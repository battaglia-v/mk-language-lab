import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mklanguage/glossary';

/**
 * A saved word in the glossary
 */
export type SavedWord = {
  /** Unique ID: word-{mk.toLowerCase()} */
  id: string;
  /** Macedonian word */
  mk: string;
  /** English translation */
  en: string;
  /** Part of speech (optional) */
  pos?: string;
  /** Timestamp when saved (epoch ms) */
  savedAt: number;
  /** Story ID where word was encountered */
  source: string;
};

type GlossaryStore = Record<string, SavedWord>;

/**
 * Load glossary store from AsyncStorage
 */
async function loadStore(): Promise<GlossaryStore> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as GlossaryStore;
  } catch (err) {
    console.warn('[Glossary] Failed to load store:', err);
    return {};
  }
}

/**
 * Persist glossary store to AsyncStorage
 */
async function persistStore(store: GlossaryStore): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn('[Glossary] Failed to persist store:', err);
  }
}

/**
 * Generate a unique ID for a word
 */
function generateWordId(mk: string): string {
  return `word-${mk.toLowerCase().replace(/[.,!?;:'"]/g, '')}`;
}

/**
 * Save a word to the glossary
 *
 * @param word - The word to save
 */
export async function saveWord(word: Omit<SavedWord, 'id' | 'savedAt'>): Promise<void> {
  const store = await loadStore();
  const id = generateWordId(word.mk);

  store[id] = {
    ...word,
    id,
    savedAt: Date.now(),
  };

  await persistStore(store);
}

/**
 * Get all saved words
 *
 * @returns Array of saved words, sorted by savedAt descending (newest first)
 */
export async function getSavedWords(): Promise<SavedWord[]> {
  const store = await loadStore();
  return Object.values(store).sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Remove a word from the glossary
 *
 * @param id - The word ID to remove
 */
export async function removeWord(id: string): Promise<void> {
  const store = await loadStore();
  delete store[id];
  await persistStore(store);
}

/**
 * Check if a word is saved in the glossary
 *
 * @param mk - The Macedonian word to check
 * @returns true if the word is saved
 */
export async function isWordSaved(mk: string): Promise<boolean> {
  const store = await loadStore();
  const id = generateWordId(mk);
  return id in store;
}

/**
 * Get a single saved word by Macedonian text
 *
 * @param mk - The Macedonian word to look up
 * @returns The saved word or null
 */
export async function getSavedWord(mk: string): Promise<SavedWord | null> {
  const store = await loadStore();
  const id = generateWordId(mk);
  return store[id] ?? null;
}
