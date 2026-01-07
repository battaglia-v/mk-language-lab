/**
 * Type definitions for PDF extraction from UKIM Macedonian textbooks
 */

/**
 * Individual text item extracted from a PDF page
 * Position data (x/y) is essential for detecting structure like headings vs body
 */
export interface ExtractedTextItem {
  /** The text content */
  str: string;
  /** X position on page (from transform[4]) */
  x: number;
  /** Y position on page (from transform[5]) */
  y: number;
  /** Font size for structure detection */
  fontSize: number;
}

/**
 * Extracted content from a single PDF page
 */
export interface ExtractedPage {
  /** 1-indexed page number */
  pageNum: number;
  /** Full text content of the page (items joined) */
  text: string;
  /** Individual text items with position data */
  items: ExtractedTextItem[];
}

/**
 * Complete extracted textbook with metadata
 */
export interface ExtractedTextbook {
  /** Textbook identifier (e.g., 'a1-teskoto') */
  id: string;
  /** Full title in Macedonian */
  title: string;
  /** CEFR level: A1, A2, or B1 */
  level: 'A1' | 'A2' | 'B1';
  /** Extracted pages */
  pages: ExtractedPage[];
  /** Extraction metadata */
  extractedAt: string;
  /** Total page count */
  totalPages: number;
}

/**
 * Macedonian-specific characters for validation
 * These distinguish Macedonian from other Cyrillic alphabets
 */
export const MACEDONIAN_SPECIFIC_CHARS = ['Ѓ', 'ѓ', 'Ќ', 'ќ', 'Љ', 'љ', 'Њ', 'њ', 'Џ', 'џ'];

/**
 * Check if text contains Macedonian-specific characters
 */
export function containsMacedonianChars(text: string): boolean {
  return MACEDONIAN_SPECIFIC_CHARS.some(char => text.includes(char));
}

/**
 * Structured vocabulary item for parsed output
 * UKIM textbooks are Macedonian-only - no English translations exist
 */
export interface StructuredVocabulary {
  word: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  context?: string;
}
