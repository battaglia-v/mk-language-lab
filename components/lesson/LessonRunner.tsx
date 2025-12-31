'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ExerciseLayout,
  FeedbackBanner,
} from '@/components/learn/ExerciseLayout';
import { useLessonRunner } from '@/lib/lesson-runner/useLessonRunner';
import { calculateLessonXP } from '@/lib/xp/calculator';
import type { LessonRunnerProps, Step, SummaryStep, LessonResults, StepAnswer } from '@/lib/lesson-runner/types';

// Step Components
import { MultipleChoice } from './steps/MultipleChoice';
import { FillBlank } from './steps/FillBlank';
import { TapWords } from './steps/TapWords';
import { Pronounce } from './steps/Pronounce';
import { Summary } from './steps/Summary';

/**
 * LessonRunner Component
 *
 * Main orchestrator for step-based lesson flows.
 * Wraps ExerciseLayout and dynamically renders step components.
 *
 * Features:
 * - Progress tracking with visual progress bar
 * - Step-by-step navigation with validation
 * - Feedback display after each answer
 * - XP calculation on completion
 * - Auto-save progress (if enabled)
 */
export function LessonRunner({
  steps: rawSteps,
  onComplete,
  lessonId,
  lessonTitle,
  difficulty,
  onExit,
  autoSave = false,
}: LessonRunnerProps) {
  // Calculate XP and add Summary step
  const handleRawComplete = (results: Omit<LessonResults, 'xpEarned'>) => {
    const xpData = calculateLessonXP({
      totalSteps: results.totalSteps,
      correctAnswers: results.correctAnswers,
      streak: 0, // TODO: Get from user profile
    });

    onComplete({
      ...results,
      xpEarned: xpData.totalXP,
    });
  };

  // Add Summary step if not already present
  const steps: Step[] = rawSteps[rawSteps.length - 1]?.type === 'SUMMARY'
    ? rawSteps
    : [
        ...rawSteps,
        {
          id: 'summary',
          type: 'SUMMARY' as const,
          xpEarned: 0, // Will be calculated by hook
          totalSteps: rawSteps.length,
          correctAnswers: 0, // Will be filled by hook
          lessonTitle,
        },
      ];

  const {
    currentStep,
    currentIndex,
    currentFeedback,
    showFeedback,
    isEvaluating,
    hasAnswered,
    isLastStep,
    correctCount,
    totalSteps,
    progress,
    submitAnswer,
    continueToNext,
    skipStep,
    submitLabel,
    submitDisabled,
    showSkip,
  } = useLessonRunner(steps, {
    lessonId,
    onComplete: handleRawComplete,
    autoSave,
  });

  // Update Summary step with actual values
  if (currentStep?.type === 'SUMMARY') {
    const summaryStep = currentStep as SummaryStep;
    const xpData = calculateLessonXP({
      totalSteps: totalSteps - 1, // Exclude summary step
      correctAnswers: correctCount,
      streak: 0, // TODO: Get from user profile
    });

    summaryStep.xpEarned = xpData.totalXP;
    summaryStep.correctAnswers = correctCount;
    summaryStep.totalSteps = totalSteps - 1;
  }

  // Render current step component
  const renderStep = () => {
    if (!currentStep) return null;

    const baseProps = {
      onAnswer: submitAnswer as (answer: StepAnswer) => void,
      feedback: currentFeedback,
      disabled: isEvaluating,
    };

    switch (currentStep.type) {
      case 'MULTIPLE_CHOICE':
        return <MultipleChoice step={currentStep} {...baseProps} />;
      case 'FILL_BLANK':
        return <FillBlank step={currentStep} {...baseProps} />;
      case 'TAP_WORDS':
        return <TapWords step={currentStep} {...baseProps} />;
      case 'PRONOUNCE':
        return <Pronounce step={currentStep} {...baseProps} />;
      case 'SUMMARY':
        return <Summary step={currentStep} {...baseProps} />;
      default:
        return (
          <div className="rounded-[var(--radius-card)] border border-border/50 bg-card/80 p-6 shadow-sm">
            <p className="text-destructive">
              Unknown step type: {(currentStep as Step).type}
            </p>
          </div>
        );
    }
  };

  // Handle primary button click
  const handleSubmit = () => {
    if (showFeedback) {
      continueToNext();
    }
    // If not showing feedback, the step component handles submission via onAnswer
  };

  // Chips for header
  const chips = [
    ...(difficulty ? [{ label: difficulty, variant: 'muted' as const }] : []),
    ...(lessonTitle ? [{ label: lessonTitle }] : []),
  ];

  return (
    <ExerciseLayout
      progress={progress}
      chips={chips.length > 0 ? chips : undefined}
      onSkip={showSkip ? skipStep : undefined}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      submitDisabled={submitDisabled && !showFeedback}
      submitLoading={isEvaluating}
      bottomNavOffset={true}
      className="relative"
    >
      {/* Exit Button (top right) */}
      {onExit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="absolute right-4 top-4 z-10 rounded-full h-10 w-10"
          aria-label="Exit lesson"
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Current Step */}
      <div className="space-y-6">
        {renderStep()}

        {/* Feedback Banner */}
        {showFeedback && currentFeedback && currentStep?.type !== 'SUMMARY' && (
          <FeedbackBanner
            isCorrect={currentFeedback.correct}
            correctAnswer={currentFeedback.correctAnswer}
            explanation={currentFeedback.explanation}
          />
        )}
      </div>
    </ExerciseLayout>
  );
}
