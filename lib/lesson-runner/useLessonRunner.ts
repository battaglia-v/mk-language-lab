'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  Step,
  StepAnswer,
  StepFeedback,
  LessonResults,
  ValidationResult,
} from './types';

/**
 * useLessonRunner Hook
 *
 * Manages state and progression for a step-based lesson flow.
 * Handles answer validation, feedback, and completion tracking.
 */
export function useLessonRunner(
  steps: Step[],
  {
    lessonId,
    onComplete,
    autoSave = false,
  }: {
    lessonId?: string;
    onComplete: (results: LessonResults) => void;
    autoSave?: boolean;
  }
) {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(new Map<string, StepAnswer>());
  const [feedback, setFeedback] = useState(new Map<string, StepFeedback>());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Timing
  const startTimeRef = useRef(Date.now());
  const [completedAt, setCompletedAt] = useState<number | undefined>();

  // Derived state
  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;
  const hasAnswered = currentStep ? answers.has(currentStep.id) : false;
  const currentFeedback = currentStep ? feedback.get(currentStep.id) : undefined;

  const stepById = useMemo(
    () => new Map(steps.map((step) => [step.id, step])),
    [steps]
  );

  const scoredStepIds = useMemo(() => {
    const scoredSteps = steps.filter(
      (step) => step.type !== 'SUMMARY' && step.type !== 'INFO'
    );
    return new Set(scoredSteps.map((step) => step.id));
  }, [steps]);

  const isInfoStep = currentStep?.type === 'INFO';
  const scoredStepCount = scoredStepIds.size;

  // Calculate correct answers
  const correctCount = Array.from(feedback.entries()).filter(
    ([stepId, f]) => f.correct && scoredStepIds.has(stepId)
  ).length;

  /**
   * Validate an answer for a given step
   */
  const validateAnswer = useCallback(
    (step: Step, answer: StepAnswer): ValidationResult => {
      switch (step.type) {
        case 'INFO': {
          if (answer.type !== 'INFO') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }
          return {
            isCorrect: true,
            feedback: {
              correct: true,
              message: 'Continue when you are ready.',
            },
          };
        }
        case 'MULTIPLE_CHOICE': {
          if (answer.type !== 'MULTIPLE_CHOICE') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }
          const isCorrect = answer.selectedIndex === step.correctIndex;
          return {
            isCorrect,
            feedback: {
              correct: isCorrect,
              message: isCorrect ? 'Correct!' : 'Not quite',
              correctAnswer: isCorrect
                ? undefined
                : step.choices[step.correctIndex],
              explanation: step.explanation,
            },
          };
        }

        case 'FILL_BLANK': {
          if (answer.type !== 'FILL_BLANK') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }

          const userAnswer = step.caseSensitive
            ? answer.answer.trim()
            : answer.answer.trim().toLowerCase();

          const correctAnswer = step.caseSensitive
            ? step.correctAnswer.trim()
            : step.correctAnswer.trim().toLowerCase();

          const acceptableAnswers = step.acceptableAnswers?.map((a) =>
            step.caseSensitive ? a.trim() : a.trim().toLowerCase()
          ) || [];

          const isCorrect =
            userAnswer === correctAnswer ||
            acceptableAnswers.includes(userAnswer);

          return {
            isCorrect,
            feedback: {
              correct: isCorrect,
              message: isCorrect ? 'Correct!' : 'Not quite',
              correctAnswer: isCorrect ? undefined : step.correctAnswer,
              explanation: step.explanation,
            },
          };
        }

        case 'TAP_WORDS': {
          if (answer.type !== 'TAP_WORDS') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }

          // For TAP_WORDS, we consider it correct if they tapped minimum required words
          const minimumTaps = step.minimumTaps || 3;
          const isCorrect = answer.tappedWords.length >= minimumTaps;

          return {
            isCorrect,
            feedback: {
              correct: isCorrect,
              message: isCorrect
                ? `Great! You explored ${answer.tappedWords.length} words.`
                : `Tap at least ${minimumTaps} words to continue.`,
            },
          };
        }

        case 'PRONOUNCE': {
          if (answer.type !== 'PRONOUNCE') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }

          // For pronunciation, we always allow continue (self-assessment)
          // If they recorded, assume correct. If skipped, still allow continue.
          const isCorrect = !answer.skipped;

          return {
            isCorrect,
            feedback: {
              correct: true, // Always positive feedback
              message: answer.skipped
                ? 'Skipped. You can practice this later!'
                : 'Great job practicing!',
            },
          };
        }

        case 'SUMMARY': {
          // Summary step is always "correct" - just acknowledgment
          return {
            isCorrect: true,
            feedback: {
              correct: true,
              message: 'Lesson complete!',
            },
          };
        }

        default: {
          return {
            isCorrect: false,
            feedback: { correct: false, message: 'Unknown step type' },
          };
        }
      }
    },
    []
  );

  /**
   * Submit an answer for the current step
   */
  const submitAnswer = useCallback(
    async (answer: StepAnswer) => {
      if (!currentStep) return;

      setIsEvaluating(true);

      try {
        // Simulate slight delay for UX (feels more natural)
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Validate the answer
        const validation = validateAnswer(currentStep, answer);

        // Update state
        setAnswers((prev) => new Map(prev).set(currentStep.id, answer));
        setFeedback(
          (prev) => new Map(prev).set(currentStep.id, validation.feedback)
        );
        setShowFeedback(true);

        // Auto-save progress if enabled
        if (autoSave && lessonId) {
          try {
            await fetch('/api/lessons/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lessonId,
                status: 'in_progress',
                progress: Math.round(((currentIndex + 1) / steps.length) * 100),
              }),
            });
          } catch (saveError) {
            console.error('Failed to auto-save progress:', saveError);
          }
        }
      } catch (error) {
        console.error('Error validating answer:', error);
        setFeedback(
          (prev) =>
            new Map(prev).set(currentStep.id, {
              correct: false,
              message: 'Something went wrong. Please try again.',
            })
        );
        setShowFeedback(true);
      } finally {
        setIsEvaluating(false);
      }
    },
    [currentStep, currentIndex, steps.length, validateAnswer, autoSave, lessonId]
  );

  /**
   * Continue to next step
   */
  const continueToNext = useCallback(() => {
    if (isLastStep) {
      // Mark as completed
      setCompletedAt(Date.now());
    } else {
      // Move to next step
      setCurrentIndex((prev) => prev + 1);
      setShowFeedback(false);
    }
  }, [isLastStep]);

  /**
   * Skip current step
   */
  const skipStep = useCallback(() => {
    if (!currentStep) return;

    // Record as skipped answer based on step type
    let skippedAnswer: StepAnswer;
    switch (currentStep.type) {
      case 'PRONOUNCE':
        skippedAnswer = { type: 'PRONOUNCE', skipped: true };
        break;
      case 'TAP_WORDS':
        skippedAnswer = { type: 'TAP_WORDS', tappedWords: [] };
        break;
      default:
        // For other types, skip means we don't record an answer
        continueToNext();
        return;
    }

    submitAnswer(skippedAnswer);
  }, [currentStep, submitAnswer, continueToNext]);

  /**
   * Reset to beginning
   */
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers(new Map());
    setFeedback(new Map());
    setShowFeedback(false);
    setIsEvaluating(false);
    setCompletedAt(undefined);
    startTimeRef.current = Date.now();
  }, []);

  // Handle lesson completion
  useEffect(() => {
    if (completedAt) {
      const totalTime = completedAt - startTimeRef.current;
      const timeSpentMinutes = Math.ceil(totalTime / 60000);

      const results: LessonResults = {
        lessonId,
        totalSteps: scoredStepCount,
        correctAnswers: correctCount,
        totalTime,
        xpEarned: 0, // Will be calculated by XP calculator
        completedAt,
        answers: Array.from(answers.entries())
          .filter(([stepId]) => scoredStepIds.has(stepId))
          .map(([stepId, answer]) => {
            const step = stepById.get(stepId);
            const stepFeedback = feedback.get(stepId);
            return {
              stepId,
              stepType: step?.type || 'MULTIPLE_CHOICE',
              answer,
              correct: stepFeedback?.correct ?? false,
            };
          }),
      };

      // Save completion to database
      if (lessonId) {
        fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            status: 'completed',
            progress: 100,
            timeSpent: timeSpentMinutes,
          }),
        }).catch((err) => console.error('Failed to save lesson completion:', err));
      }

      onComplete(results);
    }
  }, [completedAt, lessonId, answers, feedback, correctCount, scoredStepCount, scoredStepIds, stepById, onComplete]);

  return {
    // Current state
    currentStep,
    currentIndex,
    currentFeedback,
    showFeedback,
    isEvaluating,
    hasAnswered,

    // Derived state
    isLastStep,
    correctCount,
    totalSteps: scoredStepCount,
    progress: {
      current: currentIndex + 1,
      total: steps.length,
    },

    // Actions
    submitAnswer,
    continueToNext,
    skipStep,
    reset,

    // Button state helpers
    submitLabel: showFeedback || isInfoStep
      ? isLastStep
        ? 'Finish Lesson'
        : 'Continue'
      : 'Check',
    submitDisabled: (isInfoStep ? false : !hasAnswered) || isEvaluating,
    showSkip: currentStep?.type === 'PRONOUNCE' || currentStep?.type === 'TAP_WORDS',
  };
}
