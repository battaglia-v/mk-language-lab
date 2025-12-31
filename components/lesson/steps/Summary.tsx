'use client';

import { useEffect } from 'react';
import { Trophy, Star, Flame, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SummaryStep, StepComponentProps } from '@/lib/lesson-runner/types';
import { cn } from '@/lib/utils';

/**
 * Summary Step Component
 *
 * Displays lesson completion with:
 * - XP earned
 * - Streak information
 * - Completion message
 * - Confetti animation (respects prefers-reduced-motion)
 */
export function Summary({
  step,
  onAnswer,
  feedback,
}: StepComponentProps<SummaryStep>) {
  const accuracy = step.totalSteps > 0
    ? Math.round((step.correctAnswers / step.totalSteps) * 100)
    : 0;

  const isPerfect = accuracy === 100;

  // Trigger confetti on mount
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const colors = ['#f6d83b', '#3ecf8e', '#34d399'];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Auto-acknowledge after a moment
    const timer = setTimeout(() => {
      if (!feedback) {
        onAnswer({ type: 'SUMMARY', acknowledged: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [feedback, onAnswer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg">
          <Trophy className="h-10 w-10 text-background" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          {isPerfect ? 'Perfect!' : 'Lesson Complete!'}
        </h2>
        {step.completionMessage && (
          <p className="text-base text-muted-foreground sm:text-lg">
            {step.completionMessage}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* XP Earned */}
        <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-primary">
            <Star className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">XP Earned</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {step.xpEarned}
          </p>
        </div>

        {/* Accuracy */}
        <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Accuracy</span>
          </div>
          <p className={cn(
            "mt-2 text-3xl font-bold",
            isPerfect ? "text-green-500" : "text-foreground"
          )}>
            {accuracy}%
          </p>
        </div>
      </div>

      {/* Streak Badge (if applicable) */}
      {step.streakDays && step.streakDays > 0 && (
        <div className="rounded-[var(--radius-card)] border border-orange-500/30 bg-orange-500/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
              <Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Day Streak
              </p>
              <p className="text-2xl font-bold text-foreground">
                {step.streakDays} {step.streakDays === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Lesson Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Correct answers</span>
            <span className="font-medium text-foreground">
              {step.correctAnswers} / {step.totalSteps}
            </span>
          </div>
          {step.lessonTitle && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lesson</span>
              <span className="font-medium text-foreground">
                {step.lessonTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="text-center">
        {isPerfect ? (
          <p className="text-sm font-medium text-primary">
            🎉 Outstanding! Perfect score!
          </p>
        ) : accuracy >= 80 ? (
          <p className="text-sm font-medium text-green-500">
            Great job! Keep up the good work!
          </p>
        ) : accuracy >= 60 ? (
          <p className="text-sm font-medium text-muted-foreground">
            Good effort! Practice makes perfect.
          </p>
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            Keep practicing! You&apos;re making progress.
          </p>
        )}
      </div>
    </div>
  );
}
