/**
 * Strip diacritics/accents from a string for flexible matching
 */
const stripDiacritics = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');

/**
 * Normalize answer for comparison with Unicode-aware handling
 *
 * Features:
 * - NFKC Unicode normalization
 * - Diacritic-insensitive matching (for learner flexibility)
 * - Removes parenthetical content like "(formal)"
 * - Strips punctuation
 * - Normalizes whitespace
 * - Case-insensitive
 */
export const normalizeAnswer = (value: string): string =>
  stripDiacritics(
    value
      .normalize('NFKC')
      .trim()
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove parentheticals
      .replace(/[?!.,;:'"«»„"()[\]{}—–-]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim()
  );

/**
 * Strict normalization that preserves diacritics
 * Use for advanced learners or exact matching requirements
 */
export const normalizeAnswerStrict = (value: string): string =>
  value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[?!.,;:'"«»„"()[\]{}—–-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
