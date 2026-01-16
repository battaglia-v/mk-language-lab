import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PracticeCard, PracticeMode } from './practice';

const SESSION_KEY = '@mklanguage/practice-session';
const DEFAULT_MAX_AGE_HOURS = 24;

/**
 * Persisted session state for interrupted practice sessions
 */
export type PersistedSession = {
  /** Unique session ID */
  id: string;
  /** Deck type (e.g., 'curated', 'lesson-review') */
  deck: string;
  /** Practice mode (e.g., 'multipleChoice', 'typing') */
  mode: PracticeMode;
  /** Cards in this session (preserved order) */
  cards: PracticeCard[];
  /** Current card index */
  currentIndex: number;
  /** Number of correct answers */
  correct: number;
  /** Number of incorrect answers */
  incorrect: number;
  /** Session start time (epoch ms) */
  startTime: number;
  /** Last update time (epoch ms) */
  lastUpdated: number;
};

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Save session state to AsyncStorage
 *
 * Call this after each answer to persist progress
 */
export async function saveSession(session: PersistedSession): Promise<void> {
  try {
    const updated = { ...session, lastUpdated: Date.now() };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[SessionPersistence] Failed to save session:', err);
  }
}

/**
 * Load persisted session from AsyncStorage
 *
 * @returns The persisted session or null if none exists
 */
export async function loadSession(): Promise<PersistedSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch (err) {
    console.warn('[SessionPersistence] Failed to load session:', err);
    return null;
  }
}

/**
 * Clear the persisted session
 *
 * Call this when session completes or user starts fresh
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('[SessionPersistence] Failed to clear session:', err);
  }
}

/**
 * Check if a persisted session is too old to be useful
 *
 * @param session - The persisted session to check
 * @param maxAgeHours - Maximum age in hours (default 24)
 * @returns true if the session is stale and should be discarded
 */
export function isSessionStale(
  session: PersistedSession,
  maxAgeHours: number = DEFAULT_MAX_AGE_HOURS
): boolean {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return now - session.lastUpdated > maxAgeMs;
}

/**
 * Check if a saved session exists
 */
export async function hasSavedSession(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw !== null;
  } catch (err) {
    console.warn('[SessionPersistence] Failed to check session:', err);
    return false;
  }
}

/**
 * Create a debounced save function
 *
 * Use this to avoid excessive writes on rapid answer submissions
 */
export function createDebouncedSave(delayMs: number = 500): {
  save: (session: PersistedSession) => void;
  flush: () => Promise<void>;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingSession: PersistedSession | null = null;

  const save = (session: PersistedSession) => {
    pendingSession = session;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      if (pendingSession) {
        await saveSession(pendingSession);
        pendingSession = null;
      }
      timeoutId = null;
    }, delayMs);
  };

  const flush = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (pendingSession) {
      await saveSession(pendingSession);
      pendingSession = null;
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingSession = null;
  };

  return { save, flush, cancel };
}
