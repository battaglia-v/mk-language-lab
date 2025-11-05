/**
 * Common Phrases Library for Family Conversations
 *
 * Format for each phrase:
 * - macedonian: Cyrillic text
 * - english: English translation
 * - context: When/how to use this phrase
 * - formality: 'formal' | 'informal' | 'neutral'
 */

export type Formality = 'formal' | 'informal' | 'neutral';

export type Phrase = {
  id: string;
  macedonian: string;
  english: string;
  context: string;
  formality: Formality;
};

export type PhraseCategory = {
  id: string;
  name: string;
  phrases: Phrase[];
};

export const familyPhrases: PhraseCategory[] = [
  // Categories will be added in batches below
];

// Helper function to get all phrases
export function getAllPhrases(): Phrase[] {
  return familyPhrases.flatMap(category => category.phrases);
}

// Helper function to get phrases by category
export function getPhrasesByCategory(categoryId: string): Phrase[] {
  const category = familyPhrases.find(cat => cat.id === categoryId);
  return category?.phrases || [];
}

// Helper function to count total phrases
export function getTotalPhrasesCount(): number {
  return getAllPhrases().length;
}
