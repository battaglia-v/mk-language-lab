/**
 * Google Play Billing Integration
 * 
 * Handles in-app purchases through Google Play for TWA (Trusted Web Activity).
 * 
 * Integration Flow:
 * 1. Web app calls launchPurchaseFlow()
 * 2. In a Play-installed TWA, use Payment Request + Digital Goods API when available
 *    (preferred, no native bridge required).
 * 3. Fallback: native bridge (window.Android) if provided by a custom wrapper.
 * 4. After purchase, verify purchaseToken via /api/billing/verify
 * 5. Entitlement is granted and cached
 * 
 * Products:
 * - pro_monthly: Monthly Pro subscription
 * - pro_yearly: Yearly Pro subscription (40% savings)
 */

import { SUBSCRIPTION_PRODUCTS, type SubscriptionProduct } from '@/lib/entitlements';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const PLAY_BILLING_PAYMENT_METHOD = 'https://play.google.com/billing';

type DigitalGoodsItem = {
  itemId: string;
  title?: string;
  description?: string;
  price?: string;
};

type DigitalGoodsPurchase = {
  itemId: string;
  purchaseToken: string;
};

type DigitalGoodsService = {
  getDetails?: (itemIds: string[]) => Promise<DigitalGoodsItem[]>;
  listPurchases?: () => Promise<DigitalGoodsPurchase[]>;
};

async function getDigitalGoodsService(): Promise<DigitalGoodsService | null> {
  if (typeof window === 'undefined') return null;

  const getter = (window as unknown as { getDigitalGoodsService?: (method: string) => Promise<DigitalGoodsService> })
    .getDigitalGoodsService;

  if (typeof getter !== 'function') return null;

  try {
    return await getter(PLAY_BILLING_PAYMENT_METHOD);
  } catch (error) {
    console.warn('[GooglePlay] Digital Goods API unavailable:', error);
    return null;
  }
}

function getPaymentRequestCtor(): typeof PaymentRequest | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctor = (window as any).PaymentRequest as typeof PaymentRequest | undefined;
  return typeof ctor === 'function' ? ctor : null;
}

// =====================================================
// TYPES
// =====================================================

export interface GooglePlayPurchase {
  productId: string;
  purchaseToken: string;
  orderId: string;
  purchaseTime: number;
  purchaseState: number;
  acknowledged: boolean;
  autoRenewing: boolean;
}

export interface PurchaseResult {
  success: boolean;
  purchase?: GooglePlayPurchase;
  error?: string;
  errorCode?: GooglePlayBillingError;
}

export type GooglePlayBillingError = 
  | 'USER_CANCELED'
  | 'SERVICE_UNAVAILABLE'
  | 'BILLING_UNAVAILABLE'
  | 'ITEM_UNAVAILABLE'
  | 'DEVELOPER_ERROR'
  | 'ERROR'
  | 'ITEM_ALREADY_OWNED'
  | 'ITEM_NOT_OWNED'
  | 'NETWORK_ERROR'
  | 'FEATURE_NOT_SUPPORTED';

// =====================================================
// BILLING AVAILABILITY
// =====================================================

/**
 * Check if Google Play Billing is available (TWA on Android)
 */
export function isGooglePlayBillingAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Preferred: Digital Goods API (TWA via Play Billing)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (window as any).getDigitalGoodsService === 'function') return true;

  // Fallback: custom native bridge (not provided by Bubblewrap defaults)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).Android?.launchBillingFlow === 'function';
}

/**
 * Check if running in a TWA
 */
export function isRunningInTwa(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Digital Asset Links verification
  // @ts-expect-error - Android interface may not exist
  return !!window.Android?.isTwa || document.referrer.includes('android-app://');
}

