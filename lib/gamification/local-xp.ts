/**
 * Local XP Tracking
 *
 * Stores XP progress in localStorage for immediate feedback.
 * Syncs to server when user is authenticated.
 */

const STORAGE_KEY = 'mk-xp-progress';

type LocalXPState = {
  todayXP: number;
  dailyGoal: number;
  streak: number;
  lastActivityDate: string; // ISO date string
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

export function getLocalXP(): LocalXPState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;

    const state = JSON.parse(stored) as LocalXPState;
    const today = getToday();

    // Reset if it's a new day
    if (state.lastActivityDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = state.lastActivityDate === yesterday.toISOString().split('T')[0];

      return {
        ...state,
        todayXP: 0,
        lastActivityDate: today,
        streak: wasYesterday ? state.streak : 0, // Reset streak if missed a day
      };
    }

    return state;
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
