/**
 * Reset all local progress data
 * Used when user wants to start fresh or clear stale data
 */

const PROGRESS_KEYS = [
  'mk-local-xp',
  'mk-favorites',
  'mk-srs',
  'mk-practice-activity',
  'mk-spaced-repetition',
  'mk-translator-history',
  'mk-saved-phrases',
  'mk-reader-history',
  'mk-daily-goal',
] as const;

/**
 * Clear all local progress data from localStorage
 * @returns Array of keys that were cleared
 */
export function clearAllLocalProgress(): string[] {
  if (typeof window === 'undefined') return [];

  const clearedKeys: string[] = [];

  for (const key of PROGRESS_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      clearedKeys.push(key);
    }
  }

  return clearedKeys;
}

/**
 * Get count of stored progress items
 */
export function getProgressItemCount(): number {
  if (typeof window === 'undefined') return 0;

  return PROGRESS_KEYS.filter(key => localStorage.getItem(key) !== null).length;
}
