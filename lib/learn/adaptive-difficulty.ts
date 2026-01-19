/**
 * Adaptive Difficulty System
 * 
 * Dynamically adjusts exercise difficulty during a session
 * based on the learner's rolling performance.
 * 
 * Algorithm:
 * - Track rolling accuracy of last N exercises
 * - Adjust difficulty bias based on performance
 * - Select next exercise weighted by bias
 * 
 * Goals:
 * - Keep learners in "flow" state (not too easy, not too hard)
 * - Provide appropriate challenge for skill development
 * - Avoid frustration from consistent failure
 * 
 * Parity: Shared logic for both PWA and Android
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Configuration for adaptive difficulty
 */
export interface AdaptiveConfig {
  /** Number of recent answers to consider */
  windowSize: number;
  /** Accuracy threshold to increase difficulty */
  increaseThreshold: number;
  /** Accuracy threshold to decrease difficulty */
  decreaseThreshold: number;
  /** Maximum difficulty adjustment per session */
  maxAdjustments: number;
  /** Minimum exercises before adapting */
  warmupPeriod: number;
}

/**
 * Default configuration - balanced for language learning
 */
export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  windowSize: 5,
  increaseThreshold: 0.8, // 80% or higher → increase difficulty
  decreaseThreshold: 0.4, // 40% or lower → decrease difficulty
  maxAdjustments: 3,
  warmupPeriod: 3,
};

/**
 * Session state for adaptive difficulty tracking
 */
export interface AdaptiveSessionState {
  /** Recent answer results (true = correct) */
  recentAnswers: boolean[];
  /** Current difficulty bias (-1 to +1) */
  difficultyBias: number;
  /** Number of adjustments made this session */
  adjustmentsMade: number;
  /** Current effective difficulty */
  currentDifficulty: DifficultyLevel;
  /** History of difficulty changes */
  difficultyHistory: Array<{
    timestamp: number;
    from: DifficultyLevel;
    to: DifficultyLevel;
    reason: string;
  }>;
}

/**
 * Create initial adaptive session state
 */
export function createAdaptiveState(
  startingDifficulty: DifficultyLevel = 'medium'
): AdaptiveSessionState {
  return {
    recentAnswers: [],
    difficultyBias: 0,
    adjustmentsMade: 0,
    currentDifficulty: startingDifficulty,
    difficultyHistory: [],
  };
}

/**
 * Calculate rolling accuracy from recent answers
 */
export function calculateRollingAccuracy(
  answers: boolean[],
  windowSize: number = DEFAULT_ADAPTIVE_CONFIG.windowSize
): number {
  if (answers.length === 0) return 0.5; // Neutral if no data
  
  const recent = answers.slice(-windowSize);
  const correct = recent.filter(a => a).length;
  return correct / recent.length;
}

/**
 * Determine if difficulty should be adjusted
 */
export function shouldAdjustDifficulty(
  state: AdaptiveSessionState,
  config: AdaptiveConfig = DEFAULT_ADAPTIVE_CONFIG
): { shouldAdjust: boolean; direction: 'up' | 'down' | 'none'; reason: string } {
  // Check warmup period
  if (state.recentAnswers.length < config.warmupPeriod) {
    return { shouldAdjust: false, direction: 'none', reason: 'Warmup period' };
  }

  // Check max adjustments
  if (state.adjustmentsMade >= config.maxAdjustments) {
    return { shouldAdjust: false, direction: 'none', reason: 'Max adjustments reached' };
  }

  const accuracy = calculateRollingAccuracy(state.recentAnswers, config.windowSize);

  // Check if at boundaries
  if (state.currentDifficulty === 'hard' && accuracy >= config.increaseThreshold) {
    return { shouldAdjust: false, direction: 'none', reason: 'Already at max difficulty' };
  }
  if (state.currentDifficulty === 'easy' && accuracy <= config.decreaseThreshold) {
    return { shouldAdjust: false, direction: 'none', reason: 'Already at min difficulty' };
  }

  // Determine adjustment
  if (accuracy >= config.increaseThreshold) {
    return { 
      shouldAdjust: true, 
      direction: 'up', 
      reason: `High accuracy (${Math.round(accuracy * 100)}%)` 
    };
  }
  if (accuracy <= config.decreaseThreshold) {
    return { 
      shouldAdjust: true, 
      direction: 'down', 
      reason: `Low accuracy (${Math.round(accuracy * 100)}%)` 
    };
  }

  return { shouldAdjust: false, direction: 'none', reason: 'Performance in target range' };
}

