'use client';

import { useState, useCallback, useMemo } from 'react';
import { WordDetailPopup } from './WordDetailPopup';
import { cn } from '@/lib/utils';
import { toggleFavorite, isFavorite } from '@/lib/favorites';

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

  const handleWordClick = useCallback((word: string) => {
    // Normalize the clicked word
    const normalized = word.toLowerCase().replace(/[.,!?;:'"]/g, '');

    // Look up in vocabulary
    const vocab = vocabMap.get(normalized);

    if (vocab) {
      const match: WordMatch = {
        original: vocab.mk,
        translation: vocab.en,
        partOfSpeech: vocab.pos,
        phonetic: vocab.note,
      };
      setSelectedWord(match);
      // Check if already in favorites
      const wordId = `vocab-${normalized}`;
      setIsInDeck(isFavorite(wordId));
    } else {
      // Word not in vocabulary - still show it but without translation
      setSelectedWord({
        original: word,
        translation: locale === 'mk' ? 'Translation not available' : 'Превод не е достапен',
      });
      setIsInDeck(false);
    }
  }, [vocabMap, locale]);

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
      <p className={cn('leading-relaxed', className)}>
        {words.map((word, idx) => {
          // Skip whitespace
          if (/^\s+$/.test(word)) {
            return <span key={idx}>{word}</span>;
          }

          // Check if this word is in vocabulary
          const normalized = word.toLowerCase().replace(/[.,!?;:'"]/g, '');
          const isInVocab = vocabMap.has(normalized);

          return (
            <span
              key={idx}
              onClick={() => handleWordClick(word)}
              className={cn(
                'cursor-pointer rounded-sm px-0.5 -mx-0.5 transition-colors',
                'hover:bg-primary/20 active:bg-primary/30',
                isInVocab && 'underline decoration-primary/30 decoration-dotted underline-offset-4'
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
