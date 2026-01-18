import { apiFetch, ApiError } from './api';

export interface UserProgress {
  currentLevel: 'A1' | 'A2' | 'B1';
  currentLesson: number;
  lessonsCompleted: number;
  totalLessons: number;
  streak: number;
  xp: number;
}

/**
 * Default progress when API is unavailable or user not logged in
 */
const DEFAULT_PROGRESS: UserProgress = {
  currentLevel: 'A1',
  currentLesson: 1,
  lessonsCompleted: 0,
  totalLessons: 24,
  streak: 0,
  xp: 0,
};

/**
 * Fetch user progress from the mobile profile API
 * Falls back to defaults if API unavailable
 */
export async function fetchProgress(): Promise<UserProgress> {
  try {
    // Use the mobile profile endpoint
    const profile = await apiFetch<{
      xp?: { total?: number };
      streak?: { days?: number };
      progress?: { lessonsCompleted?: number };
    }>('/api/mobile/profile');

    return {
      currentLevel: 'A1', // TODO: Determine from lessons completed
      currentLesson: (profile.progress?.lessonsCompleted ?? 0) + 1,
      lessonsCompleted: profile.progress?.lessonsCompleted ?? 0,
      totalLessons: 24, // A1 has 24 lessons
      streak: profile.streak?.days ?? 0,
      xp: profile.xp?.total ?? 0,
    };
  } catch (error) {
    // Return defaults for unauthenticated users or API errors
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      console.log('[Progress] User not authenticated, using defaults');
      return DEFAULT_PROGRESS;
    }
    console.warn('[Progress] Failed to fetch, using defaults:', error);
    return DEFAULT_PROGRESS;
  }
}
