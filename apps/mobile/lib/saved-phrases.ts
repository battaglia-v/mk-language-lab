/**
 * Saved Phrases for React Native
 * 
 * Mirrors PWA's lib/saved-phrases.ts implementation
 * Uses AsyncStorage instead of localStorage
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/saved-phrases.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedPhraseDirection = 'mk-en' | 'en-mk';

export type SavedPhrasePayload = {
  sourceText: string;
  translatedText: string;
  directionId: SavedPhraseDirection;
};

export type SavedPhraseRecord = SavedPhrasePayload & {
  id: string;
  createdAt: string;
  savedAt: number; // Unix timestamp for sorting
  fingerprint: string;
};

const STORAGE_KEY = 'mkll:saved-phrases';

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function buildSavedPhraseFingerprint(payload: SavedPhrasePayload): string {
  return `${payload.directionId}::${normalize(payload.sourceText).toLowerCase()}::${normalize(payload.translatedText).toLowerCase()}`;
}

/**
 * Read saved phrases from AsyncStorage
 */
export async function readSavedPhrases(): Promise<SavedPhraseRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPhraseRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        Boolean(entry.id && entry.sourceText && entry.translatedText && entry.directionId)
    );
  } catch (error) {
    console.warn('[SavedPhrases] Failed to read:', error);
    return [];
  }
}

/**
 * Write saved phrases to AsyncStorage
 */
export async function writeSavedPhrases(entries: SavedPhraseRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('[SavedPhrases] Failed to write:', error);
  }
}

/**
 * Add or update a saved phrase
 */
export function upsertSavedPhrase(
  entries: SavedPhraseRecord[],
  payload: SavedPhrasePayload
): SavedPhraseRecord[] {
  const fingerprint = buildSavedPhraseFingerprint(payload);
  const nextEntries = [...entries];
  const existingIndex = nextEntries.findIndex((entry) => entry.fingerprint === fingerprint);

  const now = Date.now();

  if (existingIndex >= 0) {
    // Update existing entry
    nextEntries[existingIndex] = {
      ...nextEntries[existingIndex],
      sourceText: normalize(payload.sourceText),
      translatedText: normalize(payload.translatedText),
      createdAt: new Date().toISOString(),
      savedAt: now,
    };
    return nextEntries;
  }

  // Create new entry
  const id = `phrase-${now}-${Math.random().toString(36).slice(2, 9)}`;
  nextEntries.unshift({
    ...payload,
    sourceText: normalize(payload.sourceText),
    translatedText: normalize(payload.translatedText),
    id,
    createdAt: new Date().toISOString(),
    savedAt: now,
    fingerprint,
  });

  return nextEntries;
}

/**
 * Remove a saved phrase by ID
 */
export function removeSavedPhrase(entries: SavedPhraseRecord[], id: string): SavedPhraseRecord[] {
  return entries.filter((entry) => entry.id !== id);
}

/**
 * Clear all saved phrases
 */
export function clearSavedPhrases(): SavedPhraseRecord[] {
  return [];
}

/**
 * Check if a phrase is already saved
 */
export function isPhraseAlreadySaved(
  entries: SavedPhraseRecord[],
  payload: SavedPhrasePayload
): boolean {
  const fingerprint = buildSavedPhraseFingerprint(payload);
  return entries.some((entry) => entry.fingerprint === fingerprint);
}

/**
 * Map saved phrases to practice items format
 */
export type PracticeItem = {
  id: string;
  macedonian: string;
  english: string;
  category: string;
};

export function mapSavedPhrasesToPracticeItems(entries: SavedPhraseRecord[]): PracticeItem[] {
  return entries.map((entry) => {
    const macedonian = entry.directionId === 'en-mk' ? entry.translatedText : entry.sourceText;
    const english = entry.directionId === 'en-mk' ? entry.sourceText : entry.translatedText;
    return {
      id: entry.id,
      macedonian,
      english,
      category: 'saved-phrases',
    };
  });
}

/**
 * Get practice items from saved phrases (async)
 */
export async function getSavedPhrasePracticeItems(): Promise<PracticeItem[]> {
  const phrases = await readSavedPhrases();
  return mapSavedPhrasesToPracticeItems(phrases);
}
