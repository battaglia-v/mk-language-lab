/**
 * Topic Decks - Static JSON vocabulary decks for topic packs
 */

import householdDeck from '@/data/decks/household-deck.json';
import weatherSeasonsDeck from '@/data/decks/weather-seasons-deck.json';
import bodyHealthDeck from '@/data/decks/body-health-deck.json';
import activitiesHobbiesDeck from '@/data/decks/activities-hobbies-deck.json';
import clothingAppearanceDeck from '@/data/decks/clothing-appearance-deck.json';
import technologyDeck from '@/data/decks/technology-deck.json';
import numbersTimeDeck from '@/data/decks/numbers-time-deck.json';
import celebrationsDeck from '@/data/decks/celebrations-deck.json';
import alphabetDeck from '@/data/alphabet-deck.json';

export interface TopicDeckItem {
  id: string;
  mk: string;
  en: string;
  category?: string;
}

export interface TopicDeckMeta {
  id: string;
  title: string;
  titleMk: string;
  description: string;
  descriptionMk: string;
  level: string;
  category: string;
  version: string;
  lastUpdated: string;
}

export interface TopicDeck {
  meta: TopicDeckMeta;
  items: TopicDeckItem[];
}

// Alphabet deck has a different structure - convert it to TopicDeck format
const alphabetDeckConverted: TopicDeck = {
  meta: {
    id: alphabetDeck.meta.id,
    title: alphabetDeck.meta.title,
    titleMk: alphabetDeck.meta.titleMk,
    description: alphabetDeck.meta.description,
    descriptionMk: alphabetDeck.meta.descriptionMk,
    level: alphabetDeck.meta.level,
    category: alphabetDeck.meta.category,
    version: alphabetDeck.meta.version,
    lastUpdated: alphabetDeck.meta.lastUpdated,
  },
  items: alphabetDeck.items.map((item: { id: string; letter: string; latinEquiv: string; exampleWord: { mk: string; en: string }; notes: string }) => ({
    id: item.id,
    mk: item.letter.split(' ')[0], // Just the uppercase letter
    en: `${item.latinEquiv} - ${item.notes}`, // Latin equivalent with pronunciation hint
    category: 'alphabet',
  })),
};

// Map deck IDs to their data
const topicDecks: Record<string, TopicDeck> = {
  'household-v1': householdDeck as TopicDeck,
  'weather-seasons-v1': weatherSeasonsDeck as TopicDeck,
  'body-health-v1': bodyHealthDeck as TopicDeck,
  'activities-hobbies-v1': activitiesHobbiesDeck as TopicDeck,
  'clothing-appearance-v1': clothingAppearanceDeck as TopicDeck,
  'technology-v1': technologyDeck as TopicDeck,
  'numbers-time-v1': numbersTimeDeck as TopicDeck,
  'celebrations-v1': celebrationsDeck as TopicDeck,
  'cyrillic-alphabet-v1': alphabetDeckConverted,
};

/**
 * Check if a deck ID is a topic deck
 */
export function isTopicDeck(deckId: string): boolean {
  return deckId in topicDecks;
}

/**
 * Get a topic deck by ID
 */
export function getTopicDeck(deckId: string): TopicDeck | null {
  return topicDecks[deckId] || null;
}

/**
 * Get all topic deck IDs
 */
export function getTopicDeckIds(): string[] {
  return Object.keys(topicDecks);
}

/**
 * Get topic deck metadata
 */
export function getTopicDeckMeta(deckId: string): TopicDeckMeta | null {
  const deck = topicDecks[deckId];
  return deck?.meta || null;
}

/**
 * Get the number of items in a topic deck
 */
export function getTopicDeckSize(deckId: string): number {
  const deck = topicDecks[deckId];
  return deck?.items.length || 0;
}
