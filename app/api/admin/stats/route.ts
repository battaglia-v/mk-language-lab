import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Authentication check - critical security requirement
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all queries in parallel for better performance
    const [
      wordOfTheDayCount,
      practiceWordsCount,
      activeUsersCount,
      totalExercisesCount,
    ] = await Promise.all([
      // Count total Word of the Day entries
      prisma.wordOfTheDay.count({
        where: { isActive: true },
      }),

      // Count total Practice Vocabulary words
      prisma.practiceVocabulary.count({
        where: { isActive: true },
      }),

      // Count active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Count total exercises across all lessons
      prisma.exercise.count(),
    ]);

    return NextResponse.json({
      wordOfTheDay: wordOfTheDayCount,
      practiceWords: practiceWordsCount,
      activeUsers: activeUsersCount,
      totalExercises: totalExercisesCount,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
