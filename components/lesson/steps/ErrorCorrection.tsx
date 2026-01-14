'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ErrorCorrectionStep, StepComponentProps } from '@/lib/lesson-runner/types';

/**
 * ErrorCorrection Step Component
 *
 * Interactive error identification exercise where users tap the word
 * that contains an error. User selects word, then presses Check to validate.
 */
export function ErrorCorrection({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<ErrorCorrectionStep>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset when step changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [step.id]);

  // Handle word tap - select/deselect without validating
  const handleWordTap = (index: number) => {
    if (disabled || feedback) return;

    // Allow changing selection before Check is pressed
    const newIndex = index === selectedIndex ? null : index;
    setSelectedIndex(newIndex);

    // Set pending answer if a word is selected (validation happens on Check)
    if (newIndex !== null) {
      onAnswer({ type: 'ERROR_CORRECTION', selectedIndex: newIndex });
    }
  };

  // Determine word styling based on selection and feedback state
  const getWordState = (index: number): 'default' | 'selected' | 'correct' | 'incorrect' | 'missed' => {
    if (!feedback) {
      // Before feedback - just show selection
      return index === selectedIndex ? 'selected' : 'default';
    }

    // After feedback - show correct/incorrect state
    if (index === step.errorIndex) {
      // This is the actual error word
      return index === selectedIndex ? 'correct' : 'missed';
    }
    if (index === selectedIndex) {
      // User selected this but it wasn't the error
      return 'incorrect';
    }
    return 'default';
  };

  const wordStyles = {
    default: '',
    selected: 'bg-primary text-primary-foreground border-primary',
    correct: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500',
    incorrect: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500',
    missed: 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500 ring-2 ring-amber-500',
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
            {step.instructions || 'Tap the word that contains an error'}
          </p>
          {step.translationHint && (
            <p className="text-sm text-muted-foreground italic">
              Translation: {step.translationHint}
            </p>
          )}
        </div>
      </div>

      {/* Sentence with tappable words */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Find the Error
        </p>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex flex-wrap gap-2">
            {step.words.map((word, index) => {
              const state = getWordState(index);
              return (
                <Button
                  key={`word-${index}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleWordTap(index)}
                  disabled={disabled || !!feedback}
                  className={cn(
                    'min-h-[48px] px-4 transition-all text-base',
                    wordStyles[state]
                  )}
                  aria-label={`Select "${word}" as the error`}
                  aria-pressed={index === selectedIndex}
                >
                  {word}
                </Button>
              );
            })}
          </div>
        </div>
        {!feedback && selectedIndex === null && (
          <p className="text-xs text-muted-foreground">
            Tap the word you think is incorrect
          </p>
        )}
      </div>

      {/* Show correction on feedback */}
      {feedback && (() => {
        // Build full corrected sentence
        const correctedSentence = step.words.map((word, idx) =>
          idx === step.errorIndex ? step.correctWord : word
        ).join(' ');

        return (
          <div className={cn(
            'rounded-lg p-4 space-y-3',
            feedback.correct ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted/50'
          )}>
            {feedback.correct ? (
              <>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Correct! You found the error.
                </p>
                <p className="text-base text-foreground">
                  <span className="line-through text-muted-foreground">{step.words[step.errorIndex]}</span>
                  {' → '}
                  <span className="font-medium text-green-700 dark:text-green-400">{step.correctWord}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">The correct answer:</p>
                <p className="text-base text-foreground">
                  The error is in &ldquo;<span className="font-medium text-amber-600 dark:text-amber-400">{step.words[step.errorIndex]}</span>&rdquo;
                  {' → '}
                  <span className="font-medium text-green-700 dark:text-green-400">{step.correctWord}</span>
                </p>
              </>
            )}
            {/* Full corrected sentence */}
            <div className="border-t border-border/30 pt-3 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Full sentence:</p>
              <p className="text-base text-foreground">{correctedSentence}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
