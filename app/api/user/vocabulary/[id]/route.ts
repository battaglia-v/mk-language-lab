import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { createScopedLogger } from '@/lib/logger';

const prisma = new PrismaClient();
const log = createScopedLogger('api.user.vocabulary.id');

// SRS intervals in days (Leitner-style, matching lib/srs.ts)
// mastery 0: 1 day, 1: 3 days, 2: 7 days, 3: 14 days, 4: 30 days, 5: 90 days
const INTERVALS = [1, 3, 7, 14, 30, 90];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * PATCH /api/user/vocabulary/[id]
 *
 * Update vocabulary word after a review.
 *
 * Request body:
 * - correct: boolean (required)
 *
 * SRS logic (Leitner-style):
 * - correct: mastery = min(mastery + 1, 5)
 * - incorrect: mastery = 0
 * - nextReviewAt calculated based on new mastery level
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { correct } = body;

    if (typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: 'correct (boolean) is required' },
        { status: 400 }
      );
    }

    // Verify word exists and belongs to user
    const existingWord = await prisma.vocabularyWord.findUnique({
      where: { id },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: 'Vocabulary word not found' },
        { status: 404 }
      );
    }

    if (existingWord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vocabulary word not found' },
        { status: 404 }
      );
    }

    // Calculate new mastery and next review date
    const now = new Date();
    let newMastery: number;

    if (correct) {
      newMastery = Math.min(existingWord.mastery + 1, 5);
    } else {
      newMastery = 0;
    }

    const nextReviewAt = addDays(now, INTERVALS[newMastery]);

    // Update the word
    const updatedWord = await prisma.vocabularyWord.update({
      where: { id },
      data: {
        mastery: newMastery,
        nextReviewAt,
        timesReviewed: existingWord.timesReviewed + 1,
        timesCorrect: existingWord.timesCorrect + (correct ? 1 : 0),
      },
    });

    return NextResponse.json({ word: updatedWord });
  } catch (error) {
    log.error('Failed to update vocabulary word', {
      error,
      userId: (await auth())?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to update vocabulary word' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
