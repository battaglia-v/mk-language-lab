/**
 * Billing Verification API
 *
 * Verifies purchase tokens from Google Play or Stripe
 * and grants Pro entitlements to users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface VerifyRequest {
  productId: string;
  purchaseToken: string;
  platform: 'google_play' | 'stripe';
  orderId?: string;
}

type VerificationResult = {
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'expired';
  orderId: string | null;
  purchasedAt: Date | null;
  expiresAt: Date | null;
  autoRenewing: boolean | null;
};

const GOOGLE_PLAY_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

async function verifyGooglePlaySubscription(productId: string, purchaseToken: string): Promise<VerificationResult> {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.mklanguage.twa';

  const rawServiceAccount = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  let parsedCredentials: unknown | undefined;
  if (rawServiceAccount) {
    try {
      parsedCredentials = JSON.parse(rawServiceAccount) as unknown;
    } catch (error) {
      console.error('[Billing] Invalid GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', error);
      throw new Error('Invalid Google Play service account JSON');
    }
  }

  const authClient = parsedCredentials
    ? new google.auth.GoogleAuth({
        credentials: parsedCredentials as Record<string, unknown>,
        scopes: [GOOGLE_PLAY_SCOPE],
      })
    : new google.auth.GoogleAuth({ scopes: [GOOGLE_PLAY_SCOPE] });

  const androidpublisher = google.androidpublisher({
    version: 'v3',
    auth: authClient,
  });

  const response = await androidpublisher.purchases.subscriptions.get({
    packageName,
    subscriptionId: productId,
    token: purchaseToken,
  });

  const data = response.data;
  const expiryTimeMillis = data.expiryTimeMillis ? Number(data.expiryTimeMillis) : null;
  const startTimeMillis = data.startTimeMillis ? Number(data.startTimeMillis) : null;
  const expiresAt = expiryTimeMillis ? new Date(expiryTimeMillis) : null;
  const purchasedAt = startTimeMillis ? new Date(startTimeMillis) : null;
  const now = Date.now();

  const isExpired = expiresAt ? expiresAt.getTime() <= now : false;

  // cancelReason can be set even while the subscription is still active until expiryTimeMillis.
  const cancelReasonPresent = typeof data.cancelReason === 'number';
  const status: VerificationResult['status'] = isExpired
    ? 'expired'
    : cancelReasonPresent
      ? 'canceled'
      : 'active';

  return {
    status,
    orderId: data.orderId ?? null,
    purchasedAt,
    expiresAt,
    autoRenewing: typeof data.autoRenewing === 'boolean' ? data.autoRenewing : null,
  };
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

    if (purchaseToken.trim().length < 10) {
      return NextResponse.json(
        { verified: false, error: 'Invalid purchase token' },
        { status: 400 }
      );
    }

    let verification: VerificationResult;

    if (platform === 'google_play') {
      if (!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return NextResponse.json(
          { verified: false, error: 'Google Play verification is not configured' },
          { status: 501 }
        );
      }

      try {
        verification = await verifyGooglePlaySubscription(productId, purchaseToken);
      } catch (error) {
        console.error('[Billing] Google Play verification failed:', error);
        return NextResponse.json(
          { verified: false, error: 'Google Play verification failed' },
          { status: 400 }
        );
      }
    } else {
      // Stripe support is intentionally disabled until webhook + checkout are implemented.
      return NextResponse.json(
        { verified: false, error: 'Stripe verification is not implemented' },
        { status: 501 }
      );
    }

    if (verification.status === 'expired' || verification.status === 'inactive') {
      return NextResponse.json(
        { verified: false, error: 'Subscription is not active' },
        { status: 402 }
      );
    }

    // Persist subscription to database
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        status: verification.status,
        source: platform === 'google_play' ? 'google_play' : 'stripe',
        productId,
        period: productId.includes('yearly') ? 'yearly' : 'monthly',
        purchaseToken,
        orderId: verification.orderId || orderId || null,
        purchasedAt: verification.purchasedAt ?? new Date(),
        expiresAt: verification.expiresAt,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        status: verification.status,
        source: platform === 'google_play' ? 'google_play' : 'stripe',
        productId,
        period: productId.includes('yearly') ? 'yearly' : 'monthly',
        purchaseToken,
        orderId: verification.orderId || orderId || null,
        purchasedAt: verification.purchasedAt ?? new Date(),
        expiresAt: verification.expiresAt,
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
