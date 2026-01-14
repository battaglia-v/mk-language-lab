'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SentenceBuilderStep, StepComponentProps } from '@/lib/lesson-runner/types';

// Strip duplicate "Translation:" or "Hint:" prefix from hint text
function cleanHint(hint: string | undefined): string | undefined {
  if (!hint) return undefined;
  // Remove leading "Translation:", "Hint:", "Превод:" (MK), or similar
  return hint.replace(/^(Translation|Hint|Превод)\s*:\s*/i, '').trim();
}

/**
 * SentenceBuilder Step Component
 *
 * Interactive word arrangement exercise where users tap words to build a sentence.
 * Tap available words to add them, tap selected words to remove them.
 */
export function SentenceBuilder({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<SentenceBuilderStep>) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Reset when step changes
  useEffect(() => {
    setSelectedWords([]);
  }, [step.id]);

  // Calculate available words (not yet selected)
  // Track indices to handle duplicate words correctly
  const getAvailableWordsWithIndices = useCallback(() => {
    const selectedIndices = new Set<number>();
    let searchFromIndex = 0;

    // For each selected word, find its index in the original words array
    for (const word of selectedWords) {
      const foundIndex = step.words.findIndex(
        (w, i) => i >= searchFromIndex && w === word && !selectedIndices.has(i)
      );
      if (foundIndex !== -1) {
        selectedIndices.add(foundIndex);
      }
      searchFromIndex = 0; // Reset for next search
    }

    return step.words.map((word, index) => ({
      word,
      index,
      isAvailable: !selectedIndices.has(index),
    }));
  }, [step.words, selectedWords]);

  const wordsWithState = getAvailableWordsWithIndices();
  const availableWords = wordsWithState.filter((w) => w.isAvailable);
  const allWordsSelected = selectedWords.length === step.words.length;

  // Update pending answer when selection changes (doesn't validate, just tracks for Check button)
  useEffect(() => {
    if (!feedback && selectedWords.length > 0) {
      onAnswer({ type: 'SENTENCE_BUILDER', selectedWords });
    }
  }, [selectedWords, feedback, onAnswer]);

  // Add word to selection
  const handleSelectWord = (word: string, index: number) => {
    if (disabled || feedback) return;
    setSelectedWords((prev) => [...prev, word]);
  };

  // Remove word from selection (tap to deselect)
  const handleDeselectWord = (indexInSelection: number) => {
    if (disabled || feedback) return;
    setSelectedWords((prev) => {
      const newSelection = prev.filter((_, i) => i !== indexInSelection);
      return newSelection;
    });
  };

  // Check if a word at position is correct (for feedback display)
  const isWordCorrect = (word: string, position: number): boolean | null => {
    if (!feedback) return null;
    return word === step.correctOrder[position];
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
            {step.instructions || 'Arrange the words to form a correct sentence'}
          </p>
          {step.translationHint && (
            <p className="text-sm text-muted-foreground italic">
              Translation: {cleanHint(step.translationHint)}
            </p>
          )}
        </div>
      </div>

      {/* Selected Words (Your Answer) */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your Sentence
        </p>
        <div
          className={cn(
            'min-h-[60px] rounded-lg border-2 border-dashed p-3',
            selectedWords.length === 0
              ? 'border-border/50 bg-muted/30'
              : 'border-primary/30 bg-primary/5'
          )}
        >
          {selectedWords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Tap words below to build your sentence
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, index) => {
                const correctState = isWordCorrect(word, index);
                return (
                  <Button
                    key={`selected-${index}`}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeselectWord(index)}
                    disabled={disabled || !!feedback}
                    className={cn(
                      'min-h-[48px] px-4 transition-colors',
                      correctState === true && 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      correctState === false && 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                    aria-label={`Remove "${word}" from position ${index + 1}`}
                  >
                    {word}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        {!feedback && selectedWords.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Tap a word to remove it
          </p>
        )}
      </div>

      {/* Available Words */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Available Words
        </p>
        <div className="flex flex-wrap gap-2">
          {wordsWithState.map(({ word, index, isAvailable }) => (
            <Button
              key={`available-${index}`}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectWord(word, index)}
              disabled={disabled || !!feedback || !isAvailable}
              className={cn(
                'min-h-[48px] px-4 transition-all',
                !isAvailable && 'opacity-30 pointer-events-none'
              )}
              aria-label={`Add "${word}" to your sentence`}
              aria-hidden={!isAvailable}
            >
              {word}
            </Button>
          ))}
        </div>
      </div>

      {/* Show correct answer on incorrect feedback */}
      {feedback && !feedback.correct && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Correct answer:</p>
          <p className="text-base font-medium text-foreground">
            {step.correctOrder.join(' ')}
          </p>
        </div>
      )}
    </div>
  );
}
