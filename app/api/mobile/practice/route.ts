import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import { createScopedLogger } from '@/lib/logger';
import practiceVocabulary from '@/data/practice-vocabulary.json';

const log = createScopedLogger('api.mobile.practice');

// Response type for mobile practice API
type PracticeItem = {
  id: string;
  macedonian: string;
  english: string;
  category?: string;
  lessonId?: string;
};

type PracticeResponse = {
  items: PracticeItem[];
  meta: {
    deckType: string;
    total: number;
  };
};

/**
 * GET /api/mobile/practice
 *
 * Returns practice vocabulary for mobile sessions.
 *
 * Query params:
 * - deck: 'lesson-review' (from completed lessons) | 'curated' (starter deck)
 * - mode: 'multipleChoice' | 'typing' | 'cloze' (card type - for logging only)
 * - limit: optional number (default 20)
 *
 * Response:
 * {
 *   items: Array<{ id, macedonian, english, category?, lessonId? }>,
 *   meta: { deckType, total }
 * }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deck = searchParams.get('deck') ?? 'curated';
  const mode = searchParams.get('mode') ?? 'multipleChoice';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

  try {
    // Handle 'curated' deck - no auth required
    if (deck === 'curated') {
      const items: PracticeItem[] = practiceVocabulary.slice(0, limit).map((item, index) => ({
        id: `curated-${index}`,
        macedonian: item.macedonian,
        english: item.english,
        category: item.category,
      }));

      log.info('Returning curated deck', { mode, limit, count: items.length });

      const response: PracticeResponse = {
        items,
        meta: {
          deckType: 'curated',
          total: practiceVocabulary.length,
        },
      };

      // Curated data is static - cache for 5 minutes
      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Handle 'lesson-review' deck - auth required
    if (deck === 'lesson-review') {
      const mobileSession = await getMobileSessionFromRequest(request);

      if (!mobileSession?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = mobileSession.user.id;

      // Get completed lessons
      const completedLessons = await prisma.userLessonProgress.findMany({
        where: {
          userId,
          status: 'completed',
        },
        select: {
          lessonId: true,
        },
      });

      if (completedLessons.length === 0) {
        log.info('No completed lessons found', { userId });
        const response: PracticeResponse = {
          items: [],
          meta: {
            deckType: 'lesson-review',
            total: 0,
          },
        };
        return NextResponse.json(response);
      }

      const completedLessonIds = completedLessons.map((lp) => lp.lessonId);

      // Get vocabulary from completed lessons
      const vocabularyItems = await prisma.vocabularyItem.findMany({
        where: {
          lessonId: { in: completedLessonIds },
        },
        orderBy: [
          { lessonId: 'asc' },
          { orderIndex: 'asc' },
        ],
        take: limit,
        select: {
          id: true,
          macedonianText: true,
          englishText: true,
          lessonId: true,
        },
      });

      const items: PracticeItem[] = vocabularyItems.map((item) => ({
        id: item.id,
        macedonian: item.macedonianText,
        english: item.englishText,
        lessonId: item.lessonId,
        category: 'lesson-vocab',
      }));

      // Get total count for meta
      const totalCount = await prisma.vocabularyItem.count({
        where: {
          lessonId: { in: completedLessonIds },
        },
      });

      log.info('Returning lesson-review deck', {
        userId,
        mode,
        completedLessons: completedLessonIds.length,
        count: items.length,
        total: totalCount,
      });

      const response: PracticeResponse = {
        items,
        meta: {
          deckType: 'lesson-review',
          total: totalCount,
        },
      };

      return NextResponse.json(response);
    }

    // Unknown deck type
    return NextResponse.json(
      { error: 'Invalid deck type. Use "lesson-review" or "curated".' },
      { status: 400 }
    );
  } catch (error) {
    log.error('Failed to fetch practice vocabulary', { error, deck, mode });
    return NextResponse.json(
      { error: 'Failed to fetch practice vocabulary' },
      { status: 500 }
    );
  }
}
