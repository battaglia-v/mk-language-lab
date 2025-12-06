import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { convertDeckCardsToPracticeItems } from '@/lib/custom-decks';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ deckId: string }>;
};

/**
 * GET /api/decks/[deckId] - Get deck with all cards
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    console.log('[api.decks.deckId.GET] No session or user ID');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId } = await context.params;
    console.log('[api.decks.deckId.GET] Looking for deck:', { deckId, userId: session.user.id });

    const deck = await prisma.customDeck.findFirst({
      where: {
        id: deckId,
        userId: session.user.id,
      },
      include: {
        cards: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!deck) {
      // Check if deck exists with different owner
      const anyDeck = await prisma.customDeck.findUnique({
        where: { id: deckId },
        select: { userId: true },
      });

      if (anyDeck) {
        console.log('[api.decks.deckId.GET] Deck exists but wrong owner:', {
          deckId,
          deckOwner: anyDeck.userId,
          currentUser: session.user.id
        });
      } else {
        console.log('[api.decks.deckId.GET] Deck does not exist:', deckId);
      }

      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    console.log('[api.decks.deckId.GET] Deck found:', { deckId, cardCount: deck.cards.length });

    const { cards, ...deckData } = deck;
    const practiceItems = convertDeckCardsToPracticeItems(cards);

    return NextResponse.json({
      deck: deckData,
      cards: practiceItems,
    });
  } catch (error) {
    console.error('[api.decks.deckId.GET] Error fetching deck:', error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}

/**
 * PATCH /api/decks/[deckId] - Update deck metadata
 * Body: { name?: string, description?: string, category?: string, isArchived?: boolean }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId } = await context.params;
    const body = await request.json();
    const { name, description, category, isArchived } = body;

    // Verify deck ownership
    const existingDeck = await prisma.customDeck.findUnique({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Deck name cannot be empty' }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Deck name must be 100 characters or less' }, { status: 400 });
      }
    }

    const deck = await prisma.customDeck.update({
      where: {
        id: deckId,
      },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(category !== undefined && { category: category ? category.trim() : null }),
        ...(isArchived !== undefined && { isArchived: Boolean(isArchived) }),
      },
    });

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('[api.decks.deckId.PATCH] Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

/**
 * DELETE /api/decks/[deckId] - Delete deck and all its cards
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId } = await context.params;

    // Verify deck ownership
    const existingDeck = await prisma.customDeck.findUnique({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Delete deck (cascades to cards)
    await prisma.customDeck.delete({
      where: {
        id: deckId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api.decks.deckId.DELETE] Error deleting deck:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}
