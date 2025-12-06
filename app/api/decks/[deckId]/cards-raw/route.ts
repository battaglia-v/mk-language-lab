import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ deckId: string }>;
};

/**
 * GET /api/decks/[deckId]/cards-raw - Get raw cards with all fields (for editing)
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

    // Fetch all cards with all fields
    const cards = await prisma.customDeckCard.findMany({
      where: {
        deckId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('[api.decks.deckId.cards-raw.GET] Error fetching raw cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