async function launchPurchaseFlowWithPaymentRequest(productId: string): Promise<PurchaseResult> {
  const PaymentRequestCtor = getPaymentRequestCtor();
  if (!PaymentRequestCtor) {
    return {
      success: false,
      error: 'PaymentRequest is not available',
      errorCode: 'FEATURE_NOT_SUPPORTED',
    };
  }

  try {
    // For Google Play Billing, Chrome handles pricing; total is a required placeholder.
    // Google Play Billing requires specific Payment API types that don't match standard types
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const methodData = {
      supportedMethods: PLAY_BILLING_PAYMENT_METHOD,
      data: {
        sku: productId,
        skuType: 'subs',
      },
    } as any;

    const paymentDetails = {
      total: {
        label: 'Pro subscription',
        amount: { currency: 'USD', value: '0.00' },
      },
    } as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const request = new PaymentRequestCtor([methodData], paymentDetails);

    const response = await request.show();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details = (response as any).details ?? {};

    const purchaseToken = details.purchaseToken ?? details.token ?? null;
    const orderId = details.orderId ?? details.orderID ?? '';

    await response.complete('success').catch(() => {});

    if (typeof purchaseToken !== 'string' || purchaseToken.trim().length === 0) {
      return {
        success: false,
        error: 'Purchase did not return a token',
        errorCode: 'ERROR',
      };
    }

    const purchase: GooglePlayPurchase = {
      productId,
      purchaseToken,
      orderId: typeof orderId === 'string' ? orderId : '',
      purchaseTime: Date.now(),
      purchaseState: 0,
      acknowledged: false,
      autoRenewing: true,
    };

    const verified = await verifyPurchase(purchase);
    return {
      success: verified,
      purchase: verified ? purchase : undefined,
      error: verified ? undefined : 'Verification failed',
    };
  } catch (error) {
    const isAbort =
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError';

    return {
      success: false,
      error: isAbort ? 'Purchase canceled' : 'Purchase failed',
      errorCode: isAbort ? 'USER_CANCELED' : 'ERROR',
    };
  }
}

// =====================================================
// PURCHASE FLOW
// =====================================================

/**
 * Launch the Google Play purchase flow
 * 
 * @param productId - The product to purchase (pro_monthly or pro_yearly)
 * @returns Promise resolving to purchase result
 */
export async function launchPurchaseFlow(productId: string): Promise<PurchaseResult> {
  // Validate product
  const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === productId);
  if (!product) {
    return {
      success: false,
      error: 'Invalid product ID',
      errorCode: 'DEVELOPER_ERROR',
    };
  }
  
  // Track purchase initiation
  trackEvent(AnalyticsEvents.PURCHASE_STARTED, {
    productId,
    source: 'google_play',
  });
  
  // Check if billing is available
  if (!isGooglePlayBillingAvailable()) {
    console.warn('[GooglePlay] Billing not available - not in TWA');
    return {
      success: false,
      error: 'Google Play Billing is not available',
      errorCode: 'BILLING_UNAVAILABLE',
    };
  }

  const digitalGoodsService = await getDigitalGoodsService();
  if (digitalGoodsService) {
    return launchPurchaseFlowWithPaymentRequest(productId);
  }
  
  return new Promise((resolve) => {
    try {
      // Set up callback for purchase result
      // @ts-expect-error - Global callback for Android bridge
      window.onGooglePlayPurchaseResult = (resultJson: string) => {
        try {
          const result = JSON.parse(resultJson);
          
          if (result.success && result.purchase) {
            // Verify purchase on server
            verifyPurchase(result.purchase).then(verified => {
              resolve({
                success: verified,
                purchase: result.purchase,
                error: verified ? undefined : 'Verification failed',
              });
            });
          } else {
            resolve({
              success: false,
              error: result.error || 'Purchase failed',
              errorCode: result.errorCode,
            });
          }
        } catch {
          resolve({
            success: false,
            error: 'Failed to parse purchase result',
            errorCode: 'ERROR',
          });
        }
      };
      
      // Launch native billing flow
      // @ts-expect-error - Android interface
      window.Android.launchBillingFlow(productId);
      
    } catch (error) {
      console.error('[GooglePlay] Error launching billing:', error);
      resolve({
        success: false,
        error: 'Failed to launch billing',
        errorCode: 'ERROR',
      });
    }
  });
}

/**
 * Verify a purchase token with the server
 */
async function verifyPurchase(purchase: GooglePlayPurchase): Promise<boolean> {
  try {
    const response = await fetch('/api/billing/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: purchase.productId,
        purchaseToken: purchase.purchaseToken,
        platform: 'google_play',
      }),
    });
    
    if (!response.ok) {
      console.error('[GooglePlay] Verification failed:', await response.text());
      return false;
    }
    
    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('[GooglePlay] Verification error:', error);
    return false;
  }
}

// =====================================================
// RESTORE PURCHASES
// =====================================================

