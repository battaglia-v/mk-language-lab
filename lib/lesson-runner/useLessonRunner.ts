'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  Step,
  StepAnswer,
  StepFeedback,
  LessonResults,
  ValidationResult,
  SavedLessonProgress,
} from './types';
import { validateWithAlternatives } from '../validation/unified-validator';
import { debugExercise, debugValidation, debugSave, setDebugState } from '../debug';

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
    onProgressLoaded,
  }: {
    lessonId?: string;
    onComplete: (results: LessonResults) => void;
    autoSave?: boolean;
    onProgressLoaded?: (progress: SavedLessonProgress | null) => void;
  }
) {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(new Map<string, StepAnswer>());
  const [feedback, setFeedback] = useState(new Map<string, StepFeedback>());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Pending answer state - tracks user input before Check is pressed
  const [pendingAnswer, setPendingAnswerState] = useState<StepAnswer | null>(null);

  // Resume state
  const [savedProgress, setSavedProgress] = useState<SavedLessonProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(!!lessonId);
  const previousTimeSpentRef = useRef(0); // Track time from previous sessions

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

  // INFO and SUMMARY steps don't need validation - user just clicks Continue
  const isInfoStep = currentStep?.type === 'INFO' || currentStep?.type === 'SUMMARY';
  const scoredStepCount = scoredStepIds.size;
  const hasPendingAnswer = pendingAnswer !== null;

  // Clear pending answer when step changes
  useEffect(() => {
    setPendingAnswerState(null);
  }, [currentIndex]);

  /**
   * Set pending answer (user input before Check is pressed)
   * This does NOT trigger validation - just records the answer for the Check button
   */
  const setPendingAnswer = useCallback((answer: StepAnswer) => {
    setPendingAnswerState(answer);
    // Debug logging
    if (currentStep) {
      debugExercise(currentStep.id, currentStep.type, 'pending_answer_set', { answerType: answer.type });
      setDebugState({
        exerciseId: currentStep.id,
        exerciseType: currentStep.type,
        state: 'answering',
        pendingAnswer: true,
      });
    }
  }, [currentStep]);

  // Calculate correct answers
  const correctCount = Array.from(feedback.entries()).filter(
    ([stepId, f]) => f.correct && scoredStepIds.has(stepId)
  ).length;

  // Fetch saved progress on mount
  useEffect(() => {
    if (!lessonId) {
      setIsLoadingProgress(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/lessons/progress?lessonId=${lessonId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');
        const data = await response.json();
        const progress = data.progress as SavedLessonProgress | null;
        setSavedProgress(progress);
        onProgressLoaded?.(progress);
      } catch (error) {
        console.error('Error fetching lesson progress:', error);
        onProgressLoaded?.(null);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [lessonId, onProgressLoaded]);

  /**
   * Restore progress from saved state
   */
  const restoreProgress = useCallback(
    (progress: SavedLessonProgress) => {
      // Cap currentStepIndex to valid range (in case lesson was modified)
      const safeIndex = Math.min(progress.currentStepIndex, Math.max(0, steps.length - 1));
      setCurrentIndex(safeIndex);

      // Restore answers from saved stepAnswers
      if (progress.stepAnswers) {
        const restoredAnswers = new Map<string, StepAnswer>(
          Object.entries(progress.stepAnswers)
        );
        setAnswers(restoredAnswers);
      }

      // Track previous time spent for total calculation
      previousTimeSpentRef.current = progress.timeSpent;

      // Reset feedback and UI state
      setFeedback(new Map());
      setShowFeedback(false);
      startTimeRef.current = Date.now();
    },
    [steps.length]
  );

  /**
   * Reset and start fresh (clears saved progress)
   */
  const resetAndStartFresh = useCallback(async () => {
    // Clear local state
    setCurrentIndex(0);
    setAnswers(new Map());
    setFeedback(new Map());
    setShowFeedback(false);
    setIsEvaluating(false);
    setCompletedAt(undefined);
    setSavedProgress(null);
    previousTimeSpentRef.current = 0;
    startTimeRef.current = Date.now();

    // Reset saved progress on server if lessonId exists
    if (lessonId) {
      try {
        await fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            status: 'in_progress',
            progress: 0,
            timeSpent: 0,
            currentStepIndex: 0,
            stepAnswers: null,
          }),
        });
      } catch (error) {
        console.error('Failed to reset progress:', error);
      }
    }
  }, [lessonId]);

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

          // Use unified validator for rich Macedonian-specific feedback
          const validation = validateWithAlternatives(
            answer.answer,
            step.correctAnswer,
            step.acceptableAnswers || [],
            { caseSensitive: step.caseSensitive ?? false, strict: false }
          );

          // Generate feedback message based on analysis
          let message = validation.isCorrect ? 'Correct!' : 'Not quite';
          if (!validation.isCorrect && validation.analysis?.mistakeType) {
            message = validation.feedbackHint || message;
          }

          return {
            isCorrect: validation.isCorrect,
            feedback: {
              correct: validation.isCorrect,
              message,
              correctAnswer: validation.isCorrect ? undefined : step.correctAnswer,
              explanation: step.explanation,
            },
          };
        }

        case 'SENTENCE_BUILDER': {
          if (answer.type !== 'SENTENCE_BUILDER') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }

          // Compare selected words to correct order (exact match)
          const selectedJoined = answer.selectedWords.join(' ');
          const correctJoined = step.correctOrder.join(' ');
          let isCorrect = selectedJoined === correctJoined;

          // Check alternative orders if primary doesn't match
          if (!isCorrect && step.alternativeOrders?.length) {
            isCorrect = step.alternativeOrders.some(
              (alt) => alt.join(' ') === selectedJoined
            );
          }

          return {
            isCorrect,
            feedback: {
              correct: isCorrect,
              message: isCorrect ? 'Correct!' : 'Not quite',
              correctAnswer: isCorrect ? undefined : step.correctOrder.join(' '),
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

        case 'ERROR_CORRECTION': {
          if (answer.type !== 'ERROR_CORRECTION') {
            return {
              isCorrect: false,
              feedback: { correct: false, message: 'Invalid answer type' },
            };
          }

          // Check if user selected the correct error word
          const isCorrect = answer.selectedIndex === step.errorIndex;

          return {
            isCorrect,
            feedback: {
              correct: isCorrect,
              message: isCorrect ? 'Correct!' : 'Not quite',
              correctAnswer: isCorrect
                ? undefined
                : `${step.words[step.errorIndex]} → ${step.correctWord}`,
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
   * If no answer is provided, uses the pending answer (set by setPendingAnswer)
   */
  const submitAnswer = useCallback(
    async (answerArg?: StepAnswer) => {
      const answer = answerArg ?? pendingAnswer;
      if (!currentStep || !answer) return;

      setIsEvaluating(true);

      // Debug: Log validation trigger
      debugExercise(currentStep.id, currentStep.type, 'validation_triggered', { trigger: 'check_button' });
      setDebugState({ state: 'submitted', lastValidationReason: 'check_button' });

      try {
        // Simulate slight delay for UX (feels more natural)
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Validate the answer
        const validation = validateAnswer(currentStep, answer);

        // Debug: Log validation result
        debugValidation(currentStep.id, 'check_button', {
          isCorrect: validation.isCorrect,
          answer,
        });
        setDebugState({ state: 'feedback' });

        // Update state
        setAnswers((prev) => new Map(prev).set(currentStep.id, answer));
        setFeedback(
          (prev) => new Map(prev).set(currentStep.id, validation.feedback)
        );
        setShowFeedback(true);

        // Auto-save progress if enabled (with step-level data for resume)
        if (autoSave && lessonId) {
          try {
            // Create updated answers map for serialization
            const updatedAnswers = new Map(answers).set(currentStep.id, answer);
            const stepAnswersObj = Object.fromEntries(updatedAnswers);

            debugSave(lessonId, 'pending');
            await fetch('/api/lessons/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lessonId,
                status: 'in_progress',
                progress: Math.round(((currentIndex + 1) / steps.length) * 100),
                currentStepIndex: currentIndex,
                stepAnswers: stepAnswersObj,
              }),
            });
            debugSave(lessonId, 'success');
            setDebugState({ lastSaveStatus: 'ok' });
          } catch (saveError) {
            console.error('Failed to auto-save progress:', saveError);
            debugSave(lessonId, 'failed', { error: String(saveError) });
            setDebugState({ lastSaveStatus: 'failed' });
          }
        }
      } catch (error) {
        console.error('Error validating answer:', error);
        debugExercise(currentStep.id, currentStep.type, 'validation_error', { error: String(error) });
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
    [currentStep, currentIndex, steps.length, validateAnswer, autoSave, lessonId, answers, pendingAnswer]
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
      const sessionTime = completedAt - startTimeRef.current;
      const totalTime = sessionTime + (previousTimeSpentRef.current * 60000); // Add previous time
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

      // Save completion to database (clear step-level progress on completion)
      if (lessonId) {
        fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            status: 'completed',
            progress: 100,
            timeSpent: timeSpentMinutes,
            currentStepIndex: 0,
            stepAnswers: null, // Clear step-level progress on completion
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
    hasPendingAnswer,
    pendingAnswer,

    // Derived state
    isLastStep,
    correctCount,
    totalSteps: scoredStepCount,
    progress: {
      current: currentIndex + 1,
      total: steps.length,
    },

    // Resume state
    savedProgress,
    isLoadingProgress,

    // Actions
    submitAnswer,
    setPendingAnswer,
    continueToNext,
    skipStep,
    reset,
    restoreProgress,
    resetAndStartFresh,

    // Button state helpers
    submitLabel: showFeedback || isInfoStep
      ? 'Continue'
      : 'Check',
    // Enable Check button when user has a pending answer (not yet validated)
    submitDisabled: isInfoStep ? false : (showFeedback ? false : !hasPendingAnswer) || isEvaluating,
    showSkip: currentStep?.type === 'PRONOUNCE' || currentStep?.type === 'TAP_WORDS',
  };
}
