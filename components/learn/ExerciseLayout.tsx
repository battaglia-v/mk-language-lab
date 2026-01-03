'use client';

/**
 * ExerciseLayout - Standard Duolingo-like exercise screen template
 *
 * Provides a consistent layout for all exercise types with:
 * - Progress indicator at top
 * - Scrollable prompt/content area in middle
 * - Sticky bottom action bar with clear hierarchy
 *
 * @example
 * <ExerciseLayout
 *   progress={{ current: 3, total: 10 }}
 *   chips={[{ label: 'Beginner' }, { label: '10 XP' }]}
 *   onHint={() => {}}
 *   onSkip={() => {}}
 *   onSubmit={() => {}}
 *   submitLabel="Check"
 *   submitDisabled={!answer}
 * >
 *   <PromptArea>...</PromptArea>
 * </ExerciseLayout>
 */

import { ReactNode } from 'react';
import { Lightbulb, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ExerciseLayoutProps {
  /** Child content for the prompt/answer area */
  children: ReactNode;
  /** Progress indicator */
  progress?: {
    current: number;
    total: number;
  };
  /** Chips to display next to progress (e.g., difficulty, XP) */
  chips?: Array<{
    label: string;
    variant?: 'default' | 'accent' | 'muted';
    icon?: ReactNode;
  }>;
  /** Hint button callback (omit to hide hint button) */
  onHint?: () => void;
  /** Skip button callback (omit to hide skip button) */
  onSkip?: () => void;
  /** Primary submit/check action */
  onSubmit: () => void;
  /** Label for submit button */
  submitLabel?: string;
  /** Whether submit is disabled */
  submitDisabled?: boolean;
  /** Whether submit is loading */
  submitLoading?: boolean;
  /** Helper/error text below submit button */
  helperText?: string;
  /** Whether helper text is an error */
  helperIsError?: boolean;
  /** Extra bottom padding for mobile nav */
  bottomNavOffset?: boolean;
  /** Additional class for the container */
  className?: string;
  /** data-testid for the layout root */
  testId?: string;
  /** Hint button label */
  hintLabel?: string;
  /** Skip button label */
  skipLabel?: string;
}

export function ExerciseLayout({
  children,
  progress,
  chips,
  onHint,
  onSkip,
  onSubmit,
  submitLabel = 'Check',
  submitDisabled = false,
  submitLoading = false,
  helperText,
  helperIsError = false,
  bottomNavOffset = true,
  className,
  testId,
  hintLabel = 'Hint',
  skipLabel = 'Skip',
}: ExerciseLayoutProps) {
  const progressPercent = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div
      className={cn(
        'flex min-h-[100dvh] flex-col',
        className
      )}
      data-testid={testId}
    >
      {/* Top: Progress bar + chips */}
      {(progress || chips) && (
        <header className="sticky top-0 z-10 border-b border-border/30 bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl space-y-2">
            {/* Progress bar */}
            {progress && (
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="metadata-item text-xs font-medium text-muted-foreground">
                  <span className="count-unit">{progress.current}/{progress.total}</span>
                </span>
              </div>
            )}

            {/* Chips row */}
            {chips && chips.length > 0 && (
              <div className="metadata-row gap-2">
                {chips.map((chip, index) => (
                  <span
                    key={index}
                    className={cn(
                      'stat-chip',
                      chip.variant === 'accent' && 'bg-primary/10 text-primary',
                      chip.variant === 'muted' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {chip.icon}
                    <span className="label-nowrap">{chip.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Middle: Scrollable prompt/content area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </main>

      {/* Bottom: Sticky action bar */}
      <footer
        className={cn(
          'sticky bottom-0 z-10 border-t border-border/30 bg-background/95 px-4 py-4 backdrop-blur-sm',
          bottomNavOffset && 'pb-[calc(5rem+env(safe-area-inset-bottom))]'
        )}
      >
        <div className="mx-auto max-w-2xl space-y-3">
          {/* Row 1: Secondary actions (Hint + Skip) */}
          {(onHint || onSkip) && (
            <div className="flex items-center justify-between gap-3">
              {onHint ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onHint}
                  className="gap-1.5 text-muted-foreground hover:text-primary"
                  data-testid="exercise-hint"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span className="label-nowrap">{hintLabel}</span>
                </Button>
              ) : (
                <div /> // Spacer
              )}

              {onSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="gap-1.5 text-muted-foreground hover:text-primary"
                  data-testid="exercise-skip"
                >
                  <span className="label-nowrap">{skipLabel}</span>
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Row 2: Primary CTA (full width) */}
          <Button
            onClick={onSubmit}
            disabled={submitDisabled || submitLoading}
            className="w-full"
            size="lg"
            data-testid="exercise-submit"
          >
            {submitLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="label-nowrap">Checking...</span>
              </>
            ) : (
              <span className="label-nowrap">{submitLabel}</span>
            )}
          </Button>

          {/* Row 3: Helper/error text */}
          {helperText && (
            <p
              className={cn(
                'text-center text-sm',
                helperIsError ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {helperText}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

/**
 * PromptCard - Styled container for the exercise prompt
 */
export function PromptCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * AnswerArea - Container for the answer input section
 */
export function AnswerArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-6 space-y-4', className)}>
      {children}
    </div>
  );
}

/**
 * FeedbackBanner - Shows correct/incorrect feedback with animation
 */
export function FeedbackBanner({
  isCorrect,
  correctAnswer,
  explanation,
  className,
}: {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  className?: string;
}) {
  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: 'easeOut' },
      };

  return (
    <div
      {...animation}
      className={cn(
        'mt-4 rounded-xl border-2 p-4',
        isCorrect
          ? 'border-green-500/50 bg-green-500/10'
          : 'border-red-500/50 bg-red-500/10',
        className
      )}
    >
      <p
        className={cn(
          'text-sm font-semibold',
          isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}
      >
        {isCorrect ? '✓ Correct!' : '✗ Not quite'}
      </p>

      {!isCorrect && correctAnswer && (
        <p className="mt-1 text-sm text-muted-foreground">
          Correct answer: <strong className="text-foreground">{correctAnswer}</strong>
        </p>
      )}

      {explanation && (
        <p className="mt-2 text-sm text-muted-foreground">{explanation}</p>
      )}
    </div>
  );
}
