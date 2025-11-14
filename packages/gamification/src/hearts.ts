import type { HeartRegenerationContext } from './types.js';

/**
 * Maximum hearts a user can have
 */
export const MAX_HEARTS = 5;

/**
 * Time (in minutes) it takes to regenerate one heart
 */
export const HEART_REGEN_MINUTES = 30;

/**
 * Calculate hearts lost for an incorrect answer
 * Can be adjusted based on difficulty or talisman protection
 */
export function calculateHeartLoss(options: {
  difficulty?: 'easy' | 'medium' | 'hard';
  hasTalismanProtection?: boolean;
}): number {
  const { difficulty = 'medium', hasTalismanProtection = false } = options;

  // No loss with talisman protection
  if (hasTalismanProtection) return 0;

  // Easy exercises cost less
  if (difficulty === 'easy') return 0.5;

  // Hard exercises cost more
  if (difficulty === 'hard') return 2;

  return 1;
}

/**
 * Calculate current hearts based on time regeneration
 */
export function calculateCurrentHearts(context: HeartRegenerationContext): {
  currentHearts: number;
  minutesUntilNextHeart: number;
  isFullyRegenerated: boolean;
} {
  const { currentHearts, maxHearts, lastPracticeDate, currentDate } = context;

  // Already at max
  if (currentHearts >= maxHearts) {
    return {
      currentHearts: maxHearts,
      minutesUntilNextHeart: 0,
      isFullyRegenerated: true,
    };
  }

  // No last practice date - assume full hearts
  if (!lastPracticeDate) {
    return {
      currentHearts: maxHearts,
      minutesUntilNextHeart: 0,
      isFullyRegenerated: true,
    };
  }

  // Calculate time elapsed
  const elapsedMinutes = Math.floor(
    (currentDate.getTime() - lastPracticeDate.getTime()) / (1000 * 60)
  );

  // Calculate hearts regenerated
  const heartsRegened = Math.floor(elapsedMinutes / HEART_REGEN_MINUTES);
  const newHearts = Math.min(maxHearts, currentHearts + heartsRegened);

  // Calculate time until next heart
  const minutesSinceLastRegen = elapsedMinutes % HEART_REGEN_MINUTES;
  const minutesUntilNextHeart =
    newHearts >= maxHearts ? 0 : HEART_REGEN_MINUTES - minutesSinceLastRegen;

  return {
    currentHearts: newHearts,
    minutesUntilNextHeart,
    isFullyRegenerated: newHearts >= maxHearts,
  };
}

/**
 * Format time remaining until next heart
 */
export function formatHeartRegenTime(minutes: number): string {
  if (minutes === 0) return 'Full';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}

/**
 * Calculate hearts gained from completing a lesson
 */
export function calculateHeartReward(options: {
  lessonDifficulty?: 'easy' | 'medium' | 'hard';
  perfectScore?: boolean;
}): number {
  const { lessonDifficulty = 'medium', perfectScore = false } = options;

  let hearts = 0;

  // Base reward
  if (lessonDifficulty === 'hard') {
    hearts = 2;
  } else if (lessonDifficulty === 'medium') {
    hearts = 1;
  }

  // Bonus for perfect score
  if (perfectScore) {
    hearts += 1;
  }

  return hearts;
}

/**
 * Check if user has enough hearts for an activity
 */
export function canPerformActivity(currentHearts: number, costInHearts: number = 0): boolean {
  return currentHearts >= costInHearts && currentHearts > 0;
}
