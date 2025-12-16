'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  shouldShowReviewPrompt,
  triggerReviewFlow,
  markReviewGiven,
  recordCompletedSession,
} from '@/lib/in-app-review';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// =====================================================
// TYPES
// =====================================================

interface ReviewPromptProps {
  /** Session data for determining if to show prompt */
  sessionData: {
    accuracy: number;
    correctCount: number;
    totalAttempts: number;
    hadErrors: boolean;
  };
  /** Whether to check and potentially show prompt */
  shouldCheck?: boolean;
  /** Callback when prompt is shown */
  onShow?: () => void;
  /** Callback when prompt is dismissed */
  onDismiss?: () => void;
  /** Callback when user agrees to review */
  onReview?: () => void;
  /** Translations */
  t?: {
    title?: string;
    subtitle?: string;
    yesButton?: string;
    laterButton?: string;
    thankYou?: string;
  };
}

// =====================================================
// COMPONENT
// =====================================================

/**
 * ReviewPrompt - In-app review prompt
 * 
 * Shows after positive learning moments (high accuracy, no errors).
 * Uses Google Play In-App Review API on Android.
 * 
 * Trigger conditions:
 * - 3+ successful sessions
 * - Current session accuracy >= 70%
 * - No errors in current session
 * - Not prompted in last 30 days
 * - User hasn't already given a review
 */
export function ReviewPrompt({
  sessionData,
  shouldCheck = false,
  onShow,
  onDismiss,
  onReview,
  t = {},
}: ReviewPromptProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Default translations
  const translations = {
    title: t.title || 'Enjoying MK Language Lab?',
    subtitle: t.subtitle || 'Your feedback helps us improve!',
    yesButton: t.yesButton || 'Rate Us ⭐',
    laterButton: t.laterButton || 'Maybe Later',
    thankYou: t.thankYou || 'Thank you for your support! 💛',
  };

  // Check if we should show the prompt
  useEffect(() => {
    if (!shouldCheck) return;

    // Record the completed session first
    recordCompletedSession(sessionData);

    // Check if we should show the review prompt
    const shouldShow = shouldShowReviewPrompt({
      accuracy: sessionData.accuracy,
      hadErrors: sessionData.hadErrors,
    });

    if (shouldShow) {
      // Small delay before showing to not interrupt the celebration
      const timer = setTimeout(() => {
        setIsVisible(true);
        onShow?.();
        
        trackEvent(AnalyticsEvents.REVIEW_PROMPT_SHOWN, {
          accuracy: sessionData.accuracy,
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [shouldCheck, sessionData, onShow]);

  const handleReview = useCallback(async () => {
    trackEvent(AnalyticsEvents.REVIEW_ACCEPTED, {});

    // Trigger the native review flow
    await triggerReviewFlow();
    
    // Mark as reviewed (even if user cancels in native dialog)
    markReviewGiven();
    
    setHasReviewed(true);
    onReview?.();

    // Auto-dismiss after showing thank you
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 2000);
  }, [onReview, onDismiss]);

  const handleLater = useCallback(() => {
    trackEvent(AnalyticsEvents.REVIEW_DECLINED, {});

    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={cn(
            "fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-sm",
            "rounded-2xl border border-primary/30 bg-background/98 backdrop-blur-xl",
            "shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(246,216,59,0.1)]",
            "p-5"
          )}
        >
          {hasReviewed ? (
            // Thank you state
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
              >
                <Heart className="h-10 w-10 text-destructive fill-destructive" />
              </motion.div>
              <p className="text-center text-lg font-semibold text-foreground">
                {translations.thankYou}
              </p>
            </motion.div>
          ) : (
            // Prompt state
            <>
              {/* Close button */}
              <button
                onClick={handleLater}
                className="absolute right-3 top-3 rounded-full p-1 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="flex flex-col items-center gap-4">
                {/* Stars animation */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                    >
                      <Star 
                        className="h-6 w-6 text-primary fill-primary" 
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Text */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground">
                    {translations.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {translations.subtitle}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex w-full gap-3">
                  <Button
                    variant="outline"
                    onClick={handleLater}
                    className="flex-1 h-11"
                  >
                    {translations.laterButton}
                  </Button>
                  <Button
                    onClick={handleReview}
                    className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary text-[#0a0a0a] font-semibold"
                  >
                    {translations.yesButton}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage review prompt state
 */
export function useReviewPrompt() {
  const [shouldCheck, setShouldCheck] = useState(false);
  const [sessionData, setSessionData] = useState({
    accuracy: 0,
    correctCount: 0,
    totalAttempts: 0,
    hadErrors: false,
  });

  const triggerCheck = useCallback((data: typeof sessionData) => {
    setSessionData(data);
    setShouldCheck(true);
  }, []);

  const reset = useCallback(() => {
    setShouldCheck(false);
  }, []);

  return {
    shouldCheck,
    sessionData,
    triggerCheck,
    reset,
  };
}