/**
 * Restore previous purchases (for users who reinstall or switch devices)
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isGooglePlayBillingAvailable()) {
    return {
      success: false,
      error: 'Google Play Billing is not available',
      errorCode: 'BILLING_UNAVAILABLE',
    };
  }

  const digitalGoodsService = await getDigitalGoodsService();
  if (digitalGoodsService?.listPurchases) {
    try {
      const purchases = await digitalGoodsService.listPurchases();
      if (!purchases.length) {
        return { success: false, error: 'No purchases to restore' };
      }

      const preferred = purchases.find((purchase) =>
        SUBSCRIPTION_PRODUCTS.some((product) => product.id === purchase.itemId)
      );

      const purchase = preferred ?? purchases[0];
      const candidate: GooglePlayPurchase = {
        productId: purchase.itemId,
        purchaseToken: purchase.purchaseToken,
        orderId: '',
        purchaseTime: Date.now(),
        purchaseState: 0,
        acknowledged: true,
        autoRenewing: true,
      };

      const verified = await verifyPurchase(candidate);
      return { success: verified, purchase: verified ? candidate : undefined };
    } catch (error) {
      console.error('[GooglePlay] Error restoring purchases (Digital Goods API):', error);
      return { success: false, error: 'Failed to restore purchases', errorCode: 'ERROR' };
    }
  }
  
  return new Promise((resolve) => {
    try {
      // @ts-expect-error - Global callback
      window.onGooglePlayRestoreResult = (resultJson: string) => {
        try {
          const result = JSON.parse(resultJson);
          
          if (result.purchases && result.purchases.length > 0) {
            // Verify the most recent active subscription
            const activeSub = result.purchases.find(
              (p: GooglePlayPurchase) => p.autoRenewing
            );
            
            if (activeSub) {
              verifyPurchase(activeSub).then(verified => {
                resolve({
                  success: verified,
                  purchase: activeSub,
                });
              });
            } else {
              resolve({
                success: false,
                error: 'No active subscription found',
              });
            }
          } else {
            resolve({
              success: false,
              error: 'No purchases to restore',
            });
          }
        } catch {
          resolve({
            success: false,
            error: 'Failed to parse restore result',
          });
        }
      };
      
      // @ts-expect-error - Android interface
      window.Android.queryPurchases();
      
    } catch (error) {
      console.error('[GooglePlay] Error restoring purchases:', error);
      resolve({
        success: false,
        error: 'Failed to restore purchases',
        errorCode: 'ERROR',
      });
    }
  });
}

// =====================================================
// SUBSCRIPTION MANAGEMENT
// =====================================================

/**
 * Open Google Play subscription management
 */
export function openSubscriptionManagement(): void {
  if (!isGooglePlayBillingAvailable()) {
    // Fallback to web URL
    window.open(
      'https://play.google.com/store/account/subscriptions',
      '_blank',
      'noopener,noreferrer'
    );
    return;
  }
  
  // @ts-expect-error - Android interface
  window.Android?.openSubscriptionManagement?.();
}

// =====================================================
// PRODUCT INFO
// =====================================================

/**
 * Get subscription products with localized pricing from Google Play
 */
export async function getProductDetails(): Promise<SubscriptionProduct[]> {
  if (!isGooglePlayBillingAvailable()) {
    // Return default products if not in TWA
    return SUBSCRIPTION_PRODUCTS;
  }

  const digitalGoodsService = await getDigitalGoodsService();
  if (digitalGoodsService?.getDetails) {
    try {
      const details = await digitalGoodsService.getDetails(SUBSCRIPTION_PRODUCTS.map((product) => product.id));

      return SUBSCRIPTION_PRODUCTS.map((product) => {
        const matching = details.find((item) => item.itemId === product.id);
        return {
          ...product,
          displayPrice: matching?.price || product.displayPrice,
        };
      });
    } catch (error) {
      console.warn('[GooglePlay] Failed to fetch product details (Digital Goods API):', error);
      return SUBSCRIPTION_PRODUCTS;
    }
  }
  
  return new Promise((resolve) => {
    try {
      // @ts-expect-error - Global callback
      window.onGooglePlayProductDetails = (resultJson: string) => {
        try {
          const result = JSON.parse(resultJson);
          
          if (result.products) {
            // Merge with our product definitions
            const products = SUBSCRIPTION_PRODUCTS.map(product => {
              const googleProduct = result.products.find(
                (p: { productId: string }) => p.productId === product.id
              );
              
              if (googleProduct) {
                return {
                  ...product,
                  displayPrice: googleProduct.price || product.displayPrice,
                };
              }
              
              return product;
            });
            
            resolve(products);
          } else {
            resolve(SUBSCRIPTION_PRODUCTS);
          }
        } catch {
          resolve(SUBSCRIPTION_PRODUCTS);
        }
      };
      
      // @ts-expect-error - Android interface
      window.Android.queryProductDetails(
        SUBSCRIPTION_PRODUCTS.map(p => p.id).join(',')
      );
      
    } catch {
      resolve(SUBSCRIPTION_PRODUCTS);
    }
  });
}
