/**
 * Achievements/Badges System for React Native
 * 
 * Tracks user achievements and unlockable badges
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mkll:achievements';

// ============================================================================
// Types
// ============================================================================

export type AchievementId =
  | 'first_lesson'
  | 'first_practice'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'words_10'
  | 'words_50'
  | 'words_100'
  | 'words_500'
  | 'perfect_practice'
  | 'speed_demon'
  | 'bookworm'
  | 'translator'
  | 'daily_goal_7'
  | 'night_owl'
  | 'early_bird';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string; // Emoji
  category: 'learning' | 'streak' | 'practice' | 'special';
  xpReward: number;
  unlockedAt?: string; // ISO timestamp
};

export type AchievementProgress = {
  unlockedAchievements: Partial<Record<AchievementId, string>>; // id -> ISO timestamp
  totalXPFromAchievements: number;
};

// ============================================================================
// Achievement Definitions
// ============================================================================

export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
  first_lesson: {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'learning',
    xpReward: 50,
  },
  first_practice: {
    id: 'first_practice',
    title: 'Practice Makes Perfect',
    description: 'Complete your first practice session',
    icon: '💪',
    category: 'practice',
    xpReward: 30,
  },
  streak_3: {
    id: 'streak_3',
    title: 'Getting Warmed Up',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    xpReward: 50,
  },
  streak_7: {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    category: 'streak',
    xpReward: 100,
  },
  streak_30: {
    id: 'streak_30',
    title: 'Dedication Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    category: 'streak',
    xpReward: 500,
  },
  words_10: {
    id: 'words_10',
    title: 'Vocabulary Starter',
    description: 'Learn 10 words',
    icon: '📚',
    category: 'learning',
    xpReward: 25,
  },
  words_50: {
    id: 'words_50',
    title: 'Word Collector',
    description: 'Learn 50 words',
    icon: '📖',
    category: 'learning',
    xpReward: 75,
  },
  words_100: {
    id: 'words_100',
    title: 'Vocabulary Builder',
    description: 'Learn 100 words',
    icon: '🎓',
    category: 'learning',
    xpReward: 150,
  },
  words_500: {
    id: 'words_500',
    title: 'Language Scholar',
    description: 'Learn 500 words',
    icon: '🌟',
    category: 'learning',
    xpReward: 500,
  },
  perfect_practice: {
    id: 'perfect_practice',
    title: 'Perfectionist',
    description: 'Get 100% on a practice session',
    icon: '✨',
    category: 'practice',
    xpReward: 75,
  },
  speed_demon: {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete Word Sprint in under 60 seconds',
    icon: '⚡',
    category: 'practice',
    xpReward: 100,
  },
  bookworm: {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Read 5 stories in the Reader',
    icon: '📕',
    category: 'learning',
    xpReward: 100,
  },
  translator: {
    id: 'translator',
    title: 'Translator',
    description: 'Translate 50 phrases',
    icon: '🌐',
    category: 'special',
    xpReward: 75,
  },
  daily_goal_7: {
    id: 'daily_goal_7',
    title: 'Goal Getter',
    description: 'Meet your daily goal 7 days in a row',
    icon: '🎯',
    category: 'streak',
    xpReward: 150,
  },
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Practice after 10 PM',
    icon: '🦉',
    category: 'special',
    xpReward: 25,
  },
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Practice before 7 AM',
    icon: '🌅',
    category: 'special',
    xpReward: 25,
  },
};

// ============================================================================
// Storage Functions
// ============================================================================

async function readProgress(): Promise<AchievementProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('[Achievements] Failed to read:', error);
  }
  return {
    unlockedAchievements: {},
    totalXPFromAchievements: 0,
  };
}

async function writeProgress(progress: AchievementProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('[Achievements] Failed to write:', error);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if an achievement is unlocked
 */
export async function isAchievementUnlocked(id: AchievementId): Promise<boolean> {
  const progress = await readProgress();
  return !!progress.unlockedAchievements[id];
}

/**
 * Unlock an achievement
 * Returns the achievement with XP reward if newly unlocked, null if already unlocked
 */
export async function unlockAchievement(
  id: AchievementId
): Promise<Achievement | null> {
  const progress = await readProgress();
  
  // Already unlocked
  if (progress.unlockedAchievements[id]) {
    return null;
  }
  
  const definition = ACHIEVEMENTS[id];
  if (!definition) {
    console.warn('[Achievements] Unknown achievement:', id);
    return null;
  }
  
  const now = new Date().toISOString();
  progress.unlockedAchievements[id] = now;
  progress.totalXPFromAchievements += definition.xpReward;
  
  await writeProgress(progress);
  
  return {
    ...definition,
    unlockedAt: now,
  };
}

