'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { WordBottomSheet } from './WordBottomSheet';
import { cn } from '@/lib/utils';
import { toggleFavorite, isFavorite } from '@/lib/favorites';

// Simple in-memory cache for translations during session
const translationCache = new Map<string, string>();

interface VocabItem {
  mk: string;
  en: string;
  pos?: string;
  note?: string;
}

/** Pre-analyzed word from Text Analyzer API */
interface AnalyzedWord {
  id: string;
  original: string;
  translation: string;
  alternativeTranslations?: string[];
  contextualMeaning?: string;
  contextHint?: string;
  hasMultipleMeanings?: boolean;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  index: number;
}

/** Pre-analyzed text data from Text Analyzer */
interface AnalyzedTextData {
  words: AnalyzedWord[];
  tokens: Array<{ token: string; isWord: boolean; index: number }>;
  fullTranslation: string;
  difficulty: {
    level: 'beginner' | 'intermediate' | 'advanced';
    score: number;
  };
  metadata: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
  };
}

interface TappableTextProps {
  /** The Macedonian text to display */
  text: string;
  /** Vocabulary list for lookups */
  vocabulary: VocabItem[];
  /** Pre-analyzed data from Text Analyzer (optional, for rich word info) */
  analyzedData?: AnalyzedTextData;
  /** CSS class for the paragraph */
  className?: string;
  /** Locale for translations */
  locale: 'en' | 'mk';
}

interface WordMatch {
  original: string;
  translation: string;
  alternativeTranslations?: string[];
  contextHint?: string;
  partOfSpeech?: string;
  phonetic?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'basic' | 'intermediate' | 'advanced';
  examples?: string[];
}

/**
 * TappableText - Renders text with tappable words that show translations
 *
 * When a user taps a word, it looks up the word in:
 * 1. Pre-analyzed data (if available) - richest info
 * 2. Vocabulary list - basic translation
 * 3. Translation API - live lookup as fallback
 */
