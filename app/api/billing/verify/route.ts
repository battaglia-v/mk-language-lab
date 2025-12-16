/**
 * Billing Verification API
 * 
 * Verifies purchase tokens from Google Play or Stripe
 * and grants Pro entitlements to users.
 * 
 * NOTE: This is a stub until the Subscription model is migrated.
 * Run `npx prisma migrate dev` to enable full billing support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface VerifyRequest {
  productId: string;
  purchaseToken: string;
  platform: 'google_play' | 'stripe';
  orderId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: VerifyRequest = await request.json();
    const { productId, purchaseToken, platform } = body;

    // Validate request
    if (!productId || !purchaseToken || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate product ID
    const validProducts = ['pro_monthly', 'pro_yearly'];
    if (!validProducts.includes(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Basic token validation
    const isValidToken = purchaseToken.length > 10;
    
    if (!isValidToken) {
      console.error('[Billing] Invalid purchase token format');
      return NextResponse.json(
        { verified: false, error: 'Invalid purchase token' },
        { status: 400 }
      );
    }

    // TODO: Once Subscription model is migrated:
    // 1. Verify purchase token with Google Play Developer API
    // 2. Upsert subscription record in database
    // 3. Return full subscription details
    //
    // For now, we acknowledge the purchase but don't persist it
    // This allows the client to cache the entitlement locally

    console.log('[Billing] Purchase verification (stub):', {
      userId: session.user.id,
      productId,
      platform,
    });

    // Return success - client will cache entitlement
    // Once migration runs, this will persist to database
    return NextResponse.json({
      verified: true,
      subscription: {
        status: 'active',
        productId,
        // Expires in 1 month or 1 year based on product
        expiresAt: new Date(
          Date.now() + (productId.includes('yearly') ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    });
  } catch (error) {
    console.error('[Billing] Verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

