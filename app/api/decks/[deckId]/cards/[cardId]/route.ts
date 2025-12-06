import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ deckId: string; cardId: string }>;
};

/**
 * PATCH /api/decks/[deckId]/cards/[cardId] - Update a card
 * Body: {
 *   macedonian?: string,
 *   english?: string,
 *   macedonianAlternates?: string[],
 *   englishAlternates?: string[],
 *   category?: string,
 *   notes?: string
 * }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId, cardId } = await context.params;
    const body = await request.json();
    const { macedonian, english, macedonianAlternates, englishAlternates, category, notes } = body;

    // Verify deck ownership
    const deck = await prisma.customDeck.findUnique({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Verify card exists in this deck
    const existingCard = await prisma.customDeckCard.findUnique({
      where: {
        id: cardId,
        deckId,
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Validate fields if provided
    if (macedonian !== undefined && (typeof macedonian !== 'string' || macedonian.trim().length === 0)) {
      return NextResponse.json({ error: 'Macedonian text cannot be empty' }, { status: 400 });
    }

    if (english !== undefined && (typeof english !== 'string' || english.trim().length === 0)) {
      return NextResponse.json({ error: 'English text cannot be empty' }, { status: 400 });
    }

    // Process alternates if provided
    const macedonianAlts =
      macedonianAlternates !== undefined
        ? Array.isArray(macedonianAlternates)
          ? macedonianAlternates.filter((alt) => typeof alt === 'string' && alt.trim().length > 0)
          : []
        : undefined;

    const englishAlts =
      englishAlternates !== undefined
        ? Array.isArray(englishAlternates)
          ? englishAlternates.filter((alt) => typeof alt === 'string' && alt.trim().length > 0)
          : []
        : undefined;

    const card = await prisma.customDeckCard.update({
      where: {
        id: cardId,
      },
      data: {
        ...(macedonian !== undefined && { macedonian: macedonian.trim() }),
        ...(english !== undefined && { english: english.trim() }),
        ...(macedonianAlts !== undefined && { macedonianAlternates: macedonianAlts }),
        ...(englishAlts !== undefined && { englishAlternates: englishAlts }),
        ...(category !== undefined && { category: category ? category.trim() : null }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('[api.decks.deckId.cards.cardId.PATCH] Error updating card:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}

/**
 * DELETE /api/decks/[deckId]/cards/[cardId] - Delete a card
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId, cardId } = await context.params;

    // Verify deck ownership
    const deck = await prisma.customDeck.findUnique({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Verify card exists in this deck
    const existingCard = await prisma.customDeckCard.findUnique({
      where: {
        id: cardId,
        deckId,
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Delete card and update deck count in a transaction
    await prisma.$transaction([
      prisma.customDeckCard.delete({
        where: {
          id: cardId,
        },
      }),
      prisma.customDeck.update({
        where: { id: deckId },
        data: { cardCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api.decks.deckId.cards.cardId.DELETE] Error deleting card:', error);
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
  }
}
