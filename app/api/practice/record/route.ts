import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';

const log = createScopedLogger('api.practice.record');

/**
 * Record practice session and update user progress
 * POST /api/practice/record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { correctCount, totalCount } = body;

    if (typeof correctCount !== 'number' || typeof totalCount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Calculate XP earned (12 XP per correct answer)
    const xpEarned = correctCount * 12;

    // Update or create GameProgress
    const gameProgress = await prisma.gameProgress.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        xp: xpEarned,
        weeklyXP: xpEarned,
        todayXP: xpEarned,
        level: 'beginner',
        streak: 1,
        hearts: 5,
        totalLessons: 1, // First lesson completed
        lastPracticeDate: new Date(),
        streakUpdatedAt: new Date(),
      },
      update: {
        xp: {
          increment: xpEarned,
        },
        weeklyXP: {
          increment: xpEarned,
        },
        todayXP: {
          increment: xpEarned,
        },
        totalLessons: {
          increment: 1, // Increment lesson count for path unlocking
        },
        lastPracticeDate: new Date(),
        // Update streak logic
        streakUpdatedAt: new Date(),
      },
    });

    // Calculate streak
    const now = new Date();
    const lastPractice = gameProgress.lastPracticeDate;

    if (lastPractice) {
      const diffTime = Math.abs(now.getTime() - lastPractice.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = gameProgress.streak;

      if (diffDays === 0) {
        // Same day, keep streak
        newStreak = gameProgress.streak;
      } else if (diffDays === 1) {
        // Next day, increment streak
        newStreak = gameProgress.streak + 1;
      } else {
        // Missed days, reset streak
        newStreak = 1;
      }

      await prisma.gameProgress.update({
        where: { userId: session.user.id },
        data: { streak: newStreak },
      });
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      totalXp: gameProgress.xp + xpEarned,
      todayXP: gameProgress.todayXP + xpEarned,
      streak: gameProgress.streak,
      totalLessons: gameProgress.totalLessons + 1,
    });
  } catch (error) {
    log.error('Failed to record practice session', {
      error,
      correctCount: (await request.json().catch(() => ({}))).correctCount,
      totalCount: (await request.json().catch(() => ({}))).totalCount,
      userId: (await auth())?.user?.id,
    });

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Session already recorded' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
