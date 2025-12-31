/**
 * Word Sprint Types
 *
 * Shared types for the Word Sprint practice mode.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export type WordSprintItem = {
  id: string;
  mk: string;              // Full Macedonian sentence
  en: string;              // English translation
  missing: string;         // The blanked word (correct answer)
  maskedMk: string;        // Sentence with ____ placeholder
  choices: string[];       // For easy mode (4 options)
  wordBank: string[];      // For medium mode (6-8 words)
  difficulty: Difficulty;
  tags: string[];          // e.g., ['greetings', 'A1']
  sourceName: string;      // e.g., 'Tatoeba', 'Wikivoyage'
  sourceUrl?: string;
  attribution: string;     // Required for CC content
};

export type SessionState = {
  phase: 'picking' | 'playing' | 'complete';
  difficulty: Difficulty | null;
  queue: WordSprintItem[];
  currentIndex: number;
  feedback: 'correct' | 'incorrect' | null;
  selectedAnswer: string | null;
  correctCount: number;
  totalAnswered: number;
  startTime: number;
};

export type FeedbackState = {
  type: 'correct' | 'incorrect';
  correctAnswer: string;
};

// XP rewards by difficulty (awarded per session, not per question)
export const SESSION_XP: Record<Difficulty, number> = {
  easy: 8,
  medium: 12,
  hard: 20,
};

// Difficulty display colors
export const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  easy: {
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    border: 'border-green-500/40',
  },
  medium: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-500',
    border: 'border-amber-500/40',
  },
  hard: {
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    border: 'border-red-500/40',
  },
};
