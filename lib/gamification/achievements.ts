/**
 * Achievement Checker Service
 *
 * Handles achievement unlocking, badge awarding,
 * and tracking progress towards achievements.
 */

import prisma from '@/lib/prisma';
import { awardXP } from './xp';

/**
 * Achievement definitions
 *
 * These define the unlock conditions for each achievement.
 * The unlockCondition is stored in the Badge model as JSON.
 */
export const ACHIEVEMENTS = {
  // Streak Achievements
  STREAK_7: {
    name: 'Week Warrior',
    description: 'Complete a 7-day streak',
    icon: '🔥',
    category: 'streak',
    xpReward: 20,
    condition: { type: 'streak', value: 7 },
  },
  STREAK_30: {
    name: 'Month Master',
    description: 'Complete a 30-day streak',
    icon: '⚡',
    category: 'streak',
    xpReward: 50,
    condition: { type: 'streak', value: 30 },
  },
  STREAK_100: {
    name: 'Century Legend',
    description: 'Complete a 100-day streak',
    icon: '👑',
    category: 'streak',
    xpReward: 100,
    condition: { type: 'streak', value: 100 },
  },

  // Lesson Achievements
  FIRST_LESSON: {
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'lesson',
    xpReward: 10,
    condition: { type: 'lessons_completed', value: 1 },
  },
  LESSON_10: {
    name: 'Getting Started',
    description: 'Complete 10 lessons',
    icon: '📚',
    category: 'lesson',
    xpReward: 20,
    condition: { type: 'lessons_completed', value: 10 },
  },
  LESSON_50: {
    name: 'Dedicated Learner',
    description: 'Complete 50 lessons',
    icon: '🌟',
    category: 'lesson',
    xpReward: 50,
    condition: { type: 'lessons_completed', value: 50 },
  },
  LESSON_100: {
    name: 'Master Student',
    description: 'Complete 100 lessons',
    icon: '🏆',
    category: 'lesson',
    xpReward: 100,
    condition: { type: 'lessons_completed', value: 100 },
  },

  // XP Achievements
  XP_1000: {
    name: 'Rising Star',
    description: 'Earn 1,000 XP',
    icon: '⭐',
    category: 'xp',
    xpReward: 50,
    condition: { type: 'total_xp', value: 1000 },
  },
  XP_5000: {
    name: 'XP Champion',
    description: 'Earn 5,000 XP',
    icon: '💫',
    category: 'xp',
    xpReward: 100,
    condition: { type: 'total_xp', value: 5000 },
  },

  // Special Achievements
  WEEKEND_WARRIOR: {
    name: 'Weekend Warrior',
    description: 'Practice on both Saturday and Sunday',
    icon: '🎮',
    category: 'special',
    xpReward: 15,
    condition: { type: 'weekend_practice', value: 1 },
  },
  EARLY_BIRD: {
    name: 'Early Bird',
    description: 'Practice before 8 AM',
    icon: '🌅',
    category: 'special',
    xpReward: 10,
    condition: { type: 'early_morning_practice', value: 1 },
  },
  NIGHT_OWL: {
    name: 'Night Owl',
    description: 'Practice after 10 PM',
    icon: '🦉',
    category: 'special',
    xpReward: 10,
    condition: { type: 'late_night_practice', value: 1 },
  },
} as const;

export type AchievementKey = keyof typeof ACHIEVEMENTS;

/**
 * Check if user meets achievement condition
 */
async function checkAchievementCondition(
  userId: string,
  condition: { type: string; value: number }
): Promise<boolean> {
  const gameProgress = await prisma.gameProgress.findUnique({
    where: { userId },
  });

  if (!gameProgress) return false;

  switch (condition.type) {
    case 'streak':
      return gameProgress.streak >= condition.value;

    case 'lessons_completed':
      return gameProgress.totalLessons >= condition.value;

    case 'total_xp':
      return gameProgress.xp >= condition.value;

    case 'weekend_practice':
      // Check if user practiced on both Saturday and Sunday
      // This would require additional tracking in practice sessions
      return false; // TODO: Implement weekend tracking

    case 'early_morning_practice':
      // Check if user practiced before 8 AM
      return false; // TODO: Implement time-based tracking

    case 'late_night_practice':
      // Check if user practiced after 10 PM
      return false; // TODO: Implement time-based tracking

    default:
      return false;
  }
}

