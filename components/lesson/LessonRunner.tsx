'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ExerciseLayout,
  FeedbackBanner,
} from '@/components/learn/ExerciseLayout';
import { useLessonRunner } from '@/lib/lesson-runner/useLessonRunner';
import { calculateLessonXP } from '@/lib/xp/calculator';
import { validateStep, getFallbackPrompt } from '@/lib/lesson-runner/validation';
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
  // Fetch user's current streak
  const [userStreak, setUserStreak] = useState(0);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch('/api/user/progress');
        if (response.ok) {
          const data = await response.json();
          setUserStreak(data.progress?.streak || 0);
        }
      } catch (error) {
        console.error('Failed to fetch user streak:', error);
      }
    }
    fetchStreak();
  }, []);

  // Calculate XP and add Summary step
  const handleRawComplete = (results: Omit<LessonResults, 'xpEarned'>) => {
    const xpData = calculateLessonXP({
      totalSteps: results.totalSteps,
      correctAnswers: results.correctAnswers,
      streak: userStreak,
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
    currentFeedback,
    showFeedback,
    isEvaluating,
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
      streak: userStreak,
    });

    summaryStep.xpEarned = xpData.totalXP;
    summaryStep.correctAnswers = correctCount;
    summaryStep.totalSteps = totalSteps - 1;
  }

  // Render current step component
  const renderStep = () => {
    if (!currentStep) return null;

    // Validate step before rendering
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      return (
        <div className="rounded-[var(--radius-card)] border border-amber-500/50 bg-amber-500/10 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Exercise has incomplete data
              </p>
              <p className="text-sm text-muted-foreground">
                {getFallbackPrompt(currentStep.type)}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                {validation.errors.map((error, i) => (
                  <li key={i}>• {error.message}</li>
                ))}
              </ul>
              <Button
                size="default"
                onClick={skipStep}
                className="mt-4"
                data-testid="lesson-runner-validation-continue"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      );
    }

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
        testId="lesson-runner"
      >
      {/* Exit Button (top right) - 44px for WCAG touch target */}
      {onExit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="absolute right-4 top-4 z-10 rounded-full h-11 w-11 touch-manipulation"
          aria-label="Exit lesson"
          data-testid="lesson-runner-exit"
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Current Step */}
      <div className="space-y-4 sm:space-y-6">
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
