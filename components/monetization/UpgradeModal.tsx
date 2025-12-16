'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Sparkles, Zap, Volume2, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { 
  SUBSCRIPTION_PRODUCTS, 
  FEATURES,
  type UpsellContext,
  type SubscriptionProduct,
} from '@/lib/entitlements';
import { 
  isGooglePlayBillingAvailable, 
  launchPurchaseFlow,
  getProductDetails,
} from '@/lib/billing/google-play';
import { isStripeEnabled } from '@/lib/billing/stripe';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// =====================================================
// TYPES
// =====================================================

interface UpgradeModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Context for why upsell is showing */
  context?: UpsellContext;
  /** Callback after successful purchase */
  onPurchaseSuccess?: () => void;
  /** Translations */
  t?: {
    title?: string;
    subtitle?: string;
    monthlyLabel?: string;
    yearlyLabel?: string;
    saveLabel?: string;
    continueButton?: string;
    restorePurchases?: string;
    termsLink?: string;
    privacyLink?: string;
  };
}

// Feature icons mapping
const FEATURE_ICONS: Record<string, React.ReactNode> = {
  native_audio: <Volume2 className="h-5 w-5" />,
  advanced_grammar: <BookOpen className="h-5 w-5" />,
  unlimited_practice: <Zap className="h-5 w-5" />,
  custom_decks: <Sparkles className="h-5 w-5" />,
  offline_content: <Star className="h-5 w-5" />,
};

// =====================================================
// COMPONENT
// =====================================================

/**
 * UpgradeModal - Premium upgrade prompt
 * 
 * Shows subscription options at positive moments:
 * - Daily goal completed
 * - Streak milestones
 * - Pro feature tapped
 * 
 * NEVER interrupts learning flow.
 */
export function UpgradeModal({
  isOpen,
  onClose,
  context,
  onPurchaseSuccess,
  t = {},
}: UpgradeModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [products, setProducts] = useState<SubscriptionProduct[]>(SUBSCRIPTION_PRODUCTS);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default translations
  const translations = {
    title: t.title || 'Unlock Pro',
    subtitle: t.subtitle || 'Take your Macedonian to the next level',
    monthlyLabel: t.monthlyLabel || 'Monthly',
    yearlyLabel: t.yearlyLabel || 'Yearly',
    saveLabel: t.saveLabel || 'Save 33%',
    continueButton: t.continueButton || 'Continue',
    restorePurchases: t.restorePurchases || 'Restore Purchases',
    termsLink: t.termsLink || 'Terms',
    privacyLink: t.privacyLink || 'Privacy',
  };

  // Get Pro features to display
  const proFeatures = FEATURES.filter(f => f.requiresPro);

  // Fetch localized prices on mount
  useEffect(() => {
    if (isOpen && isGooglePlayBillingAvailable()) {
      getProductDetails().then(setProducts);
    }
  }, [isOpen]);

  // Track modal view
  useEffect(() => {
    if (isOpen) {
      trackEvent(AnalyticsEvents.UPGRADE_MODAL_VIEWED, {
        trigger: context?.trigger || 'unknown',
        featureId: context?.featureId || '',
      });
    }
  }, [isOpen, context]);

  const handlePurchase = useCallback(async () => {
    const product = products.find(p => p.period === selectedPlan);
    if (!product) return;

    setIsPurchasing(true);
    setError(null);

    try {
      // Track purchase attempt
      trackEvent(AnalyticsEvents.PURCHASE_STARTED, {
        productId: product.id,
        plan: selectedPlan,
      });

      if (isGooglePlayBillingAvailable()) {
        const result = await launchPurchaseFlow(product.id);
        
        if (result.success) {
          trackEvent(AnalyticsEvents.PURCHASE_COMPLETED, {
            productId: product.id,
          });
          onPurchaseSuccess?.();
          onClose();
        } else {
          setError(result.error || 'Purchase failed');
          trackEvent(AnalyticsEvents.PURCHASE_FAILED, {
            error: result.errorCode || 'unknown',
          });
        }
      } else if (isStripeEnabled()) {
        // Web payments - redirect to Stripe
        // TODO: Implement when enabling web payments
        setError('Web payments coming soon');
      } else {
        setError('Payments not available on this device');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('[UpgradeModal] Purchase error:', err);
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPlan, products, onPurchaseSuccess, onClose]);

  const selectedProduct = products.find(p => p.period === selectedPlan);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={cn(
              "fixed z-50 w-[calc(100%-2rem)] max-w-md",
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "rounded-3xl border border-primary/20 bg-background/98 backdrop-blur-xl",
              "shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(246,216,59,0.15)]",
              "overflow-hidden"
            )}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 px-6 py-6 text-center">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Crown icon */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg"
              >
                <Crown className="h-8 w-8 text-[#0a0a0a]" />
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground">
                {translations.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {translations.subtitle}
              </p>
            </div>

            {/* Features list */}
            <div className="px-6 py-4">
              <div className="space-y-3">
                {proFeatures.slice(0, 4).map((feature, idx) => (
                  <motion.div
                    key={feature.id}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {FEATURE_ICONS[feature.id] || <Check className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Plan selection */}
            <div className="px-6 py-4 border-t border-border/40">
              <div className="grid grid-cols-2 gap-3">
                {/* Monthly */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-all",
                    selectedPlan === 'monthly'
                      ? "border-primary bg-primary/10"
                      : "border-border/40 hover:border-border"
                  )}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {translations.monthlyLabel}
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {products.find(p => p.period === 'monthly')?.displayPrice || '$4.99/mo'}
                  </p>
                </button>

                {/* Yearly */}
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-all",
                    selectedPlan === 'yearly'
                      ? "border-primary bg-primary/10"
                      : "border-border/40 hover:border-border"
                  )}
                >
                  <Badge className="absolute -top-2 right-2 bg-secondary text-secondary-foreground text-[10px]">
                    {translations.saveLabel}
                  </Badge>
                  <p className="text-sm font-medium text-muted-foreground">
                    {translations.yearlyLabel}
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {products.find(p => p.period === 'yearly')?.displayPrice || '$39.99/yr'}
                  </p>
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-6 mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* CTA */}
            <div className="px-6 pb-6">
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-secondary text-[#0a0a0a] text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPurchasing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent" />
                ) : (
                  <>
                    <Crown className="mr-2 h-5 w-5" />
                    {translations.continueButton} - {selectedProduct?.displayPrice}
                  </>
                )}
              </Button>

              {/* Restore purchases link */}
              <button
                onClick={() => {
                  // TODO: Implement restore
                }}
                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {translations.restorePurchases}
              </button>

              {/* Legal links */}
              <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {translations.termsLink}
                </Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {translations.privacyLink}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
