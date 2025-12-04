import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import fallbackStandings from '@/data/league-standings.json';
import type { LeagueStandings } from '@mk/api-client';
import { getLeagueTierFromStreak } from '@mk/gamification';
import type { GameProgress, Prisma } from '@prisma/client';

const FALLBACK_STANDINGS = fallbackStandings as LeagueStandings;
const TIER_ORDER: Record<string, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
};

export const revalidate = 60;

// Cached query wrappers for league data
const getCachedLeagues = unstable_cache(
  async () => {
    return prisma.league.findMany();
  },
  ['leagues-list'],
  { revalidate: 3600, tags: ['leagues'] } // 1 hour cache - static reference data
);

const getCachedLeagueStandings = unstable_cache(
  async (leagueId: string) => {
    return prisma.leagueMembership.findMany({
      where: { leagueId },
      include: { user: { select: { name: true, image: true } } },
      orderBy: [{ rank: 'asc' }, { updatedAt: 'desc' }],
      take: 20,
    });
  },
  ['league-standings'],
  { revalidate: 120, tags: ['leagues'] } // 2 min cache
);

const getCachedMemberProgress = unstable_cache(
  async (memberIds: string[]) => {
    return prisma.gameProgress.findMany({
      where: { userId: { in: memberIds } },
      select: { userId: true, streak: true, xp: true },
    });
  },
  ['member-progress'],
  { revalidate: 60, tags: ['leagues'] } // 1 min cache
);

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const standings = await buildLeagueStandings(session.user.id);
    return NextResponse.json(standings, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'x-league-source': 'prisma',
      },
    });
  } catch (error) {
    console.error('[api.leagues.standings] Falling back to fixture payload', error);
    const fallback = {
      ...FALLBACK_STANDINGS,
      members: FALLBACK_STANDINGS.members.map((member) => ({
        ...member,
        isCurrentUser: member.isCurrentUser || member.name.toLowerCase().includes('you'),
      })),
    } satisfies LeagueStandings;
    return NextResponse.json(fallback, {
      headers: {
        'Cache-Control': 'public, s-maxage=120',
        'x-league-source': 'fallback',
      },
    });
  }
}

async function buildLeagueStandings(userId: string): Promise<LeagueStandings> {
  const now = new Date();
  const membership = await prisma.leagueMembership.findFirst({
    where: { userId },
    include: { league: true },
    orderBy: { updatedAt: 'desc' },
  });

  const [gameProgress, leagues] = await Promise.all([
    prisma.gameProgress.findUnique({ where: { userId } }),
    getCachedLeagues(), // Cached: 1 hour
  ]);

  const streakDays = gameProgress?.streak ?? 0;
  const inferredTier = getLeagueTierFromStreak(streakDays);
  const targetLeague = membership?.league ?? findLeagueForTier(leagues, inferredTier);

  if (!targetLeague) {
    throw new Error('Missing league tiers');
  }

  const standings: Array<
    Prisma.LeagueMembershipGetPayload<{
      include: { user: { select: { name: true; image: true } } };
    }>
  > = await getCachedLeagueStandings(targetLeague.id); // Cached: 2 min

  const memberIds = standings.map((entry) => entry.userId);
  if (!memberIds.includes(userId)) {
    memberIds.push(userId);
  }

  const progressRecords: Pick<GameProgress, 'userId' | 'streak' | 'xp'>[] = await getCachedMemberProgress(memberIds); // Cached: 1 min

  const streakMap = new Map(progressRecords.map((entry) => [entry.userId, entry.streak]));
  const xpMap = new Map(progressRecords.map((entry) => [entry.userId, entry.xp]));

  const sortedMembers = [...standings];
  if (!sortedMembers.some((entry) => entry.userId === userId)) {
    sortedMembers.push({
      id: `virtual-${userId}`,
      userId,
      leagueId: targetLeague.id,
      joinedAt: now,
      rank: sortedMembers.length + 1,
      updatedAt: now,
      user: { name: 'You', image: null },
    } as typeof sortedMembers[number]);
  }

  const members = sortedMembers
    .map((entry, index) => ({
      id: entry.userId,
      name: entry.user?.name ?? 'Learner',
      rank: entry.rank ?? index + 1,
      streakDays: streakMap.get(entry.userId) ?? 0,
      xp: xpMap.get(entry.userId) ?? 0,
      avatarUrl: entry.user?.image ?? null,
      trend: 'neutral' as const,
      isCurrentUser: entry.userId === userId,
    }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 20);

  const userRank = members.find((member) => member.isCurrentUser)?.rank ?? null;
  const promotionCutoff = 5;
  const demotionCutoff = targetLeague.tier === TIER_ORDER.diamond ? null : 10;
  const progressPercent = getProgressPercent(streakDays, targetLeague.minStreak, targetLeague.maxStreak);

  return {
    tier: inferredTier,
    tierLabel: targetLeague.name,
    icon: targetLeague.icon,
    rank: userRank,
    streakDays,
    promotionCutoff,
    demotionCutoff,
    progressPercent,
    members,
    updatedAt: now.toISOString(),
  } satisfies LeagueStandings;
}

function findLeagueForTier(leagues: Awaited<ReturnType<typeof prisma.league.findMany>>, tier: string) {
  const numericTier = TIER_ORDER[tier] ?? 1;
  return leagues.find((league) => league.tier === numericTier) ?? null;
}

function getProgressPercent(streak: number, min: number, max: number | null): number {
  if (max === null) {
    return Math.min(100, Math.round((streak / (min || 1)) * 100));
  }
  const range = Math.max(1, max - min + 1);
  const progress = streak - min;
  return Math.max(0, Math.min(100, Math.round((progress / range) * 100)));
}
// @ts-nocheck
