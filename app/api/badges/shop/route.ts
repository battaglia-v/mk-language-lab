import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/badges/shop - List available badges in shop
 */
export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // Fetch shop badges and user's current badge ownership
    const [shopBadges, userBadges, currency] = await Promise.all([
      prisma.badge.findMany({
        where: {
          isAvailableInShop: true,
          isActive: true,
        },
        orderBy: [
          { rarityTier: 'asc' },
          { costGems: 'asc' },
        ],
      }),
      prisma.userBadge.findMany({
        where: { userId: session.user.id },
        select: { badgeId: true },
      }),
      prisma.currency.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const ownedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    // Map badges with ownership status
    const badgesWithOwnership = shopBadges.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rarityTier: badge.rarityTier,
      costGems: badge.costGems,
      isOwned: ownedBadgeIds.has(badge.id),
    }));

    return NextResponse.json({
      badges: badgesWithOwnership,
      currency: {
        gems: currency?.gems ?? 0,
        coins: currency?.coins ?? 0,
      },
    });
  } catch (error) {
    console.error('[api.badges.shop] Failed to fetch shop badges', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop badges' },
      { status: 500 }
    );
  }
}
