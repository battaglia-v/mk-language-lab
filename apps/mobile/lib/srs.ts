/**
 * Spaced Repetition System (SRS) for React Native
 * 
 * Tracks card review progress and calculates due cards
 * Mirrors PWA's SRS implementation
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/spaced-repetition.ts (PWA implementation)
 * @see lib/srs.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mkll:srs-data';

export type SRSCardData = {
  id: string;
  macedonian: string;
  english: string;
  interval: number;        // Days until next review
  easeFactor: number;      // SM-2 ease factor (starts at 2.5)
  repetitions: number;     // Number of successful reviews
  nextReviewAt: string;    // ISO timestamp
  lastReviewAt: string;    // ISO timestamp
  correctCount: number;
  incorrectCount: number;
};

export type SRSStats = {
  totalCards: number;
  dueToday: number;
  mastered: number;
  learning: number;
  newCards: number;
};

/**
 * Read all SRS data from storage
 */
export async function readSRSData(): Promise<Record<string, SRSCardData>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SRSCardData>;
  } catch (error) {
    console.warn('[SRS] Failed to read data:', error);
    return {};
  }
}

/**
 * Write SRS data to storage
 */
async function writeSRSData(data: Record<string, SRSCardData>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[SRS] Failed to write data:', error);
  }
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate next review interval using SM-2 algorithm
 */
function calculateNextInterval(
  currentInterval: number,
  easeFactor: number,
  isCorrect: boolean
): { interval: number; easeFactor: number } {
  if (!isCorrect) {
    // Reset on incorrect - show again soon
    return {
      interval: 0,
      easeFactor: Math.max(1.3, easeFactor - 0.2),
    };
  }

  // SM-2 algorithm
  let newInterval: number;
  let newEaseFactor = easeFactor;

  if (currentInterval === 0) {
    newInterval = 1; // First correct: 1 day
  } else if (currentInterval === 1) {
    newInterval = 6; // Second correct: 6 days
  } else {
    newInterval = Math.round(currentInterval * easeFactor);
    // Increase ease factor slightly on success
    newEaseFactor = Math.min(2.8, easeFactor + 0.05);
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
  };
}

/**
 * Record a practice result for a card
 */
export async function recordPracticeResult(
  id: string,
  macedonian: string,
  english: string,
  isCorrect: boolean
): Promise<SRSCardData> {
  const data = await readSRSData();
  const existing = data[id];
  const now = new Date();

  const currentInterval = existing?.interval ?? 0;
  const currentEaseFactor = existing?.easeFactor ?? 2.5;
  const { interval, easeFactor } = calculateNextInterval(
    currentInterval,
    currentEaseFactor,
    isCorrect
  );

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  const updated: SRSCardData = {
    id,
    macedonian,
    english,
    interval,
    easeFactor,
    repetitions: isCorrect ? (existing?.repetitions ?? 0) + 1 : 0,
    nextReviewAt: nextReview.toISOString(),
    lastReviewAt: now.toISOString(),
    correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
    incorrectCount: (existing?.incorrectCount ?? 0) + (isCorrect ? 0 : 1),
  };

  data[id] = updated;
  await writeSRSData(data);

  return updated;
}

/**
 * Get cards that are due for review
 */
export async function getDueCards(): Promise<SRSCardData[]> {
  const data = await readSRSData();
  const now = new Date();

  return Object.values(data).filter((card) => {
    const nextReview = new Date(card.nextReviewAt);
    return nextReview <= now;
  });
}

/**
 * Check if a card is due for review
 */
export async function isCardDue(id: string): Promise<boolean> {
  const data = await readSRSData();
  const card = data[id];
  
  if (!card) return true; // New cards are always "due"
  
  const nextReview = new Date(card.nextReviewAt);
  return nextReview <= new Date();
}

/**
 * Get SRS statistics
 */
export async function getSRSStats(cardIds?: string[]): Promise<SRSStats> {
  const data = await readSRSData();
  const cards = Object.values(data);
  const now = new Date();
  const today = getTodayString();

  // Filter to provided IDs if specified
  const relevantCards = cardIds
    ? cards.filter((card) => cardIds.includes(card.id))
    : cards;

  const dueToday = relevantCards.filter((card) => {
    const nextReview = new Date(card.nextReviewAt);
    return nextReview <= now;
  }).length;

  // Cards with interval >= 21 days are "mastered"
  const mastered = relevantCards.filter((card) => card.interval >= 21).length;

  // Cards still being learned
  const learning = relevantCards.filter(
    (card) => card.interval > 0 && card.interval < 21
  ).length;

  // New cards (from provided IDs not in SRS data)
  const newCards = cardIds
    ? cardIds.filter((id) => !data[id]).length
    : 0;

  return {
    totalCards: relevantCards.length + newCards,
    dueToday,
    mastered,
    learning,
    newCards,
  };
}

/**
 * Get SRS counts for a list of card IDs
 * Returns due, new, and learned counts
 */
export async function getSRSCounts(itemIds: string[]): Promise<{
  due: number;
  new_: number;
  learned: number;
}> {
  const data = await readSRSData();
  const today = getTodayString();
  const now = new Date();

  let due = 0;
  let new_ = 0;
  let learned = 0;

  for (const id of itemIds) {
    const entry = data[id];
    
    if (!entry) {
      new_++;
    } else {
      const nextReview = new Date(entry.nextReviewAt);
      if (nextReview <= now) {
        due++;
      } else {
        learned++;
      }
    }
  }

  return { due, new_, learned };
}

/**
 * Get review queue sorted by priority
 * Due cards first, then new cards, oldest first
 */
export async function getReviewQueue(itemIds: string[]): Promise<string[]> {
  const data = await readSRSData();
  const now = new Date();

  type ItemWithPriority = {
    id: string;
    priority: number;
    date: string;
  };

  const items: ItemWithPriority[] = itemIds.map((id) => {
    const entry = data[id];
    
    if (!entry) {
      // New item - priority 2
      return { id, priority: 2, date: '9999-99-99' };
    }
    
    const nextReview = new Date(entry.nextReviewAt);
    if (nextReview <= now) {
      // Due item - priority 1 (highest)
      return { id, priority: 1, date: entry.nextReviewAt.split('T')[0] };
    }
    
    // Learned but not due - priority 3
    return { id, priority: 3, date: entry.nextReviewAt.split('T')[0] };
  });

  // Sort by priority, then by date
  items.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.date.localeCompare(b.date);
  });

  return items.map((item) => item.id);
}

/**
 * Get mastery percentage for a card (0-100)
 */
export function getMasteryLevel(card: SRSCardData): number {
  // Based on interval, ease factor, and success rate
  const intervalScore = Math.min(40, (card.interval / 21) * 40);
  
  const totalReviews = card.correctCount + card.incorrectCount;
  const successRate = totalReviews > 0 ? card.correctCount / totalReviews : 0;
  const successScore = successRate * 40;
  
  const easeScore = ((card.easeFactor - 1.3) / 1.5) * 20;
  
  return Math.round(intervalScore + successScore + easeScore);
}

/**
 * Get box/level label for a card
 */
export function getBoxLabel(card: SRSCardData): string {
  if (card.interval >= 21) return 'Mastered';
  if (card.interval >= 14) return 'Expert';
  if (card.interval >= 7) return 'Strong';
  if (card.interval >= 3) return 'Good';
  if (card.interval >= 1) return 'Review';
  return 'Learning';
}

/**
 * Clear all SRS data (for debugging/reset)
 */
export async function clearSRSData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
