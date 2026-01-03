'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  wordBank: string[];
  correctAnswer: string;
  feedback: 'correct' | 'incorrect' | null;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
};

export function WordBankInput({
  wordBank,
  correctAnswer,
  feedback,
  onSubmit,
  disabled,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle word bank on mount
    setShuffledWords([...wordBank].sort(() => Math.random() - 0.5));
    setSelected(null);
  }, [wordBank]);

  const handleWordTap = (word: string) => {
    if (feedback || disabled) return;

    if (selected === word) {
      setSelected(null);
    } else {
      setSelected(word);
    }
  };

  const handleCheck = () => {
    if (selected) {
      onSubmit(selected);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected word display / blank */}
      <div
        className={cn(
          'min-h-[52px] rounded-xl border-2 border-dashed flex items-center justify-center px-4 py-3',
          selected ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
          feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
          feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20'
        )}
      >
        {selected ? (
          <span className="text-lg font-medium">{selected}</span>
        ) : (
          <span className="text-muted-foreground">Tap a word to fill the blank</span>
        )}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {shuffledWords.map((word, i) => {
          const isUsed = selected === word;
          const isCorrectAnswer = word === correctAnswer;

          return (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => handleWordTap(word)}
              disabled={disabled || !!feedback}
              data-testid={`word-sprint-word-${i}`}
              className={cn(
                'rounded-full px-4 transition-all',
                isUsed && 'opacity-50 scale-95',
                feedback && isCorrectAnswer && 'border-emerald-400 bg-emerald-500/15'
              )}
            >
              {word}
            </Button>
          );
        })}
      </div>

      {/* Check button */}
      {!feedback && (
        <Button
          className="w-full min-h-[48px] rounded-xl"
          onClick={handleCheck}
          disabled={!selected || disabled}
          data-testid="word-sprint-check"
        >
          Check
        </Button>
      )}
    </div>
  );
}
