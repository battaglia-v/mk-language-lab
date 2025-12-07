/**
 * XP Award Service
 *
 * Handles experience point calculations, level progression,
 * and daily goal tracking for the gamification system.
 */

import prisma from '@/lib/prisma';

/**
 * XP Award Reasons - determines how much XP is awarded
 */
export const XP_AWARDS = {
  // Core Learning
  LESSON_COMPLETE: 10,
  PRACTICE_SESSION: 5,
  QUIZ_PERFECT: 15, // Bonus for 100% accuracy

  // Daily Goals
  DAILY_GOAL_COMPLETE: 10,
  DAILY_GOAL_EXCEEDED_2X: 20, // Double the daily goal

  // Streaks
  STREAK_7_DAY: 20,
  STREAK_30_DAY: 50,
  STREAK_100_DAY: 100,

  // Social
  REFERRAL: 25,

  // Misc
  FIRST_ACTION_TODAY: 5,
  TRANSLATION_USED: 2,
  NEWS_ARTICLE_READ: 5,
} as const;

/**
 * Level thresholds and names
 */
export const LEVELS = [
  { name: 'Beginner', minXP: 0, maxXP: 100 },
  { name: 'Elementary', minXP: 100, maxXP: 300 },
  { name: 'Intermediate', minXP: 300, maxXP: 700 },
  { name: 'Advanced', minXP: 700, maxXP: 1500 },
  { name: 'Fluent', minXP: 1500, maxXP: Infinity },
] as const;

export type LevelName = typeof LEVELS[number]['name'];

/**
 * Get level information based on total XP
 */
export function getLevelInfo(totalXP: number) {
  const levelIndex = LEVELS.findIndex(
    (level) => totalXP >= level.minXP && totalXP < level.maxXP
  );

  const currentLevel = LEVELS[levelIndex] || LEVELS[LEVELS.length - 1];
  const nextLevel = LEVELS[levelIndex + 1];

  const currentXP = totalXP - currentLevel.minXP;
  const xpForNextLevel = nextLevel
    ? nextLevel.minXP - currentLevel.minXP
    : 0; // Max level reached

  return {
    level: levelIndex + 1,
    name: currentLevel.name,
    currentXP,
    xpForNextLevel,
    totalXP,
    progress: xpForNextLevel > 0 ? (currentXP / xpForNextLevel) * 100 : 100,
    isMaxLevel: !nextLevel,
  };
}

/**
 * Award XP to a user and update their progress
 *
 * @param userId - User ID to award XP to
 * @param xpAmount - Amount of XP to award
 * @param reason - Why XP is being awarded (for logging/analytics)
 * @returns Updated game progress with XP details
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  reason: keyof typeof XP_AWARDS | string
) {
  // Get or create game progress
  let gameProgress = await prisma.gameProgress.findUnique({
    where: { userId },
  });

  if (!gameProgress) {
    gameProgress = await prisma.gameProgress.create({
      data: {
        userId,
        xp: 0,
        level: 'beginner',
        streak: 0,
        hearts: 5,
        todayXP: 0,
        dailyGoalXP: 20,
        longestStreak: 0,
        totalLessons: 0,
      },
    });
  }

  // Calculate new XP totals
  const newTotalXP = gameProgress.xp + xpAmount;
  const newTodayXP = gameProgress.todayXP + xpAmount;

  // Determine new level
  const levelInfo = getLevelInfo(newTotalXP);
  const previousLevelInfo = getLevelInfo(gameProgress.xp);
  const leveledUp = levelInfo.level > previousLevelInfo.level;

  // Update game progress
  const updated = await prisma.gameProgress.update({
    where: { userId },
    data: {
      xp: newTotalXP,
      todayXP: newTodayXP,
      level: levelInfo.name.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
    },
  });

  return {
    ...updated,
    xpAwarded: xpAmount,
    reason,
    leveledUp,
    previousLevel: previousLevelInfo.level,
    currentLevel: levelInfo.level,
    levelName: levelInfo.name,
  };
}

/**
 * Award XP for completing a lesson
 */
