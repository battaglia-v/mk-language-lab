/**
 * Practice Mistakes tracking for React Native
 * 
 * Tracks incorrect answers during practice sessions for SRS-style review.
 * Mirrors PWA's mistake tracking behavior.
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mkll:practice-mistakes';
const MAX_MISTAKES = 100; // Keep last 100 mistakes

export type PracticeMistake = {
  /** Unique identifier for the practice item */
  itemId: string;
  /** Macedonian text */
  macedonian: string;
  /** English text */
  english: string;
  /** User's incorrect answer */
  userAnswer: string;
  /** Correct answer */
  correctAnswer: string;
  /** Practice mode when mistake occurred */
  mode: 'multipleChoice' | 'typing' | 'cloze' | 'tapWords' | 'matching';
  /** When the mistake occurred */
  timestamp: string;
  /** Number of times this item was answered incorrectly */
  mistakeCount: number;
};

/**
 * Read all practice mistakes from AsyncStorage
 */
export async function readMistakes(): Promise<PracticeMistake[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PracticeMistake[];
  } catch (error) {
    console.warn('[PracticeMistakes] Failed to read:', error);
    return [];
  }
}

/**
 * Write mistakes to AsyncStorage
 */
export async function writeMistakes(mistakes: PracticeMistake[]): Promise<void> {
  try {
    // Keep only the most recent mistakes
    const trimmed = mistakes.slice(-MAX_MISTAKES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('[PracticeMistakes] Failed to write:', error);
  }
}

/**
 * Record a practice mistake
 */
export async function recordMistake(
  mistake: Omit<PracticeMistake, 'timestamp' | 'mistakeCount'>
): Promise<void> {
  const mistakes = await readMistakes();

  // Check if this item already has a mistake recorded
  const existingIndex = mistakes.findIndex((m) => m.itemId === mistake.itemId);

  if (existingIndex >= 0) {
    // Update existing mistake - increment count and update timestamp
    mistakes[existingIndex] = {
      ...mistakes[existingIndex],
      userAnswer: mistake.userAnswer,
      correctAnswer: mistake.correctAnswer,
      mode: mistake.mode,
      timestamp: new Date().toISOString(),
      mistakeCount: mistakes[existingIndex].mistakeCount + 1,
    };
  } else {
    // Add new mistake
    mistakes.push({
      ...mistake,
      timestamp: new Date().toISOString(),
      mistakeCount: 1,
    });
  }

  await writeMistakes(mistakes);
}

/**
 * Remove a mistake when user answers correctly
 */
export async function clearMistake(itemId: string): Promise<void> {
  const mistakes = await readMistakes();
  const filtered = mistakes.filter((m) => m.itemId !== itemId);
  await writeMistakes(filtered);
}

/**
 * Get all mistakes sorted by most frequent
 */
export async function getMistakesByFrequency(): Promise<PracticeMistake[]> {
  const mistakes = await readMistakes();
  return [...mistakes].sort((a, b) => b.mistakeCount - a.mistakeCount);
}

/**
 * Get mistakes for SRS-style review (oldest first)
 */
export async function getMistakesForReview(limit: number = 10): Promise<PracticeMistake[]> {
  const mistakes = await readMistakes();
  return [...mistakes]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get mistake count
 */
export async function getMistakesCount(): Promise<number> {
  const mistakes = await readMistakes();
  return mistakes.length;
}

/**
 * Clear all mistakes
 */
export async function clearAllMistakes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[PracticeMistakes] Failed to clear:', error);
  }
}

/**
 * Map mistakes to practice items format for review sessions
 */
export type PracticeItem = {
  id: string;
  macedonian: string;
  english: string;
  category: string;
};

export function mapMistakesToPracticeItems(mistakes: PracticeMistake[]): PracticeItem[] {
  return mistakes.map((m) => ({
    id: m.itemId,
    macedonian: m.macedonian,
    english: m.english,
    category: 'mistakes',
  }));
}

/**
 * Get practice items from mistakes (async)
 */
export async function getMistakePracticeItems(limit: number = 20): Promise<PracticeItem[]> {
  const mistakes = await getMistakesForReview(limit);
  return mapMistakesToPracticeItems(mistakes);
}
