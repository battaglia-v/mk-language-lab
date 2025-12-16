'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bug, Lightbulb, Send, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// =====================================================
// TYPES
// =====================================================

type FeedbackType = 'feedback' | 'bug' | 'suggestion';

interface FeedbackFormProps {
  /** Whether form is open */
  isOpen: boolean;
  /** Callback when form closes */
  onClose: () => void;
  /** Pre-selected feedback type */
  initialType?: FeedbackType;
  /** Context for the feedback (e.g., current page) */
  context?: {
    page?: string;
    feature?: string;
  };
  /** Translations */
  t?: {
    title?: string;
    feedbackLabel?: string;
    bugLabel?: string;
    suggestionLabel?: string;
    placeholder?: string;
    emailPlaceholder?: string;
    submitButton?: string;
    successMessage?: string;
    errorMessage?: string;
  };
}

// =====================================================
// COMPONENT
// =====================================================

/**
 * FeedbackForm - In-app feedback and issue reporting
 * 
 * Allows users to:
 * - Submit general feedback
 * - Report bugs
 * - Suggest features
 */
export function FeedbackForm({
  isOpen,
  onClose,
  initialType = 'feedback',
  context,
  t = {},
}: FeedbackFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const [type, setType] = useState<FeedbackType>(initialType);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default translations
  const translations = {
    title: t.title || 'Send Feedback',
    feedbackLabel: t.feedbackLabel || 'Feedback',
    bugLabel: t.bugLabel || 'Bug Report',
    suggestionLabel: t.suggestionLabel || 'Suggestion',
    placeholder: t.placeholder || 'Tell us what you think...',
    emailPlaceholder: t.emailPlaceholder || 'Email (optional)',
    submitButton: t.submitButton || 'Send Feedback',
    successMessage: t.successMessage || 'Thanks for your feedback!',
    errorMessage: t.errorMessage || 'Failed to send. Please try again.',
  };

  const feedbackTypes = [
    { id: 'feedback' as FeedbackType, label: translations.feedbackLabel, icon: MessageSquare },
    { id: 'bug' as FeedbackType, label: translations.bugLabel, icon: Bug },
    { id: 'suggestion' as FeedbackType, label: translations.suggestionLabel, icon: Lightbulb },
  ];

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      trackEvent(AnalyticsEvents.FEEDBACK_SUBMITTED, {
        type,
        hasEmail: !!email,
        messageLength: message.length,
      });

      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || undefined,
          context: {
            ...context,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setIsSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        // Reset form
        setMessage('');
        setEmail('');
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('[Feedback] Submit error:', err);
      setError(translations.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [type, message, email, context, onClose, translations.errorMessage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Form */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={cn(
              "fixed z-50 w-[calc(100%-2rem)] max-w-md",
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "rounded-2xl border border-border/60 bg-background/98 backdrop-blur-xl",
              "shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
              "overflow-hidden"
            )}
          >
            {isSuccess ? (
              // Success state
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 p-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20"
                >
                  <Check className="h-8 w-8 text-success" />
                </motion.div>
                <p className="text-lg font-semibold text-foreground">
                  {translations.successMessage}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
                  <h2 className="text-lg font-bold text-foreground">
                    {translations.title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Type selector */}
                  <div className="flex gap-2">
                    {feedbackTypes.map((ft) => (
                      <button
                        key={ft.id}
                        onClick={() => setType(ft.id)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                          type === ft.id
                            ? "border-primary bg-primary/10"
                            : "border-border/40 hover:border-border"
                        )}
                      >
                        <ft.icon className={cn(
                          "h-5 w-5",
                          type === ft.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          type === ft.id ? "text-primary" : "text-muted-foreground"
                        )}>
                          {ft.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Message textarea */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={translations.placeholder}
                    rows={4}
                    className={cn(
                      "w-full rounded-xl border border-border/60 bg-white/5 px-4 py-3",
                      "text-sm text-foreground placeholder:text-muted-foreground",
                      "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      "resize-none"
                    )}
                  />

                  {/* Email input (optional) */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={translations.emailPlaceholder}
                    className={cn(
                      "w-full rounded-xl border border-border/60 bg-white/5 px-4 py-3",
                      "text-sm text-foreground placeholder:text-muted-foreground",
                      "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    )}
                  />

                  {/* Error message */}
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  {/* Submit button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-[#0a0a0a] font-semibold"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent" />
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {translations.submitButton}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

