/**
 * Subscription Status API
 *
 * Returns the current user's subscription status.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSubscription, FREE_TIER_LIMITS, PRO_FEATURES } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      // Return free tier info for unauthenticated users
      return NextResponse.json({
        tier: 'free',
        status: 'unauthenticated',
        limits: FREE_TIER_LIMITS,
        features: [],
      });
    }

    const subscription = await getSubscription(session.user.id);

    return NextResponse.json({
      ...subscription,
      limits: subscription.tier === 'free' ? FREE_TIER_LIMITS : null,
      features: subscription.tier === 'pro' ? PRO_FEATURES : [],
    });
  } catch (error) {
    console.error('[Subscription Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}
