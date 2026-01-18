/**
 * Favorites system for React Native
 * 
 * Mirrors PWA's lib/favorites.ts implementation
 * Uses AsyncStorage instead of localStorage
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/favorites.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mkll:favorites';

export type FavoriteItem = {
  /** Unique identifier */
  id: string;
  /** Macedonian text */
  macedonian: string;
  /** English text */
  english: string;
  /** Optional category */
  category?: string;
  /** When this was favorited */
  favoritedAt: string;
  /** Optional notes from user */
  notes?: string;
};

/**
 * Read all favorite items from AsyncStorage
 */
export async function readFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FavoriteItem[];
  } catch (error) {
    console.warn('[Favorites] Failed to read data:', error);
    return [];
  }
}

/**
 * Write favorites to AsyncStorage
 */
export async function writeFavorites(favorites: FavoriteItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('[Favorites] Failed to write data:', error);
  }
}

/**
 * Check if an item is favorited
 */
export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await readFavorites();
  return favorites.some((fav) => fav.id === id);
}

/**
 * Add an item to favorites
 */
export async function addFavorite(
  item: Omit<FavoriteItem, 'favoritedAt'>
): Promise<FavoriteItem> {
  const favorites = await readFavorites();

  // Check if already exists
  const existingIndex = favorites.findIndex((fav) => fav.id === item.id);
  if (existingIndex >= 0) {
    return favorites[existingIndex];
  }

  const newFavorite: FavoriteItem = {
    ...item,
    favoritedAt: new Date().toISOString(),
  };

  favorites.push(newFavorite);
  await writeFavorites(favorites);

  return newFavorite;
}

/**
 * Remove an item from favorites
 */
export async function removeFavorite(id: string): Promise<void> {
  const favorites = await readFavorites();
  const filtered = favorites.filter((fav) => fav.id !== id);
  await writeFavorites(filtered);
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  item: Omit<FavoriteItem, 'favoritedAt'>
): Promise<boolean> {
  const favorited = await isFavorite(item.id);
  if (favorited) {
    await removeFavorite(item.id);
    return false;
  } else {
    await addFavorite(item);
    return true;
  }
}

/**
 * Get favorites count
 */
export async function getFavoritesCount(): Promise<number> {
  const favorites = await readFavorites();
  return favorites.length;
}

/**
 * Clear all favorites
 */
export async function clearFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[Favorites] Failed to clear:', error);
  }
}

/**
 * Update notes for a favorite item
 */
export async function updateFavoriteNotes(id: string, notes: string): Promise<void> {
  const favorites = await readFavorites();
  const item = favorites.find((fav) => fav.id === id);
  if (item) {
    item.notes = notes;
    await writeFavorites(favorites);
  }
}

/**
 * Map favorites to practice items format
 */
export type PracticeItem = {
  id: string;
  macedonian: string;
  english: string;
  category: string;
};

export function mapFavoritesToPracticeItems(favorites: FavoriteItem[]): PracticeItem[] {
  return favorites.map((fav) => ({
    id: fav.id,
    macedonian: fav.macedonian,
    english: fav.english,
    category: fav.category ?? 'favorites',
  }));
}

/**
 * Get practice items from favorites (async)
 */
export async function getFavoritePracticeItems(): Promise<PracticeItem[]> {
  const favorites = await readFavorites();
  return mapFavoritesToPracticeItems(favorites);
}
