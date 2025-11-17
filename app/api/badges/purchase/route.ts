import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const purchaseSchema = z.object({
  badgeId: z.string(),
});

/**
 * POST /api/badges/purchase - Purchase a badge from the shop
 */
export async function POST(request: Request) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = purchaseSchema.parse(body);

    // Fetch badge and verify it's available for purchase
    const badge = await prisma.badge.findUnique({
      where: { id: data.badgeId },
    });

    if (!badge || !badge.isAvailableInShop || !badge.isActive) {
      return NextResponse.json(
        { error: 'Badge not available for purchase' },
        { status: 404 }
      );
    }

    // Check if user already owns the badge
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: session.user.id,
          badgeId: data.badgeId,
        },
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'Badge already owned' },
        { status: 400 }
      );
    }

    // Check if user has enough gems
    const currency = await prisma.currency.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    const currentGems = currency.gems;
    if (currentGems < badge.costGems) {
      return NextResponse.json(
        {
          error: 'Insufficient gems',
          required: badge.costGems,
          available: currentGems,
        },
        { status: 400 }
      );
    }

    // Perform the purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct gems
      const updatedCurrency = await tx.currency.update({
        where: { userId: session.user.id },
        data: { gems: { decrement: badge.costGems } },
      });

      // Log the transaction
      await tx.currencyTransaction.create({
        data: {
          userId: session.user.id,
          currencyType: 'gems',
          amount: -badge.costGems,
          reason: 'badge_purchase',
          metadata: JSON.stringify({
            badgeId: badge.id,
            badgeName: badge.name,
          }),
        },
      });

      // Grant the badge
      const userBadge = await tx.userBadge.create({
        data: {
          userId: session.user.id,
          badgeId: badge.id,
          purchasedAt: new Date(),
        },
      });

      return { userBadge, updatedCurrency };
    });

    return NextResponse.json({
      success: true,
      badge: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        rarityTier: badge.rarityTier,
      },
      currency: {
        gems: result.updatedCurrency.gems,
        gemsSpent: badge.costGems,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[api.badges.purchase] Failed to purchase badge', error);
    return NextResponse.json(
      { error: 'Failed to purchase badge' },
      { status: 500 }
    );
  }
}
