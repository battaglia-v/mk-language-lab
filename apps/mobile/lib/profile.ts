import { apiFetch, ApiError } from './api';

/**
 * User profile statistics
 */
export type ProfileStats = {
  /** Total XP earned */
  xpTotal: number;
  /** XP earned this week */
  xpWeekly: number;
  /** Current streak in days */
  streakDays: number;
  /** Number of lessons completed */
  lessonsCompleted: number;
  /** Number of practice sessions completed */
  practiceSessionsCompleted: number;
};

type ProfileApiResponse = {
  xp?: { total?: number; weekly?: number };
  streak?: { days?: number };
  progress?: { lessonsCompleted?: number; practiceSessionsCompleted?: number };
};

/**
 * Default stats when API is unavailable
 */
const DEFAULT_STATS: ProfileStats = {
  xpTotal: 0,
  xpWeekly: 0,
  streakDays: 0,
  lessonsCompleted: 0,
  practiceSessionsCompleted: 0,
};

/**
 * Fetch user profile statistics
 *
 * Returns default values if the API endpoint doesn't exist yet
 */
export async function fetchProfileStats(): Promise<ProfileStats> {
  try {
    const response = await apiFetch<ProfileApiResponse>('/api/mobile/profile');

    return {
      xpTotal: response.xp?.total ?? 0,
      xpWeekly: response.xp?.weekly ?? 0,
      streakDays: response.streak?.days ?? 0,
      lessonsCompleted: response.progress?.lessonsCompleted ?? 0,
      practiceSessionsCompleted: response.progress?.practiceSessionsCompleted ?? 0,
    };
  } catch (error) {
    // Return defaults if endpoint doesn't exist (404) or other error
    if (error instanceof ApiError && error.status === 404) {
      console.log('[Profile] API endpoint not available, using defaults');
      return DEFAULT_STATS;
    }

    console.warn('[Profile] Failed to fetch stats:', error);
    return DEFAULT_STATS;
  }
}
