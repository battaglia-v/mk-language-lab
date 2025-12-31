'use client';

import { forwardRef } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

type FeedbackState = 'none' | 'correct' | 'incorrect' | 'disabled';

interface ChoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current feedback state */
  state?: FeedbackState;
  /** Whether this is the correct answer (shows checkmark when revealed) */
  isAnswer?: boolean;
  /** Whether user selected this option */
  isSelected?: boolean;
  /** Compact mode (smaller padding) */
  compact?: boolean;
  /** Optional letter/number label prefix (e.g., "A", "B", "1") */
  label?: string;

  // Backwards compatibility props (deprecated - use state instead)
  /** @deprecated Use state="correct" instead */
  isCorrect?: boolean;
  /** @deprecated Use state="incorrect" instead */
  isIncorrect?: boolean;
}

/**
 * ChoiceButton - Multiple choice answer button for practice sessions
 *
 * Always 44px+ height for touch targets. Shows visual feedback
 * for correct/incorrect states with color and icon indicators.
 *
 * @example
 * // During selection
 * <ChoiceButton onClick={() => handleSelect(option)}>
 *   {option}
 * </ChoiceButton>
 *
 * // After feedback - correct answer selected
 * <ChoiceButton state="correct" isSelected isAnswer>
 *   {option}
 * </ChoiceButton>
 *
 * // After feedback - incorrect answer selected
 * <ChoiceButton state="incorrect" isSelected>
 *   {option}
 * </ChoiceButton>
 *
 * // After feedback - correct answer not selected (revealed)
 * <ChoiceButton state="correct" isAnswer>
 *   {option}
 * </ChoiceButton>
 */
export const ChoiceButton = forwardRef<HTMLButtonElement, ChoiceButtonProps>(
  (
    {
      children,
      className,
      state: stateProp = 'none',
      isAnswer = false,
      isSelected = false,
      compact = false,
      label,
      isCorrect: isCorrectProp,
      isIncorrect: isIncorrectProp,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    // Support backwards-compatible props
    const state: FeedbackState = isCorrectProp
      ? 'correct'
      : isIncorrectProp
        ? 'incorrect'
        : stateProp;
    const computedIsAnswer = isCorrectProp || isAnswer;

    const showFeedback = state !== 'none';
    const isCorrectSelection = showFeedback && isSelected && computedIsAnswer;
    const isIncorrectSelection = showFeedback && isSelected && !computedIsAnswer;
    const isRevealedAnswer = showFeedback && !isSelected && computedIsAnswer;
    const isDimmed = showFeedback && !isSelected && !computedIsAnswer;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!showFeedback && !disabled) {
        triggerHaptic('selection');
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || showFeedback}
        onClick={handleClick}
        className={cn(
          // Base styles - minimum 44px touch target
          'relative flex items-center justify-between gap-3 rounded-xl border-2',
          'font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'active:scale-[0.98]',

          // Size
          compact ? 'min-h-[44px] p-3 text-base' : 'min-h-[52px] p-4 text-lg',

          // Default state (selectable)
          !showFeedback && [
            'border-border/50 bg-card/50',
            'hover:border-primary/50 hover:bg-primary/5',
          ],

          // Correct selection (green)
          isCorrectSelection && [
            'border-emerald-500 bg-emerald-500/15 text-emerald-400',
          ],

          // Incorrect selection (red/amber)
          isIncorrectSelection && [
            'border-red-500 bg-red-500/15 text-red-400',
          ],

          // Revealed correct answer (not selected)
          isRevealedAnswer && [
            'border-emerald-500/70 bg-emerald-500/10 text-emerald-400',
          ],

          // Dimmed (wrong option, not selected)
          isDimmed && [
            'border-border/30 bg-transparent opacity-50',
          ],

          // Disabled
          disabled && 'opacity-50 pointer-events-none',

          className
        )}
        {...props}
      >
        {/* Optional letter label */}
        {label && (
          <span className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            !showFeedback && "bg-muted/50 text-muted-foreground",
            isCorrectSelection && "bg-emerald-500/30 text-emerald-400",
            isIncorrectSelection && "bg-red-500/30 text-red-400",
            isRevealedAnswer && "bg-emerald-500/20 text-emerald-400",
            isDimmed && "opacity-50"
          )}>
            {label}
          </span>
        )}

        <span className="flex-1 text-left">{children}</span>

        {/* Feedback icons */}
        {isCorrectSelection && (
          <Check className="h-5 w-5 shrink-0 text-emerald-400" />
        )}
        {isIncorrectSelection && (
          <X className="h-5 w-5 shrink-0 text-red-400" />
        )}
        {isRevealedAnswer && (
          <Check className="h-5 w-5 shrink-0 text-emerald-400/70" />
        )}
      </button>
    );
  }
);

ChoiceButton.displayName = 'ChoiceButton';

export default ChoiceButton;
