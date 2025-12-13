'use client';

/**
 * Favorites system for bookmarking vocabulary items.
 * 
 * Users can mark words/phrases as favorites during practice
 * to create a personalized study deck.
 */

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
 * Read all favorite items from localStorage
 */
export function readFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FavoriteItem[];
  } catch (error) {
    console.warn('[Favorites] Failed to read data', error);
    return [];
  }
}

/**
 * Write favorites to localStorage
 */
export function writeFavorites(favorites: FavoriteItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

/**
 * Check if an item is favorited
 */
export function isFavorite(id: string): boolean {
  const favorites = readFavorites();
  return favorites.some((fav) => fav.id === id);
}

/**
 * Add an item to favorites
 */
export function addFavorite(item: Omit<FavoriteItem, 'favoritedAt'>): FavoriteItem {
  const favorites = readFavorites();
  
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
  writeFavorites(favorites);
  
  return newFavorite;
}

/**
 * Remove an item from favorites
 */
export function removeFavorite(id: string): void {
  const favorites = readFavorites();
  const filtered = favorites.filter((fav) => fav.id !== id);
  writeFavorites(filtered);
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(item: Omit<FavoriteItem, 'favoritedAt'>): boolean {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  } else {
    addFavorite(item);
    return true;
  }
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return readFavorites().length;
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Update notes for a favorite item
 */
export function updateFavoriteNotes(id: string, notes: string): void {
  const favorites = readFavorites();
  const item = favorites.find((fav) => fav.id === id);
  if (item) {
    item.notes = notes;
    writeFavorites(favorites);
  }
}

/**
 * Export favorites for backup
 */
export function exportFavorites(): string {
  return JSON.stringify(readFavorites(), null, 2);
}

/**
 * Import favorites from backup
 */
export function importFavorites(json: string): boolean {
  try {
    const data = JSON.parse(json) as FavoriteItem[];
    if (!Array.isArray(data)) return false;
    writeFavorites(data);
    return true;
  } catch (error) {
    console.error('[Favorites] Failed to import data', error);
    return false;
  }
}
