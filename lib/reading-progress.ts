'use client';

/**
 * Reading progress tracking for story completion and position.
 *
 * Tracks scroll position, time spent, and completion status
 * so users can resume reading where they left off.
 */

const STORAGE_KEY = 'mkll:reading-progress';

export interface ReadingProgress {
  /** Story/sample identifier */
  storyId: string;
  /** Scroll position as percentage (0-100) */
  scrollPercent: number;
  /** Time spent reading in seconds */
  timeSpentSeconds: number;
  /** Whether the story has been marked complete */
  isCompleted: boolean;
  /** ISO timestamp when completed (if completed) */
  completedAt?: string;
  /** ISO timestamp of last reading session */
  lastReadAt: string;
}

/**
 * Read all progress entries from localStorage
 */
function readAllProgressInternal(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ReadingProgress>;
  } catch (error) {
    console.warn('[ReadingProgress] Failed to read data', error);
    return {};
  }
}

/**
 * Write all progress entries to localStorage
 */
function writeAllProgress(data: Record<string, ReadingProgress>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Read progress for a specific story
 */
export function readProgress(storyId: string): ReadingProgress | null {
  const all = readAllProgressInternal();
  return all[storyId] || null;
}

/**
 * Read all progress entries as an array
 */
export function readAllProgress(): ReadingProgress[] {
  const all = readAllProgressInternal();
  return Object.values(all);
}

/**
 * Save progress for a story (updates existing or creates new)
 */
export function saveProgress(
  storyId: string,
  update: Partial<Omit<ReadingProgress, 'storyId' | 'lastReadAt'>>
): ReadingProgress {
  const all = readAllProgressInternal();
  const existing = all[storyId];

  const progress: ReadingProgress = {
    storyId,
    scrollPercent: update.scrollPercent ?? existing?.scrollPercent ?? 0,
    timeSpentSeconds: update.timeSpentSeconds ?? existing?.timeSpentSeconds ?? 0,
    isCompleted: update.isCompleted ?? existing?.isCompleted ?? false,
    completedAt: update.completedAt ?? existing?.completedAt,
    lastReadAt: new Date().toISOString(),
  };

  all[storyId] = progress;
  writeAllProgress(all);

  return progress;
}

/**
 * Mark a story as completed
 */
export function markCompleted(storyId: string): ReadingProgress {
  return saveProgress(storyId, {
    isCompleted: true,
    completedAt: new Date().toISOString(),
    scrollPercent: 100,
  });
}

/**
 * Clear progress for a specific story
 */
export function clearProgress(storyId: string): void {
  const all = readAllProgressInternal();
  delete all[storyId];
  writeAllProgress(all);
}

/**
 * Get all completed story IDs
 */
export function getCompletedStoryIds(): string[] {
  const all = readAllProgressInternal();
  return Object.values(all)
    .filter((p) => p.isCompleted)
    .map((p) => p.storyId);
}

/**
 * Get in-progress stories (started but not completed)
 */
export function getInProgressStories(): ReadingProgress[] {
  const all = readAllProgressInternal();
  return Object.values(all)
    .filter((p) => !p.isCompleted && p.scrollPercent > 0)
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
}

/**
 * Check if a story is completed
 */
export function isStoryCompleted(storyId: string): boolean {
  const progress = readProgress(storyId);
  return progress?.isCompleted ?? false;
}

/**
 * Migrate legacy completion keys to new progress system
 * Reads mkll:reader-v2-complete:* keys and creates progress entries
 */
export function migrateLegacyCompletionKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    const all = readAllProgressInternal();
    let updated = false;

    // Find all legacy completion keys
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith('mkll:reader-v2-complete:')) {
        const value = window.localStorage.getItem(key);
        if (value === 'true') {
          const storyId = key.replace('mkll:reader-v2-complete:', '');

          // Only migrate if not already in new system
          if (!all[storyId]) {
            all[storyId] = {
              storyId,
              scrollPercent: 100,
              timeSpentSeconds: 0,
              isCompleted: true,
              completedAt: new Date().toISOString(),
              lastReadAt: new Date().toISOString(),
            };
            updated = true;
          }
        }
      }
    }

    if (updated) {
      writeAllProgress(all);
    }
  } catch (error) {
    console.warn('[ReadingProgress] Failed to migrate legacy keys', error);
  }
}
