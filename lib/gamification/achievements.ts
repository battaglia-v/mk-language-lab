/**
 * Achievement Checker Service
 *
 * Handles achievement unlocking, badge awarding,
 * and tracking progress towards achievements.
 *
 * Optimized with:
 * - Category-based filtering for targeted checks
 * - Batched database queries to reduce round-trips
 * - Early exit when thresholds aren't met
 * - Cached static data for achievement definitions
 */

import prisma from '@/lib/prisma';
import { awardXP } from './xp';

// Types for achievement categories
type AchievementCategory = 'streak' | 'lesson' | 'xp' | 'special';
type ConditionType =
  | 'streak'
  | 'lessons_completed'
  | 'total_xp'
  | 'weekend_practice'
  | 'early_morning_practice'
  | 'late_night_practice';

// Map condition types to categories for efficient filtering
const CONDITION_TO_CATEGORY: Record<ConditionType, AchievementCategory> = {
  streak: 'streak',
  lessons_completed: 'lesson',
  total_xp: 'xp',
  weekend_practice: 'special',
  early_morning_practice: 'special',
  late_night_practice: 'special',
};

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
 * Pre-fetched context data for achievement checks
 * Batches all database queries upfront to avoid N+1 queries
 */
interface AchievementContext {
  gameProgress: {
    streak: number;
    totalLessons: number;
    xp: number;
  } | null;
  weekendDays: Set<number>;
  lastAttemptHour: number | null;
}

/**
 * Fetch all data needed for achievement checks in a single batch
 * This replaces multiple individual queries with one efficient fetch
 */
