import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { authRateLimit, checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/user/reset-progress
 *
 * Resets all progress data for the authenticated user.
 * Does NOT delete the user account - only progress/activity data.
 */
export async function POST(request: NextRequest) {
  // Rate limiting - prevent abuse
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  const { success } = await checkRateLimit(authRateLimit, `reset-progress:${ip}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all progress data in a transaction
    await prisma.$transaction([
      // Lesson and exercise progress
      prisma.userLessonProgress.deleteMany({ where: { userId } }),
      prisma.exerciseAttempt.deleteMany({ where: { userId } }),

      // Gamification progress
      prisma.userQuestProgress.deleteMany({ where: { userId } }),
      prisma.userBadge.deleteMany({ where: { userId } }),
      prisma.currencyTransaction.deleteMany({ where: { userId } }),

      // Reader progress
      prisma.readerSession.deleteMany({ where: { userId } }),

      // Daily tracking
      prisma.dailyProgress.deleteMany({ where: { userId } }),

      // Vocabulary lists
      prisma.vocabularyWord.deleteMany({ where: { userId } }),

      // Journey progress
      prisma.journeyProgress.deleteMany({ where: { userId } }),

      // League progress
      prisma.leagueMembership.deleteMany({ where: { userId } }),

      // Notifications
      prisma.notification.deleteMany({ where: { userId } }),

      // Reset GameProgress counters (don't delete - keep the record)
      prisma.gameProgress.updateMany({
        where: { userId },
        data: {
          streak: 0,
          xp: 0,
          level: 'beginner',
          hearts: 5,
          lastPracticeDate: null,
          streakUpdatedAt: null,
          todayXP: 0,
          longestStreak: 0,
          totalLessons: 0,
        }
      }),

      // Reset Currency (don't delete - keep the record)
      prisma.currency.updateMany({
        where: { userId },
        data: {
          gems: 0,
          coins: 0,
          lifetimeGemsEarned: 0,
        }
      }),
    ]);

    console.log('[PROGRESS_RESET] Progress reset for user:', {
      userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'All progress has been reset.',
    });
  } catch (error) {
    console.error('[PROGRESS_RESET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to reset progress. Please try again.' },
      { status: 500 }
    );
  }
}
