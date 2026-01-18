/**
 * Practice Session Persistence for React Native
 * 
 * Allows users to resume interrupted practice sessions
 * Mirrors PWA's lib/session-persistence.ts
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/session-persistence.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mkll:practice-session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Types
// ============================================================================

export type PracticeCard = {
  id: string;
  mk: string;
  en: string;
  type: 'vocab' | 'phrase';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
};

export type PracticeSessionState = {
  /** Unique ID for this session */
  sessionId: string;
  /** Deck identifier (e.g., 'curated', 'favorites', 'lesson-abc123') */
  deckType: string;
  /** Custom deck ID if applicable */
  customDeckId: string | null;
  /** Difficulty filter */
  difficulty: string;
  /** Practice mode ('typing' or 'multiple-choice') */
  mode: string;
  /** Preserved deck order for exact retake */
  deckSnapshot: PracticeCard[];
  /** Current card index */
  currentIndex: number;
  /** Number of cards reviewed */
  reviewedCount: number;
  /** Number of correct answers */
  correctAnswers: number;
  /** Current streak */
  currentStreak: number;
  /** Maximum streak achieved */
  maxStreak: number;
  /** When session started (ISO timestamp) */
  startedAt: string;
  /** When session was last updated (ISO timestamp) */
  lastUpdatedAt: string;
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Save practice session state
 */
export async function savePracticeSession(state: PracticeSessionState): Promise<void> {
  try {
    const updated = { ...state, lastUpdatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[PracticeSession] Failed to save:', error);
  }
}

/**
 * Load practice session state
 */
export async function loadPracticeSession(): Promise<PracticeSessionState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const state = JSON.parse(raw) as PracticeSessionState;
    
    // Check if session has expired
    const lastUpdate = new Date(state.lastUpdatedAt).getTime();
    if (Date.now() - lastUpdate > SESSION_EXPIRY_MS) {
      await clearPracticeSession();
      return null;
    }
    
    return state;
  } catch (error) {
    console.warn('[PracticeSession] Failed to load:', error);
    return null;
  }
}

/**
 * Clear saved practice session
 */
export async function clearPracticeSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[PracticeSession] Failed to clear:', error);
  }
}

/**
 * Check if there's a resumable session
 */
export async function hasResumableSession(): Promise<boolean> {
  const session = await loadPracticeSession();
  if (!session) return false;
  
  // Must have at least one card remaining
  return session.currentIndex < session.deckSnapshot.length;
}

/**
 * Get session resume info for display
 */
export async function getSessionResumeInfo(): Promise<{
  hasSession: boolean;
  deckType: string;
  progress: number;
  cardsRemaining: number;
  lastUpdated: string;
} | null> {
  const session = await loadPracticeSession();
  if (!session || session.currentIndex >= session.deckSnapshot.length) {
    return null;
  }
  
  return {
    hasSession: true,
    deckType: session.deckType,
    progress: Math.round((session.currentIndex / session.deckSnapshot.length) * 100),
    cardsRemaining: session.deckSnapshot.length - session.currentIndex,
    lastUpdated: session.lastUpdatedAt,
  };
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Start a new practice session
 */
export async function startNewSession(options: {
  deckType: string;
  customDeckId?: string;
  difficulty: string;
  mode: string;
  cards: PracticeCard[];
}): Promise<PracticeSessionState> {
  const session: PracticeSessionState = {
    sessionId: generateSessionId(),
    deckType: options.deckType,
    customDeckId: options.customDeckId || null,
    difficulty: options.difficulty,
    mode: options.mode,
    deckSnapshot: options.cards,
    currentIndex: 0,
    reviewedCount: 0,
    correctAnswers: 0,
    currentStreak: 0,
    maxStreak: 0,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
  
  await savePracticeSession(session);
  return session;
}

/**
 * Update session progress after answering a card
 */
export async function updateSessionProgress(
  session: PracticeSessionState,
  isCorrect: boolean
): Promise<PracticeSessionState> {
  const newStreak = isCorrect ? session.currentStreak + 1 : 0;
  
  const updated: PracticeSessionState = {
    ...session,
    currentIndex: session.currentIndex + 1,
    reviewedCount: session.reviewedCount + 1,
    correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
    currentStreak: newStreak,
    maxStreak: Math.max(session.maxStreak, newStreak),
  };
  
  await savePracticeSession(updated);
  return updated;
}

/**
 * Complete session and get results
 */
export async function completeSession(session: PracticeSessionState): Promise<{
  totalCards: number;
  correctAnswers: number;
  accuracy: number;
  maxStreak: number;
  timeSpent: number; // milliseconds
}> {
  const startTime = new Date(session.startedAt).getTime();
  const endTime = Date.now();
  
  const results = {
    totalCards: session.deckSnapshot.length,
    correctAnswers: session.correctAnswers,
    accuracy: Math.round((session.correctAnswers / session.deckSnapshot.length) * 100),
    maxStreak: session.maxStreak,
    timeSpent: endTime - startTime,
  };
  
  // Clear the session after completion
  await clearPracticeSession();
  
  return results;
}

/**
 * Get current card from session
 */
export function getCurrentCard(session: PracticeSessionState): PracticeCard | null {
  if (session.currentIndex >= session.deckSnapshot.length) {
    return null;
  }
  return session.deckSnapshot[session.currentIndex];
}

/**
 * Check if session is complete
 */
export function isSessionComplete(session: PracticeSessionState): boolean {
  return session.currentIndex >= session.deckSnapshot.length;
}

/**
 * Get session progress info
 */
export function getSessionProgress(session: PracticeSessionState): {
  current: number;
  total: number;
  percent: number;
  correctCount: number;
  currentStreak: number;
} {
  return {
    current: session.currentIndex + 1,
    total: session.deckSnapshot.length,
    percent: Math.round((session.currentIndex / session.deckSnapshot.length) * 100),
    correctCount: session.correctAnswers,
    currentStreak: session.currentStreak,
  };
}
