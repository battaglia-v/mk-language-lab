import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';

const log = createScopedLogger('api.practice.lesson-vocab');

/**
 * GET /api/practice/lesson-vocab
 *
 * Returns vocabulary from user's completed lessons.
 * Query params:
 * - lessonId: optional, filter to specific lesson
 *
 * Response format (compatible with Flashcard):
 * {
 *   id: string,
 *   macedonian: string,
 *   english: string,
 *   lessonId: string,
 *   lessonTitle: string,
 *   category: string | null
 * }[]
 *
 * Returns empty array if:
 * - User not authenticated
 * - No completed lessons
 * - No vocabulary items seeded
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    // Get completed lesson IDs for this user
    const completedLessons = await prisma.userLessonProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'completed',
        ...(lessonId ? { lessonId } : {}),
      },
      select: {
        lessonId: true,
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (completedLessons.length === 0) {
      log.info('No completed lessons found', { userId: session.user.id });
      return NextResponse.json([]);
    }

    const completedLessonIds = completedLessons.map((lp) => lp.lessonId);
    const lessonTitleMap = new Map(
      completedLessons.map((lp) => [lp.lessonId, lp.lesson.title])
    );

    // Get vocabulary from completed lessons
    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where: {
        lessonId: { in: completedLessonIds },
      },
      orderBy: [
        { lessonId: 'asc' },
        { orderIndex: 'asc' },
      ],
      select: {
        id: true,
        macedonianText: true,
        englishText: true,
        lessonId: true,
        pronunciation: true,
      },
    });

    // Transform to API response format
    const vocab = vocabularyItems.map((item) => ({
      id: item.id,
      macedonian: item.macedonianText,
      english: item.englishText,
      lessonId: item.lessonId,
      lessonTitle: lessonTitleMap.get(item.lessonId) ?? 'Unknown Lesson',
      category: 'lesson-vocab',
      pronunciation: item.pronunciation,
    }));

    log.info('Returning lesson vocabulary', {
      userId: session.user.id,
      completedLessons: completedLessonIds.length,
      vocabCount: vocab.length,
    });

    return NextResponse.json(vocab);
  } catch (error) {
    log.error('Failed to fetch lesson vocabulary', { error });
    return NextResponse.json(
      { error: 'Failed to fetch lesson vocabulary' },
      { status: 500 }
    );
  }
}
