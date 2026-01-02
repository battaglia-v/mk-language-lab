/**
 * User Entitlement API
 * 
 * Returns the user's current subscription status and Pro features.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createFreeEntitlement } from '@/lib/entitlements';
import { getEntitlementForUserId } from '@/lib/entitlements-server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      // Return free entitlement for unauthenticated users
      return NextResponse.json({
        entitlement: createFreeEntitlement(),
      });
    }

    return NextResponse.json({
      entitlement: await getEntitlementForUserId(session.user.id),
    });
  } catch (error) {
    console.error('[Entitlement API] Error:', error);
    
    // Return free entitlement on error to avoid blocking users
    return NextResponse.json({
      entitlement: createFreeEntitlement(),
    });
  }
}
