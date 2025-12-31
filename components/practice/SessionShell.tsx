'use client';

import { ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * SessionShell - Duolingo-style practice session wrapper
 *
 * Layout:
 * ┌─────────────────────────────────────┐
 * │ [X]  ████████░░░░  3/10   +5 XP    │ <- TopBar
 * ├─────────────────────────────────────┤
 * │                                     │
 * │         [Content Area]              │ <- Scrollable content
 * │         Prompt, cards, etc          │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │         [Primary CTA]               │ <- StickyFooter
 * │         Continue / Check            │
 * └─────────────────────────────────────┘
 */

export type SessionShellProps = {
  /** Current progress (0-100) or current/total for counter */
  progress: number;
  /** Total items for counter display (e.g., "3/10") */
  total: number;
  /** Current index (1-based) for counter display */
  current: number;
  /** XP earned this session (optional) */
  xpEarned?: number;
  /** Main content area */
  children: ReactNode;
  /** Footer content (buttons, controls) */
  footer?: ReactNode;
  /** Called when close button pressed. If not provided, navigates to results */
  onClose?: () => void;
  /** Custom class for the content area */
  contentClassName?: string;
  /** Show skeleton loading state */
  isLoading?: boolean;
};

export function SessionShell({
  progress,
  total,
  current,
  xpEarned,
  children,
  footer,
  onClose,
  contentClassName,
  isLoading = false,
}: SessionShellProps) {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const router = useRouter();

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      // Default: navigate to results
      router.push(`/${locale}/practice/results`);
    }
  }, [onClose, router, locale]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top Game Bar */}
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-0 hover:bg-white/10"
          onClick={handleClose}
          aria-label={t('drills.endSession', { default: 'End Session' })}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <Progress
            value={progress}
            className="h-2.5 transition-all duration-500"
            aria-label={t('drills.progressLabel', { current, total })}
          />
        </div>

        <span className="min-w-[3rem] text-center text-sm font-semibold tabular-nums text-muted-foreground">
          {current}/{total}
        </span>

        {typeof xpEarned === 'number' && xpEarned > 0 && (
          <span className="ml-1 text-sm font-bold text-primary">
            +{xpEarned} XP
          </span>
        )}
      </header>

      {/* Content Area */}
      <div
        className={cn(
          'flex-1 overflow-auto px-4 py-6',
          contentClassName
        )}
      >
        {isLoading ? (
          <SessionShellSkeleton />
        ) : (
          <div className="mx-auto max-w-lg">{children}</div>
        )}
      </div>

      {/* Sticky Footer */}
      {footer && (
        <footer className="border-t border-border/40 px-4 py-3 safe-bottom bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-lg">{footer}</div>
        </footer>
      )}
    </div>
  );
}

/**
 * Skeleton loading state for SessionShell content
 */
function SessionShellSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6 animate-pulse">
      {/* Question skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-white/10" />
        <div className="h-8 w-full rounded bg-white/15" />
        <div className="h-6 w-3/4 rounded bg-white/10" />
      </div>

      {/* Answer area skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="h-16 w-full rounded bg-white/10" />
      </div>

      {/* Choices skeleton */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Pre-styled prompt display for questions
 */
export function SessionPrompt({
  label,
  primary,
  secondary,
  className,
}: {
  label?: string;
  primary: string;
  secondary?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <p className="text-2xl font-bold text-foreground sm:text-3xl">
        {primary}
      </p>
      {secondary && (
        <p className="text-base text-muted-foreground">{secondary}</p>
      )}
    </div>
  );
}

/**
 * Feedback display for correct/incorrect answers
 */
export function SessionFeedback({
  type,
  title,
  message,
  className,
}: {
  type: 'correct' | 'incorrect';
  title: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 transition-all duration-300',
        type === 'correct'
          ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50 animate-feedback-correct'
          : 'border-amber-400/60 bg-amber-500/15 text-amber-50 animate-feedback-incorrect',
        className
      )}
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
    </div>
  );
}

/**
 * Choice button styled for practice sessions
 */
export function SessionChoice({
  label,
  text,
  selected,
  correct,
  disabled,
  onClick,
}: {
  label: string; // A, B, C, D
  text: string;
  selected?: boolean;
  correct?: boolean | null; // null = not yet revealed
  disabled?: boolean;
  onClick?: () => void;
}) {
  const isRevealed = correct !== null && correct !== undefined;
  const isSelectedCorrect = selected && correct === true;
  const isSelectedIncorrect = selected && correct === false;
  const isCorrectAnswer = !selected && correct === true;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-h-[52px] w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
        'flex items-center gap-3',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'active:scale-[0.98]',
        !isRevealed && !disabled && 'border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/10',
        isSelectedCorrect && 'border-emerald-400 bg-emerald-500/20 scale-[1.02]',
        isSelectedIncorrect && 'border-amber-400 bg-amber-500/20 animate-shake',
        isCorrectAnswer && 'border-emerald-400/50 bg-emerald-500/10',
        disabled && !isRevealed && 'opacity-60 cursor-not-allowed'
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-sm font-bold">
        {label}
      </span>
      <span className="flex-1 font-medium">{text}</span>
    </button>
  );
}
