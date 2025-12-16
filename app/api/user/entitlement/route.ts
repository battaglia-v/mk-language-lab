/**
 * User Entitlement API
 * 
 * Returns the user's current subscription status and Pro features.
 * 
 * NOTE: This returns free entitlement until the Subscription model
 * is migrated to the database. Run `npx prisma migrate dev` to enable
 * full subscription support.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createFreeEntitlement } from '@/lib/entitlements';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      // Return free entitlement for unauthenticated users
      return NextResponse.json({
        entitlement: createFreeEntitlement(),
      });
    }

    // TODO: Once Subscription model is migrated, uncomment this:
    // const subscription = await prisma.subscription.findUnique({
    //   where: { userId: session.user.id },
    // });
    // 
    // if (subscription?.status === 'active') {
    //   return NextResponse.json({
    //     entitlement: {
    //       isPro: true,
    //       tier: 'pro',
    //       source: subscription.source,
    //       expiresAt: subscription.expiresAt?.toISOString() ?? null,
    //       ...
    //     }
    //   });
    // }

    // For now, return free entitlement
    // This ensures the app works before migration is run
    return NextResponse.json({
      entitlement: createFreeEntitlement(),
    });
  } catch (error) {
    console.error('[Entitlement API] Error:', error);
    
    // Return free entitlement on error to avoid blocking users
    return NextResponse.json({
      entitlement: createFreeEntitlement(),
    });
  }
}

