'use client';

import { useState, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FillBlankStep, StepComponentProps } from '@/lib/lesson-runner/types';

/**
 * FillBlank Step Component
 *
 * Renders a fill-in-the-blank question with a text input.
 * Supports audio playback for prompts and placeholder hints.
 */
export function FillBlank({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<FillBlankStep>) {
  const [answer, setAnswer] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Reset answer when step changes to prevent answer flash on next question
  useEffect(() => {
    setAnswer('');
  }, [step.id]);

  // Submit answer when user types
  useEffect(() => {
    if (answer.trim() && !feedback) {
      onAnswer({ type: 'FILL_BLANK', answer: answer.trim() });
    }
  }, [answer, feedback, onAnswer]);

  const playAudio = async () => {
    if (!step.promptAudio || isPlayingAudio) return;

    setIsPlayingAudio(true);

    try {
      const audio = new Audio(step.promptAudio);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
    }
  };

  const handleWordBankSelect = (word: string) => {
    if (disabled || feedback) return;
    setAnswer(word);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
              {step.prompt}
            </p>
            <p className="text-sm text-muted-foreground">
              Type your answer in the box below
            </p>
          </div>

          {step.promptAudio && (
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              disabled={isPlayingAudio}
              className="flex-shrink-0 rounded-full h-10 w-10 p-0"
              aria-label="Listen to prompt"
            >
              {isPlayingAudio ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Answer Input */}
      <div className="space-y-2">
        <Input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={step.placeholder || 'Type your answer...'}
          disabled={disabled || !!feedback}
          className="h-14 text-base sm:text-lg"
          aria-label="Your answer"
          autoFocus
        />

        {!feedback && answer.trim().length > 0 && (
          <p className="text-xs text-muted-foreground">
            {step.caseSensitive
              ? 'Case-sensitive answer'
              : 'Answer is not case-sensitive'}
          </p>
        )}
      </div>

      {step.wordBank && step.wordBank.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Word Bank
          </p>
          <div className="flex flex-wrap gap-2">
            {step.wordBank.map((word) => (
              <Button
                key={word}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleWordBankSelect(word)}
                disabled={disabled || !!feedback}
                className="min-h-[48px]"
              >
                {word}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
