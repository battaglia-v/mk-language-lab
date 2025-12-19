import { forwardRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

/**
 * ChoiceButton Component
 *
 * A convenience wrapper around Button with the 'choice' variant.
 * Designed for multiple-choice questions in lesson flows.
 *
 * States:
 * - Default: Un-selected choice
 * - Selected: data-selected=true (primary highlight)
 * - Correct: data-correct=true (green feedback)
 * - Incorrect: data-incorrect=true (red feedback)
 *
 * @example
 * <ChoiceButton
 *   isSelected={selected === 0}
 *   isCorrect={showFeedback && selected === 0 && correct}
 *   isIncorrect={showFeedback && selected === 0 && !correct}
 *   onClick={() => setSelected(0)}
 * >
 *   Choice A
 * </ChoiceButton>
 */

export interface ChoiceButtonProps {
  children: React.ReactNode;
  isSelected?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string; // Optional letter label (A, B, C, D)
}

export const ChoiceButton = forwardRef<HTMLButtonElement, ChoiceButtonProps>(
  (
    {
      children,
      isSelected = false,
      isCorrect = false,
      isIncorrect = false,
      onClick,
      disabled = false,
      className,
      label,
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant="choice"
        size="lg"
        className={cn('w-full justify-start text-left', className)}
        onClick={onClick}
        disabled={disabled}
        data-selected={isSelected}
        data-correct={isCorrect}
        data-incorrect={isIncorrect}
      >
        {label && (
          <span className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-current text-sm font-bold">
            {label}
          </span>
        )}
        <span className="flex-1">{children}</span>
      </Button>
    );
  }
);

ChoiceButton.displayName = 'ChoiceButton';
