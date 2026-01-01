import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/user/stats - Unified stats endpoint
 *
 * Returns user's XP and progress stats in a consistent format
 * for use by the useUserStats hook.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's game progress
    const gameProgress = await prisma.gameProgress.findUnique({
      where: { userId: session.user.id },
    });

    // If no progress exists, return zeros
    if (!gameProgress) {
      return NextResponse.json({
        todayXP: 0,
        weeklyXP: 0,
        totalXP: 0,
        streak: 0,
        dailyGoal: 20,
      });
    }

    // Calculate if today's XP should be used
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = gameProgress.lastPracticeDate
      ? new Date(gameProgress.lastPracticeDate).toISOString().split('T')[0]
      : null;
    const isToday = lastActivity === today;

    return NextResponse.json({
      todayXP: isToday ? gameProgress.todayXP : 0,
      weeklyXP: gameProgress.xp, // Using total XP for weekly (simplified)
      totalXP: gameProgress.xp,
      streak: gameProgress.streak,
      dailyGoal: gameProgress.dailyGoalXP || 20,
    });
  } catch (error) {
    console.error('[GET STATS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
