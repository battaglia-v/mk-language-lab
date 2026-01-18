/**
 * Text Analyzer - Word-by-word analysis for Macedonian text
 * 
 * Uses the same API as PWA for consistent analysis results
 */

import { apiFetch } from './api';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export interface AnalyzedWord {
  id: string;
  original: string;
  translation: string;
  contextualMeaning?: string;
  alternativeTranslations?: string[];
  contextHint?: string;
  hasMultipleMeanings?: boolean;
  pos: PartOfSpeech;
  difficulty: Difficulty;
  index: number;
}

export interface TextToken {
  token: string;
  isWord: boolean;
  index: number;
}

export interface TextDifficulty {
  level: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  factors: {
    avgWordLength: number;
    longWords: number;
    totalWords: number;
  };
}

export interface TextMetadata {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
}

export interface AnalysisResult {
  words: AnalyzedWord[];
  tokens: TextToken[];
  fullTranslation: string;
  difficulty: TextDifficulty;
  metadata: TextMetadata;
}

export type AnalysisDirection = 'mk-en' | 'en-mk';

/**
 * Analyze text for word-by-word translation and breakdown
 */
export async function analyzeText(
  text: string,
  direction: AnalysisDirection = 'mk-en'
): Promise<AnalysisResult> {
  const [sourceLang, targetLang] = direction.split('-') as ['mk' | 'en', 'mk' | 'en'];
  
  const response = await apiFetch<AnalysisResult>('/api/translate/analyze', {
    method: 'POST',
    body: {
      text,
      sourceLang,
      targetLang,
    },
    skipAuth: true,
  });
  
  return response;
}

/**
 * Get difficulty label with emoji
 */
export function getDifficultyLabel(level: TextDifficulty['level']): { label: string; emoji: string; color: string } {
  switch (level) {
    case 'beginner':
      return { label: 'Beginner', emoji: '🌱', color: '#22c55e' };
    case 'intermediate':
      return { label: 'Intermediate', emoji: '📚', color: '#f59e0b' };
    case 'advanced':
      return { label: 'Advanced', emoji: '🎓', color: '#ef4444' };
  }
}

/**
 * Get part of speech label
 */
export function getPosLabel(pos: PartOfSpeech): string {
  switch (pos) {
    case 'noun': return 'noun';
    case 'verb': return 'verb';
    case 'adjective': return 'adj';
    case 'adverb': return 'adv';
    case 'other': return '';
  }
}

/**
 * Get word difficulty color
 */
export function getWordDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'basic': return 'rgba(34,197,94,0.3)';
    case 'intermediate': return 'rgba(245,158,11,0.3)';
    case 'advanced': return 'rgba(239,68,68,0.3)';
  }
}
