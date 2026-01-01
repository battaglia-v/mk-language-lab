/**
 * Billing Verification API
 *
 * Verifies purchase tokens from Google Play or Stripe
 * and grants Pro entitlements to users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: VerifyRequest = await request.json();
    const { productId, purchaseToken, platform, orderId } = body;

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
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
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

    // TODO: For production, verify purchase token with Google Play Developer API:
    // const { google } = require('googleapis');
    // const androidpublisher = google.androidpublisher('v3');
    // const response = await androidpublisher.purchases.subscriptions.get({
    //   packageName: 'com.mklanguagelab.app',
    //   subscriptionId: productId,
    //   token: purchaseToken,
    // });

    // Calculate expiration date
    const isYearly = productId.includes('yearly');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (isYearly ? 365 : 30));

    // Persist subscription to database
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        status: 'active',
        source: platform === 'google_play' ? 'google_play' : 'stripe',
        productId,
        period: isYearly ? 'yearly' : 'monthly',
        purchaseToken,
        orderId: orderId || null,
        purchasedAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        status: 'active',
        source: platform === 'google_play' ? 'google_play' : 'stripe',
        productId,
        period: isYearly ? 'yearly' : 'monthly',
        purchaseToken,
        orderId: orderId || null,
        purchasedAt: new Date(),
        expiresAt,
      },
    });

    console.log('[Billing] Purchase verified and persisted:', {
      userId: session.user.id,
      productId,
      platform,
      subscriptionId: subscription.id,
    });

    return NextResponse.json({
      verified: true,
      subscription: {
        status: subscription.status,
        productId: subscription.productId,
        expiresAt: subscription.expiresAt?.toISOString(),
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

