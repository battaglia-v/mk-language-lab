import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { FREE_TIER_LIMITS } from '@/lib/entitlements';
import { getEntitlementForUserId } from '@/lib/entitlements-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/decks - List user's custom decks
 * Query params:
 *   - archived: boolean (default: false)
 */
export async function GET(request: NextRequest) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const archived = searchParams.get('archived') === 'true';

    const decks = await prisma.customDeck.findMany({
      where: {
        userId: session.user.id,
        isArchived: archived,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        cardCount: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('[api.decks.GET] Error fetching decks:', error);
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
  }
}

/**
 * POST /api/decks - Create a new custom deck
 * Body: { name: string, description?: string, category?: string }
 */
export async function POST(request: NextRequest) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (process.env.ENABLE_PAYWALL === 'true') {
      const entitlement = await getEntitlementForUserId(session.user.id);

      if (!entitlement.isPro) {
        const activeDeckCount = await prisma.customDeck.count({
          where: {
            userId: session.user.id,
            isArchived: false,
          },
        });

        if (activeDeckCount >= FREE_TIER_LIMITS.maxCustomDecks) {
          return NextResponse.json(
            { error: 'Upgrade required to create more custom decks' },
            { status: 402 }
          );
        }
      }
    }

    const body = await request.json();
    const { name, description, category } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Deck name must be 100 characters or less' }, { status: 400 });
    }

    const deck = await prisma.customDeck.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        category: category ? category.trim() : null,
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    console.error('[api.decks.POST] Error creating deck:', error);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}
