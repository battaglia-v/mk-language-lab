/**
 * Subscription Status API
 *
 * Returns the current user's subscription status.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { FEATURES, FREE_TIER_LIMITS, createFreeEntitlement } from '@/lib/entitlements';
import { getEntitlementForUserId } from '@/lib/entitlements-server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Return free tier info for unauthenticated users
      return NextResponse.json({
        entitlement: createFreeEntitlement(),
        limits: FREE_TIER_LIMITS,
        features: [],
      });
    }

    const entitlement = await getEntitlementForUserId(session.user.id);

    return NextResponse.json({
      entitlement,
      limits: entitlement.isPro ? null : FREE_TIER_LIMITS,
      features: entitlement.isPro ? FEATURES.filter((feature) => feature.requiresPro) : [],
    });
  } catch (error) {
    console.error('[Subscription Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
