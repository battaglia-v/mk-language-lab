import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fallbackProfileSummary from '@/data/profile-summary.json';
import type { ProfileSummary } from '@mk/api-client';

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

  const [user, gameProgress, journeys, weeklyAttempts, userBadges, weeklyQuests] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.gameProgress.findUnique({ where: { userId } }),
    prisma.journeyProgress.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    }),
    prisma.exerciseAttempt.findMany({
      where: {
        userId,
        attemptedAt: { gte: sevenDaysAgo },
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
  ]);

  const xpTotal = gameProgress?.xp ?? 0;
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

  return {
    name: user?.name ?? FALLBACK_PROFILE.name,
    level,
    xp: {
      total: xpTotal,
      weekly: weeklyXp,
    },
    streakDays,
    quests: {
      active: questsActive,
      completedThisWeek: questsCompleted,
    },
    badges,
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
