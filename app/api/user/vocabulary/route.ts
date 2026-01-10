import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';
const log = createScopedLogger('api.user.vocabulary');

type VocabStatus = 'new' | 'learning' | 'mastered' | 'due' | 'all';

/**
 * GET /api/user/vocabulary
 *
 * Returns user's vocabulary words with filtering and counts.
 *
 * Query params:
 * - status: 'new' | 'learning' | 'mastered' | 'due' | 'all' (default: 'all')
 * - limit: number (default: 50, max: 200)
 *
 * Mastery mapping:
 * - new: mastery = 0
 * - learning: mastery 1-3
 * - mastered: mastery 4-5
 * - due: nextReviewAt <= now
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'all') as VocabStatus;
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 200);

    const userId = session.user.id;
    const now = new Date();

    // Build where clause based on status filter
    let whereClause: Prisma.VocabularyWordWhereInput = { userId };

    switch (status) {
      case 'new':
        whereClause = { ...whereClause, mastery: 0 };
        break;
      case 'learning':
        whereClause = { ...whereClause, mastery: { gte: 1, lte: 3 } };
        break;
      case 'mastered':
        whereClause = { ...whereClause, mastery: { gte: 4 } };
        break;
      case 'due':
        whereClause = { ...whereClause, nextReviewAt: { lte: now } };
        break;
      // 'all' - no additional filter
    }

    // Fetch words with applied filter
    const words = await prisma.vocabularyWord.findMany({
      where: whereClause,
      take: limit,
      orderBy: [
        { nextReviewAt: 'asc' }, // Due words first
        { createdAt: 'desc' },   // Then newest
      ],
    });

    // Get counts for all categories
    const [newCount, learningCount, masteredCount, dueCount, totalCount] = await Promise.all([
      prisma.vocabularyWord.count({ where: { userId, mastery: 0 } }),
      prisma.vocabularyWord.count({ where: { userId, mastery: { gte: 1, lte: 3 } } }),
      prisma.vocabularyWord.count({ where: { userId, mastery: { gte: 4 } } }),
      prisma.vocabularyWord.count({ where: { userId, nextReviewAt: { lte: now } } }),
      prisma.vocabularyWord.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      words,
      counts: {
        new: newCount,
        learning: learningCount,
        mastered: masteredCount,
        due: dueCount,
        total: totalCount,
      },
    });
  } catch (error) {
    log.error('Failed to fetch vocabulary', {
      error,
      userId: (await auth())?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/vocabulary
 *
 * Add a new word to user's vocabulary.
 * If word already exists (same userId + wordMk), returns existing record.
 *
 * Request body:
 * - wordMk: string (required)
 * - wordEn: string (required)
 * - phonetic?: string
 * - source: 'practice' | 'reader' | 'translator' | 'manual'
 * - sourceId?: string
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wordMk, wordEn, phonetic, source, sourceId } = body;

    // Validate required fields
    if (!wordMk || !wordEn) {
      return NextResponse.json(
        { error: 'wordMk and wordEn are required' },
        { status: 400 }
      );
    }

    if (!source || !['practice', 'reader', 'translator', 'manual'].includes(source)) {
      return NextResponse.json(
        { error: 'source must be one of: practice, reader, translator, manual' },
        { status: 400 }
      );
    }

    // Upsert: create if not exists, return existing if it does
    const word = await prisma.vocabularyWord.upsert({
      where: {
        userId_wordMk: {
          userId: session.user.id,
          wordMk,
        },
      },
      update: {}, // No updates if exists - just return it
      create: {
        userId: session.user.id,
        wordMk,
        wordEn,
        phonetic: phonetic || null,
        source,
        sourceId: sourceId || null,
        mastery: 0,
        nextReviewAt: null,
      },
    });

    return NextResponse.json({ word });
  } catch (error) {
    log.error('Failed to save vocabulary word', {
      error,
      userId: (await auth())?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to save vocabulary word' },
      { status: 500 }
    );
  }
}
