/**
 * Subscription Utilities
 *
 * Functions for checking user subscription status (DB-backed).
 *
 * Note: Product definitions, limits, and Pro feature lists live in `lib/entitlements.ts`.
 */

import prisma from '@/lib/prisma';

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'expired';
  expiresAt: Date | null;
  source: 'google_play' | 'stripe' | 'promo' | 'none';
}

/**
 * Get user's subscription info
 */
export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status === 'inactive') {
      return {
        tier: 'free',
        status: 'inactive',
        expiresAt: null,
        source: 'none',
      };
    }

    // Check if subscription has expired
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      return {
        tier: 'free',
        status: 'expired',
        expiresAt: subscription.expiresAt,
        source: subscription.source,
      };
    }

    return {
      tier: ['active', 'canceled', 'past_due'].includes(subscription.status) ? 'pro' : 'free',
      status: subscription.status,
      expiresAt: subscription.expiresAt,
      source: subscription.source,
    };
  } catch (error) {
    console.error('[Subscription] Error fetching subscription:', error);
    return {
      tier: 'free',
      status: 'inactive',
      expiresAt: null,
      source: 'none',
    };
  }
}

/**
 * Check if user has an active Pro subscription
 */
export async function hasProSubscription(userId: string): Promise<boolean> {
  const info = await getSubscription(userId);
  return info.tier === 'pro';
}

/**
 * Grant a promotional subscription
 */
export async function grantPromoSubscription(
  userId: string,
  durationDays: number,
  grantedBy: string,
  reason: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      status: 'active',
      source: 'promo',
      expiresAt,
      grantedBy,
      grantReason: reason,
      updatedAt: new Date(),
    },
    create: {
      userId,
      status: 'active',
      source: 'promo',
      expiresAt,
      grantedBy,
      grantReason: reason,
    },
  });
}
