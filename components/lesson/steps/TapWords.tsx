'use client';

import { useState, useEffect } from 'react';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TapWordsStep, StepComponentProps } from '@/lib/lesson-runner/types';

/**
 * TapWords Step Component
 *
 * Interactive reading step where users tap words to see translations.
 * Used in reader lessons for vocabulary acquisition.
 * Tracks tapped words and optionally saved words for quiz generation.
 */
export function TapWords({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<TapWordsStep>) {
  const [tappedWords, setTappedWords] = useState<Set<string>>(new Set());
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  // Reset state when step changes to prevent state carryover
  useEffect(() => {
    setTappedWords(new Set());
    setSavedWords(new Set());
    setActiveWordIndex(null);
  }, [step.id]);

  const minimumTaps = step.minimumTaps || 3;
  const canContinue = tappedWords.size >= minimumTaps;

  // Parse passage into words with their indices
  const words = step.passage.split(/(\s+)/); // Keep whitespace

  const handleWordTap = (wordIndex: number) => {
    if (disabled || feedback) return;

    const wordData = step.words.find((w) => w.index === wordIndex);
    if (!wordData) return;

    // Toggle word selection
    const newTapped = new Set(tappedWords);
    const wordKey = `${wordIndex}-${wordData.word}`;

    if (newTapped.has(wordKey)) {
      newTapped.delete(wordKey);
      setActiveWordIndex(null);
    } else {
      newTapped.add(wordKey);
      setActiveWordIndex(wordIndex);
    }

    setTappedWords(newTapped);

    // Update answer
    onAnswer({
      type: 'TAP_WORDS',
      tappedWords: Array.from(newTapped),
      savedWords: Array.from(savedWords),
    });
  };

  const toggleSaveWord = (wordIndex: number) => {
    const wordData = step.words.find((w) => w.index === wordIndex);
    if (!wordData) return;

    const wordKey = `${wordIndex}-${wordData.word}`;
    const newSaved = new Set(savedWords);

    if (newSaved.has(wordKey)) {
      newSaved.delete(wordKey);
    } else {
      newSaved.add(wordKey);
    }

    setSavedWords(newSaved);

    // Update answer with saved words
    onAnswer({
      type: 'TAP_WORDS',
      tappedWords: Array.from(tappedWords),
      savedWords: Array.from(newSaved),
    });
  };

  const activeWord = activeWordIndex !== null
    ? step.words.find((w) => w.index === activeWordIndex)
    : null;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {step.instructions || `Tap on words to see their translations. Tap at least ${minimumTaps} words to continue.`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, (tappedWords.size / minimumTaps) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {tappedWords.size}/{minimumTaps}
          </span>
        </div>
      </div>

      {/* Passage with tappable words */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="text-base leading-relaxed sm:text-lg">
          {words.map((word, index) => {
            const wordData = step.words.find((w) => w.index === index);
            if (!wordData) {
              // Regular text (whitespace or non-tappable)
              return <span key={index}>{word}</span>;
            }

            const wordKey = `${wordData.index}-${wordData.word}`;
            const isTapped = tappedWords.has(wordKey);
            const isActive = activeWordIndex === wordData.index;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleWordTap(wordData.index)}
                disabled={disabled || !!feedback}
                className={cn(
                  'cursor-pointer rounded-sm px-1 transition-colors',
                  'hover:bg-primary/20',
                  isTapped && 'bg-primary/10 text-primary font-medium',
                  isActive && 'bg-primary/20 ring-2 ring-primary/50'
                )}
              >
                {wordData.word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Word Translation Card */}
      {activeWord && (
        <div className="rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-5 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h4 className="text-lg font-semibold text-foreground">
                  {activeWord.word}
                </h4>
                {activeWord.pos && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {activeWord.pos}
                  </span>
                )}
              </div>
              <p className="mt-1 text-base text-primary">
                {activeWord.translation}
              </p>
              {activeWord.note && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeWord.note}
                </p>
              )}
            </div>

            {/* Save Word Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSaveWord(activeWord.index)}
              className="flex-shrink-0"
            >
              {savedWords.has(`${activeWord.index}-${activeWord.word}`) ? (
                <>
                  <BookmarkCheck className="h-5 w-5 text-green-500" />
                  <span className="ml-1.5 text-xs">Saved</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-5 w-5" />
                  <span className="ml-1.5 text-xs">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Progress Message */}
      {!canContinue && (
        <p className="text-center text-sm text-muted-foreground">
          Tap {minimumTaps - tappedWords.size} more {minimumTaps - tappedWords.size === 1 ? 'word' : 'words'} to continue
        </p>
      )}
    </div>
  );
}
