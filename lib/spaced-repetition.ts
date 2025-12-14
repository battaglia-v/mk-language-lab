'use client';

/**
 * Spaced Repetition System (SRS) using a simplified SM-2 algorithm.
 *
 * This module tracks word learning progress and calculates optimal
 * review intervals based on user performance.
 *
 * Key concepts:
 * - Ease Factor: How easy a word is (starts at 2.5, min 1.3)
 * - Interval: Days until next review
 * - Repetitions: Number of successful reviews in a row
 */

const STORAGE_KEY = 'mkll:spaced-repetition';
const WRONG_ANSWERS_KEY = 'mkll:wrong-answers-session';

// Quality ratings for SM-2 algorithm
export type AnswerQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 - Complete blackout, no memory at all
// 1 - Incorrect response, but upon seeing correct answer remembered
// 2 - Incorrect response, but correct answer seemed easy to recall
// 3 - Correct response with serious difficulty
// 4 - Correct response with some hesitation
// 5 - Perfect response, instant recall

export type SRSCardData = {
  /** Unique identifier (prompt ID or word) */
  id: string;
  /** The Macedonian text */
  macedonian: string;
  /** The English text */
  english: string;
  /** SM-2 ease factor (default 2.5, min 1.3) */
  easeFactor: number;
  /** Days until next review */
  interval: number;
  /** Number of consecutive correct answers */
  repetitions: number;
  /** When this card was last reviewed (ISO string) */
  lastReviewedAt: string;
  /** When this card should be reviewed next (ISO string) */
  nextReviewAt: string;
  /** Total times reviewed */
  totalReviews: number;
  /** Total times answered correctly */
  correctCount: number;
};

export type WrongAnswerRecord = {
  id: string;
  macedonian: string;
  english: string;
  userAnswer: string;
  expectedAnswer: string;
  direction: 'mkToEn' | 'enToMk';
  timestamp: string;
};

export type SRSStats = {
  totalCards: number;
  dueToday: number;
  mastered: number;
  learning: number;
  averageEaseFactor: number;
};

/**
 * Read all SRS card data from localStorage
 */
export function readSRSData(): Record<string, SRSCardData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SRSCardData>;
    return parsed;
  } catch (error) {
    console.warn('[SRS] Failed to read data', error);
    return {};
  }
}

/**
 * Write SRS card data to localStorage
 */
export function writeSRSData(data: Record<string, SRSCardData>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Read wrong answers from current session
 */
export function readWrongAnswers(): WrongAnswerRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(WRONG_ANSWERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WrongAnswerRecord[];
  } catch (error) {
    console.warn('[SRS] Failed to read wrong answers', error);
    return [];
  }
}

/**
 * Write wrong answers to session storage
 */
export function writeWrongAnswers(records: WrongAnswerRecord[]): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(records));
}

/**
 * Add a wrong answer to the session
 */
export function addWrongAnswer(record: Omit<WrongAnswerRecord, 'timestamp'>): void {
  const existing = readWrongAnswers();
  // Avoid duplicates for the same prompt in this session
  const filtered = existing.filter((r) => r.id !== record.id);
  filtered.push({
    ...record,
    timestamp: new Date().toISOString(),
  });
  writeWrongAnswers(filtered);
}

/**
 * Clear wrong answers (call when starting new session)
 */
export function clearWrongAnswers(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(WRONG_ANSWERS_KEY);
}

/**
 * Calculate SM-2 algorithm parameters
 *
 * @param card - Current card data
 * @param quality - Answer quality (0-5)
 * @returns Updated card data
 */
export function calculateSM2(
  card: Partial<SRSCardData> & { id: string; macedonian: string; english: string },
  quality: AnswerQuality
): SRSCardData {
  const now = new Date();
  const ef = card.easeFactor ?? 2.5;
  const reps = card.repetitions ?? 0;
  const interval = card.interval ?? 1;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF); // Minimum ease factor is 1.3

  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Incorrect answer - reset repetitions
    newReps = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Correct answer
    newReps = reps + 1;

    if (newReps === 1) {
      newInterval = 1; // First correct: review tomorrow
    } else if (newReps === 2) {
      newInterval = 6; // Second correct: review in 6 days
    } else {
      // Subsequent: multiply previous interval by ease factor
      newInterval = Math.round(interval * newEF);
    }
  }

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    id: card.id,
    macedonian: card.macedonian,
    english: card.english,
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newReps,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewDate.toISOString(),
    totalReviews: (card.totalReviews ?? 0) + 1,
    correctCount: (card.correctCount ?? 0) + (quality >= 3 ? 1 : 0),
  };
}

/**
 * Record a practice result for a word/prompt
 *
 * @param id - Unique identifier for the word/prompt
 * @param macedonian - Macedonian text
 * @param english - English text
 * @param isCorrect - Whether the answer was correct
 * @param responseTime - Optional response time in ms (affects quality rating)
 */
export function recordPracticeResult(
  id: string,
  macedonian: string,
  english: string,
  isCorrect: boolean,
  responseTime?: number
): SRSCardData {
  const data = readSRSData();
  const existing = data[id];

  // Determine quality based on correctness and response time
  let quality: AnswerQuality;
  if (!isCorrect) {
    quality = 1; // Incorrect but saw the answer
  } else if (responseTime && responseTime < 2000) {
    quality = 5; // Perfect, instant recall
  } else if (responseTime && responseTime < 5000) {
    quality = 4; // Good, some hesitation
  } else {
    quality = 3; // Correct but with difficulty
  }

  const updated = calculateSM2(
    existing ?? { id, macedonian, english },
    quality
  );

  data[id] = updated;
  writeSRSData(data);

  return updated;
}

