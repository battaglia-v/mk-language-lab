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

    // Split by commas or newlines, filter to valid words
    const words = wordString
      .split(/[,\n]/)
      .map(w => w.trim())
      // Keep only Cyrillic words, minimum 2 characters
      .filter(w => /^[А-Яа-яЀ-ӿ\s]+$/.test(w) && w.length >= 2)
      // Remove common noise words (articles, particles)
      .filter(w => !['и', 'а', 'во', 'на', 'со', 'од', 'за', 'до', 'ги', 'се'].includes(w.toLowerCase()));

    for (const word of words) {
      const normalized = word.toLowerCase().trim();
      // Skip if we've seen this word or it's too short after trimming
      if (normalized.length < 2 || seen.has(normalized)) continue;
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

    // Extract words (skip blanks marked with _)
    const singularWords = singularSection
      .split(/\s+/)
      .filter(w => /^[А-Яа-яЀ-ӿ]+$/.test(w) && w.length >= 2);

    const pluralWords = pluralSection
      .split(/\s+/)
      .filter(w => /^[А-Яа-яЀ-ӿ]+$/.test(w) && w.length >= 2);

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
  // that appear to be vocabulary sections
  const listPattern = /([А-Яа-яЀ-ӿ]+(?:[,\s]+[А-Яа-яЀ-ӿ]+){4,})/g;

  let match;
  while ((match = listPattern.exec(text)) !== null) {
    const wordString = match[1];
    const words = wordString
      .split(/[,\s]+/)
      .filter(w => /^[А-Яа-яЀ-ӿ]+$/.test(w) && w.length >= 2)
      .filter(
        w =>
          !['и', 'а', 'во', 'на', 'со', 'од', 'за', 'до', 'ги', 'се', 'ја'].includes(w.toLowerCase())
      );

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
