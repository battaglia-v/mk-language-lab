import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mklanguage/reading-progress';

/**
 * Reading progress for a single story
 */
export type ReadingProgress = {
  storyId: string;
  /** Scroll position as percentage (0-1) */
  scrollPosition: number;
  /** Whether the story has been completed */
  completed: boolean;
  /** Last read timestamp (epoch ms) */
  lastReadAt: number;
};

type ProgressStore = Record<string, ReadingProgress>;

/**
 * Load all reading progress from storage
 */
async function loadStore(): Promise<ProgressStore> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch (err) {
    console.warn('[ReadingProgress] Failed to load store:', err);
    return {};
  }
}

/**
 * Persist the progress store
 */
async function persistStore(store: ProgressStore): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('[ReadingProgress] Failed to persist store:', err);
  }
}

/**
 * Save reading progress for a story
 *
 * @param progress - The progress to save
 */
export async function saveProgress(progress: ReadingProgress): Promise<void> {
  const store = await loadStore();
  store[progress.storyId] = {
    ...progress,
    lastReadAt: Date.now(),
  };
  await persistStore(store);
}

/**
 * Load reading progress for a specific story
 *
 * @param storyId - The story ID to load progress for
 * @returns The progress or null if not found
 */
export async function loadProgress(storyId: string): Promise<ReadingProgress | null> {
  const store = await loadStore();
  return store[storyId] ?? null;
}

/**
 * Load all reading progress
 *
 * @returns Array of all progress entries, sorted by lastReadAt descending
 */
export async function loadAllProgress(): Promise<ReadingProgress[]> {
  const store = await loadStore();
  return Object.values(store).sort((a, b) => b.lastReadAt - a.lastReadAt);
}

/**
 * Mark a story as completed
 *
 * @param storyId - The story ID to mark complete
 */
export async function markComplete(storyId: string): Promise<void> {
  const store = await loadStore();
  const existing = store[storyId];

  store[storyId] = {
    storyId,
    scrollPosition: existing?.scrollPosition ?? 1,
    completed: true,
    lastReadAt: Date.now(),
  };

  await persistStore(store);
}

/**
 * Create a debounced save function for scroll position updates
 *
 * @param delayMs - Debounce delay in ms (default 1000)
 * @returns Object with save, flush, and cancel functions
 */
export function createDebouncedProgressSave(delayMs: number = 1000): {
  save: (progress: ReadingProgress) => void;
  flush: () => Promise<void>;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingProgress: ReadingProgress | null = null;

  const save = (progress: ReadingProgress) => {
    pendingProgress = progress;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      if (pendingProgress) {
        await saveProgress(pendingProgress);
        pendingProgress = null;
      }
      timeoutId = null;
    }, delayMs);
  };

  const flush = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (pendingProgress) {
      await saveProgress(pendingProgress);
      pendingProgress = null;
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingProgress = null;
  };

  return { save, flush, cancel };
}