/**
 * Get cards that are due for review
 */
export function getDueCards(): SRSCardData[] {
  const data = readSRSData();
  const now = new Date();

  return Object.values(data).filter((card) => {
    const nextReview = new Date(card.nextReviewAt);
    return nextReview <= now;
  });
}

/**
 * Get cards sorted by priority (most overdue first)
 */
export function getCardsByPriority(): SRSCardData[] {
  const data = readSRSData();
  const now = new Date().getTime();

  return Object.values(data).sort((a, b) => {
    const aNext = new Date(a.nextReviewAt).getTime();
    const bNext = new Date(b.nextReviewAt).getTime();
    // Cards that are more overdue come first
    return (aNext - now) - (bNext - now);
  });
}

/**
 * Check if a specific card is due for review
 */
export function isCardDue(id: string): boolean {
  const data = readSRSData();
  const card = data[id];
  if (!card) return true; // New cards are always "due"

  const now = new Date();
  const nextReview = new Date(card.nextReviewAt);
  return nextReview <= now;
}

/**
 * Get SRS statistics
 */
export function getSRSStats(): SRSStats {
  const data = readSRSData();
  const cards = Object.values(data);
  const now = new Date();

  const dueToday = cards.filter((card) => {
    const nextReview = new Date(card.nextReviewAt);
    return nextReview <= now;
  }).length;

  // Cards with interval >= 21 days are considered "mastered"
  const mastered = cards.filter((card) => card.interval >= 21).length;

  // Cards still being learned (interval < 21 days)
  const learning = cards.length - mastered;

  const averageEaseFactor = cards.length > 0
    ? cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length
    : 2.5;

  return {
    totalCards: cards.length,
    dueToday,
    mastered,
    learning,
    averageEaseFactor,
  };
}

/**
 * Get mastery level for a card (0-100%)
 * 
 * Mastery is calculated based on:
 * - Interval length (longer = more mastery) - 40 points max
 * - Success rate (higher = more mastery) - 40 points max
 * - Ease factor (higher = easier recall) - 20 points max
 */
export function getCardMastery(id: string): number {
  const data = readSRSData();
  const card = data[id];
  if (!card) return 0;

  // Interval score: 0-40 points (caps at 60 days)
  const intervalScore = Math.min(card.interval / 60, 1) * 40;
  
  // Success rate score: 0-40 points
  const successRate = card.totalReviews > 0 ? card.correctCount / card.totalReviews : 0;
  const successScore = successRate * 40;
  
  // Ease factor score: 0-20 points (1.3 to 2.5 range)
  const easeNormalized = (card.easeFactor - 1.3) / (2.5 - 1.3);
  const easeScore = Math.min(Math.max(easeNormalized, 0), 1) * 20;

  return Math.round(intervalScore + successScore + easeScore);
}

/**
 * Mastery level thresholds
 */
export const MASTERY_LEVELS = {
  NEW: 0,           // Never reviewed
  LEARNING: 25,     // Just started
  FAMILIAR: 50,     // Getting comfortable
  PRACTICED: 75,    // Usually correct
  MASTERED: 90,     // Consistently correct over time
} as const;

/**
 * Get mastery level label for a card
 */
export function getMasteryLabel(mastery: number): 'new' | 'learning' | 'familiar' | 'practiced' | 'mastered' {
  if (mastery >= MASTERY_LEVELS.MASTERED) return 'mastered';
  if (mastery >= MASTERY_LEVELS.PRACTICED) return 'practiced';
  if (mastery >= MASTERY_LEVELS.FAMILIAR) return 'familiar';
  if (mastery >= MASTERY_LEVELS.LEARNING) return 'learning';
  return 'new';
}

/**
 * Get mastery color for UI display
 */
export function getMasteryColor(mastery: number): string {
  if (mastery >= MASTERY_LEVELS.MASTERED) return 'text-success';
  if (mastery >= MASTERY_LEVELS.PRACTICED) return 'text-emerald-400';
  if (mastery >= MASTERY_LEVELS.FAMILIAR) return 'text-sky-400';
  if (mastery >= MASTERY_LEVELS.LEARNING) return 'text-amber-400';
  return 'text-muted-foreground';
}

/**
 * Get all cards with their mastery levels
 */
export function getCardsWithMastery(): Array<SRSCardData & { mastery: number }> {
  const data = readSRSData();
  return Object.values(data).map((card) => ({
    ...card,
    mastery: getCardMastery(card.id),
  }));
}

/**
 * Clear all SRS data (for testing/reset)
 */
export function clearSRSData(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export SRS data for backup
 */
export function exportSRSData(): string {
  const data = readSRSData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import SRS data from backup
 */
export function importSRSData(json: string): boolean {
  try {
    const data = JSON.parse(json) as Record<string, SRSCardData>;
    writeSRSData(data);
    return true;
  } catch (error) {
    console.error('[SRS] Failed to import data', error);
    return false;
  }
}
