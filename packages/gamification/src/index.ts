// Export types
export type * from './types';

// Export XP utilities
export {
  BASE_XP_VALUES,
  DIFFICULTY_MULTIPLIERS,
  calculateXP,
  calculateStreakBonus,
  calculateXPForLevel,
  calculateLevelFromXP,
  getLevelProgress,
} from './xp';

// Export heart utilities
export {
  MAX_HEARTS,
  HEART_REGEN_MINUTES,
  calculateHeartLoss,
  calculateCurrentHearts,
  formatHeartRegenTime,
  calculateHeartReward,
  canPerformActivity,
} from './hearts';

// Export streak utilities
export {
  calculateStreak,
  getStreakStatus,
  hasPracticedToday,
  getLeagueTierFromStreak,
  getStreakXPMultiplier,
  getHoursRemainingToday,
} from './streak';