/**
 * Get next difficulty level
 */
function getNextDifficulty(
  current: DifficultyLevel,
  direction: 'up' | 'down'
): DifficultyLevel {
  const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const currentIndex = levels.indexOf(current);
  
  if (direction === 'up') {
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  } else {
    return levels[Math.max(currentIndex - 1, 0)];
  }
}

/**
 * Record an answer and potentially adjust difficulty
 */
export function recordAnswer(
  state: AdaptiveSessionState,
  correct: boolean,
  config: AdaptiveConfig = DEFAULT_ADAPTIVE_CONFIG
): AdaptiveSessionState {
  // Add answer to history
  const newAnswers = [...state.recentAnswers, correct].slice(-config.windowSize * 2);
  
  const newState: AdaptiveSessionState = {
    ...state,
    recentAnswers: newAnswers,
  };

  // Check if we should adjust
  const { shouldAdjust, direction, reason } = shouldAdjustDifficulty(newState, config);
  
  if (shouldAdjust && direction !== 'none') {
    const newDifficulty = getNextDifficulty(state.currentDifficulty, direction);
    
    newState.currentDifficulty = newDifficulty;
    newState.adjustmentsMade = state.adjustmentsMade + 1;
    newState.difficultyHistory = [
      ...state.difficultyHistory,
      {
        timestamp: Date.now(),
        from: state.currentDifficulty,
        to: newDifficulty,
        reason,
      },
    ];

    // Update bias
    newState.difficultyBias = direction === 'up' 
      ? Math.min(state.difficultyBias + 0.3, 1)
      : Math.max(state.difficultyBias - 0.3, -1);

    console.log(`[AdaptiveDifficulty] Adjusted: ${state.currentDifficulty} → ${newDifficulty} (${reason})`);
  }

  return newState;
}

/**
 * Exercise with difficulty metadata
 */
export interface ExerciseWithDifficulty {
  id: string;
  difficulty: DifficultyLevel;
  /** Related exercises at different difficulties */
  adaptivePool?: string[];
}

/**
 * Select next exercise based on current difficulty state
 */
export function selectNextExercise<T extends ExerciseWithDifficulty>(
  exercises: T[],
  state: AdaptiveSessionState,
  usedIds: Set<string> = new Set()
): T | null {
  // Filter out already used exercises
  const available = exercises.filter(e => !usedIds.has(e.id));
  
  if (available.length === 0) {
    return null;
  }

  // Group by difficulty
  const byDifficulty: Record<DifficultyLevel, T[]> = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const exercise of available) {
    const diff = exercise.difficulty || 'medium';
    byDifficulty[diff].push(exercise);
  }

  // Select based on current difficulty with some variance
  const targetDifficulty = state.currentDifficulty;
  
  // Weighted selection: prefer target, allow adjacent
  const weights: Record<DifficultyLevel, number> = {
    easy: targetDifficulty === 'easy' ? 0.7 : targetDifficulty === 'medium' ? 0.2 : 0.1,
    medium: targetDifficulty === 'medium' ? 0.7 : 0.25,
    hard: targetDifficulty === 'hard' ? 0.7 : targetDifficulty === 'medium' ? 0.2 : 0.1,
  };

  // Build weighted pool
  const weightedPool: T[] = [];
  for (const [diff, exs] of Object.entries(byDifficulty)) {
    const weight = weights[diff as DifficultyLevel];
    const count = Math.ceil(exs.length * weight * 3);
    for (let i = 0; i < count && i < exs.length; i++) {
      weightedPool.push(exs[i]);
    }
  }

  if (weightedPool.length === 0) {
    // Fallback to any available
    return available[Math.floor(Math.random() * available.length)];
  }

  // Random selection from weighted pool
  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}

/**
 * Get human-readable difficulty label
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy': return 'Beginner';
    case 'medium': return 'Intermediate';
    case 'hard': return 'Advanced';
  }
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy': return '#22c55e'; // Green
    case 'medium': return '#f59e0b'; // Amber
    case 'hard': return '#ef4444'; // Red
  }
}

/**
 * Serialize state for storage
 */
export function serializeAdaptiveState(state: AdaptiveSessionState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize state from storage
 */
export function deserializeAdaptiveState(serialized: string): AdaptiveSessionState | null {
  try {
    return JSON.parse(serialized) as AdaptiveSessionState;
  } catch {
    return null;
  }
}
