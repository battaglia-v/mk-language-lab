'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { readTranslatorHistory } from '@/lib/translator-history';
import { fetchUserDecks } from '@/lib/custom-decks';
import { readWrongAnswers, getDueCards, clearWrongAnswers, type WrongAnswerRecord, type SRSCardData } from '@/lib/spaced-repetition';
import { readFavorites, type FavoriteItem } from '@/lib/favorites';
import { getSRSCounts, getReviewQueue } from '@/lib/srs';
import { useVocabulary, type VocabWord } from './useVocabulary';
import type { CustomDeckSummary } from '@/lib/custom-decks';
import type { Flashcard, DeckType, DifficultyFilter } from './types';
import { normalizeDifficulty } from './types';

type PromptResponse = {
  id?: string;
  macedonian: string;
  english: string;
  category?: string | null;
  difficulty?: string | null;
};

/**
 * Hook for loading and managing practice decks
 */
export function usePracticeDecks() {
  const { phrases } = useSavedPhrases();
  const { status } = useSession();
  const vocabulary = useVocabulary();
  const [historySnapshot, setHistorySnapshot] = useState<ReturnType<typeof readTranslatorHistory>>([]);
  const [customDecks, setCustomDecks] = useState<CustomDeckSummary[]>([]);
  const [curatedDeck, setCuratedDeck] = useState<Flashcard[]>([]);
  const [customDeckCards, setCustomDeckCards] = useState<Flashcard[]>([]);
  const [activeCustomDeckId, setActiveCustomDeckId] = useState<string | null>(null);
  const [mistakesDeck, setMistakesDeck] = useState<Flashcard[]>([]);
  const [srsDueDeck, setSrsDueDeck] = useState<Flashcard[]>([]);
  const [favoritesDeck, setFavoritesDeck] = useState<Flashcard[]>([]);
  const [favoritesSRSCounts, setFavoritesSRSCounts] = useState({ due: 0, new_: 0, learned: 0 });
  const [lessonReviewDeck, setLessonReviewDeck] = useState<Flashcard[]>([]);
  const [userVocabDeck, setUserVocabDeck] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    setHistorySnapshot(readTranslatorHistory(32));
  }, []);

  // Load mistakes, SRS, and favorites
  const refreshSpecialDecks = useCallback(() => {
    const wrongAnswers = readWrongAnswers();
    const mistakes: Flashcard[] = wrongAnswers.map((wa: WrongAnswerRecord) => ({
      id: wa.id,
      source: wa.direction === 'mkToEn' ? wa.macedonian : wa.english,
      target: wa.direction === 'mkToEn' ? wa.english : wa.macedonian,
      direction: wa.direction === 'mkToEn' ? 'mk-en' : 'en-mk',
      category: 'mistakes',
      difficulty: 'review',
      audioClip: null,
      macedonian: wa.macedonian,
    }));
    setMistakesDeck(mistakes);

    const dueCards = getDueCards();
    const srsFlashcards: Flashcard[] = dueCards.map((card: SRSCardData) => ({
      id: card.id,
      source: card.macedonian,
      target: card.english,
      direction: 'mk-en' as const,
      category: 'srs',
      difficulty: 'review',
      audioClip: null,
      macedonian: card.macedonian,
    }));
    setSrsDueDeck(srsFlashcards);

    const favorites = readFavorites();
    const favoriteIds = favorites.map((f) => f.id);
    const srsCounts = getSRSCounts(favoriteIds);
    setFavoritesSRSCounts(srsCounts);

    // Sort favorites by SRS priority (due first, then new)
    const sortedIds = getReviewQueue(favoriteIds);
    const idToFav = new Map(favorites.map((f) => [f.id, f]));
    const sortedFavorites = sortedIds.map((id) => idToFav.get(id)!).filter(Boolean);

    const favoritesFlashcards: Flashcard[] = sortedFavorites.map((fav: FavoriteItem) => ({
      id: fav.id,
      source: fav.macedonian,
      target: fav.english,
      direction: 'mk-en' as const,
      category: fav.category || 'favorites',
      difficulty: 'favorites',
      audioClip: null,
      macedonian: fav.macedonian,
    }));
    setFavoritesDeck(favoritesFlashcards);
  }, []);

  useEffect(() => {
    refreshSpecialDecks();
  }, [refreshSpecialDecks]);

  // Load custom decks and curated deck
  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      status === 'authenticated'
        ? fetchUserDecks({ archived: false }).catch(() => [])
        : Promise.resolve([] as CustomDeckSummary[]),
      fetch('/api/practice/prompts').then((res) => res.json()).catch(() => []),
    ]).then(([decks, prompts]) => {
      setCustomDecks(decks);

      const flashcards = (prompts as PromptResponse[]).map((prompt, index) => ({
        id: prompt.id || `prompt-${index}`,
        source: prompt.macedonian,
        target: prompt.english,
        direction: 'mk-en' as const,
        category: prompt.category ?? undefined,
        difficulty: normalizeDifficulty(prompt.difficulty),
        audioClip: null,
      }));

      if (flashcards.length > 0) {
        setCuratedDeck(flashcards);
      } else {
        // Fallback deck
        setCuratedDeck([
          { id: 'c1', source: 'Како си?', target: 'How are you?', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c2', source: 'Од каде си?', target: 'Where are you from?', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c3', source: 'Благодарам многу.', target: 'Thank you very much.', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c4', source: 'Сакам кафе.', target: 'I would like coffee.', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c5', source: 'Колку чини ова?', target: 'How much is this?', direction: 'mk-en', difficulty: 'mixed' },
        ]);
      }

      setIsLoading(false);
    });
  }, [status]);

  // Load a specific custom deck
  const loadCustomDeck = useCallback(async (deckId: string) => {
    setActiveCustomDeckId(deckId);
    try {
      const res = await fetch(`/api/decks/${deckId}/cards`);
      if (!res.ok) throw new Error('Failed to fetch deck');
      const data = await res.json();
      const flashcards: Flashcard[] = data.cards.map((card: { id: string; macedonian: string; english: string }) => ({
        id: card.id,
        source: card.macedonian,
        target: card.english,
        direction: 'mk-en' as const,
        category: undefined,
        difficulty: 'custom',
        audioClip: null,
      }));
      setCustomDeckCards(flashcards);
      return flashcards;
    } catch (error) {
      console.error('Failed to load custom deck:', error);
      setCustomDeckCards([]);
      setActiveCustomDeckId(null);
      return [];
    }
  }, []);

  // Clear custom deck selection
  const clearCustomDeck = useCallback(() => {
    setActiveCustomDeckId(null);
    setCustomDeckCards([]);
  }, []);

  // Clear mistakes deck
  const clearMistakes = useCallback(() => {
    clearWrongAnswers();
    setMistakesDeck([]);
  }, []);

  // Load lesson review vocabulary (from completed lessons)
  const loadLessonReviewDeck = useCallback(async () => {
    if (status !== 'authenticated') {
      setLessonReviewDeck([]);
      return [];
    }
    try {
      const res = await fetch('/api/practice/lesson-vocab');
      if (!res.ok) throw new Error('Failed to fetch lesson vocab');
      const data = await res.json();
      const flashcards: Flashcard[] = data.map((item: { id: string; macedonian: string; english: string; lessonTitle?: string }) => ({
        id: item.id,
        source: item.macedonian,
        target: item.english,
        direction: 'mk-en' as const,
        category: item.lessonTitle ?? 'lesson-vocab',
        difficulty: 'lesson-review',
        audioClip: null,
        macedonian: item.macedonian,
      }));
      setLessonReviewDeck(flashcards);
      return flashcards;
    } catch (error) {
      console.error('Failed to load lesson review deck:', error);
      setLessonReviewDeck([]);
      return [];
    }
  }, [status]);

  // Load vocabulary from a specific lesson by ID
  const loadLessonVocabById = useCallback(async (lessonId: string): Promise<Flashcard[]> => {
    try {
      const res = await fetch(`/api/practice/lesson-vocab?lessonId=${encodeURIComponent(lessonId)}`);
      if (!res.ok) throw new Error('Failed to fetch lesson vocab');
      const data = await res.json();
      const flashcards: Flashcard[] = data.map((item: { id: string; macedonian: string; english: string; lessonTitle?: string }) => ({
        id: item.id,
        source: item.macedonian,
        target: item.english,
        direction: 'mk-en' as const,
        category: item.lessonTitle ?? 'lesson-vocab',
        difficulty: 'lesson-vocab',
        audioClip: null,
        macedonian: item.macedonian,
      }));
      // Shuffle for variety
      return flashcards.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Failed to load lesson vocab by ID:', error);
      return [];
    }
  }, []);

  // Convert VocabWord to Flashcard
  const vocabWordToFlashcard = useCallback((word: VocabWord): Flashcard => ({
    id: word.id,
    source: word.wordMk,
    target: word.wordEn,
    direction: 'mk-en' as const,
    category: word.category ?? 'vocabulary',
    difficulty: 'user-vocab',
    audioClip: null,
    macedonian: word.wordMk,
  }), []);

  // Load user vocabulary deck (due + new words for practice)
  const loadUserVocabDeck = useCallback(async () => {
    if (status !== 'authenticated') {
      setUserVocabDeck([]);
      return [];
    }
    try {
      // Get due words first, then new words
      const [dueWords, newWords] = await Promise.all([
        vocabulary.getDueWords(15),
        vocabulary.getNewWords(5),
      ]);

      // Interleave: due words take priority, then new words
      const combined = [...dueWords, ...newWords];
      const flashcards = combined.map(vocabWordToFlashcard);
      setUserVocabDeck(flashcards);
      return flashcards;
    } catch (error) {
      console.error('Failed to load user vocab deck:', error);
      setUserVocabDeck([]);
      return [];
    }
  }, [status, vocabulary, vocabWordToFlashcard]);

  // Convert saved phrases to flashcards
  const savedDeck = useMemo<Flashcard[]>(
    () =>
      phrases.map((phrase) => ({
        id: phrase.id,
        source: phrase.directionId === 'en-mk' ? phrase.sourceText : phrase.translatedText,
        target: phrase.directionId === 'en-mk' ? phrase.translatedText : phrase.sourceText,
        direction: phrase.directionId,
        category: undefined,
        difficulty: 'saved',
        audioClip: null,
      })),
    [phrases],
  );

  // Convert history to flashcards
  const historyDeck = useMemo<Flashcard[]>(
    () =>
      historySnapshot.map((entry) => ({
        id: entry.id,
        source: entry.directionId === 'en-mk' ? entry.sourceText : entry.translatedText,
        target: entry.directionId === 'en-mk' ? entry.translatedText : entry.sourceText,
        direction: entry.directionId,
        category: undefined,
        difficulty: 'history',
        audioClip: null,
      })),
    [historySnapshot],
  );

  // Get deck by type with optional difficulty filter
  const getDeck = useCallback((
    deckType: DeckType,
    difficultyFilter: DifficultyFilter = 'all'
  ): Flashcard[] => {
    switch (deckType) {
      case 'custom':
        return customDeckCards;
      case 'saved':
        return savedDeck;
      case 'history':
        return historyDeck;
      case 'mistakes':
        return mistakesDeck;
      case 'srs':
        return srsDueDeck;
      case 'favorites':
        return favoritesDeck;
      case 'lesson-review':
        return lessonReviewDeck;
      case 'user-vocab':
        return userVocabDeck;
      case 'curated':
      default:
        if (difficultyFilter === 'all') {
          return curatedDeck;
        }
        return curatedDeck.filter((card) => card.difficulty === difficultyFilter);
    }
  }, [customDeckCards, savedDeck, historyDeck, mistakesDeck, srsDueDeck, favoritesDeck, lessonReviewDeck, userVocabDeck, curatedDeck]);

  // Determine recommended deck (for "Continue" CTA)
  const recommendedDeck = useMemo((): DeckType => {
    // Priority: SRS due > Mistakes > Lesson Review (from completed lessons) > Favorites > Curated
    // Lesson review should be prioritized when user has completed lessons
    if (srsDueDeck.length > 0) return 'srs';
    if (mistakesDeck.length > 0) return 'mistakes';
    if (lessonReviewDeck.length > 0) return 'lesson-review';
    if (favoritesDeck.length > 0) return 'favorites';
    return 'curated';
  }, [srsDueDeck.length, mistakesDeck.length, lessonReviewDeck.length, favoritesDeck.length]);

  return {
    // Decks
    savedDeck,
    historyDeck,
    curatedDeck,
    customDeckCards,
    mistakesDeck,
    srsDueDeck,
    favoritesDeck,
    lessonReviewDeck,
    userVocabDeck,
    customDecks,

    // State
    activeCustomDeckId,
    isLoading,
    recommendedDeck,

    // Actions
    loadCustomDeck,
    clearCustomDeck,
    clearMistakes,
    refreshSpecialDecks,
    loadLessonReviewDeck,
    loadLessonVocabById,
    loadUserVocabDeck,
    getDeck,

    // Vocabulary actions (for save/review during practice)
    vocabActions: {
      saveWord: vocabulary.saveWord,
      recordReview: vocabulary.recordReview,
    },

    // Vocabulary state
    vocabCounts: vocabulary.counts,

    // Counts for UI
    deckCounts: {
      saved: savedDeck.length,
      history: historyDeck.length,
      curated: curatedDeck.length,
      custom: customDeckCards.length,
      mistakes: mistakesDeck.length,
      srs: srsDueDeck.length,
      favorites: favoritesDeck.length,
      lessonReview: lessonReviewDeck.length,
      userVocab: userVocabDeck.length,
    },

    // SRS counts for favorites
    favoritesSRSCounts,
  };
}
