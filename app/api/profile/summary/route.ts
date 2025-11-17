import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fallbackProfileSummary from '@/data/profile-summary.json';
import type { ProfileSummary } from '@mk/api-client';
import {
  MAX_HEARTS,
  calculateCurrentHearts,
  getLevelProgress,
  getLeagueTierFromStreak,
} from '@mk/gamification';

export const dynamic = 'force-dynamic';

const FALLBACK_PROFILE = fallbackProfileSummary as ProfileSummary;
const XP_PER_REVIEW = 12;

export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const payload = await buildProfileSummary(session.user.id);
    return NextResponse.json(payload, {
      headers: {
        'x-profile-source': 'prisma',
      },
    });
  } catch (error) {
    console.error('[api.profile.summary] Falling back to fixture payload', error);
    const fallbackPayload: ProfileSummary = {
      ...FALLBACK_PROFILE,
      name: session.user.name ?? FALLBACK_PROFILE.name,
    };
    return NextResponse.json(fallbackPayload, {
      headers: {
        'x-profile-source': 'fallback',
      },
    });
  }
}

async function buildProfileSummary(userId: string): Promise<ProfileSummary> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const [
    user,
    gameProgress,
    journeys,
    recentAttempts,
    userBadges,
    weeklyQuests,
    currency,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.gameProgress.findUnique({ where: { userId } }),
    prisma.journeyProgress.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    }),
    prisma.exerciseAttempt.findMany({
      where: {
        userId,
        attemptedAt: { gte: twentyEightDaysAgo },
      },
      select: { attemptedAt: true },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.userQuestProgress.findMany({
      where: {
        userId,
        updatedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.currency.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
  ]);

  const xpTotal = gameProgress?.xp ?? 0;
  const weeklyAttempts = recentAttempts.filter((attempt) => attempt.attemptedAt >= sevenDaysAgo);
  const weeklyXp = weeklyAttempts.length * XP_PER_REVIEW;
  const streakDays = gameProgress?.streak ?? 0;
  const level = formatLevel(gameProgress?.level ?? 'beginner');

  // Use the new quest system for quest counts
  const questsActive = weeklyQuests.filter((q) => q.status === 'active').length;
  const questsCompleted = weeklyQuests.filter((q) => q.status === 'completed').length;

  // Map real badges from database or fall back to generated ones
  let badges: ProfileSummary['badges'];
  if (userBadges.length > 0) {
    badges = userBadges.map((ub) => ({
      id: ub.badge.id,
      label: ub.badge.name,
      description: ub.badge.description,
      earnedAt: ub.earnedAt?.toISOString() ?? null,
    }));
  } else {
    // Fallback to generated badges if no badges in DB yet
    badges = buildBadges({
      xpTotal,
      streakDays,
      weeklyAttempts: weeklyAttempts.length,
      questsActive,
      streakUpdatedAt: gameProgress?.streakUpdatedAt ?? null,
      xpUpdatedAt: gameProgress?.updatedAt ?? null,
      journeyUpdatedAt: journeys[0]?.updatedAt ?? null,
    });
  }

  const xpProgress = getLevelProgress(xpTotal);
  const heartSnapshot = calculateCurrentHearts({
    currentHearts: gameProgress?.hearts ?? MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    lastPracticeDate: gameProgress?.lastPracticeDate ?? null,
    currentDate: now,
  });
  const leagueTier = getLeagueTierFromStreak(streakDays);

  return {
    name: user?.name ?? FALLBACK_PROFILE.name,
    level,
    xp: {
      total: xpTotal,
      weekly: weeklyXp,
    },
    xpProgress: {
      percentComplete: xpProgress.percentComplete,
      xpInCurrentLevel: xpProgress.xpInCurrentLevel,
      xpForNextLevel: xpProgress.xpForNextLevel,
    },
    streakDays,
    quests: {
      active: questsActive,
      completedThisWeek: questsCompleted,
    },
    hearts: {
      current: heartSnapshot.currentHearts,
      max: MAX_HEARTS,
      minutesUntilNext: heartSnapshot.minutesUntilNextHeart,
      isFull: heartSnapshot.isFullyRegenerated,
    },
    currency: {
      gems: currency.gems,
      coins: currency.coins,
    },
    league: {
      tier: leagueTier,
      nextTier: getNextTier(leagueTier),
      daysUntilNextTier: getDaysUntilNextTier(leagueTier, streakDays),
    },
    badges,
    activityHeatmap: buildActivityHeatmap({ attempts: recentAttempts, now }),
  };
}

function formatLevel(level: string): string {
  if (!level) {
    return 'Beginner';
  }
  return level.charAt(0).toUpperCase() + level.slice(1);
}

type BadgeContext = {
  xpTotal: number;
  streakDays: number;
  weeklyAttempts: number;
  questsActive: number;
  streakUpdatedAt: Date | null;
  xpUpdatedAt: Date | null;
  journeyUpdatedAt: Date | null;
};

function buildBadges(context: BadgeContext): ProfileSummary['badges'] {
  const badges: ProfileSummary['badges'] = [];

  badges.push({
    id: 'streak-guardian',
    label: 'Streak Guardian',
    description: 'Protect a 20-day streak',
    earnedAt: context.streakDays >= 20 ? (context.streakUpdatedAt ?? new Date()).toISOString() : null,
  });

  badges.push({
    id: 'xp-ranger',
    label: 'XP Ranger',
    description: 'Earn 10,000 lifetime XP',
    earnedAt: context.xpTotal >= 10_000 ? (context.xpUpdatedAt ?? new Date()).toISOString() : null,
  });

  badges.push({
    id: 'weekly-warrior',
    label: 'Weekly Warrior',
    description: 'Finish 5 practice sessions this week',
    earnedAt: context.weeklyAttempts >= 5 ? new Date().toISOString() : null,
  });

  badges.push({
    id: 'journey-lead',
    label: 'Journey Lead',
    description: 'Activate a learning journey',
    earnedAt: context.questsActive > 0 ? (context.journeyUpdatedAt ?? new Date()).toISOString() : null,
  });

  return badges;
}

function getNextTier(tier: string): string | null {
  const order = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const index = order.indexOf(tier);
  if (index === -1 || index === order.length - 1) {
    return null;
  }
  return order[index + 1];
}

function getDaysUntilNextTier(tier: string, streakDays: number): number | null {
  const thresholds: Record<string, number> = {
    bronze: 0,
    silver: 7,
    gold: 21,
    platinum: 50,
    diamond: 100,
  };
  const nextTier = getNextTier(tier);
  if (!nextTier) return null;
  const target = thresholds[nextTier];
  return Math.max(0, target - streakDays);
}

type ActivityAttempt = { attemptedAt: Date };

function buildActivityHeatmap({
  attempts,
  now,
  days = 28,
}: {
  attempts: ActivityAttempt[];
  now: Date;
  days?: number;
}): ProfileSummary['activityHeatmap'] {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const counts = new Map<string, number>();
  attempts.forEach((attempt) => {
    const dateKey = attempt.attemptedAt.toISOString().slice(0, 10);
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  });

  const entries: ProfileSummary['activityHeatmap'] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const isoDate = date.toISOString().slice(0, 10);
    const attemptsForDay = counts.get(isoDate) ?? 0;
    const xp = attemptsForDay * XP_PER_REVIEW;
    const practiceMinutes = attemptsForDay * 3;
    let status: ProfileSummary['activityHeatmap'][number]['status'] = 'missed';
    if (xp >= 60) {
      status = 'complete';
    } else if (xp > 0) {
      status = 'partial';
    }
    entries.push({ date: isoDate, xp, practiceMinutes, status });
  }

  return entries;
}
