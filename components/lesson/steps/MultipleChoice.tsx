'use client';

import { useState, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChoiceButton } from '@/components/ui/ChoiceButton';
import type { MultipleChoiceStep, StepComponentProps } from '@/lib/lesson-runner/types';

// Letter labels for choices
const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * MultipleChoice Step Component
 *
 * Renders a multiple-choice question with letter-labeled answer buttons.
 * User selects an option, then presses Check button (in parent) to validate.
 * Supports audio playback for prompts and provides visual feedback.
 */
export function MultipleChoice({
  step,
  onAnswer,
  feedback,
  disabled = false,
}: StepComponentProps<MultipleChoiceStep>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Reset selection when step changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [step.id]);

  // Handle option selection - sets pending answer but doesn't validate
  const handleSelect = (index: number) => {
    if (disabled || feedback) return; // Can't change after feedback shown
    setSelectedIndex(index);
    // Set pending answer - validation happens when Check button is pressed
    onAnswer({ type: 'MULTIPLE_CHOICE', selectedIndex: index });
  };

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

  return (
    <div className="space-y-6">
      {/* Prompt Card */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
            {step.prompt}
          </p>

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

        {step.translationHint && !feedback && (
          <p className="mt-3 text-sm text-muted-foreground border-t border-border/30 pt-3">
            <span className="font-medium">Hint:</span> {step.translationHint}
          </p>
        )}
      </div>

      {/* Answer Choices */}
      <div className="space-y-3">
        {step.choices.map((choice, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = feedback?.correct && isSelected;
          const isIncorrect = feedback && !feedback.correct && isSelected;

          return (
            <ChoiceButton
              key={index}
              label={CHOICE_LABELS[index]}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isIncorrect={isIncorrect}
              onClick={() => handleSelect(index)}
              disabled={disabled || !!feedback}
            >
              {choice}
            </ChoiceButton>
          );
        })}
      </div>
    </div>
  );
}
