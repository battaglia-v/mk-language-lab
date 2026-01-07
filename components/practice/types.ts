/**
 * Practice Module Types
 *
 * Shared types for the practice hub, session, and results pages.
 */

import type { PracticeAudioClip } from '@mk/api-client';

/**
 * A flashcard for practice sessions
 */
export type Flashcard = {
  id: string;
  source: string;
  target: string;
  direction: 'mk-en' | 'en-mk';
  category?: string | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed' | string;
  audioClip?: PracticeAudioClip | null;
  /** Macedonian text for TTS */
  macedonian?: string;
};

/**
 * Available deck types
 */
export type DeckType = 'saved' | 'history' | 'curated' | 'custom' | 'mistakes' | 'srs' | 'favorites' | 'lesson-review' | 'user-vocab';

/**
 * Practice mode
 */
export type PracticeMode = 'typing' | 'multiple-choice';

/**
 * Difficulty filter
 */
export type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

/**
 * Session configuration passed to the session page via URL params
 */
export type SessionConfig = {
  deckType: DeckType;
  customDeckId?: string;
  mode: PracticeMode;
  difficulty: DifficultyFilter;
};

/**
 * Session results passed to the results page
 */
export type SessionResults = {
  reviewedCount: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  durationSeconds: number;
  xpEarned: number;
  deckType: DeckType;
};

/**
 * Deck info for the hub display
 */
export type DeckInfo = {
  type: DeckType;
  label: string;
  count: number;
  disabled?: boolean;
};

/**
 * Normalize difficulty value from API
 */
export const normalizeDifficulty = (value?: string | null): Flashcard['difficulty'] => {
  const normalized = value?.toLowerCase();
  if (normalized === 'beginner' || normalized === 'intermediate' || normalized === 'advanced') {
    return normalized;
  }
  if (normalized === 'a1') return 'beginner';
  if (normalized === 'a2') return 'intermediate';
  if (normalized === 'b1' || normalized === 'b2' || normalized === 'c1') return 'advanced';
  return 'mixed';
};

/**
 * Format difficulty for display
 */
export const formatDifficultyLabel = (value?: Flashcard['difficulty']) => {
  if (!value) return 'Mixed';
  const normalized = value.toString().toLowerCase();
  if (normalized === 'beginner') return 'Beginner';
  if (normalized === 'intermediate') return 'Intermediate';
  if (normalized === 'advanced') return 'Advanced';
  if (normalized === 'a1') return 'A1';
  if (normalized === 'a2') return 'A2';
  if (normalized === 'b1') return 'B1';
  if (normalized === 'b2') return 'B2';
  if (normalized === 'c1') return 'C1';
  return 'Mixed';
};

/**
 * Calculate XP earned from a session
 * Base: 1 XP per correct answer
 * Bonus: +1 XP for every 5 correct in a row (streak bonus)
 */
export const calculateXP = (correctAnswers: number, maxStreak: number): number => {
  const baseXP = correctAnswers;
  const streakBonus = Math.floor(maxStreak / 5);
  return baseXP + streakBonus;
};
