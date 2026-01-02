/**
 * Entitlement resolution (server-side)
 *
 * Converts a DB subscription record into the shared `UserEntitlement` DTO.
 * Keep this as the single server-side mapping so API routes/pages stay consistent.
 */

import prisma from '@/lib/prisma';
import { createFreeEntitlement, type UserEntitlement } from '@/lib/entitlements';

type DbSubscription = {
  status: string;
  source: string;
  productId: string | null;
  period: string | null;
  purchasedAt: Date | null;
  expiresAt: Date | null;
} | null;

export function resolveEntitlementFromDbSubscription(subscription: DbSubscription): UserEntitlement {
  if (!subscription || subscription.status === 'inactive') {
    return createFreeEntitlement();
  }

  const now = new Date();
  const expiresAt = subscription.expiresAt ?? null;
  const isExpired = expiresAt ? expiresAt <= now : false;

  if (isExpired || subscription.status === 'expired') {
    return createFreeEntitlement();
  }

  const inGracePeriod = subscription.status === 'past_due';
  const isPro = ['active', 'canceled', 'past_due'].includes(subscription.status) && !isExpired;

  if (!isPro) {
    return createFreeEntitlement();
  }

  const period =
    subscription.period === 'monthly' || subscription.period === 'yearly'
      ? subscription.period
      : null;

  return {
    isPro: true,
    tier: 'pro',
    source: subscription.source as UserEntitlement['source'],
    expiresAt: expiresAt?.toISOString() ?? null,
    inGracePeriod,
    purchasedAt: subscription.purchasedAt?.toISOString() ?? null,
    period,
    productId: subscription.productId ?? null,
  };
}

export async function getEntitlementForUserId(userId: string): Promise<UserEntitlement> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      source: true,
      productId: true,
      period: true,
      purchasedAt: true,
      expiresAt: true,
    },
  });

  return resolveEntitlementFromDbSubscription(subscription);
}