export function TappableText({ text, vocabulary, analyzedData, className, locale }: TappableTextProps) {
  const [selectedWord, setSelectedWord] = useState<WordMatch | null>(null);
  const [isInDeck, setIsInDeck] = useState(false);
  const [_isTranslating, setIsTranslating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastTapRef = useRef(0);

  // Build a lookup map from pre-analyzed words (best quality)
  const analyzedMap = useMemo(() => {
    const map = new Map<string, AnalyzedWord>();
    if (!analyzedData?.words) return map;

    analyzedData.words.forEach((word) => {
      const normalized = word.original.toLowerCase().replace(/[.,!?;:'"„"«»—–]/g, '');
      if (!map.has(normalized)) {
        map.set(normalized, word);
      }
    });
    return map;
  }, [analyzedData]);

  // Build a lookup map from Macedonian words (normalized) to vocab items
  const vocabMap = useMemo(() => {
    const map = new Map<string, VocabItem>();
    vocabulary.forEach((item) => {
      // Add both the full phrase and individual words
      const normalized = item.mk.toLowerCase().replace(/[.,!?;:'"]/g, '');
      map.set(normalized, item);
      // Also add individual words for multi-word phrases
      normalized.split(/\s+/).forEach((word) => {
        if (word.length > 2 && !map.has(word)) {
          map.set(word, item);
        }
      });
    });
    return map;
  }, [vocabulary]);

  // Fetch translation from API
  const fetchTranslation = useCallback(async (word: string, normalized: string): Promise<string | null> => {
    // Check cache first
    if (translationCache.has(normalized)) {
      return translationCache.get(normalized) || null;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: word.replace(/[.,!?;:'"„"«»—–]/g, ''),
          sourceLang: 'mk',
          targetLang: 'en',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const translation = data.translatedText;

      if (translation) {
        translationCache.set(normalized, translation);
        return translation;
      }
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error('Translation fetch error:', error);
      return null;
    }
  }, []);

  const handleWordClick = useCallback(async (word: string) => {
    // Normalize the clicked word
    const normalized = word.toLowerCase().replace(/[.,!?;:'"„"«»—–]/g, '');
    const cleanWord = word.replace(/[.,!?;:'"„"«»—–]/g, '');

    // 1. First check pre-analyzed data (richest info)
    const analyzed = analyzedMap.get(normalized);
    if (analyzed) {
      const match: WordMatch = {
        original: analyzed.original,
        translation: analyzed.contextualMeaning || analyzed.translation,
        alternativeTranslations: analyzed.alternativeTranslations,
        contextHint: analyzed.contextHint,
        partOfSpeech: analyzed.pos,
        difficulty: analyzed.difficulty,
      };
      setSelectedWord(match);
      setIsInDeck(isFavorite(`vocab-${normalized}`));
      return;
    }

    // 2. Then check vocabulary list
    const vocab = vocabMap.get(normalized);
    if (vocab) {
      const match: WordMatch = {
        original: vocab.mk,
        translation: vocab.en,
        partOfSpeech: vocab.pos,
        phonetic: vocab.note,
      };
      setSelectedWord(match);
      setIsInDeck(isFavorite(`vocab-${normalized}`));
      return;
    }

    // 3. Not found - show loading state and fetch translation from API
    setSelectedWord({
      original: cleanWord,
      translation: locale === 'en' ? 'Translating...' : 'Се преведува...',
    });
    setIsInDeck(false);
    setIsTranslating(true);

    const translation = await fetchTranslation(word, normalized);

    setIsTranslating(false);
    setSelectedWord({
      original: cleanWord,
      translation: translation || (locale === 'en' ? 'Translation not available' : 'Превод не е достапен'),
    });
  }, [analyzedMap, vocabMap, locale, fetchTranslation]);

  const handleClose = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const handleAddToDeck = useCallback((word: WordMatch) => {
    const wordId = `vocab-${word.original.toLowerCase().replace(/[.,!?;:'"]/g, '')}`;
    const wasAdded = toggleFavorite({
      id: wordId,
      macedonian: word.original,
      english: word.translation,
      category: 'reader',
    });
    setIsInDeck(wasAdded);
  }, []);

  const handlePlayAudio = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sr-RS'; // Serbian is closest to Macedonian
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const triggerWord = useCallback((word: string) => {
    const now = Date.now();
    if (now - lastTapRef.current < 250) return;
    lastTapRef.current = now;
    void handleWordClick(word);
  }, [handleWordClick]);

  // Split text into words while preserving punctuation
  const words = text.split(/(\s+)/);

  return (
    <>
      <p className={cn('leading-relaxed select-none', className)}>
        {words.map((word, idx) => {
          // Skip whitespace
          if (/^\s+$/.test(word)) {
            return <span key={idx}>{word}</span>;
          }

          // Check if this word has translation data available
          const normalized = word.toLowerCase().replace(/[.,!?;:'"„"«»—–]/g, '');
          const hasAnalysis = analyzedMap.has(normalized) || vocabMap.has(normalized);

          return (
            <span
              key={idx}
              role="button"
              tabIndex={0}
              data-testid="reader-tappable-word"
              data-scan-group="reader-tappable-word"
              data-scan-label="Tap word for translation"
              onPointerUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerWord(word);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerWord(word);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerWord(word);
                }
              }}
              className={cn(
                'cursor-pointer rounded-sm px-1 py-0.5 -mx-1 transition-colors inline-block',
                'hover:bg-primary/20 active:bg-primary/30 focus:bg-primary/20 focus:outline-none',
                'touch-manipulation', // Better mobile touch handling
                hasAnalysis && 'underline decoration-primary/40 decoration-dotted underline-offset-4'
              )}
            >
              {word}
            </span>
          );
        })}
      </p>

      <WordBottomSheet
        open={!!selectedWord}
        word={selectedWord}
        onClose={handleClose}
        onSaveToGlossary={handleAddToDeck}
        isSaved={isInDeck}
        locale={locale}
      />
    </>
  );
}
