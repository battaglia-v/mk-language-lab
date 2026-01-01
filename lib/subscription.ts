/**
 * Subscription Utilities
 *
 * Functions for checking user subscription status and entitlements.
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
      tier: subscription.status === 'active' ? 'pro' : 'free',
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
 * Premium routes that require subscription
 * Format: paths that start with these prefixes require Pro
 */
export const PREMIUM_ROUTES = [
  '/learn/paths/b1',
  '/learn/paths/b2c1',
  '/reader/samples/day06', // Days 6-30 of challenge are premium
  '/reader/samples/day07',
  '/reader/samples/day08',
  '/reader/samples/day09',
  '/reader/samples/day10',
  '/reader/samples/day11',
  '/reader/samples/day12',
  '/reader/samples/day13',
  '/reader/samples/day14',
  '/reader/samples/day15',
  '/reader/samples/day16',
  '/reader/samples/day17',
  '/reader/samples/day18',
  '/reader/samples/day19',
  '/reader/samples/day20',
  '/reader/samples/day21',
  '/reader/samples/day22',
  '/reader/samples/day23',
  '/reader/samples/day24',
  '/reader/samples/day25',
  '/reader/samples/day26',
  '/reader/samples/day27',
  '/reader/samples/day28',
  '/reader/samples/day29',
  '/reader/samples/day30',
];

/**
 * Check if a route requires a premium subscription
 */
export function isPremiumRoute(pathname: string): boolean {
  // Remove locale prefix (e.g., /en/ or /mk/)
  const cleanPath = pathname.replace(/^\/(en|mk)/, '');
  return PREMIUM_ROUTES.some(route => cleanPath.startsWith(route));
}

/**
 * Free tier limits
 */
export const FREE_TIER_LIMITS = {
  practiceSessionsPerDay: 3,
  readerSamples: 5, // First 5 days of 30-day challenge
  customDecks: 1,
  vocabularyWords: 50,
};

/**
 * Pro tier features
 */
export const PRO_FEATURES = [
  'Unlimited practice sessions',
  'Full 30-Day Reading Challenge',
  'B1-C1 learning paths',
  'Unlimited custom decks',
  'Priority pronunciation audio',
  'Advanced grammar lessons',
  'Offline mode',
  'Ad-free experience',
];

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
