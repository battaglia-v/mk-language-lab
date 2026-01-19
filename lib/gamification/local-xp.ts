/**
 * Local XP Tracking
 *
 * Stores XP progress in localStorage for immediate feedback.
 * Syncs to server when user is authenticated.
 * 
 * Includes streak freeze feature:
 * - 1 free streak freeze per week
 * - Automatically used if user misses exactly 1 day
 * - Visual indicator when freeze was used
 */

import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const STORAGE_KEY = 'mk-xp-progress';

type LocalXPState = {
  todayXP: number;
  dailyGoal: number;
  streak: number;
  lastActivityDate: string; // ISO date string
  /** Streak freeze: date when last freeze was used (ISO string) */
  lastFreezeUsedDate?: string;
  /** Whether streak was saved by freeze today */
  streakSavedByFreeze?: boolean;
};

const DEFAULT_STATE: LocalXPState = {
  todayXP: 0,
  dailyGoal: 10,
  streak: 0,
  lastActivityDate: new Date().toISOString().split('T')[0],
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function getDayBefore(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date(getToday());
  return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if streak freeze is available (1 per week)
 */
export function isStreakFreezeAvailable(state: LocalXPState): boolean {
  if (!state.lastFreezeUsedDate) return true;
  return getDaysSince(state.lastFreezeUsedDate) >= 7;
}

export function getLocalXP(): LocalXPState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;

    const state = JSON.parse(stored) as LocalXPState;
    const today = getToday();
    const yesterday = getYesterday();

    // Reset streakSavedByFreeze flag if it's from a previous day
    let streakSavedByFreeze = state.streakSavedByFreeze;
    if (state.lastActivityDate !== today && state.lastActivityDate !== yesterday) {
      streakSavedByFreeze = false;
    }

    // If already today's data, return as-is
    if (state.lastActivityDate === today) {
      return { ...state, streakSavedByFreeze };
    }

    // Check if user practiced yesterday (no freeze needed)
    const wasYesterday = state.lastActivityDate === yesterday;
    if (wasYesterday) {
      return {
        ...state,
        todayXP: 0,
        lastActivityDate: today,
        streakSavedByFreeze: false,
      };
    }

    // User missed at least one day - check if we should use streak freeze
    const daysMissed = getDaysSince(state.lastActivityDate);
    const canUseFreeze = daysMissed === 1 || daysMissed === 2; // Only protect 1-2 day gaps
    const freezeAvailable = isStreakFreezeAvailable(state);
    const hasStreakToProtect = state.streak >= 2; // Only protect meaningful streaks

    if (canUseFreeze && freezeAvailable && hasStreakToProtect) {
      // Use streak freeze - protect the streak!
      const updated: LocalXPState = {
        ...state,
        todayXP: 0,
        lastActivityDate: today,
        lastFreezeUsedDate: today,
        streakSavedByFreeze: true,
        // Streak is preserved!
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Track streak freeze usage
      trackEvent(AnalyticsEvents.STREAK_FREEZE_USED, {
        previousStreak: state.streak,
        daysMissed,
      });
      
      return updated;
    }

    // No freeze available or too many days missed - reset streak
    return {
      ...state,
      todayXP: 0,
      lastActivityDate: today,
      streak: 0,
      streakSavedByFreeze: false,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function addLocalXP(amount: number): LocalXPState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const current = getLocalXP();
  const today = getToday();
  const wasGoalMet = current.todayXP >= current.dailyGoal;

  const updated: LocalXPState = {
    ...current,
    todayXP: current.todayXP + amount,
    lastActivityDate: today,
    // Increment streak when goal is first met today
    streak: !wasGoalMet && (current.todayXP + amount) >= current.dailyGoal
      ? current.streak + 1
      : current.streak,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function setDailyGoal(goal: number): void {
  if (typeof window === 'undefined') return;

  const current = getLocalXP();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, dailyGoal: goal }));
}

export function resetLocalXP(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isGoalComplete(): boolean {
  const state = getLocalXP();
  return state.todayXP >= state.dailyGoal;
}

export function getXPToGoal(): number {
  const state = getLocalXP();
  return Math.max(0, state.dailyGoal - state.todayXP);
}
