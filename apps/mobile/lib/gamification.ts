/**
 * Gamification utilities for React Native
 * 
 * Local XP and streak tracking using @mk/gamification utilities
 * Syncs with server when online
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see packages/gamification (shared package)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateXP,
  calculateStreakBonus,
  calculateLevelFromXP,
  getLevelProgress,
  BASE_XP_VALUES,
  DIFFICULTY_MULTIPLIERS,
  type XPSource,
} from '@mk/gamification';

const STORAGE_KEY_XP = 'mkll:local-xp';
const STORAGE_KEY_STREAK = 'mkll:streak';

// Re-export useful utilities
export {
  calculateXP,
  calculateStreakBonus,
  calculateLevelFromXP,
  getLevelProgress,
  BASE_XP_VALUES,
  DIFFICULTY_MULTIPLIERS,
};

export type { XPSource };

export type LocalXPData = {
  totalXP: number;
  todayXP: number;
  lastPracticeDate: string; // ISO date string
  dailyGoal: number;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string
};

/**
 * Get the current date as YYYY-MM-DD string
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Read local XP data
 */
export async function getLocalXP(): Promise<LocalXPData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_XP);
    if (!raw) {
      return {
        totalXP: 0,
        todayXP: 0,
        lastPracticeDate: '',
        dailyGoal: 50,
      };
    }
    const data = JSON.parse(raw) as LocalXPData;
    
    // Reset todayXP if it's a new day
    const today = getTodayString();
    if (data.lastPracticeDate !== today) {
      return {
        ...data,
        todayXP: 0,
        lastPracticeDate: today,
      };
    }
    
    return data;
  } catch (error) {
    console.warn('[Gamification] Failed to read XP:', error);
    return {
      totalXP: 0,
      todayXP: 0,
      lastPracticeDate: '',
      dailyGoal: 50,
    };
  }
}

/**
 * Save local XP data
 */
export async function saveLocalXP(data: LocalXPData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_XP, JSON.stringify(data));
  } catch (error) {
    console.warn('[Gamification] Failed to save XP:', error);
  }
}

/**
 * Add XP from an activity
 */
export async function addLocalXP(
  xpAmount: number,
  source: XPSource = 'exercise_correct'
): Promise<{ newTotal: number; newToday: number; levelUp: boolean }> {
  const data = await getLocalXP();
  const today = getTodayString();
  const previousLevel = calculateLevelFromXP(data.totalXP);
  
  const newData: LocalXPData = {
    ...data,
    totalXP: data.totalXP + xpAmount,
    todayXP: data.todayXP + xpAmount,
    lastPracticeDate: today,
  };
  
  await saveLocalXP(newData);
  
  const newLevel = calculateLevelFromXP(newData.totalXP);
  
  return {
    newTotal: newData.totalXP,
    newToday: newData.todayXP,
    levelUp: newLevel > previousLevel,
  };
}

/**
 * Check if daily goal is complete
 */
export async function isGoalComplete(): Promise<boolean> {
  const data = await getLocalXP();
  return data.todayXP >= data.dailyGoal;
}

/**
 * Set daily goal
 */
export async function setDailyGoal(goal: number): Promise<void> {
  const data = await getLocalXP();
  await saveLocalXP({ ...data, dailyGoal: goal });
}

/**
 * Get streak data
 */
export async function getStreakData(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_STREAK);
    if (!raw) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
      };
    }
    return JSON.parse(raw) as StreakData;
  } catch (error) {
    console.warn('[Gamification] Failed to read streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
    };
  }
}

/**
 * Save streak data
 */
async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(data));
  } catch (error) {
    console.warn('[Gamification] Failed to save streak:', error);
  }
}

/**
 * Update streak based on activity
 * Call this when user completes a practice session
 */
export async function updateStreak(): Promise<StreakData> {
  const data = await getStreakData();
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  // Already practiced today
  if (data.lastActiveDate === today) {
    return data;
  }
  
  let newStreak: number;
  
  if (data.lastActiveDate === yesterdayString) {
    // Continuing streak
    newStreak = data.currentStreak + 1;
  } else if (data.lastActiveDate === '') {
    // First activity ever
    newStreak = 1;
  } else {
    // Streak broken
    newStreak = 1;
  }
  
  const newData: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActiveDate: today,
  };
  
  await saveStreakData(newData);
  return newData;
}

/**
 * Check if user has practiced today
 */
export async function hasPracticedToday(): Promise<boolean> {
  const data = await getStreakData();
  return data.lastActiveDate === getTodayString();
}

/**
 * Gamification summary type
 */
export type GamificationSummary = {
  totalXP: number;
  todayXP: number;
  dailyProgress: number; // Alias for todayXP for component compatibility
  dailyGoal: number;
  goalComplete: boolean;
  isGoalComplete: boolean; // Alias for goalComplete
  currentStreak: number;
  streak: number; // Alias for currentStreak
  longestStreak: number;
  level: number;
  levelProgress: number;
  streakBonus: number;
};

/**
 * Get gamification summary for display
 */
export async function getGamificationSummary(): Promise<GamificationSummary> {
  const [xpData, streakData] = await Promise.all([
    getLocalXP(),
    getStreakData(),
  ]);
  
  const levelInfo = getLevelProgress(xpData.totalXP);
  const streakBonus = calculateStreakBonus(streakData.currentStreak);
  const goalComplete = xpData.todayXP >= xpData.dailyGoal;
  
  return {
    totalXP: xpData.totalXP,
    todayXP: xpData.todayXP,
    dailyProgress: xpData.todayXP, // Alias
    dailyGoal: xpData.dailyGoal,
    goalComplete,
    isGoalComplete: goalComplete, // Alias
    currentStreak: streakData.currentStreak,
    streak: streakData.currentStreak, // Alias
    longestStreak: streakData.longestStreak,
    level: levelInfo.currentLevel,
    levelProgress: levelInfo.percentComplete,
    streakBonus,
  };
}

/**
 * Update daily goal
 */
export async function updateDailyGoal(goal: number): Promise<void> {
  await setDailyGoal(goal);
}