/**
 * Get all achievements with unlock status
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const progress = await readProgress();
  
  return Object.values(ACHIEVEMENTS).map((achievement) => ({
    ...achievement,
    unlockedAt: progress.unlockedAchievements[achievement.id],
  }));
}

/**
 * Get only unlocked achievements
 */
export async function getUnlockedAchievements(): Promise<Achievement[]> {
  const all = await getAllAchievements();
  return all.filter((a) => a.unlockedAt);
}

/**
 * Get achievements by category
 */
export async function getAchievementsByCategory(
  category: Achievement['category']
): Promise<Achievement[]> {
  const all = await getAllAchievements();
  return all.filter((a) => a.category === category);
}

/**
 * Get achievement stats
 */
export async function getAchievementStats(): Promise<{
  unlocked: number;
  total: number;
  totalXP: number;
  recentUnlock: Achievement | null;
}> {
  const progress = await readProgress();
  const all = await getAllAchievements();
  const unlocked = all.filter((a) => a.unlockedAt);
  
  // Find most recent
  const recentUnlock = unlocked.sort((a, b) => 
    new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
  )[0] || null;
  
  return {
    unlocked: unlocked.length,
    total: all.length,
    totalXP: progress.totalXPFromAchievements,
    recentUnlock,
  };
}

/**
 * Check and unlock achievements based on current stats
 * Call this after relevant actions (lesson complete, practice done, etc.)
 */
export async function checkAndUnlockAchievements(stats: {
  lessonsCompleted?: number;
  practiceSessionsCompleted?: number;
  streak?: number;
  wordsLearned?: number;
  perfectPractice?: boolean;
  storiesRead?: number;
  translationsCount?: number;
  dailyGoalStreak?: number;
}): Promise<Achievement[]> {
  const newlyUnlocked: Achievement[] = [];
  
  // Check lesson achievements
  if (stats.lessonsCompleted && stats.lessonsCompleted >= 1) {
    const a = await unlockAchievement('first_lesson');
    if (a) newlyUnlocked.push(a);
  }
  
  // Check practice achievements
  if (stats.practiceSessionsCompleted && stats.practiceSessionsCompleted >= 1) {
    const a = await unlockAchievement('first_practice');
    if (a) newlyUnlocked.push(a);
  }
  
  if (stats.perfectPractice) {
    const a = await unlockAchievement('perfect_practice');
    if (a) newlyUnlocked.push(a);
  }
  
  // Check streak achievements
  if (stats.streak) {
    if (stats.streak >= 3) {
      const a = await unlockAchievement('streak_3');
      if (a) newlyUnlocked.push(a);
    }
    if (stats.streak >= 7) {
      const a = await unlockAchievement('streak_7');
      if (a) newlyUnlocked.push(a);
    }
    if (stats.streak >= 30) {
      const a = await unlockAchievement('streak_30');
      if (a) newlyUnlocked.push(a);
    }
  }
  
  // Check word count achievements
  if (stats.wordsLearned) {
    if (stats.wordsLearned >= 10) {
      const a = await unlockAchievement('words_10');
      if (a) newlyUnlocked.push(a);
    }
    if (stats.wordsLearned >= 50) {
      const a = await unlockAchievement('words_50');
      if (a) newlyUnlocked.push(a);
    }
    if (stats.wordsLearned >= 100) {
      const a = await unlockAchievement('words_100');
      if (a) newlyUnlocked.push(a);
    }
    if (stats.wordsLearned >= 500) {
      const a = await unlockAchievement('words_500');
      if (a) newlyUnlocked.push(a);
    }
  }
  
  // Check reading achievements
  if (stats.storiesRead && stats.storiesRead >= 5) {
    const a = await unlockAchievement('bookworm');
    if (a) newlyUnlocked.push(a);
  }
  
  // Check translation achievements
  if (stats.translationsCount && stats.translationsCount >= 50) {
    const a = await unlockAchievement('translator');
    if (a) newlyUnlocked.push(a);
  }
  
  // Check daily goal streak
  if (stats.dailyGoalStreak && stats.dailyGoalStreak >= 7) {
    const a = await unlockAchievement('daily_goal_7');
    if (a) newlyUnlocked.push(a);
  }
  
  // Check time-based achievements
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) {
    const a = await unlockAchievement('night_owl');
    if (a) newlyUnlocked.push(a);
  }
  if (hour >= 5 && hour < 7) {
    const a = await unlockAchievement('early_bird');
    if (a) newlyUnlocked.push(a);
  }
  
  return newlyUnlocked;
}

/**
 * Reset all achievements (for testing)
 */
export async function resetAchievements(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
