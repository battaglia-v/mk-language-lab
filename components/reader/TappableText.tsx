'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { WordDetailPopup } from './WordDetailPopup';
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

interface TappableTextProps {
  /** The Macedonian text to display */
  text: string;
  /** Vocabulary list for lookups */
  vocabulary: VocabItem[];
  /** CSS class for the paragraph */
  className?: string;
  /** Locale for translations */
  locale: 'en' | 'mk';
}

interface WordMatch {
  original: string;
  translation: string;
  partOfSpeech?: string;
  phonetic?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  examples?: string[];
}

/**
 * TappableText - Renders text with tappable words that show translations
 *
 * When a user taps a word, it looks up the word in the vocabulary list
 * and shows a popup with the translation and options to save/hear audio.
 */
export function TappableText({ text, vocabulary, className, locale }: TappableTextProps) {
  const [selectedWord, setSelectedWord] = useState<WordMatch | null>(null);
  const [isInDeck, setIsInDeck] = useState(false);
  const [_isTranslating, setIsTranslating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // Look up in vocabulary first
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

    // Not in vocabulary - show loading state and fetch translation
    const cleanWord = word.replace(/[.,!?;:'"„"«»—–]/g, '');
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
  }, [vocabMap, locale, fetchTranslation]);

  const handleClose = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const handleAddToDeck = useCallback((word: WordMatch) => {
    const wordId = `vocab-${word.original.toLowerCase().replace(/[.,!?;:'"]/g, '')}`;
    toggleFavorite({
      id: wordId,
      macedonian: word.original,
      english: word.translation,
      category: 'reader',
    });
    setIsInDeck(true);
  }, []);

  const handlePlayAudio = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sr-RS'; // Serbian is closest to Macedonian
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Split text into words while preserving punctuation
  const words = text.split(/(\s+)/);

  const translations = {
    addToDeck: locale === 'mk' ? 'Додај во колекција' : 'Add to Collection',
    alreadyInDeck: locale === 'mk' ? 'Веќе додадено' : 'Already Saved',
    playAudio: locale === 'mk' ? 'Слушај' : 'Listen',
    difficulty: locale === 'mk' ? 'Ниво' : 'Level',
  };

  return (
    <>
      <p className={cn('leading-relaxed select-none', className)}>
        {words.map((word, idx) => {
          // Skip whitespace
          if (/^\s+$/.test(word)) {
            return <span key={idx}>{word}</span>;
          }

          // Check if this word is in vocabulary
          const normalized = word.toLowerCase().replace(/[.,!?;:'"„"«»—–]/g, '');
          const isInVocab = vocabMap.has(normalized);

          return (
            <span
              key={idx}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWordClick(word);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWordClick(word);
                }
              }}
              className={cn(
                'cursor-pointer rounded-sm px-0.5 -mx-0.5 transition-colors inline',
                'hover:bg-primary/20 active:bg-primary/30 focus:bg-primary/20 focus:outline-none',
                'touch-manipulation', // Better mobile touch handling
                isInVocab && 'underline decoration-primary/40 decoration-dotted underline-offset-4'
              )}
            >
              {word}
            </span>
          );
        })}
      </p>

      <WordDetailPopup
        isOpen={!!selectedWord}
        word={selectedWord || { original: '', translation: '' }}
        onClose={handleClose}
        onAddToDeck={handleAddToDeck}
        onPlayAudio={handlePlayAudio}
        isInDeck={isInDeck}
        t={translations}
      />
    </>
  );
}
