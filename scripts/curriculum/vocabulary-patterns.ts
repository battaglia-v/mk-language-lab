/**
 * Vocabulary extraction utilities for UKIM Macedonian textbooks
 *
 * UKIM textbooks are entirely in Macedonian with no English translations.
 * Vocabulary appears in several formats:
 * 1. Singular/plural tables (еднина/множина)
 * 2. Word lists after "зборови:" markers
 * 3. Part-of-speech grouped lists (nouns, verbs, adjectives)
 */

/**
 * Comprehensive Macedonian stop words - function words to exclude from vocabulary extraction.
 * These are grammatically important but not useful for vocabulary learning.
 */
export const MACEDONIAN_STOP_WORDS = new Set([
  // Personal pronouns (лични заменки)
  'јас', 'ти', 'тој', 'таа', 'тоа', 'ние', 'вие', 'тие',
  // Personal pronoun short forms (кратки форми)
  'ме', 'те', 'го', 'ја', 'не', 'ве', 'ги',
  'ми', 'му', 'ѝ', 'ни', 'ви', 'им',
  // Reflexive pronouns
  'себе', 'себеси', 'си',
  // Accusative/dative forms
  'мене', 'тебе', 'него', 'неа', 'нас', 'вас', 'нив',

  // Possessive pronouns (присвојни заменки)
  'мој', 'моја', 'мое', 'мои',
  'твој', 'твоја', 'твое', 'твои',
  'негов', 'негова', 'негово', 'негови',
  'нејзин', 'нејзина', 'нејзино', 'нејзини',
  'наш', 'наша', 'наше', 'наши',
  'ваш', 'ваша', 'ваше', 'ваши',
  'нивни', 'нивна', 'нивно', 'нивните',
  'свој', 'своја', 'свое', 'свои',

  // Demonstrative pronouns (показни заменки)
  'ова', 'овој', 'оваа', 'овие',
  'тоа', 'тој', 'таа', 'тие',
  'она', 'оној', 'онаа', 'оние',

  // Interrogative/relative pronouns (прашални заменки)
  'што', 'кој', 'која', 'кое', 'кои',
  'чиј', 'чија', 'чие', 'чии',
  'каков', 'каква', 'какво', 'какви',
  'колкав', 'колкава', 'колкаво', 'колкави',

  // Question words
  'каде', 'кога', 'како', 'колку', 'зошто', 'дали',

  // Prepositions (предлози)
  'во', 'на', 'со', 'од', 'за', 'до', 'по', 'под', 'над', 'пред', 'зад',
  'кај', 'меѓу', 'покрај', 'низ', 'преку', 'според', 'без', 'при', 'околу',
  'помеѓу', 'спроти', 'наспроти', 'поради', 'заради', 'благодарение',

  // Conjunctions (сврзници)
  'и', 'а', 'но', 'или', 'да', 'ако', 'кога', 'бидејќи', 'затоа', 'додека',
  'дека', 'оти', 'иако', 'освен', 'туку', 'ама', 'та', 'па', 'ни', 'ниту',
  'било', 'односно', 'значи', 'пак', 'сепак', 'бидејки',

  // Particles and adverbs (честички и прилози)
  'не', 'да', 'ќе', 'би', 'нека', 'ли',
  'многу', 'малку', 'веќе', 'уште', 'само', 'дури', 'токму', 'баш',
  'сега', 'тогаш', 'денес', 'утре', 'вчера', 'потоа', 'претходно',
  'овде', 'таму', 'тука', 'онде', 'некаде', 'секаде', 'никаде',
  'секогаш', 'никогаш', 'понекогаш', 'често', 'ретко',
  'така', 'толку', 'инаку', 'исто', 'слично',

  // Auxiliary verbs (помошни глаголи)
  'сум', 'си', 'е', 'сме', 'сте', 'се',
  'бев', 'беше', 'бевме', 'бевте', 'беа',
  'бил', 'била', 'било', 'биле',
  'има', 'имам', 'имаш', 'имаме', 'имате', 'имаат',
  'нема', 'немам', 'немаш', 'немаме', 'немате', 'немаат',
  'може', 'можам', 'можеш', 'можеме', 'можете', 'можат',
  'мора', 'морам', 'мораш', 'мораме', 'морате', 'мораат',
  'треба', 'требам', 'требаш', 'требаме', 'требате', 'требаат',
  'сака', 'сакам', 'сакаш', 'сакаме', 'сакате', 'сакаат',

  // Numbers (броеви) - basic cardinal numbers
  'еден', 'една', 'едно', 'едни',
  'два', 'две', 'двајца', 'двете',
  'три', 'трите', 'тројца',
  'четири', 'четирите',
  'пет', 'петте',
  'шест', 'шесте',
  'седум', 'седумте',
  'осум', 'осумте',
  'девет', 'деветте',
  'десет', 'десетте',

  // Common short/noise words
  'еве', 'ете', 'ене', 'еј', 'ај', 'ох', 'ах',
  'мм', 'ем', 'хм', 'оф',
  'итн', 'т.е.', 'т.н.', 'др.',
]);

