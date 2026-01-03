'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  correctAnswer?: string; // Optional, kept for API compatibility
  feedback: 'correct' | 'incorrect' | null;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
};

/**
 * Normalize answer for comparison (tolerant matching)
 */
function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"„"«»]/g, ''); // Strip punctuation
}

export function isAnswerCorrect(input: string, expected: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(expected);
}

export function TypedInput({
  feedback,
  onSubmit,
  disabled,
}: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Reset on new question
    if (!feedback) {
      setValue('');
      inputRef.current?.focus();
    }
  }, [feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your answer..."
        disabled={disabled || !!feedback}
        data-testid="word-sprint-typed-input"
        className={cn(
          'min-h-[52px] text-lg rounded-xl text-center',
          feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
          feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20'
        )}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {!feedback && (
        <Button
          type="submit"
          className="w-full min-h-[48px] rounded-xl"
          disabled={!value.trim() || disabled}
          data-testid="word-sprint-typed-check"
        >
          Check
        </Button>
      )}
    </form>
  );
}
