'use client';

/**
 * CelebrationModal Component
 *
 * Full-screen celebration modal for achievements, level-ups,
 * lesson completions, and other milestone events.
 *
 * Includes confetti animation and engaging visuals.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { modalBackdrop, celebrationPop, fadeInUp } from '@/lib/animations';
import { Button } from '@/components/ui/button';

export type CelebrationType = 'achievement' | 'level_up' | 'lesson_complete' | 'streak_milestone' | 'xp_bonus';

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  type: CelebrationType;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  xpAwarded?: number;
  showConfetti?: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function CelebrationModal({
  open,
  onClose,
  type,
  title,
  description,
  icon,
  xpAwarded,
  showConfetti = true,
  actionButton,
}: CelebrationModalProps) {
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

  const defaultIcon = getDefaultIcon(type);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
          <motion.div onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />

          {/* Confetti */}
          {showConfetti && <Confetti />}

          {/* Modal */}
          {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center p-6 pt-12 text-center">
              {/* Icon */}
              {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
              <motion.div
                variants={celebrationPop}
                initial="initial"
                animate="animate"
                className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent-2 to-accent-3 text-5xl shadow-lg"
              >
                {icon || defaultIcon}
              </motion.div>

              {/* Title */}
              {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-2 text-2xl font-bold text-foreground sm:text-3xl"
              >
                {title}
              </motion.h2>

              {/* Description */}
              {description && (
                // @ts-expect-error - framer-motion type compatibility issue with Next.js 16
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mb-4 text-sm text-muted-foreground"
                >
                  {description}
                </motion.p>
              )}

              {/* XP Badge */}
              {xpAwarded && (
                // @ts-expect-error - framer-motion type compatibility issue with Next.js 16
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3, type: 'spring' }}
                  className="mb-6 flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2"
                >
                  <Star className="h-5 w-5 text-accent" fill="currentColor" />
                  <span className="text-lg font-bold text-accent">+{xpAwarded} XP</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex w-full flex-col gap-2 sm:flex-row"
              >
                {actionButton && (
                  <Button
                    onClick={() => {
                      actionButton.onClick();
                      onClose();
                    }}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-accent-2 to-accent-3 text-lg font-bold text-black hover:opacity-90"
                  >
                    {actionButton.label}
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  size="lg"
                  variant={actionButton ? 'outline' : 'default'}
                  className={cn('flex-1', !actionButton && 'bg-gradient-to-r from-accent-2 to-accent-3 text-black')}
                >
                  {actionButton ? 'Close' : 'Awesome!'}
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
 * Get default icon based on celebration type
 */
function getDefaultIcon(type: CelebrationType): React.ReactNode {
  switch (type) {
    case 'achievement':
      return <Trophy className="h-12 w-12 text-black" fill="currentColor" />;
    case 'level_up':
      return <TrendingUp className="h-12 w-12 text-black" />;
    case 'lesson_complete':
      return <Star className="h-12 w-12 text-black" fill="currentColor" />;
    case 'streak_milestone':
      return '🔥';
    case 'xp_bonus':
      return <Zap className="h-12 w-12 text-black" fill="currentColor" />;
    default:
      return <Star className="h-12 w-12 text-black" fill="currentColor" />;
  }
}

/**
 * Confetti Animation Component
 *
 * Simple CSS-based confetti animation
 */
function Confetti() {
  const confettiCount = 50;
  const colors = ['#F6D83B', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: confettiCount }).map((_, i) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 2;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}vw`,
              y: -20,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
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
              width: '10px',
              height: '10px',
              backgroundColor: randomColor,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Pre-built celebration variants for common scenarios
 */

export function AchievementUnlockedModal(props: Omit<CelebrationModalProps, 'type'>) {
  return <CelebrationModal {...props} type="achievement" />;
}

export function LevelUpModal(props: Omit<CelebrationModalProps, 'type'>) {
  return <CelebrationModal {...props} type="level_up" />;
}

export function LessonCompleteModal(props: Omit<CelebrationModalProps, 'type'>) {
  return <CelebrationModal {...props} type="lesson_complete" />;
}

export function StreakMilestoneModal(props: Omit<CelebrationModalProps, 'type'>) {
  return <CelebrationModal {...props} type="streak_milestone" />;
}
