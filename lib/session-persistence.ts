'use client';

/**
 * Practice Session Persistence
 *
 * Allows users to resume interrupted practice sessions instead of losing
 * progress when navigating away. Session state is saved to localStorage
 * and can be restored when returning to practice.
 *
 * Key features:
 * - Saves deck snapshot to preserve exact card order for retake
 * - Tracks progress (index, correct answers, streak)
 * - Auto-clears stale sessions (default 24h)
 */

import type { Flashcard } from '@/components/practice/types';

const STORAGE_KEY = 'mkll:practice-session';

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
  deckSnapshot: Flashcard[];
  /** Current card index */
  currentIndex: number;
  /** Number of cards reviewed */
  reviewedCount: number;
  /** Number of correct answers */
  correctAnswers: number;
  /** Maximum streak achieved */
  maxStreak: number;
  /** When session started (ISO timestamp) */
  startedAt: string;
  /** When session was last updated (ISO timestamp) */
  lastUpdatedAt: string;
};

/**
 * Save practice session state to localStorage
 */
export function savePracticeSession(state: PracticeSessionState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...state, lastUpdatedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[SessionPersistence] Failed to save session', error);
  }
}

/**
 * Load practice session state from localStorage
 */
export function loadPracticeSession(): PracticeSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PracticeSessionState;
  } catch (error) {
    console.warn('[SessionPersistence] Failed to load session', error);
    return null;
  }
}

/**
 * Clear saved practice session
 */
export function clearPracticeSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if a saved session exists
 */
export function hasSavedSession(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Check if the saved session is too old to be useful
 * @param maxAgeHours - Maximum age in hours (default 24)
 */
export function isSessionStale(maxAgeHours = 24): boolean {
  const session = loadPracticeSession();
  if (!session) return true;

  const lastUpdated = new Date(session.lastUpdatedAt).getTime();
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

  return now - lastUpdated > maxAgeMs;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
