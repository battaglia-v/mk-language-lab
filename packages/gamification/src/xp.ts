import type { XPCalculationContext, XPSource } from './types.js';

/**
 * Base XP values for different activities
 */
export const BASE_XP_VALUES: Record<XPSource, number> = {
  exercise_correct: 12,
  lesson_complete: 50,
  quest_complete: 100,
  streak_bonus: 25,
  daily_bonus: 15,
  talisman_multiplier: 0, // Applied as multiplier, not base value
};

/**
 * Difficulty multipliers
 */
export const DIFFICULTY_MULTIPLIERS = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.5,
} as const;

/**
 * Calculate XP earned for an activity
 */
export function calculateXP(context: XPCalculationContext): number {
  let xp = context.baseXP || BASE_XP_VALUES[context.source] || 0;

  // Apply difficulty multiplier
  if (context.difficulty) {
    xp *= DIFFICULTY_MULTIPLIERS[context.difficulty];
  }

  // Apply talisman multiplier
  if (context.talismanMultiplier && context.talismanMultiplier > 1) {
    xp *= context.talismanMultiplier;
  }

  // Add streak bonus
  if (context.streakBonus) {
    xp += context.streakBonus;
  }

  return Math.round(xp);
}

/**
 * Calculate streak bonus XP based on current streak
 * Bonuses increase with longer streaks
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays < 3) return 0;
  if (streakDays < 7) return 10;
  if (streakDays < 14) return 25;
  if (streakDays < 30) return 50;
  return 100;
}

/**
 * Calculate XP required for next level
 * Uses exponential scaling: XP = 1000 * (level^1.5)
 */
export function calculateXPForLevel(level: number): number {
  return Math.round(1000 * Math.pow(level, 1.5));
}

/**
 * Calculate level based on total XP
 */
export function calculateLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpForNextLevel = calculateXPForLevel(level);

  while (totalXP >= xpForNextLevel) {
    level++;
    xpForNextLevel = calculateXPForLevel(level);
  }

  return level;
}

/**
 * Get progress toward next level
 */
export function getLevelProgress(totalXP: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  percentComplete: number;
} {
  const currentLevel = calculateLevelFromXP(totalXP);
  const xpForCurrentLevel = currentLevel > 1 ? calculateXPForLevel(currentLevel - 1) : 0;
  const xpForNextLevel = calculateXPForLevel(currentLevel);
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const percentComplete = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    currentLevel,
    xpInCurrentLevel,
    xpForNextLevel: xpNeededForNextLevel,
    percentComplete,
  };
}
