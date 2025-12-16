/**
 * Stripe Web Payments Integration (STUBBED - NOT LIVE)
 * 
 * This module provides the foundation for web-based payments via Stripe.
 * Currently disabled via feature flag - will be enabled post-launch.
 * 
 * TODO: Before enabling:
 * 1. Set up Stripe account and products
 * 2. Configure webhook endpoint
 * 3. Add Stripe publishable key to env
 * 4. Test checkout flow end-to-end
 * 5. Set ENABLE_WEB_PAYMENTS = true
 */

import { SUBSCRIPTION_PRODUCTS, type SubscriptionProduct } from '@/lib/entitlements';

// =====================================================
// FEATURE FLAG
// =====================================================

/**
 * Feature flag for web payments
 * Set to true when ready to enable Stripe
 */
export const ENABLE_WEB_PAYMENTS = false;

// =====================================================
// TYPES
// =====================================================

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeSubscription {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// =====================================================
// STRIPE CONFIGURATION
// =====================================================

// TODO: Add to .env when enabling
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
// STRIPE_SECRET_KEY=sk_live_xxx
// STRIPE_WEBHOOK_SECRET=whsec_xxx

// Stripe price IDs (create in Stripe Dashboard)
export const STRIPE_PRICE_IDS: Record<string, string> = {
  pro_monthly: '', // TODO: price_xxx
  pro_yearly: '', // TODO: price_xxx
};

// =====================================================
// CHECKOUT
// =====================================================

/**
 * Check if Stripe payments are enabled
 */
export function isStripeEnabled(): boolean {
  return ENABLE_WEB_PAYMENTS && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/**
 * Create a Stripe Checkout session
 * 
 * TODO: Implement when enabling web payments
 */
export async function createCheckoutSession(
  productId: string,
  _userId: string
): Promise<StripeCheckoutSession | null> {
  if (!ENABLE_WEB_PAYMENTS) {
    console.warn('[Stripe] Web payments are disabled');
    return null;
  }
  
  const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === productId);
  if (!product) {
    console.error('[Stripe] Invalid product ID:', productId);
    return null;
  }
  
  // TODO: Implement checkout session creation
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   payment_method_types: ['card'],
  //   line_items: [{
  //     price: STRIPE_PRICE_IDS[productId],
  //     quantity: 1,
  //   }],
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/canceled`,
  //   client_reference_id: userId,
  //   metadata: {
  //     userId,
  //     productId,
  //   },
  // });
  
  return null;
}

/**
 * Redirect to Stripe Checkout
 * 
 * TODO: Implement when enabling web payments
 */
export async function redirectToCheckout(productId: string): Promise<void> {
  if (!ENABLE_WEB_PAYMENTS) {
    console.warn('[Stripe] Web payments are disabled');
    return;
  }
  
  // TODO: Implement redirect
  // const session = await createCheckoutSession(productId, userId);
  // if (session) {
  //   window.location.href = session.url;
  // }
  
  console.log('[Stripe] Would redirect to checkout for:', productId);
}

/**
 * Get customer portal URL for subscription management
 * 
 * TODO: Implement when enabling web payments
 */
export async function getCustomerPortalUrl(_userId: string): Promise<string | null> {
  if (!ENABLE_WEB_PAYMENTS) {
    return null;
  }
  
  // TODO: Implement portal session creation
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: customerId,
  //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
  // });
  // return session.url;
  
  return null;
}

// =====================================================
// WEBHOOK HANDLING (Server-side only)
// =====================================================

/**
 * Handle Stripe webhook events
 * 
 * TODO: Implement in /api/webhooks/stripe route
 * 
 * Events to handle:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export type StripeWebhookEvent = 
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';

/**
 * Verify Stripe webhook signature
 * 
 * TODO: Implement in webhook handler
 */
export function verifyWebhookSignature(
  _payload: string,
  _signature: string
): boolean {
  // TODO: Implement signature verification
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const event = stripe.webhooks.constructEvent(
  //   payload,
  //   signature,
  //   process.env.STRIPE_WEBHOOK_SECRET
  // );
  // return !!event;
  
  return false;
}

// =====================================================
// PRODUCT INFO
// =====================================================

/**
 * Get Stripe products with localized pricing
 * 
 * TODO: Implement when enabling web payments
 */
export async function getStripeProducts(): Promise<SubscriptionProduct[]> {
  if (!ENABLE_WEB_PAYMENTS) {
    return SUBSCRIPTION_PRODUCTS;
  }
  
  // TODO: Fetch prices from Stripe
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const prices = await stripe.prices.list({
  //   active: true,
  //   product: 'prod_xxx',
  // });
  
  return SUBSCRIPTION_PRODUCTS;
}

