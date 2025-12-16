/**
 * Google Play Billing Integration
 * 
 * Handles in-app purchases through Google Play for TWA (Trusted Web Activity).
 * 
 * Integration Flow:
 * 1. Web app calls launchPurchaseFlow()
 * 2. Native Android bridge (window.Android) initiates billing
 * 3. Google Play shows purchase sheet
 * 4. After purchase, Android calls back with purchaseToken
 * 5. Web app verifies token via /api/billing/verify
 * 6. Entitlement is granted and cached
 * 
 * Products:
 * - pro_monthly: Monthly Pro subscription
 * - pro_yearly: Yearly Pro subscription (33% savings)
 */

import { SUBSCRIPTION_PRODUCTS, type SubscriptionProduct } from '@/lib/entitlements';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

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
  
  // Check for Android bridge
  // @ts-expect-error - Android interface may not exist
  return typeof window.Android?.launchBillingFlow === 'function';
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
  trackEvent(AnalyticsEvents.PRACTICE_MODAL_OPENED, {
    action: 'purchase_started',
    productId,
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