/**
 * Extracted vocabulary item - Macedonian only (no English translations in source)
 */
export interface VocabularyItem {
  word: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  context?: string; // e.g., "singular", "plural", lesson theme
}

/**
 * Singular/plural pair for nouns
 */
export interface SingularPluralPair {
  singular: string;
  plural: string;
}

/**
 * Check if a word is valid vocabulary (not a stop word, proper length, only Cyrillic)
 */
export function isValidVocabularyWord(word: string): boolean {
  const normalized = word.toLowerCase().trim();

  // Must be at least 3 characters
  if (normalized.length < 3) return false;

  // Must not be a stop word
  if (MACEDONIAN_STOP_WORDS.has(normalized)) return false;

  // Must not be all uppercase (headers/labels)
  if (word === word.toUpperCase() && word.length > 2) return false;

  // Must contain only Cyrillic characters (and optional spaces for compound words)
  if (!/^[А-Яа-яЀ-ӿ\s]+$/.test(word)) return false;

  return true;
}

/**
 * Extract word lists from comma-separated lists following "зборови:" markers
 *
 * Pattern example: "зборови: татковина, земја, држава, живот..."
 */
export function extractWordLists(text: string): VocabularyItem[] {
  const vocab: VocabularyItem[] = [];
  const seen = new Set<string>();

  // Pattern: "зборови:" followed by comma-separated Cyrillic words
  // Also match "Зборови:" (capitalized) and variations with whitespace
  const wordListPattern = /[Зз]борови[:\s]+([А-Яа-яЀ-ӿ,\s]+?)(?=\n\n|[А-Яа-яЀ-ӿ]+[:\s]+[А-Яа-яЀ-ӿ,]+|$)/gi;

  let match;
  while ((match = wordListPattern.exec(text)) !== null) {
    const wordString = match[1];

    // Split by commas or newlines
    const words = wordString
      .split(/[,\n]/)
      .map(w => w.trim())
      // Use comprehensive validation
      .filter(isValidVocabularyWord);

    for (const word of words) {
      const normalized = word.toLowerCase().trim();
      // Skip if we've seen this word
      if (seen.has(normalized)) continue;
      seen.add(normalized);

      vocab.push({
        word: word.trim(),
        context: 'word list',
      });
    }
  }

  return vocab;
}

/**
 * Extract singular/plural noun pairs from tabular layouts
 *
 * Pattern example:
 *   еднина   множина
 *   момче    момчиња
 *   татко    татковци
 */
export function extractSingularPluralPairs(text: string): SingularPluralPair[] {
  const pairs: SingularPluralPair[] = [];
  const seen = new Set<string>();

  // Look for еднина/множина headers indicating a singular/plural table
  if (!text.includes('еднина') || !text.includes('множина')) {
    return pairs;
  }

  // Pattern 1: Adjacent words on same line after headers
  // "еднина момче девојче татко... множина момчиња девојчиња..."
  const tablePattern =
    /еднина\s+([А-Яа-яЀ-ӿ\s_]+?)множина\s+([А-Яа-яЀ-ӿ\s_]+?)(?=\n|$|[А-Яа-яЀ-ӿ]+[.:!?])/gi;

  let match;
  while ((match = tablePattern.exec(text)) !== null) {
    const singularSection = match[1];
    const pluralSection = match[2];

    // Extract words (skip blanks marked with _, use 3+ char minimum, filter stop words)
    const singularWords = singularSection
      .split(/\s+/)
      .filter(w => /^[А-Яа-яЀ-ӿ]+$/.test(w) && w.length >= 3)
      .filter(w => !MACEDONIAN_STOP_WORDS.has(w.toLowerCase()));

    const pluralWords = pluralSection
      .split(/\s+/)
      .filter(w => /^[А-Яа-яЀ-ӿ]+$/.test(w) && w.length >= 3)
      .filter(w => !MACEDONIAN_STOP_WORDS.has(w.toLowerCase()));

    // Pair them up (assume same order)
    const pairCount = Math.min(singularWords.length, pluralWords.length);
    for (let i = 0; i < pairCount; i++) {
      const key = singularWords[i].toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      pairs.push({
        singular: singularWords[i],
        plural: pluralWords[i],
      });
    }
  }

  // Pattern 2: Vertical table format (less common)
  // Line-by-line singular → plural
  const linePattern = /([А-Яа-яЀ-ӿ]+)\s+([А-Яа-яЀ-ӿ]+(?:и|ови|еви|ја|иња|ци|ки))/g;
  while ((match = linePattern.exec(text)) !== null) {
    const singular = match[1];
    const plural = match[2];

    // Skip if singular is a stop word or too short
    if (singular.length < 3 || MACEDONIAN_STOP_WORDS.has(singular.toLowerCase())) {
      continue;
    }

    // Basic validation: plural should be longer or have typical suffixes
    if (
      plural.length >= singular.length &&
      (plural.endsWith('и') ||
        plural.endsWith('ови') ||
        plural.endsWith('еви') ||
        plural.endsWith('ја') ||
        plural.endsWith('иња') ||
        plural.endsWith('ци') ||
        plural.endsWith('ки'))
    ) {
      const key = singular.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      pairs.push({ singular, plural });
    }
  }

  return pairs;
}

