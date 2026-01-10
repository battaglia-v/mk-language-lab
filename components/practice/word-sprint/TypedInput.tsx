'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyboardHint } from '@/components/ui/KeyboardHint';
import { cn } from '@/lib/utils';

/**
 * Check if a string contains Cyrillic characters
 */
function containsCyrillic(str: string): boolean {
  return /[\u0400-\u04FF]/.test(str);
}

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

  // Show keyboard hint when:
  // - Input is empty (user hasn't started typing)
  // - OR last typed character was Latin (user might be on wrong keyboard)
  const shouldShowKeyboardHint = useMemo(() => {
    if (!value) return true; // Show on empty
    const lastChar = value.slice(-1);
    return !containsCyrillic(lastChar); // Show if typing Latin
  }, [value]);

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
      <div className="space-y-2">
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
          lang="mk"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <KeyboardHint
          show={shouldShowKeyboardHint && !disabled && !feedback}
          className="justify-center"
        />
      </div>

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
