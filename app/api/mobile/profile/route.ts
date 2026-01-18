import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';

const log = createScopedLogger('api.mobile.profile');

/**
 * GET /api/mobile/profile
 *
 * Returns user profile stats for mobile app.
 * Requires authentication.
 *
 * Response:
 * {
 *   xp: { total, weekly },
 *   streak: { days },
 *   progress: { lessonsCompleted, practiceSessionsCompleted }
 * }
 */
export async function GET(request: NextRequest) {
  const mobileSession = await getMobileSessionFromRequest(request);

  if (!mobileSession?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = mobileSession.user.id;

  try {
    // Get game progress
    const gameProgress = await prisma.gameProgress.findUnique({
      where: { userId },
    });

    // Calculate weekly XP from recent attempts
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAttempts = await prisma.exerciseAttempt.count({
      where: {
        userId,
        attemptedAt: { gte: sevenDaysAgo },
      },
    });

    // Get completed lessons count
    const lessonsCompleted = await prisma.userLessonProgress.count({
      where: {
        userId,
        status: 'completed',
      },
    });

    // Calculate weekly XP (12 XP per attempt)
    const XP_PER_ATTEMPT = 12;
    const weeklyXp = weeklyAttempts * XP_PER_ATTEMPT;

    log.info('Profile fetched', {
      userId,
      xpTotal: gameProgress?.xp ?? 0,
      weeklyXp,
      streak: gameProgress?.streak ?? 0,
      lessonsCompleted,
    });

    return NextResponse.json({
      xp: {
        total: gameProgress?.xp ?? 0,
        weekly: weeklyXp,
      },
      streak: {
        days: gameProgress?.streak ?? 0,
      },
      progress: {
        lessonsCompleted,
        practiceSessionsCompleted: gameProgress?.totalLessons ?? 0,
      },
    });
  } catch (error) {
    log.error('Failed to fetch profile', { error, userId });
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
