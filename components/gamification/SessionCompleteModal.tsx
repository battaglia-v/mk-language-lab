'use client';

/**
 * SessionCompleteModal Component
 *
 * Duolingo-style session completion modal showing:
 * - XP earned with animated counter
 * - Streak status with flame animation
 * - Progress toward daily goal (ring visualization)
 * - "Keep Going" vs "Done for Today" CTAs
 * - Subtle confetti animation
 *
 * Respects prefers-reduced-motion for accessibility.
 */

import { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Flame, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modalBackdrop, fadeInUp } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { ProgressRing } from './ProgressRing';

/** Word learning summary for session complete */
export interface WordLearningSummary {
  /** Total words practiced in this session */
  wordsPracticed: number;
  /** Words answered correctly (mastered this session) */
  wordsMastered: number;
  /** Words that need more practice */
  wordsToReview: number;
  /** Optional: specific words to review */
  reviewWordsList?: Array<{ mk: string; en: string }>;
}

interface SessionCompleteModalProps {
  open: boolean;
  onClose: () => void;
  /** XP earned in this session */
  xpEarned: number;
  /** Total XP earned today (including this session) */
  todayXP: number;
  /** Daily XP goal */
  dailyGoalXP: number;
  /** Current streak count */
  streak: number;
  /** Whether this session extended the streak */
  streakExtended?: boolean;
  /** Whether streak was saved by freeze today */
  streakSavedByFreeze?: boolean;
  /** Show confetti animation */
  showConfetti?: boolean;
  /** Callback for "Keep Going" button */
  onKeepGoing: () => void;
  /** Callback for "Done for Today" button */
  onDone: () => void;
  /** Word learning summary (optional) */
  wordSummary?: WordLearningSummary;
  /** Link to review weak words */
  reviewWordsHref?: string;
  /** Translations */
  t?: {
    sessionComplete?: string;
    xpEarned?: string;
    dayStreak?: string;
    streakExtended?: string;
    streakSaved?: string;
    dailyProgress?: string;
    goalComplete?: string;
    keepGoing?: string;
    doneForToday?: string;
    wordsPracticed?: string;
    wordsMastered?: string;
    wordsToReview?: string;
    reviewNow?: string;
  };
}

/**
 * Animated counter that counts up from 0 to target value
 */
function AnimatedCounter({ 
  value, 
  duration = 1000,
  prefix = '+',
  suffix = '',
}: { 
  value: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth end
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, prefersReducedMotion]);

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

/**
 * Confetti Animation Component - Subtle version
 */
