/**
 * useAdaptiveDifficulty Hook
 * 
 * Manages adaptive difficulty state for practice sessions.
 * Tracks performance and automatically adjusts difficulty.
 * 
 * Usage:
 * const { state, recordAnswer, currentDifficulty, selectNext } = useAdaptiveDifficulty({
 *   startingDifficulty: 'medium',
 * });
 * 
 * Parity: Shared hook for both PWA and Android
 */

import { useState, useCallback, useMemo } from 'react';
import {
  createAdaptiveState,
  recordAnswer as recordAdaptiveAnswer,
  selectNextExercise,
  type AdaptiveSessionState,
  type AdaptiveConfig,
  type DifficultyLevel,
  type ExerciseWithDifficulty,
  DEFAULT_ADAPTIVE_CONFIG,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/lib/learn/adaptive-difficulty';

interface UseAdaptiveDifficultyOptions {
  /** Starting difficulty level */
  startingDifficulty?: DifficultyLevel;
  /** Custom configuration */
  config?: Partial<AdaptiveConfig>;
  /** Callback when difficulty changes */
  onDifficultyChange?: (from: DifficultyLevel, to: DifficultyLevel) => void;
  /** Whether adaptive mode is enabled */
  enabled?: boolean;
}

interface UseAdaptiveDifficultyReturn {
  /** Current adaptive state */
  state: AdaptiveSessionState;
  /** Record an answer and potentially adjust difficulty */
  recordAnswer: (correct: boolean) => void;
  /** Current difficulty level */
  currentDifficulty: DifficultyLevel;
  /** Human-readable difficulty label */
  difficultyLabel: string;
  /** Difficulty color for UI */
  difficultyColor: string;
  /** Select next exercise from pool */
  selectNext: <T extends ExerciseWithDifficulty>(
    exercises: T[],
    usedIds?: Set<string>
  ) => T | null;
  /** Rolling accuracy */
  rollingAccuracy: number;
  /** Number of adjustments made */
  adjustmentsMade: number;
  /** Whether adaptive mode is active */
  isAdaptive: boolean;
  /** Reset to initial state */
  reset: () => void;
}

export function useAdaptiveDifficulty(
  options: UseAdaptiveDifficultyOptions = {}
): UseAdaptiveDifficultyReturn {
  const {
    startingDifficulty = 'medium',
    config: customConfig,
    onDifficultyChange,
    enabled = true,
  } = options;

  const config = useMemo(
    () => ({ ...DEFAULT_ADAPTIVE_CONFIG, ...customConfig }),
    [customConfig]
  );

  const [state, setState] = useState<AdaptiveSessionState>(() =>
    createAdaptiveState(startingDifficulty)
  );

  const recordAnswer = useCallback(
    (correct: boolean) => {
      if (!enabled) return;

      setState((currentState) => {
        const previousDifficulty = currentState.currentDifficulty;
        const newState = recordAdaptiveAnswer(currentState, correct, config);

        // Notify if difficulty changed
        if (newState.currentDifficulty !== previousDifficulty && onDifficultyChange) {
          onDifficultyChange(previousDifficulty, newState.currentDifficulty);
        }

        return newState;
      });
    },
    [config, enabled, onDifficultyChange]
  );

  const selectNext = useCallback(
    <T extends ExerciseWithDifficulty>(
      exercises: T[],
      usedIds: Set<string> = new Set()
    ): T | null => {
      if (!enabled) {
        // Non-adaptive: just pick any available
        const available = exercises.filter((e) => !usedIds.has(e.id));
        return available.length > 0 ? available[0] : null;
      }
      return selectNextExercise(exercises, state, usedIds);
    },
    [state, enabled]
  );

  const reset = useCallback(() => {
    setState(createAdaptiveState(startingDifficulty));
  }, [startingDifficulty]);

  const rollingAccuracy = useMemo(() => {
    if (state.recentAnswers.length === 0) return 0;
    const recent = state.recentAnswers.slice(-config.windowSize);
    return recent.filter((a) => a).length / recent.length;
  }, [state.recentAnswers, config.windowSize]);

  return {
    state,
    recordAnswer,
    currentDifficulty: state.currentDifficulty,
    difficultyLabel: getDifficultyLabel(state.currentDifficulty),
    difficultyColor: getDifficultyColor(state.currentDifficulty),
    selectNext,
    rollingAccuracy,
    adjustmentsMade: state.adjustmentsMade,
    isAdaptive: enabled,
    reset,
  };
}

export default useAdaptiveDifficulty;
