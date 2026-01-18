/**
 * Reading Progress Tracking for React Native
 * 
 * Tracks scroll position, time spent, and completion status
 * so users can resume reading where they left off
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/reading-progress.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mkll:reading-progress';

export type ReadingProgress = {
  /** Story/sample identifier */
  storyId: string;
  /** Scroll position as percentage (0-100) */
  scrollPercent: number;
  /** Alias for scrollPercent */
  scrollPosition: number;
  /** Time spent reading in seconds */
  timeSpentSeconds: number;
  /** Whether the story has been marked complete */
  isCompleted: boolean;
  /** Alias for isCompleted */
  completed: boolean;
  /** ISO timestamp when completed (if completed) */
  completedAt?: string;
  /** ISO timestamp of last reading session */
  lastReadAt: string;
};

/**
 * Read all progress entries from storage
 */
async function readAllProgressInternal(): Promise<Record<string, ReadingProgress>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ReadingProgress>;
  } catch (error) {
    console.warn('[ReadingProgress] Failed to read data:', error);
    return {};
  }
}

/**
 * Write all progress entries to storage
 */
async function writeAllProgress(data: Record<string, ReadingProgress>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[ReadingProgress] Failed to write data:', error);
  }
}

/**
 * Read progress for a specific story
 */
export async function readProgress(storyId: string): Promise<ReadingProgress | null> {
  const all = await readAllProgressInternal();
  return all[storyId] || null;
}

/**
 * Read all progress entries as an array
 */
export async function readAllProgress(): Promise<ReadingProgress[]> {
  const all = await readAllProgressInternal();
  return Object.values(all);
}

/**
 * Save progress for a story (updates existing or creates new)
 */
export async function saveProgress(
  storyId: string,
  update: Partial<Omit<ReadingProgress, 'storyId' | 'lastReadAt'>>
): Promise<ReadingProgress> {
  const all = await readAllProgressInternal();
  const existing = all[storyId];

  const scrollPercent = update.scrollPercent ?? existing?.scrollPercent ?? 0;
  const isCompleted = update.isCompleted ?? existing?.isCompleted ?? false;
  
  const progress: ReadingProgress = {
    storyId,
    scrollPercent,
    scrollPosition: scrollPercent, // Alias
    timeSpentSeconds: update.timeSpentSeconds ?? existing?.timeSpentSeconds ?? 0,
    isCompleted,
    completed: isCompleted, // Alias
    completedAt: update.completedAt ?? existing?.completedAt,
    lastReadAt: new Date().toISOString(),
  };

  all[storyId] = progress;
  await writeAllProgress(all);

  return progress;
}

/**
 * Mark a story as completed
 */
export async function markCompleted(storyId: string): Promise<ReadingProgress> {
  return saveProgress(storyId, {
    isCompleted: true,
    completedAt: new Date().toISOString(),
    scrollPercent: 100,
  });
}

/**
 * Update scroll position
 */
export async function updateScrollPosition(
  storyId: string,
  scrollPercent: number
): Promise<ReadingProgress> {
  return saveProgress(storyId, { scrollPercent });
}

/**
 * Add time spent reading
 */
export async function addTimeSpent(
  storyId: string,
  additionalSeconds: number
): Promise<ReadingProgress> {
  const existing = await readProgress(storyId);
  const currentTime = existing?.timeSpentSeconds ?? 0;
  
  return saveProgress(storyId, {
    timeSpentSeconds: currentTime + additionalSeconds,
  });
}

/**
 * Check if a story is completed
 */
export async function isStoryCompleted(storyId: string): Promise<boolean> {
  const progress = await readProgress(storyId);
  return progress?.isCompleted ?? false;
}

/**
 * Get completion statistics
 */
export async function getReadingStats(): Promise<{
  totalStories: number;
  completedStories: number;
  totalTimeMinutes: number;
  averageProgress: number;
}> {
  const all = await readAllProgress();
  
  const totalStories = all.length;
  const completedStories = all.filter((p) => p.isCompleted).length;
  const totalTimeMinutes = Math.round(
    all.reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60
  );
  const averageProgress = totalStories > 0
    ? Math.round(all.reduce((sum, p) => sum + p.scrollPercent, 0) / totalStories)
    : 0;

  return {
    totalStories,
    completedStories,
    totalTimeMinutes,
    averageProgress,
  };
}

/**
 * Get stories in progress (started but not completed)
 */
export async function getInProgressStories(): Promise<ReadingProgress[]> {
  const all = await readAllProgress();
  return all
    .filter((p) => !p.isCompleted && p.scrollPercent > 0)
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
}

/**
 * Get completed stories
 */
export async function getCompletedStories(): Promise<ReadingProgress[]> {
  const all = await readAllProgress();
  return all
    .filter((p) => p.isCompleted)
    .sort((a, b) => {
      const aDate = a.completedAt || a.lastReadAt;
      const bDate = b.completedAt || b.lastReadAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

/**
 * Clear progress for a story
 */
export async function clearProgress(storyId: string): Promise<void> {
  const all = await readAllProgressInternal();
  delete all[storyId];
  await writeAllProgress(all);
}

/**
 * Clear all reading progress (for debugging/reset)
 */
export async function clearAllProgress(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// =============================================================================
// Aliases for compatibility with reader/[id].tsx
// =============================================================================

/**
 * Alias for readProgress
 */
export const loadProgress = readProgress;

/**
 * Alias for markCompleted
 */
export const markComplete = markCompleted;

type ProgressSavePayload = {
  storyId: string;
  scrollPosition: number;
  completed?: boolean;
  lastReadAt?: number;
};

type DebouncedProgressSaver = {
  save: (payload: ProgressSavePayload) => void;
  flush: () => void;
};

/**
 * Create a debounced save function for scroll position updates
 * Returns an object with save and flush methods
 */
export function createDebouncedProgressSave(delayMs: number = 1000): DebouncedProgressSaver {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPayload: ProgressSavePayload | null = null;

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (pendingPayload !== null) {
      saveProgress(pendingPayload.storyId, {
        scrollPercent: pendingPayload.scrollPosition * 100, // Convert 0-1 to 0-100
        isCompleted: pendingPayload.completed,
      });
      pendingPayload = null;
    }
  };

  const save = (payload: ProgressSavePayload) => {
    pendingPayload = payload;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (pendingPayload !== null) {
        saveProgress(pendingPayload.storyId, {
          scrollPercent: pendingPayload.scrollPosition * 100, // Convert 0-1 to 0-100
          isCompleted: pendingPayload.completed,
        });
        pendingPayload = null;
      }
      timeoutId = null;
    }, delayMs);
  };

  return { save, flush };
}