/**
 * Check and unlock achievements for a user
 *
 * @param userId - User ID to check achievements for
 * @returns Array of newly unlocked achievements
 */
export async function checkAchievements(userId: string) {
  const unlockedAchievements: Array<{
    key: AchievementKey;
    name: string;
    description: string;
    xpAwarded: number;
  }> = [];

  // Get user's existing badges
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const existingBadgeNames = new Set(existingBadges.map((ub) => ub.badge.name));

  // Check each achievement
  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    // Skip if user already has this badge
    if (existingBadgeNames.has(achievement.name)) continue;

    // Check if condition is met
    const conditionMet = await checkAchievementCondition(userId, achievement.condition);

    if (conditionMet) {
      // Find or create the badge
      let badge = await prisma.badge.findUnique({
        where: { name: achievement.name },
      });

      if (!badge) {
        badge = await prisma.badge.create({
          data: {
            name: achievement.name,
            description: achievement.description,
            iconUrl: achievement.icon,
            category: 'achievement',
            rarityTier: getRarityTier(achievement.xpReward),
            unlockCondition: JSON.stringify(achievement.condition),
            costGems: 0,
            isAvailableInShop: false,
            isActive: true,
          },
        });
      }

      // Award badge to user
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          earnedAt: new Date(),
        },
      });

      // Award XP bonus
      await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`);

      unlockedAchievements.push({
        key: key as AchievementKey,
        name: achievement.name,
        description: achievement.description,
        xpAwarded: achievement.xpReward,
      });
    }
  }

  return unlockedAchievements;
}

/**
 * Determine rarity tier based on XP reward
 */
function getRarityTier(xpReward: number): 'common' | 'rare' | 'epic' | 'legendary' {
  if (xpReward >= 100) return 'legendary';
  if (xpReward >= 50) return 'epic';
  if (xpReward >= 20) return 'rare';
  return 'common';
}

/**
 * Get user's achievement progress
 *
 * Returns all achievements with their unlock status and progress
 */
export async function getUserAchievementProgress(userId: string) {
  const gameProgress = await prisma.gameProgress.findUnique({
    where: { userId },
  });

  const userBadges = await prisma.userBadge.findMany({
    where: { userId, earnedAt: { not: null } },
    include: { badge: true },
  });

  const unlockedBadgeNames = new Set(userBadges.map((ub) => ub.badge.name));

  // Calculate progress for each achievement
  const progress = Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
    const isUnlocked = unlockedBadgeNames.has(achievement.name);
    let currentValue = 0;
    const targetValue = achievement.condition.value;

    if (gameProgress) {
      switch (achievement.condition.type) {
        case 'streak':
          currentValue = gameProgress.streak;
          break;
        case 'lessons_completed':
          currentValue = gameProgress.totalLessons;
          break;
        case 'total_xp':
          currentValue = gameProgress.xp;
          break;
      }
    }

    const progressPercent = Math.min((currentValue / targetValue) * 100, 100);

    return {
      key: key as AchievementKey,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      xpReward: achievement.xpReward,
      isUnlocked,
      currentValue,
      targetValue,
      progress: progressPercent,
      rarityTier: getRarityTier(achievement.xpReward),
    };
  });

  // Sort: unlocked achievements first, then by category
  return progress.sort((a, b) => {
    if (a.isUnlocked !== b.isUnlocked) {
      return a.isUnlocked ? -1 : 1;
    }
    return a.category.localeCompare(b.category);
  });
}

/**
 * Get user's unlocked achievement count
 */
export async function getUserAchievementCount(userId: string) {
  const count = await prisma.userBadge.count({
    where: {
      userId,
      earnedAt: { not: null },
    },
  });

  const total = Object.keys(ACHIEVEMENTS).length;

  return {
    unlocked: count,
    total,
    percentage: Math.round((count / total) * 100),
  };
}

/**
 * Check achievements after specific actions
 */
export async function checkAchievementsAfterLesson(userId: string) {
  return checkAchievements(userId);
}

export async function checkAchievementsAfterStreak(userId: string, streak: number) {
  // Check milestone achievements (7, 30, 100)
  if (streak === 7 || streak === 30 || streak === 100) {
    return checkAchievements(userId);
  }
  return [];
}

export async function checkAchievementsAfterXP(userId: string, totalXP: number) {
  // Check XP milestone achievements (1000, 5000)
  if (totalXP >= 1000 || totalXP >= 5000) {
    return checkAchievements(userId);
  }
  return [];
}
