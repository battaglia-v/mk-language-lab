import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TranslationDirection } from './translate';

const STORAGE_KEY = '@mklanguage/translation-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * A translation history item
 */
export type HistoryItem = {
  /** Unique ID */
  id: string;
  /** Original text */
  sourceText: string;
  /** Translated text */
  translatedText: string;
  /** Translation direction */
  direction: TranslationDirection;
  /** Timestamp when translation was made (epoch ms) */
  timestamp: number;
};

/**
 * Generate a unique history item ID
 */
function generateId(): string {
  return `trans-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Load history from AsyncStorage
 */
async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch (err) {
    console.warn('[TranslationHistory] Failed to load:', err);
    return [];
  }
}

/**
 * Persist history to AsyncStorage
 */
async function persistHistory(history: HistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('[TranslationHistory] Failed to persist:', err);
  }
}

/**
 * Add a translation to history
 *
 * @param item - Translation details (without id and timestamp)
 */
export async function addToHistory(
  item: Omit<HistoryItem, 'id' | 'timestamp'>
): Promise<void> {
  const history = await loadHistory();

  // Check for duplicate (same source text and direction)
  const existingIndex = history.findIndex(
    (h) => h.sourceText === item.sourceText && h.direction === item.direction
  );

  // If duplicate exists, remove it (we'll add updated version at top)
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  // Add new item at the beginning
  const newItem: HistoryItem = {
    ...item,
    id: generateId(),
    timestamp: Date.now(),
  };

  history.unshift(newItem);

  // Limit to MAX_HISTORY_ITEMS
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS);

  await persistHistory(trimmed);
}

/**
 * Get translation history
 *
 * @returns Array of history items, newest first
 */
export async function getHistory(): Promise<HistoryItem[]> {
  return loadHistory();
}

/**
 * Clear all translation history
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[TranslationHistory] Failed to clear:', err);
  }
}

/**
 * Delete a single history item by ID
 *
 * @param id - The history item ID to delete
 */
export async function deleteHistoryItem(id: string): Promise<void> {
  const history = await loadHistory();
  const filtered = history.filter((h) => h.id !== id);
  await persistHistory(filtered);
}
