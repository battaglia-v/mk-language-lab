/**
 * XP (Experience Points) Calculator
 *
 * Simple XP system for lesson completion:
 * - 10 points per correct answer
 * - 5 bonus points for active streak
 * - 10 bonus points for perfect score
 */

export interface XPCalculationInput {
  totalSteps: number;
  correctAnswers: number;
  streak?: number; // Current day streak
  timeSpent?: number; // Milliseconds (future: time-based bonuses)
}

export interface XPCalculationResult {
  totalXP: number;
  breakdown: {
    baseXP: number;
    streakBonus: number;
    perfectBonus: number;
  };
}

/**
 * Calculate XP earned for a completed lesson
 */
export function calculateLessonXP(input: XPCalculationInput): XPCalculationResult {
  const { totalSteps, correctAnswers, streak = 0 } = input;

  // Base XP: 10 points per correct answer
  const baseXP = correctAnswers * 10;

  // Streak bonus: 5 points if user has an active streak
  const streakBonus = streak > 0 ? 5 : 0;

  // Perfect bonus: 10 points if all answers correct
  const perfectBonus = correctAnswers === totalSteps && totalSteps > 0 ? 10 : 0;

  const totalXP = baseXP + streakBonus + perfectBonus;

  return {
    totalXP,
    breakdown: {
      baseXP,
      streakBonus,
      perfectBonus,
    },
  };
}

/**
 * Format XP display with proper pluralization
 */
export function formatXP(xp: number): string {
  return `${xp} XP`;
}

/**
 * Get XP tier/level from total accumulated XP
 * (Future enhancement: user levels based on cumulative XP)
 */
export function getXPLevel(totalXP: number): {
  level: number;
  xpForNextLevel: number;
  progress: number; // 0-1
} {
  // Simple level formula: 100 XP per level
  const XP_PER_LEVEL = 100;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
  const xpForNextLevel = XP_PER_LEVEL - xpInCurrentLevel;
  const progress = xpInCurrentLevel / XP_PER_LEVEL;

  return {
    level,
    xpForNextLevel,
    progress,
  };
}
