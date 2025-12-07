/**
 * Leaderboard API
 *
 * GET /api/leaderboard?type=global|friends|league&period=week|alltime&limit=50
 *
 * Returns ranked users based on different criteria
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const type = searchParams.get('type') || 'global'; // global | friends | league
    const period = searchParams.get('period') || 'alltime'; // week | alltime
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let leaderboard: Array<{
      userId: string;
      rank: number;
      name: string | null;
      image: string | null;
      xp: number;
      weeklyXP: number;
      streak: number;
      level: string;
    }> = [];

    switch (type) {
      case 'global':
        leaderboard = await getGlobalLeaderboard(period, limit);
        break;

      case 'friends':
        leaderboard = await getFriendsLeaderboard(userId, period, limit);
        break;

      case 'league':
        leaderboard = await getLeagueLeaderboard(userId, period, limit);
        break;

      default:
        return NextResponse.json({ error: 'Invalid leaderboard type' }, { status: 400 });
    }

    // Find current user's position
    const userPosition = leaderboard.findIndex((entry) => entry.userId === userId);
    const userRank = userPosition >= 0 ? userPosition + 1 : null;

    return NextResponse.json({
      type,
      period,
      leaderboard,
      userRank,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get global leaderboard (top users by XP)
 */
async function getGlobalLeaderboard(period: string, limit: number) {
  const orderBy = period === 'week'
    ? { weeklyXP: 'desc' as const }
    : { xp: 'desc' as const };

  const topUsers = await prisma.gameProgress.findMany({
    take: limit,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return topUsers.map((progress, index) => ({
    userId: progress.userId,
    rank: index + 1,
    name: progress.user.name,
    image: progress.user.image,
    xp: progress.xp,
    weeklyXP: 0, // TODO: Implement weeklyXP tracking in GameProgress
    streak: progress.streak,
    level: progress.level,
  }));
}

/**
 * Get friends leaderboard
 */
async function getFriendsLeaderboard(userId: string, period: string, limit: number) {
  // TODO: Implement friendship system
  // For now, return empty array
  return [];
}

/**
 * Get league leaderboard (users in same league)
 */
async function getLeagueLeaderboard(userId: string, period: string, limit: number) {
  // Find user's current league membership
  const membership = await prisma.leagueMembership.findFirst({
    where: { userId },
    orderBy: { joinedAt: 'desc' },
  });

  if (!membership) {
    return [];
  }

  // Get all members in the same league
  const orderBy = period === 'week'
    ? { weeklyXP: 'desc' as const }
    : { weeklyXP: 'desc' as const }; // For leagues, always use weekly XP

  const leagueMembers = await prisma.leagueMembership.findMany({
    where: { leagueId: membership.leagueId },
    take: limit,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Get game progress for each member
  const userIds = leagueMembers.map((m) => m.userId);
  const gameProgresses = await prisma.gameProgress.findMany({
    where: { userId: { in: userIds } },
  });

  const progressMap = new Map(
    gameProgresses.map((p) => [p.userId, p])
  );

  return leagueMembers.map((member, index) => {
    const progress = progressMap.get(member.userId);
    return {
      userId: member.userId,
      rank: index + 1,
      name: member.user.name,
      image: member.user.image,
      xp: progress?.xp || 0,
      weeklyXP: member.weeklyXP,
      streak: progress?.streak || 0,
      level: progress?.level || 'beginner',
    };
  });
}

/**
 * Update weekly XP for all league members (called by cron job)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron auth token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset weekly XP for all league members
    const result = await prisma.leagueMembership.updateMany({
      data: {
        weeklyXP: 0,
        promoted: false,
        relegated: false,
      },
    });

    console.log('[CRON] Reset weekly XP for', result.count, 'league members');

    return NextResponse.json({
      success: true,
      resetCount: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Reset weekly XP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
