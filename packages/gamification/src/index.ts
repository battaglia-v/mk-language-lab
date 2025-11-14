// Export types
export type * from './types.js';

// Export XP utilities
export {
  BASE_XP_VALUES,
  DIFFICULTY_MULTIPLIERS,
  calculateXP,
  calculateStreakBonus,
  calculateXPForLevel,
  calculateLevelFromXP,
  getLevelProgress,
} from './xp.js';

// Export heart utilities
export {
  MAX_HEARTS,
  HEART_REGEN_MINUTES,
  calculateHeartLoss,
  calculateCurrentHearts,
  formatHeartRegenTime,
  calculateHeartReward,
  canPerformActivity,
} from './hearts.js';

// Export streak utilities
export {
  calculateStreak,
  getStreakStatus,
  hasPracticedToday,
  getLeagueTierFromStreak,
  getStreakXPMultiplier,
  getHoursRemainingToday,
} from './streak.js';
