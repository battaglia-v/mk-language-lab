import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { convertDeckCardsToPracticeItems } from '@/lib/custom-decks';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ deckId: string }>;
};

/**
 * GET /api/decks/[deckId]/cards - List all cards in a deck
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId } = await context.params;

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

    const cards = await prisma.customDeckCard.findMany({
      where: {
        deckId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    const practiceItems = convertDeckCardsToPracticeItems(cards);

    return NextResponse.json({ cards: practiceItems });
  } catch (error) {
    console.error('[api.decks.deckId.cards.GET] Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

/**
 * POST /api/decks/[deckId]/cards - Add a card to a deck
 * Body: {
 *   macedonian: string,
 *   english: string,
 *   macedonianAlternates?: string[],
 *   englishAlternates?: string[],
 *   category?: string,
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deckId } = await context.params;
    const body = await request.json();
    const { macedonian, english, macedonianAlternates, englishAlternates, category, notes } = body;

    // Validate required fields
    if (!macedonian || typeof macedonian !== 'string' || macedonian.trim().length === 0) {
      return NextResponse.json({ error: 'Macedonian text is required' }, { status: 400 });
    }

    if (!english || typeof english !== 'string' || english.trim().length === 0) {
      return NextResponse.json({ error: 'English text is required' }, { status: 400 });
    }

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

    // Get the next orderIndex
    const lastCard = await prisma.customDeckCard.findFirst({
      where: { deckId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const nextOrderIndex = (lastCard?.orderIndex ?? -1) + 1;

    // Validate alternates are arrays if provided
    const macedonianAlts = Array.isArray(macedonianAlternates)
      ? macedonianAlternates.filter((alt) => typeof alt === 'string' && alt.trim().length > 0)
      : [];

    const englishAlts = Array.isArray(englishAlternates)
      ? englishAlternates.filter((alt) => typeof alt === 'string' && alt.trim().length > 0)
      : [];

    // Create card and update deck count in a transaction
    const [card] = await prisma.$transaction([
      prisma.customDeckCard.create({
        data: {
          deckId,
          macedonian: macedonian.trim(),
          english: english.trim(),
          macedonianAlternates: macedonianAlts,
          englishAlternates: englishAlts,
          category: category ? category.trim() : null,
          notes: notes ? notes.trim() : null,
          orderIndex: nextOrderIndex,
        },
      }),
      prisma.customDeck.update({
        where: { id: deckId },
        data: { cardCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error('[api.decks.deckId.cards.POST] Error creating card:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}
