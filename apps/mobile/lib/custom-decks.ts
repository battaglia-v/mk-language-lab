/**
 * Custom Decks for React Native
 * 
 * Local storage for custom vocabulary decks
 * Can sync with server API when authenticated
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/custom-decks.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

const STORAGE_KEY = 'mkll:custom-decks';

export type CustomDeckCard = {
  id: string;
  macedonian: string;
  english: string;
  macedonianAlternates?: string[];
  englishAlternates?: string[];
  category?: string;
  notes?: string;
  orderIndex: number;
  createdAt: string;
};

export type CustomDeck = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isArchived: boolean;
  cards: CustomDeckCard[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Read all custom decks from local storage
 */
export async function readCustomDecks(): Promise<CustomDeck[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomDeck[];
  } catch (error) {
    console.warn('[CustomDecks] Failed to read:', error);
    return [];
  }
}

/**
 * Write custom decks to local storage
 */
export async function writeCustomDecks(decks: CustomDeck[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.warn('[CustomDecks] Failed to write:', error);
  }
}

/**
 * Create a new custom deck
 */
export async function createDeck(data: {
  name: string;
  description?: string;
  category?: string;
}): Promise<CustomDeck> {
  const decks = await readCustomDecks();
  
  const newDeck: CustomDeck = {
    id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: data.name,
    description: data.description,
    category: data.category,
    isArchived: false,
    cards: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  decks.push(newDeck);
  await writeCustomDecks(decks);
  
  return newDeck;
}

/**
 * Update a deck's metadata
 */
export async function updateDeck(
  deckId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    isArchived?: boolean;
  }
): Promise<CustomDeck | null> {
  const decks = await readCustomDecks();
  const index = decks.findIndex((d) => d.id === deckId);
  
  if (index === -1) return null;
  
  decks[index] = {
    ...decks[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  await writeCustomDecks(decks);
  return decks[index];
}

/**
 * Delete a deck
 */
export async function deleteDeck(deckId: string): Promise<void> {
  const decks = await readCustomDecks();
  const filtered = decks.filter((d) => d.id !== deckId);
  await writeCustomDecks(filtered);
}

/**
 * Get a specific deck by ID
 */
export async function getDeck(deckId: string): Promise<CustomDeck | null> {
  const decks = await readCustomDecks();
  return decks.find((d) => d.id === deckId) || null;
}

/**
 * Add a card to a deck
 */
export async function addCardToDeck(
  deckId: string,
  card: {
    macedonian: string;
    english: string;
    macedonianAlternates?: string[];
    englishAlternates?: string[];
    category?: string;
    notes?: string;
  }
): Promise<CustomDeckCard | null> {
  const decks = await readCustomDecks();
  const deck = decks.find((d) => d.id === deckId);
  
  if (!deck) return null;
  
  const newCard: CustomDeckCard = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    macedonian: card.macedonian,
    english: card.english,
    macedonianAlternates: card.macedonianAlternates,
    englishAlternates: card.englishAlternates,
    category: card.category,
    notes: card.notes,
    orderIndex: deck.cards.length,
    createdAt: new Date().toISOString(),
  };
  
  deck.cards.push(newCard);
  deck.updatedAt = new Date().toISOString();
  
  await writeCustomDecks(decks);
  return newCard;
}

/**
 * Update a card in a deck
 */
export async function updateCard(
  deckId: string,
  cardId: string,
  data: {
    macedonian?: string;
    english?: string;
    macedonianAlternates?: string[];
    englishAlternates?: string[];
    category?: string;
    notes?: string;
  }
): Promise<CustomDeckCard | null> {
  const decks = await readCustomDecks();
  const deck = decks.find((d) => d.id === deckId);
  
  if (!deck) return null;
  
  const cardIndex = deck.cards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return null;
  
  deck.cards[cardIndex] = {
    ...deck.cards[cardIndex],
    ...data,
  };
  deck.updatedAt = new Date().toISOString();
  
  await writeCustomDecks(decks);
  return deck.cards[cardIndex];
}

/**
 * Delete a card from a deck
 */
export async function deleteCard(deckId: string, cardId: string): Promise<void> {
  const decks = await readCustomDecks();
  const deck = decks.find((d) => d.id === deckId);
  
  if (!deck) return;
  
  deck.cards = deck.cards.filter((c) => c.id !== cardId);
  
  // Re-index remaining cards
  deck.cards.forEach((card, index) => {
    card.orderIndex = index;
  });
  
  deck.updatedAt = new Date().toISOString();
  
  await writeCustomDecks(decks);
}

/**
 * Get non-archived decks
 */
export async function getActiveDecks(): Promise<CustomDeck[]> {
  const decks = await readCustomDecks();
  return decks.filter((d) => !d.isArchived);
}

/**
 * Get deck count
 */
export async function getDeckCount(): Promise<number> {
  const decks = await readCustomDecks();
  return decks.filter((d) => !d.isArchived).length;
}

/**
 * Convert deck cards to practice items format
 */
export type PracticeItem = {
  id: string;
  macedonian: string;
  english: string;
  macedonianAlternates?: string[];
  englishAlternates?: string[];
  category: string;
};

export function convertDeckCardsToPracticeItems(cards: CustomDeckCard[]): PracticeItem[] {
  return cards
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((card) => ({
      id: card.id,
      macedonian: card.macedonian,
      english: card.english,
      macedonianAlternates: card.macedonianAlternates,
      englishAlternates: card.englishAlternates,
      category: card.category || 'custom',
    }));
}

/**
 * Get practice items from a deck
 */
export async function getDeckPracticeItems(deckId: string): Promise<PracticeItem[]> {
  const deck = await getDeck(deckId);
  if (!deck) return [];
  return convertDeckCardsToPracticeItems(deck.cards);
}

/**
 * Sync decks with server (when authenticated)
 * Downloads server decks and merges with local
 */
export async function syncDecksWithServer(): Promise<{ synced: number; errors: number }> {
  try {
    const response = await apiFetch<{ decks: CustomDeck[] }>('/api/decks');
    const serverDecks = response.decks || [];
    
    const localDecks = await readCustomDecks();
    
    // Simple merge: server wins for conflicts
    const mergedDecks = [...serverDecks];
    
    // Add local-only decks (those without server IDs)
    for (const localDeck of localDecks) {
      if (!serverDecks.some((sd) => sd.id === localDeck.id)) {
        // Check if it's a local-only deck (starts with 'deck-')
        if (localDeck.id.startsWith('deck-')) {
          mergedDecks.push(localDeck);
        }
      }
    }
    
    await writeCustomDecks(mergedDecks);
    
    return { synced: serverDecks.length, errors: 0 };
  } catch (error) {
    console.warn('[CustomDecks] Sync failed:', error);
    return { synced: 0, errors: 1 };
  }
}
