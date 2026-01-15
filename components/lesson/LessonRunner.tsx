'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
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
import { SentenceBuilder } from './steps/SentenceBuilder';
import { ErrorCorrection } from './steps/ErrorCorrection';
import { Info } from './steps/Info';
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
  const t = useTranslations('learn');

  // Resume prompt state
  const [showResumePrompt, setShowResumePrompt] = useState(false);

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

  const scoredSteps = steps.filter(
    (step) => step.type !== 'SUMMARY' && step.type !== 'INFO'
  ).length;

  const {
    currentStep,
    currentFeedback,
    showFeedback,
    isEvaluating,
    correctCount,
    progress,
    submitAnswer,
    setPendingAnswer,
    continueToNext,
    skipStep,
    submitLabel,
    submitDisabled,
    showSkip,
    savedProgress,
    isLoadingProgress,
    restoreProgress,
    resetAndStartFresh,
  } = useLessonRunner(steps, {
    lessonId,
    onComplete: handleRawComplete,
    autoSave,
    onProgressLoaded: (progressData) => {
      // Show resume prompt if there's in-progress lesson with step data
      if (
        progressData &&
        progressData.status === 'in_progress' &&
        progressData.currentStepIndex > 0
      ) {
        setShowResumePrompt(true);
      }
    },
  });

  // Update Summary step with actual values
  if (currentStep?.type === 'SUMMARY') {
    const summaryStep = currentStep as SummaryStep;
    const xpData = calculateLessonXP({
      totalSteps: scoredSteps,
      correctAnswers: correctCount,
      streak: userStreak,
    });

    summaryStep.xpEarned = xpData.totalXP;
    summaryStep.correctAnswers = correctCount;
    summaryStep.totalSteps = scoredSteps;
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
      // Use setPendingAnswer instead of submitAnswer - validation happens when Check is pressed
      onAnswer: setPendingAnswer as (answer: StepAnswer) => void,
      feedback: currentFeedback,
      disabled: isEvaluating,
    };

    switch (currentStep.type) {
      case 'INFO':
        return <Info step={currentStep} {...baseProps} />;
      case 'MULTIPLE_CHOICE':
        return <MultipleChoice step={currentStep} {...baseProps} />;
      case 'FILL_BLANK':
        return <FillBlank step={currentStep} {...baseProps} />;
      case 'TAP_WORDS':
        return <TapWords step={currentStep} {...baseProps} />;
      case 'SENTENCE_BUILDER':
        return <SentenceBuilder step={currentStep} {...baseProps} />;
      case 'ERROR_CORRECTION':
        return <ErrorCorrection step={currentStep} {...baseProps} />;
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

  // Handle primary button click (Check / Continue)
  const handleSubmit = () => {
    if (showFeedback || currentStep?.type === 'INFO' || currentStep?.type === 'SUMMARY') {
      // After feedback shown, or for INFO/SUMMARY steps, continue to next
      continueToNext();
    } else {
      // Before feedback - user pressed Check, validate the pending answer
      submitAnswer();
    }
  };

  // Resume prompt handlers
  const handleResume = () => {
    if (savedProgress) {
      restoreProgress(savedProgress);
    }
    setShowResumePrompt(false);
  };

  const handleStartFresh = () => {
    resetAndStartFresh();
    setShowResumePrompt(false);
  };

  // Chips for header
  const chips = [
    ...(difficulty ? [{ label: difficulty, variant: 'muted' as const }] : []),
    ...(lessonTitle ? [{ label: lessonTitle }] : []),
  ];

  // Show loading spinner while fetching progress
  if (isLoadingProgress) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Resume Session Prompt */}
      {showResumePrompt && savedProgress && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-sm rounded-2xl border border-border/40 bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('resumeTitle')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('resumeDescription', {
                current: savedProgress.currentStepIndex + 1,
                total: steps.length,
              })}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleResume}
                className="w-full rounded-xl"
                data-testid="lesson-resume"
              >
                {t('resumeButton')}
              </Button>
              <Button
                variant="outline"
                onClick={handleStartFresh}
                className="w-full rounded-xl"
                data-testid="lesson-start-fresh"
              >
                {t('startFreshButton')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ExerciseLayout
        progress={progress}
        chips={chips.length > 0 ? chips : undefined}
        onSkip={showSkip ? skipStep : undefined}
        onSubmit={handleSubmit}
        submitLabel={submitLabel}
        submitDisabled={submitDisabled && !showFeedback}
        submitLoading={isEvaluating}
        bottomNavOffset={false}
        className="relative"
        testId="lesson-runner"
      >
      {/* Exit Button (top right) - 48px for WCAG touch target */}
      {onExit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="absolute right-4 top-4 z-10 rounded-full h-12 w-12 touch-manipulation"
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
        {showFeedback && currentFeedback && currentStep?.type !== 'SUMMARY' && currentStep?.type !== 'INFO' && (
          <FeedbackBanner
            isCorrect={currentFeedback.correct}
            correctAnswer={currentFeedback.correctAnswer}
            explanation={currentFeedback.explanation}
          />
        )}
      </div>
    </ExerciseLayout>
    </>
  );
}