export async function awardLessonXP(userId: string, perfectScore: boolean = false) {
  const baseXP = XP_AWARDS.LESSON_COMPLETE;
  const bonusXP = perfectScore ? XP_AWARDS.QUIZ_PERFECT : 0;
  const totalXP = baseXP + bonusXP;

  const result = await awardXP(
    userId,
    totalXP,
    perfectScore ? 'LESSON_COMPLETE (Perfect!)' : 'LESSON_COMPLETE'
  );

  // Increment total lessons count
  await prisma.gameProgress.update({
    where: { userId },
    data: { totalLessons: { increment: 1 } },
  });

  return result;
}

/**
 * Award XP for completing a practice session
 */
export async function awardPracticeXP(userId: string) {
  return awardXP(userId, XP_AWARDS.PRACTICE_SESSION, 'PRACTICE_SESSION');
}

/**
 * Award XP for reading a news article
 */
export async function awardNewsReadXP(userId: string) {
  return awardXP(userId, XP_AWARDS.NEWS_ARTICLE_READ, 'NEWS_ARTICLE_READ');
}

/**
 * Award XP for using translation feature
 */
export async function awardTranslationXP(userId: string) {
  return awardXP(userId, XP_AWARDS.TRANSLATION_USED, 'TRANSLATION_USED');
}

/**
 * Check and award daily goal completion bonus
 */
export async function checkDailyGoal(userId: string) {
  const gameProgress = await prisma.gameProgress.findUnique({
    where: { userId },
  });

  if (!gameProgress) return null;

  const { todayXP, dailyGoalXP } = gameProgress;

  // Already completed?
  if (todayXP < dailyGoalXP) return null;

  // Award daily goal bonus (only once per day)
  const ratio = todayXP / dailyGoalXP;
  let bonusXP = 0;
  let bonusReason = '';

  if (ratio >= 2) {
    bonusXP = XP_AWARDS.DAILY_GOAL_EXCEEDED_2X;
    bonusReason = 'DAILY_GOAL_EXCEEDED_2X';
  } else if (ratio >= 1) {
    bonusXP = XP_AWARDS.DAILY_GOAL_COMPLETE;
    bonusReason = 'DAILY_GOAL_COMPLETE';
  }

  if (bonusXP > 0) {
    return awardXP(userId, bonusXP, bonusReason);
  }

  return null;
}

/**
 * Reset daily XP at midnight (called by cron job)
 */
export async function resetDailyXP() {
  const result = await prisma.gameProgress.updateMany({
    data: { todayXP: 0 },
  });

  return { reset: result.count };
}

/**
 * Get user's current XP status
 */
export async function getUserXPStatus(userId: string) {
  const gameProgress = await prisma.gameProgress.findUnique({
    where: { userId },
  });

  if (!gameProgress) {
    return {
      totalXP: 0,
      todayXP: 0,
      dailyGoalXP: 20,
      level: 1,
      levelName: 'Beginner',
      progress: 0,
      xpForNextLevel: 100,
    };
  }

  const levelInfo = getLevelInfo(gameProgress.xp);
  const dailyGoalProgress = (gameProgress.todayXP / gameProgress.dailyGoalXP) * 100;

  return {
    totalXP: gameProgress.xp,
    todayXP: gameProgress.todayXP,
    dailyGoalXP: gameProgress.dailyGoalXP,
    dailyGoalProgress: Math.min(dailyGoalProgress, 100),
    dailyGoalComplete: gameProgress.todayXP >= gameProgress.dailyGoalXP,
    level: levelInfo.level,
    levelName: levelInfo.name,
    progress: levelInfo.progress,
    xpForNextLevel: levelInfo.xpForNextLevel,
    currentXP: levelInfo.currentXP,
    isMaxLevel: levelInfo.isMaxLevel,
  };
}

/**
 * Award streak milestone bonus
 */
export async function awardStreakMilestoneXP(userId: string, streak: number) {
  let bonusXP = 0;
  let reason = '';

  if (streak === 100) {
    bonusXP = XP_AWARDS.STREAK_100_DAY;
    reason = 'STREAK_100_DAY';
  } else if (streak === 30) {
    bonusXP = XP_AWARDS.STREAK_30_DAY;
    reason = 'STREAK_30_DAY';
  } else if (streak === 7) {
    bonusXP = XP_AWARDS.STREAK_7_DAY;
    reason = 'STREAK_7_DAY';
  }

  if (bonusXP > 0) {
    return awardXP(userId, bonusXP, reason);
  }

  return null;
}