function Confetti() {
  const confettiCount = 30;
  const colors = ['#F6D83B', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: confettiCount }).map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.3;
        const randomDuration = 2 + Math.random() * 1.5;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}vw`,
              y: -10,
              rotate: 0,
              opacity: 0.8,
            }}
            animate={{
              y: '100vh',
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: 0,
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              backgroundColor: randomColor,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        );
      })}
    </div>
  );
}

export function SessionCompleteModal({
  open,
  onClose,
  xpEarned,
  todayXP,
  dailyGoalXP,
  streak,
  streakExtended = false,
  streakSavedByFreeze = false,
  showConfetti = true,
  onKeepGoing,
  onDone,
  wordSummary,
  reviewWordsHref,
  t = {},
}: SessionCompleteModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap<HTMLDivElement>(open);
  const titleId = useId();
  
  // Default translations
  const translations = {
    sessionComplete: t.sessionComplete || 'Session Complete!',
    xpEarned: t.xpEarned || 'XP Earned',
    dayStreak: t.dayStreak || 'Day Streak',
    streakExtended: t.streakExtended || 'Streak extended!',
    streakSaved: t.streakSaved || '🛡️ Streak freeze used!',
    dailyProgress: t.dailyProgress || 'Daily Progress',
    goalComplete: t.goalComplete || 'Goal Complete!',
    keepGoing: t.keepGoing || 'Keep Going',
    doneForToday: t.doneForToday || 'Done for Today',
    wordsPracticed: t.wordsPracticed || 'Words Practiced',
    wordsMastered: t.wordsMastered || 'Mastered',
    wordsToReview: t.wordsToReview || 'To Review',
    reviewNow: t.reviewNow || 'Review Now',
  };

  // Calculate daily progress percentage
  const dailyProgress = Math.min((todayXP / dailyGoalXP) * 100, 100);
  const isGoalComplete = dailyProgress >= 100;

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Reduced motion variants
  const reducedBackdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.01 } },
    exit: { opacity: 0, transition: { duration: 0.01 } },
  };

  const reducedFadeIn = {
    initial: { opacity: 1 },
    animate: { opacity: 1, transition: { duration: 0.01 } },
    exit: { opacity: 0, transition: { duration: 0.01 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            variants={prefersReducedMotion ? reducedBackdrop : modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />

          {/* Confetti - skip if reduced motion preferred or disabled */}
          {showConfetti && !prefersReducedMotion && <Confetti />}

          {/* Modal */}
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            variants={prefersReducedMotion ? reducedFadeIn : fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 overflow-hidden rounded-3xl border border-border/50 bg-background shadow-2xl sm:inset-x-auto sm:w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center p-6 pt-8 text-center">
              {/* Progress Ring with checkmark/star */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="relative mb-4"
              >
                <ProgressRing
                  progress={dailyProgress}
                  size={120}
                  strokeWidth={10}
                  progressColor={isGoalComplete ? 'var(--success)' : 'var(--mk-accent)'}
                >
                  <motion.div
                    initial={prefersReducedMotion ? {} : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full',
                      isGoalComplete ? 'bg-success/20' : 'bg-accent/20'
                    )}
                  >
                    {isGoalComplete ? (
                      <Check className="h-8 w-8 text-success" strokeWidth={3} />
                    ) : (
                      <Star className="h-8 w-8 text-accent" fill="currentColor" />
                    )}
                  </motion.div>
                </ProgressRing>
              </motion.div>

              {/* Title */}
              <motion.h2
                id={titleId}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-1 text-2xl font-bold text-foreground"
              >
                {isGoalComplete ? translations.goalComplete : translations.sessionComplete}
              </motion.h2>

              {/* XP Earned */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex items-center gap-2"
              >
                <Star className="h-5 w-5 text-accent" fill="currentColor" />
                <span className="text-3xl font-bold text-accent">
                  <AnimatedCounter value={xpEarned} prefix="+" suffix=" XP" />
                </span>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6 flex w-full items-center justify-center gap-6"
              >
                {/* Streak */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={streakExtended && !prefersReducedMotion ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0],
                      } : {}}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Flame 
                        className={cn(
                          'h-6 w-6',
                          streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
                        )} 
                        fill={streak > 0 ? 'currentColor' : 'none'}
                      />
                    </motion.div>
                    <span className="text-2xl font-bold text-foreground">{streak}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{translations.dayStreak}</span>
                  {streakExtended && (
                    <motion.span
                      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-1 text-xs font-medium text-orange-500"
                    >
                      {translations.streakExtended}
                    </motion.span>
                  )}
                  {streakSavedByFreeze && !streakExtended && (
                    <motion.span
                      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-1 text-xs font-medium text-blue-500"
                    >
                      {translations.streakSaved}
                    </motion.span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-12 w-px bg-border" />

                {/* Daily Progress */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">
                    {todayXP}/{dailyGoalXP}
                  </span>
                  <span className="text-xs text-muted-foreground">{translations.dailyProgress}</span>
                </div>
              </motion.div>

              {/* Word Learning Summary */}
              {wordSummary && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-6 w-full rounded-xl border border-border/50 bg-muted/30 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>📚</span>
                    {translations.wordsPracticed}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {/* Words Practiced */}
                    <div>
                      <span className="block text-xl font-bold text-foreground">
                        {wordSummary.wordsPracticed}
                      </span>
                      <span className="text-xs text-muted-foreground">Practiced</span>
                    </div>
                    {/* Words Mastered */}
                    <div>
                      <span className="block text-xl font-bold text-green-500">
                        {wordSummary.wordsMastered}
                      </span>
                      <span className="text-xs text-muted-foreground">{translations.wordsMastered}</span>
                    </div>
                    {/* Words to Review */}
                    <div>
                      <span className="block text-xl font-bold text-amber-500">
                        {wordSummary.wordsToReview}
                      </span>
                      <span className="text-xs text-muted-foreground">{translations.wordsToReview}</span>
                    </div>
                  </div>
                  {/* Review link (if words need review and href provided) */}
                  {wordSummary.wordsToReview > 0 && reviewWordsHref && (
                    <a
                      href={reviewWordsHref}
                      onClick={() => {
                        trackEvent(AnalyticsEvents.SESSION_SUMMARY_REVIEW_CLICK, {
                          wordsToReview: wordSummary.wordsToReview,
                        });
                      }}
                      className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {translations.reviewNow}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex w-full flex-col gap-2"
              >
                {/* Primary CTA - Keep Going */}
                <Button
                  onClick={() => {
                    onKeepGoing();
                    onClose();
                  }}
                  size="lg"
                  className={cn(
                    'h-14 w-full rounded-xl text-lg font-bold',
                    isGoalComplete
                      ? 'bg-success hover:bg-success/90 text-white'
                      : 'bg-gradient-to-r from-accent to-[var(--accent-green,#34d399)] text-black hover:opacity-90'
                  )}
                >
                  {translations.keepGoing}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Secondary CTA - Done for Today */}
                <Button
                  onClick={() => {
                    onDone();
                    onClose();
                  }}
                  size="lg"
                  variant="ghost"
                  className="h-12 w-full rounded-xl text-base font-medium text-muted-foreground hover:text-foreground"
                >
                  {translations.doneForToday}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage session complete modal state
 */
export function useSessionComplete() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionData, setSessionData] = useState({
    xpEarned: 0,
    todayXP: 0,
    dailyGoalXP: 50,
    streak: 0,
    streakExtended: false,
  });

  const showSessionComplete = (data: typeof sessionData) => {
    setSessionData(data);
    setIsOpen(true);
  };

  const closeSessionComplete = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    sessionData,
    showSessionComplete,
    closeSessionComplete,
  };
}

