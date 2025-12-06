import type { PracticeItem } from '@mk/api-client';
import type { CustomDeck, CustomDeckCard } from '@prisma/client';

export type CustomDeckWithCards = {
  deck: CustomDeck;
  cards: CustomDeckCard[];
};

export type CustomDeckSummary = CustomDeck & {
  cardCount: number;
};

/**
 * Convert custom deck cards to PracticeItem format for use with Quick Practice
 */
export function convertDeckCardsToPracticeItems(cards: CustomDeckCard[]): PracticeItem[] {
  return cards
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((card) => ({
      id: card.id,
      macedonian: card.macedonian,
      english: card.english,
      macedonianAlternates:
        card.macedonianAlternates && card.macedonianAlternates.length > 0
          ? card.macedonianAlternates
          : undefined,
      englishAlternates:
        card.englishAlternates && card.englishAlternates.length > 0 ? card.englishAlternates : undefined,
      category: card.category || 'custom',
    }));
}

/**
 * Fetch all decks for the current user
 */
export async function fetchUserDecks(options?: {
  archived?: boolean;
}): Promise<CustomDeckSummary[]> {
  const params = new URLSearchParams();
  if (options?.archived !== undefined) {
    params.set('archived', String(options.archived));
  }

  const response = await fetch(`/api/decks?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch decks: ${response.status}`);
  }

  const data = await response.json();
  return data.decks;
}

/**
 * Fetch a specific deck with all its cards
 */
export async function fetchDeckWithCards(deckId: string): Promise<CustomDeckWithCards> {
  const response = await fetch(`/api/decks/${deckId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch deck: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch cards from a deck as PracticeItem array
 */
export async function fetchDeckCards(deckId: string): Promise<PracticeItem[]> {
  const response = await fetch(`/api/decks/${deckId}/cards`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch deck cards: ${response.status}`);
  }

  const data = await response.json();
  return data.cards;
}

/**
 * Create a new custom deck
 */
export async function createDeck(data: {
  name: string;
  description?: string;
  category?: string;
}): Promise<CustomDeck> {
  const response = await fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[createDeck] API error:', response.status, errorData);
    throw new Error(errorData.error || `Failed to create deck: ${response.status}`);
  }

  const result = await response.json();
  console.log('[createDeck] Success:', result);

  if (!result.deck || !result.deck.id) {
    console.error('[createDeck] Invalid response:', result);
    throw new Error('Deck created but no ID returned');
  }

  return result.deck;
}

/**
 * Update deck metadata
 */
export async function updateDeck(
  deckId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    isArchived?: boolean;
  }
): Promise<CustomDeck> {
  const response = await fetch(`/api/decks/${deckId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update deck: ${response.status}`);
  }

  const result = await response.json();
  return result.deck;
}

/**
 * Delete a deck and all its cards
 */
export async function deleteDeck(deckId: string): Promise<void> {
  console.log('[deleteDeck] Attempting to delete deck:', deckId);

  const response = await fetch(`/api/decks/${deckId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  console.log('[deleteDeck] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[deleteDeck] Failed:', response.status, errorData);
    throw new Error(errorData.error || `Failed to delete deck: ${response.status}`);
  }

  console.log('[deleteDeck] Deck deleted successfully');
}

/**
 * Add a card to a deck
 */
export async function createDeckCard(
  deckId: string,
  data: {
    macedonian: string;
    english: string;
    macedonianAlternates?: string[];
    englishAlternates?: string[];
    category?: string;
    notes?: string;
  }
): Promise<CustomDeckCard> {
  const response = await fetch(`/api/decks/${deckId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create card: ${response.status}`);
  }

  const result = await response.json();
  return result.card;
}

/**
 * Update a card
 */
export async function updateDeckCard(
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
): Promise<CustomDeckCard> {
  const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update card: ${response.status}`);
  }

  const result = await response.json();
  return result.card;
}

/**
 * Delete a card from a deck
 */
export async function deleteDeckCard(deckId: string, cardId: string): Promise<void> {
  console.log('[deleteDeckCard] Attempting to delete card:', { deckId, cardId });

  const response = await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  console.log('[deleteDeckCard] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[deleteDeckCard] Failed:', response.status, errorData);
    throw new Error(errorData.error || `Failed to delete card: ${response.status}`);
  }

  console.log('[deleteDeckCard] Card deleted successfully');
}