async function fetchAchievementContext(userId: string): Promise<AchievementContext> {
  // Batch fetch all required data in parallel
  const [gameProgress, recentAttempts] = await Promise.all([
    prisma.gameProgress.findUnique({
      where: { userId },
      select: { streak: true, totalLessons: true, xp: true },
    }),
    prisma.exerciseAttempt.findMany({
      where: {
        userId,
        attemptedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: { attemptedAt: true },
      orderBy: { attemptedAt: 'desc' },
      take: 100, // Limit for efficiency
    }),
  ]);

  // Process weekend days from attempts
  const weekendDays = new Set(
    recentAttempts
      .map((a) => a.attemptedAt.getDay())
      .filter((day) => day === 0 || day === 6) // Sunday = 0, Saturday = 6
  );

  // Get the hour of the most recent attempt
  const lastAttemptHour = recentAttempts.length > 0 ? recentAttempts[0].attemptedAt.getHours() : null;

  return {
    gameProgress,
    weekendDays,
    lastAttemptHour,
  };
}

/**
 * Check if user meets achievement condition using pre-fetched context
 * No database queries - uses cached context data
 */
function checkAchievementConditionSync(
  context: AchievementContext,
  condition: { type: string; value: number }
): boolean {
  const { gameProgress, weekendDays, lastAttemptHour } = context;

  if (!gameProgress && ['streak', 'lessons_completed', 'total_xp'].includes(condition.type)) {
    return false;
  }

  switch (condition.type) {
    case 'streak':
      return (gameProgress?.streak ?? 0) >= condition.value;

    case 'lessons_completed':
      return (gameProgress?.totalLessons ?? 0) >= condition.value;

    case 'total_xp':
      return (gameProgress?.xp ?? 0) >= condition.value;

    case 'weekend_practice':
      // Must have practiced on both Saturday AND Sunday
      return weekendDays.size >= 2;

    case 'early_morning_practice':
      // Check if last attempt was before 8 AM
      return lastAttemptHour !== null && lastAttemptHour < 8;

    case 'late_night_practice':
      // Check if last attempt was after 10 PM
      return lastAttemptHour !== null && lastAttemptHour >= 22;

    default:
      return false;
  }
}

/**
 * Filter achievements by category for targeted checking
 * Only checks relevant achievements based on the action that triggered the check
 */
function filterAchievementsByCategory(categories: AchievementCategory[] | null) {
  const entries = Object.entries(ACHIEVEMENTS) as [
    AchievementKey,
    (typeof ACHIEVEMENTS)[AchievementKey],
  ][];

  if (!categories) {
    return entries; // Check all if no filter specified
  }

  return entries.filter(([, achievement]) => {
    const category = CONDITION_TO_CATEGORY[achievement.condition.type as ConditionType];
    return categories.includes(category);
  });
}

/**
 * Quick eligibility check before running full achievement logic
 * Returns true if user might have new achievements to unlock
 */
function hasEligibleAchievements(
  context: AchievementContext,
  existingBadgeNames: Set<string>,
  categories: AchievementCategory[] | null
): boolean {
  const achievements = filterAchievementsByCategory(categories);

  for (const [, achievement] of achievements) {
    // Skip if already unlocked
    if (existingBadgeNames.has(achievement.name)) continue;

    // Quick threshold check for numeric achievements
    const { gameProgress } = context;
    if (gameProgress) {
      switch (achievement.condition.type) {
        case 'streak':
          if (gameProgress.streak >= achievement.condition.value) return true;
          break;
        case 'lessons_completed':
          if (gameProgress.totalLessons >= achievement.condition.value) return true;
          break;
        case 'total_xp':
          if (gameProgress.xp >= achievement.condition.value) return true;
          break;
        default:
          // Special achievements need full check
          return true;
      }
    }
  }

  return false;
}

/**
 * Check and unlock achievements for a user
 * Optimized with batched queries and category filtering
 *
 * @param userId - User ID to check achievements for
 * @param categories - Optional filter to only check specific achievement categories
 * @returns Array of newly unlocked achievements
 */
export async function checkAchievements(
  userId: string,
  categories: AchievementCategory[] | null = null
) {
  const unlockedAchievements: Array<{
    key: AchievementKey;
    name: string;
    description: string;
    xpAwarded: number;
  }> = [];

  // Batch fetch: existing badges and achievement context in parallel
  const [existingBadges, context] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId },
      select: { badge: { select: { name: true } } },
    }),
    fetchAchievementContext(userId),
  ]);

  const existingBadgeNames = new Set(existingBadges.map((ub) => ub.badge.name));

  // Early exit if no eligible achievements
  if (!hasEligibleAchievements(context, existingBadgeNames, categories)) {
    return unlockedAchievements;
  }

  // Get filtered achievements based on categories
  const achievementsToCheck = filterAchievementsByCategory(categories);

  // Process achievements - using sync condition checks (no DB queries)
  for (const [key, achievement] of achievementsToCheck) {
    // Skip if user already has this badge
    if (existingBadgeNames.has(achievement.name)) continue;

    // Check if condition is met (using pre-fetched context, no DB query)
    const conditionMet = checkAchievementConditionSync(context, achievement.condition);

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
 * Uses category filtering to only check relevant achievements
 */
export async function checkAchievementsAfterLesson(userId: string) {
  // After a lesson, check lesson achievements and special time-based ones
  return checkAchievements(userId, ['lesson', 'special']);
}

export async function checkAchievementsAfterStreak(userId: string, streak: number) {
  // Only check on milestone streaks for efficiency
  const milestones = [7, 30, 100];
  if (!milestones.includes(streak)) {
    return [];
  }
  // Only check streak-related achievements
  return checkAchievements(userId, ['streak']);
}

export async function checkAchievementsAfterXP(userId: string, totalXP: number) {
  // Only check on XP milestones for efficiency
  const milestones = [1000, 5000];
  const crossedMilestone = milestones.some(
    (milestone) => totalXP >= milestone && totalXP - milestone < 100 // Just crossed or near
  );

  if (!crossedMilestone) {
    return [];
  }
  // Only check XP-related achievements
  return checkAchievements(userId, ['xp']);
}

/**
 * Check all achievements (full check, for profile/dashboard views)
 * Use sparingly - prefer category-specific checks after actions
 */
export async function checkAllAchievements(userId: string) {
  return checkAchievements(userId, null);
}
