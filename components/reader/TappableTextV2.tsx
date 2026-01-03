'use client';

import { useState, useCallback, useMemo, useRef, Fragment } from 'react';
import { WordBottomSheet, type WordInfo } from './WordBottomSheet';
import { useReaderV2, type SavedWord } from './ReaderV2Layout';
import { cn } from '@/lib/utils';

// Translation cache
const translationCache = new Map<string, string>();

interface VocabItem {
  mk: string;
  en: string;
  pos?: string;
  note?: string;
}

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

interface AnalyzedTextData {
  words: AnalyzedWord[];
  tokens?: Array<{ token: string; isWord: boolean; index: number }>;
  fullTranslation?: string;
  difficulty?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    score: number;
  };
  metadata?: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
  };
}

interface TappableTextV2Props {
  /** The Macedonian text to display */
  text: string;
  /** Vocabulary list for lookups */
  vocabulary: VocabItem[];
  /** Pre-analyzed data */
  analyzedData?: AnalyzedTextData;
  /** CSS class */
  className?: string;
}

/**
 * TappableTextV2 - Enhanced tappable text with sentence mode
 *
 * Features:
 * - Word tap → bottom sheet translation
 * - Sentence mode: tap sentence → inline translation
 * - Integration with ReaderV2 context
 */
