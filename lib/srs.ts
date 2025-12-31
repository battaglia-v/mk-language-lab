'use client';

/**
 * Lightweight Spaced Repetition System
 *
 * Simple Leitner-style intervals for saved phrases.
 * Intervals: 1d → 3d → 7d → 14d → 30d → 90d
 */

const STORAGE_KEY = 'mkll:srs-data';

// Review intervals in days (Leitner-inspired)
const INTERVALS = [1, 3, 7, 14, 30, 90];

export type SRSEntry = {
  itemId: string;
  /** Box level 0-5 (corresponds to INTERVALS index) */
  box: number;
  /** Last review timestamp (ISO string) */
  lastReview: string;
  /** Next review due (ISO string) */
  nextReview: string;
  /** Total times reviewed */
  reviewCount: number;
  /** Correct answers */
  correctCount: number;
};

type SRSData = Record<string, SRSEntry>;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function readSRSData(): SRSData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSRSData(data: SRSData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Record a review result for an item
 */
export function recordReview(itemId: string, correct: boolean): SRSEntry {
  const data = readSRSData();
  const now = new Date();
  const existing = data[itemId];

  let newBox: number;
  if (correct) {
    // Move up a box (max 5)
    newBox = existing ? Math.min(existing.box + 1, INTERVALS.length - 1) : 1;
  } else {
    // Drop back to box 0
    newBox = 0;
  }

  const nextReviewDate = addDays(now, INTERVALS[newBox]);

  const entry: SRSEntry = {
    itemId,
    box: newBox,
    lastReview: now.toISOString(),
    nextReview: nextReviewDate.toISOString(),
    reviewCount: (existing?.reviewCount || 0) + 1,
    correctCount: (existing?.correctCount || 0) + (correct ? 1 : 0),
  };

  data[itemId] = entry;
  writeSRSData(data);
  return entry;
}

/**
 * Get SRS entry for an item (or null if never reviewed)
 */
export function getSRSEntry(itemId: string): SRSEntry | null {
  const data = readSRSData();
  return data[itemId] || null;
}

/**
 * Check if an item is due for review
 */
export function isDue(itemId: string): boolean {
  const entry = getSRSEntry(itemId);
  if (!entry) return false; // New items aren't "due"
  const today = getToday();
  const dueDate = entry.nextReview.split('T')[0];
  return dueDate <= today;
}

/**
 * Check if an item is new (never reviewed)
 */
export function isNew(itemId: string): boolean {
  return getSRSEntry(itemId) === null;
}

/**
 * Get counts for a list of item IDs
 */
export function getSRSCounts(itemIds: string[]): { due: number; new_: number; learned: number } {
  let due = 0;
  let new_ = 0;
  let learned = 0;
  const today = getToday();

  for (const id of itemIds) {
    const entry = getSRSEntry(id);
    if (!entry) {
      new_++;
    } else {
      const dueDate = entry.nextReview.split('T')[0];
      if (dueDate <= today) {
        due++;
      } else {
        learned++;
      }
    }
  }

  return { due, new_, learned };
}

/**
 * Get due items from a list of IDs
 */
export function getDueItems(itemIds: string[]): string[] {
  const today = getToday();
  return itemIds.filter((id) => {
    const entry = getSRSEntry(id);
    if (!entry) return false;
    return entry.nextReview.split('T')[0] <= today;
  });
}

/**
 * Get new (unreviewed) items from a list of IDs
 */
export function getNewItems(itemIds: string[]): string[] {
  return itemIds.filter((id) => isNew(id));
}

/**
 * Get review queue sorted by priority (due first, then new, oldest first)
 */
export function getReviewQueue(itemIds: string[]): string[] {
  const data = readSRSData();
  const today = getToday();

  type ItemWithPriority = { id: string; priority: number; date: string };
  const items: ItemWithPriority[] = itemIds.map((id) => {
    const entry = data[id];
    if (!entry) {
      // New item - priority 2
      return { id, priority: 2, date: '9999-99-99' };
    }
    const dueDate = entry.nextReview.split('T')[0];
    if (dueDate <= today) {
      // Due item - priority 1 (highest)
      return { id, priority: 1, date: dueDate };
    }
    // Learned but not due - priority 3
    return { id, priority: 3, date: dueDate };
  });

  // Sort: by priority, then by date
  items.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.date.localeCompare(b.date);
  });

  return items.map((item) => item.id);
}

/**
 * Get box level label
 */
export function getBoxLabel(box: number): string {
  const labels = ['Learning', 'Review', 'Good', 'Strong', 'Expert', 'Mastered'];
  return labels[box] || 'Unknown';
}

/**
 * Reset SRS data for an item
 */
export function resetSRSEntry(itemId: string): void {
  const data = readSRSData();
  delete data[itemId];
  writeSRSData(data);
}

/**
 * Clear all SRS data
 */
export function clearSRSData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