/**
 * Extract thematic vocabulary grouped by part of speech
 *
 * A2 textbook groups words like:
 * - Nouns: татковина, земја, држава...
 * - Adjectives: моја, убава, голема...
 * - Verbs: сака, почитува, живее...
 */
export function extractThematicVocabulary(
  text: string
): VocabularyItem[] {
  const vocab: VocabularyItem[] = [];
  const seen = new Set<string>();

  // Common verb endings in Macedonian
  const verbEndings = ['а', 'е', 'и', 'ува', 'ира', 'ува'];
  // Common adjective endings (masculine/feminine/neuter)
  const adjEndings = ['ен', 'на', 'но', 'ски', 'ска', 'ско', 'ален', 'ален'];

  // Find lists of Cyrillic words (comma-separated or newline-separated)
  // that appear to be vocabulary sections - require 6+ words for more selectivity
  const listPattern = /([А-Яа-яЀ-ӿ]+(?:[,\s]+[А-Яа-яЀ-ӿ]+){5,})/g;

  let match;
  while ((match = listPattern.exec(text)) !== null) {
    const wordString = match[1];
    const words = wordString
      .split(/[,\s]+/)
      // Use comprehensive validation (3+ chars, not stop word, not all-caps, Cyrillic)
      .filter(isValidVocabularyWord);

    for (const word of words) {
      const normalized = word.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);

      // Detect part of speech from endings
      let pos: VocabularyItem['partOfSpeech'] = 'other';

      // Check verb patterns
      if (
        verbEndings.some(
          ending => normalized.endsWith(ending) && normalized.length > ending.length + 2
        )
      ) {
        // Verbs often end in -а, -е, -и in 3rd person singular
        // More specific: -ува, -ира patterns
        if (normalized.endsWith('ува') || normalized.endsWith('ира')) {
          pos = 'verb';
        }
      }

      // Check adjective patterns
      if (
        adjEndings.some(
          ending => normalized.endsWith(ending) && normalized.length > ending.length + 2
        )
      ) {
        pos = 'adjective';
      }

      // Default to noun for other Cyrillic words
      if (pos === 'other' && normalized.length >= 3) {
        pos = 'noun';
      }

      vocab.push({
        word: word,
        partOfSpeech: pos,
        context: 'thematic vocabulary',
      });
    }
  }

  return vocab;
}

/**
 * Convert singular/plural pairs to vocabulary items
 */
export function pairsToVocabularyItems(pairs: SingularPluralPair[]): VocabularyItem[] {
  const vocab: VocabularyItem[] = [];

  for (const pair of pairs) {
    vocab.push({
      word: pair.singular,
      partOfSpeech: 'noun',
      context: 'singular',
    });
    vocab.push({
      word: pair.plural,
      partOfSpeech: 'noun',
      context: 'plural',
    });
  }

  return vocab;
}

/**
 * Extract all vocabulary from lesson text using all patterns
 * Deduplicates and returns combined results
 */
export function extractAllVocabulary(text: string): VocabularyItem[] {
  const seen = new Set<string>();
  const vocab: VocabularyItem[] = [];

  // 1. Extract from word lists ("зборови:" sections)
  const wordListItems = extractWordLists(text);
  for (const item of wordListItems) {
    const key = item.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      vocab.push(item);
    }
  }

  // 2. Extract singular/plural pairs
  const pairs = extractSingularPluralPairs(text);
  const pairItems = pairsToVocabularyItems(pairs);
  for (const item of pairItems) {
    const key = item.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      vocab.push(item);
    }
  }

  // 3. Extract thematic vocabulary
  const thematicItems = extractThematicVocabulary(text);
  for (const item of thematicItems) {
    const key = item.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      vocab.push(item);
    }
  }

  return vocab;
}