export function TappableTextV2({
  text,
  vocabulary,
  analyzedData,
  className,
}: TappableTextV2Props) {
  const {
    tapTranslateEnabled,
    sentenceModeEnabled,
    addToGlossary,
    savedWords,
    locale,
  } = useReaderV2();

  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [sentenceTranslations, setSentenceTranslations] = useState<Map<number, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build lookup maps
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

  const vocabMap = useMemo(() => {
    const map = new Map<string, VocabItem>();
    vocabulary.forEach((item) => {
      const normalized = item.mk.toLowerCase().replace(/[.,!?;:'"]/g, '');
      map.set(normalized, item);
      normalized.split(/\s+/).forEach((word) => {
        if (word.length > 2 && !map.has(word)) {
          map.set(word, item);
        }
      });
    });
    return map;
  }, [vocabulary]);

  // Split text into sentences
  const sentences = useMemo(() => {
    // Split by sentence-ending punctuation while keeping the punctuation
    return text.split(/(?<=[.!?])\s+/).filter(Boolean);
  }, [text]);

  // Fetch translation
  const fetchTranslation = useCallback(async (textToTranslate: string): Promise<string | null> => {
    const cacheKey = textToTranslate.toLowerCase();
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey) || null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: 'mk',
          targetLang: 'en',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) return null;
      const data = await response.json();
      const translation = data.translatedText;

      if (translation) {
        translationCache.set(cacheKey, translation);
        return translation;
      }
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error('Translation error:', error);
      return null;
    }
  }, []);

  // Handle word click
  const handleWordClick = useCallback(async (word: string) => {
    if (!tapTranslateEnabled) return;

    const normalized = word.toLowerCase().replace(/[.,!?;:'"„"«»—–]/g, '');
    const cleanWord = word.replace(/[.,!?;:'"„"«»—–]/g, '');

    // Check pre-analyzed data
    const analyzed = analyzedMap.get(normalized);
    if (analyzed) {
      setSelectedWord({
        original: analyzed.original,
        translation: analyzed.contextualMeaning || analyzed.translation,
        alternativeTranslations: analyzed.alternativeTranslations,
        contextHint: analyzed.contextHint,
        partOfSpeech: analyzed.pos,
        difficulty: analyzed.difficulty,
      });
      return;
    }

    // Check vocabulary
    const vocab = vocabMap.get(normalized);
    if (vocab) {
      setSelectedWord({
        original: vocab.mk,
        translation: vocab.en,
        partOfSpeech: vocab.pos,
        phonetic: vocab.note,
      });
      return;
    }

    // Fetch translation
    setSelectedWord({
      original: cleanWord,
      translation: locale === 'en' ? 'Translating...' : 'Се преведува...',
    });

    const translation = await fetchTranslation(cleanWord);
    setSelectedWord({
      original: cleanWord,
      translation: translation || (locale === 'en' ? 'Translation not available' : 'Превод не е достапен'),
    });
  }, [tapTranslateEnabled, analyzedMap, vocabMap, locale, fetchTranslation]);

  // Handle sentence click (sentence mode)
  const handleSentenceClick = useCallback(async (sentenceIndex: number, sentence: string) => {
    if (!sentenceModeEnabled) return;

    // Toggle expanded state
    setExpandedSentences((prev) => {
      const next = new Set(prev);
      if (next.has(sentenceIndex)) {
        next.delete(sentenceIndex);
      } else {
        next.add(sentenceIndex);
      }
      return next;
    });

    // Fetch translation if not already cached
    if (!sentenceTranslations.has(sentenceIndex)) {
      const translation = await fetchTranslation(sentence);
      if (translation) {
        setSentenceTranslations((prev) => new Map(prev).set(sentenceIndex, translation));
      }
    }
  }, [sentenceModeEnabled, sentenceTranslations, fetchTranslation]);

  // Handle save to glossary
  const handleSaveToGlossary = useCallback((word: WordInfo) => {
    const savedWord: SavedWord = {
      id: `vocab-${word.original.toLowerCase().replace(/[.,!?;:'"]/g, '')}`,
      original: word.original,
      translation: word.translation,
      partOfSpeech: word.partOfSpeech,
      savedAt: new Date(),
    };
    addToGlossary(savedWord);
  }, [addToGlossary]);

  // Check if word is saved
  const isWordSaved = useCallback((word: WordInfo) => {
    const wordId = `vocab-${word.original.toLowerCase().replace(/[.,!?;:'"]/g, '')}`;
    return savedWords.some((w) => w.id === wordId);
  }, [savedWords]);

  // Render a single word
  const renderWord = (word: string, wordIndex: number) => {
    if (/^\s+$/.test(word)) {
      return <Fragment key={wordIndex}>{word}</Fragment>;
    }

    const normalized = word.toLowerCase().replace(/[.,!?;:'"„"«»—–]/g, '');
    const hasAnalysis = analyzedMap.has(normalized) || vocabMap.has(normalized);

    return (
      <span
        key={wordIndex}
        role={tapTranslateEnabled ? 'button' : undefined}
        tabIndex={tapTranslateEnabled ? 0 : undefined}
        data-testid={tapTranslateEnabled ? 'reader-tappable-word' : undefined}
        data-scan-group={tapTranslateEnabled ? 'reader-tappable-word' : undefined}
        data-scan-label={tapTranslateEnabled ? 'Tap word for translation' : undefined}
        onClick={(e) => {
          e.stopPropagation();
          handleWordClick(word);
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && tapTranslateEnabled) {
            e.preventDefault();
            handleWordClick(word);
          }
        }}
        className={cn(
          'rounded-sm px-0.5 -mx-0.5 transition-colors inline',
          tapTranslateEnabled && [
            'cursor-pointer',
            'hover:bg-primary/20 active:bg-primary/30',
            'focus:bg-primary/20 focus:outline-none',
            'touch-manipulation',
          ],
          tapTranslateEnabled && hasAnalysis && 'underline decoration-primary/40 decoration-dotted underline-offset-4'
        )}
      >
        {word}
      </span>
    );
  };

  // Render sentence with optional translation
  const renderSentence = (sentence: string, sentenceIndex: number) => {
    const words = sentence.split(/(\s+)/);
    const isExpanded = expandedSentences.has(sentenceIndex);
    const translation = sentenceTranslations.get(sentenceIndex);

    return (
      <span
        key={sentenceIndex}
        className={cn(
          sentenceModeEnabled && [
            'cursor-pointer rounded px-1 -mx-1 transition-colors',
            'hover:bg-primary/10',
            isExpanded && 'bg-primary/5',
          ]
        )}
        onClick={() => handleSentenceClick(sentenceIndex, sentence)}
      >
        {words.map((word, wordIndex) => renderWord(word, wordIndex))}

        {/* Inline sentence translation */}
        {sentenceModeEnabled && isExpanded && (
          <span className="block mt-1 text-base text-primary/80 italic pl-2 border-l-2 border-primary/30">
            {translation || (locale === 'en' ? 'Loading...' : 'Се вчитува...')}
          </span>
        )}

        {sentenceIndex < sentences.length - 1 && ' '}
      </span>
    );
  };

  return (
    <>
      <p className={cn('leading-relaxed select-none', className)}>
        {sentences.map((sentence, sentenceIndex) => renderSentence(sentence, sentenceIndex))}
      </p>

      <WordBottomSheet
        open={!!selectedWord}
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onSaveToGlossary={handleSaveToGlossary}
        isSaved={selectedWord ? isWordSaved(selectedWord) : false}
        locale={locale}
      />
    </>
  );
}
