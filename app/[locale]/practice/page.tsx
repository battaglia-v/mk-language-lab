'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, TrendingUp, Eye, Volume2, VolumeX, RotateCcw, Brain, Lightbulb, SkipForward, Keyboard, Trophy, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { readTranslatorHistory } from '@/lib/translator-history';
import { fetchUserDecks } from '@/lib/custom-decks';
import { CustomDecksDropdown } from '@/components/practice/CustomDecksDropdown';
import { readWrongAnswers, getDueCards, clearWrongAnswers, type WrongAnswerRecord, type SRSCardData } from '@/lib/spaced-repetition';
import { readFavorites, toggleFavorite, isFavorite, type FavoriteItem } from '@/lib/favorites';
import { recordPracticeSession } from '@/lib/practice-activity';
import { PracticeStreakCalendar } from '@/components/gamification/PracticeStreakCalendar';
import type { CustomDeckSummary } from '@/lib/custom-decks';
import type { PracticeAudioClip } from '@mk/api-client';

type Flashcard = {
  id: string;
  source: string;
  target: string;
  direction: 'mk-en' | 'en-mk';
  category?: string | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'mixed' | string;
  audioClip?: PracticeAudioClip | null;
  /** Macedonian text for TTS */
  macedonian?: string;
};

type DeckType = 'saved' | 'history' | 'curated' | 'custom' | 'mistakes' | 'srs' | 'favorites';

type PromptResponse = {
  id?: string;
  macedonian: string;
  english: string;
  category?: string | null;
  difficulty?: string | null;
  audioClip?: PracticeAudioClip | null;
};

const normalizeDifficulty = (value?: string | null): Flashcard['difficulty'] => {
  const normalized = value?.toLowerCase();
  if (normalized === 'beginner' || normalized === 'intermediate' || normalized === 'advanced') {
    return normalized;
  }
  return 'mixed';
};

const formatDifficultyLabel = (value?: Flashcard['difficulty']) => {
  if (!value) return 'Mixed';
  const normalized = value.toString().toLowerCase();
  if (normalized === 'beginner') return 'Beginner';
  if (normalized === 'intermediate') return 'Intermediate';
  if (normalized === 'advanced') return 'Advanced';
  return 'Mixed';
};

export default function PracticePage() {
  const t = useTranslations('practiceHub');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const { phrases } = useSavedPhrases();
  const [historySnapshot, setHistorySnapshot] = useState(() => readTranslatorHistory(32));
  const [customDecks, setCustomDecks] = useState<CustomDeckSummary[]>([]);
  const [curatedDeck, setCuratedDeck] = useState<Flashcard[]>([]);
  const [customDeckCards, setCustomDeckCards] = useState<Flashcard[]>([]);
  const [activeCustomDeckId, setActiveCustomDeckId] = useState<string | null>(null);
  const [deckType, setDeckType] = useState<DeckType>('curated');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Practice mode: typing vs multiple choice
  const [practiceMode, setPracticeMode] = useState<'typing' | 'multiple-choice'>('typing');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  
  // Session summary modal
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  // SRS and Mistakes deck state
  const [mistakesDeck, setMistakesDeck] = useState<Flashcard[]>([]);
  const [srsDueDeck, setSrsDueDeck] = useState<Flashcard[]>([]);
  const [favoritesDeck, setFavoritesDeck] = useState<Flashcard[]>([]);
  const [currentCardFavorited, setCurrentCardFavorited] = useState(false);
  
  // TTS state
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  
  // Check TTS support
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);
  
  // TTS speak function
  const speakText = useCallback((text: string, lang: 'mk' | 'en' = 'mk') => {
    if (!window.speechSynthesis || !text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'mk' ? 'sr-RS' : 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);
    
    window.speechSynthesis.speak(utterance);
  }, []);
  
  const stopTTS = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingTTS(false);
  }, []);

  // Load mistakes and SRS due cards
  useEffect(() => {
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
    
    // Load favorites
    const favorites = readFavorites();
    const favoritesFlashcards: Flashcard[] = favorites.map((fav: FavoriteItem) => ({
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
  }, [reviewedCount]); // Refresh after reviews

  useEffect(() => {
    setHistorySnapshot(readTranslatorHistory(32));

    // Check for custom deck in URL
    const params = new URLSearchParams(window.location.search);
    const fixtureParam = params.get('practiceFixture');
    if (fixtureParam?.startsWith('custom-deck-')) {
      const deckId = fixtureParam.replace('custom-deck-', '');
      setActiveCustomDeckId(deckId);

      // Fetch custom deck cards
      fetch(`/api/decks/${deckId}/cards`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch deck');
          return res.json();
        })
        .then((data) => {
          const flashcards: Flashcard[] = data.cards.map((card: unknown) => {
            const c = card as { id: string; macedonian: string; english: string };
            return {
              id: c.id,
              source: c.macedonian,
              target: c.english,
              direction: 'mk-en' as const,
              category: undefined,
              difficulty: 'custom',
              audioClip: null,
            };
          });
          setCustomDeckCards(flashcards);
        })
        .catch((error) => {
          console.error('Failed to load custom deck:', error);
          setCustomDeckCards([]);
          setActiveCustomDeckId(null);
        });
    }
  }, []);

  useEffect(() => {
    fetchUserDecks({ archived: false })
      .then((decks) => setCustomDecks(decks))
      .catch((error) => {
        console.error('Failed to load custom decks:', error);
        setCustomDecks([]);
      });

    // Load curated deck from vocabulary database
    fetch('/api/practice/prompts')
      .then((res) => res.json())
      .then((prompts: PromptResponse[]) => {
        const flashcards = prompts.map((prompt, index) => ({
          id: prompt.id || `prompt-${index}`,
          source: prompt.macedonian,
          target: prompt.english,
          direction: 'mk-en' as const,
          category: prompt.category ?? undefined,
          difficulty: normalizeDifficulty(prompt.difficulty),
          audioClip: prompt.audioClip ?? null,
        }));
        setCuratedDeck(flashcards);
      })
      .catch((error) => {
        console.error('Failed to load curated deck:', error);
        // Fallback to 5 items if API fails
        setCuratedDeck([
          { id: 'c1', source: 'Како си?', target: 'How are you?', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c2', source: 'Од каде си?', target: 'Where are you from?', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c3', source: 'Благодарам многу.', target: 'Thank you very much.', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c4', source: 'Сакам кафе.', target: 'I would like coffee.', direction: 'mk-en', difficulty: 'mixed' },
          { id: 'c5', source: 'Колку чини ова?', target: 'How much is this?', direction: 'mk-en', difficulty: 'mixed' },
        ]);
      });
  }, []);

  // Allow users to explicitly choose their deck without auto-switching
  useEffect(() => {
    // Only auto-switch away from disabled decks (empty decks)
    if (!phrases.length && deckType === 'saved') {
      setDeckType(historySnapshot.length ? 'history' : 'curated');
    } else if (!historySnapshot.length && deckType === 'history') {
      setDeckType(phrases.length ? 'saved' : 'curated');
    }
  }, [deckType, historySnapshot.length, phrases.length]);

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

  const curatedFlashcards: Flashcard[] = curatedDeck;
  const filteredCuratedDeck = useMemo(
    () =>
      difficultyFilter === 'all'
        ? curatedFlashcards
        : curatedFlashcards.filter((card) => card.difficulty === difficultyFilter),
    [curatedFlashcards, difficultyFilter],
  );

  // Determine which deck to use based on deckType and activeCustomDeckId
  const deck = deckType === 'custom' && customDeckCards.length > 0
    ? customDeckCards
    : deckType === 'saved'
    ? savedDeck
    : deckType === 'history'
    ? historyDeck
    : deckType === 'mistakes'
    ? mistakesDeck
    : deckType === 'srs'
    ? srsDueDeck
    : deckType === 'favorites'
    ? favoritesDeck
    : filteredCuratedDeck;
  const total = deck.length || 1;
  const safeIndex = deck.length ? Math.min(index, deck.length - 1) : 0;
  const currentCard = deck[safeIndex];

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlayingAudio(false);
  }, []);

  useEffect(() => {
    if (
      deckType === 'curated' &&
      difficultyFilter !== 'all' &&
      filteredCuratedDeck.length === 0 &&
      curatedFlashcards.length > 0
    ) {
      setDifficultyFilter('all');
    }
  }, [curatedFlashcards.length, deckType, difficultyFilter, filteredCuratedDeck.length]);

  useEffect(() => {
    if (safeIndex !== index) {
      setIndex(safeIndex);
      setRevealed(false);
    }
  }, [index, safeIndex]);

  useEffect(
    () => () => {
      stopAudio();
    },
    [stopAudio],
  );

  useEffect(() => {
    stopAudio();
  }, [stopAudio, currentCard?.id]);

  const resetCardState = useCallback(() => {
    stopAudio();
    setGuess('');
    setFeedback(null);
    setRevealed(false);
    setHint(null);
    setSelectedChoice(null);
  }, [stopAudio]);

  const goNext = useCallback(() => {
    if (!deck.length) return;
    const nextIndex = (index + 1) % deck.length;
    // Check if we've completed the deck
    if (nextIndex === 0 && reviewedCount > 0 && !sessionCompleted) {
      setSessionCompleted(true);
      setShowSummary(true);
    }
    setIndex(nextIndex);
    resetCardState();
  }, [deck.length, index, resetCardState, reviewedCount, sessionCompleted]);

  const goPrevious = useCallback(() => {
    if (!deck.length) return;
    setIndex((previous) => (previous - 1 + deck.length) % deck.length);
    resetCardState();
  }, [deck.length, resetCardState]);

  const toggleReveal = useCallback(() => {
    if (!deck.length) return;
    setRevealed((prev) => !prev);
    setFeedback(null);
  }, [deck.length]);

  const handlePlayAudio = useCallback(
    (mode: 'normal' | 'slow' = 'normal') => {
      const clip = currentCard?.audioClip;
      if (!clip?.url) return;

      stopAudio();
      const src = mode === 'slow' && clip.slowUrl ? clip.slowUrl : clip.url;
      const audio = new Audio(src);
      audioRef.current = audio;
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      void audio.play().catch(() => setIsPlayingAudio(false));
    },
    [currentCard?.audioClip, stopAudio],
  );

  const handleSubmitGuess = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!deck.length || !currentCard) return;

      const normalize = (value: string) => value.trim().toLowerCase();
      const expected = normalize(currentCard.target);
      const attempt = normalize(guess);

      if (!attempt) return;

      const isCorrect = attempt === expected;
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      setRevealed(true);
      setReviewedCount((prev) => prev + 1);

      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
        setStreak((prev) => prev + 1);

        // Save progress to database every 5 correct answers
        const newCorrectCount = correctAnswers + 1;
        if (newCorrectCount % 5 === 0) {
          fetch('/api/practice/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              correctCount: 5,
              totalCount: 5,
            }),
          }).catch((error) => {
            console.error('Failed to record practice:', error);
          });
        }
      } else {
        setStreak(0);
      }
    },
    [currentCard, deck.length, guess, correctAnswers]
  );

  useEffect(() => {
    resetCardState();
    // Check if current card is favorited
    if (currentCard?.id) {
      setCurrentCardFavorited(isFavorite(currentCard.id));
    }
  }, [resetCardState, currentCard?.id]);

  useEffect(() => {
    if (feedback !== "correct") return;
    const timer = setTimeout(() => {
      goNext();
    }, 900);
    return () => clearTimeout(timer);
  }, [feedback, goNext]);

  // Skip card without penalty
  const skipCard = useCallback(() => {
    goNext();
  }, [goNext]);

  // Calculate session time
  const getSessionDuration = useCallback(() => {
    const elapsed = Date.now() - sessionStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return { minutes, seconds, total: elapsed };
  }, [sessionStartTime]);

  // End session manually
  const endSession = useCallback(() => {
    if (reviewedCount > 0) {
      // Record the practice session for streak tracking
      const duration = getSessionDuration();
      recordPracticeSession(reviewedCount, correctAnswers, Math.floor(duration.total / 1000));
      setShowSummary(true);
    }
  }, [reviewedCount, correctAnswers, getSessionDuration]);
  
  // Toggle favorite for current card
  const handleToggleFavorite = useCallback(() => {
    if (!currentCard) return;
    
    const macedonianText = currentCard.macedonian || (currentCard.direction === 'mk-en' ? currentCard.source : currentCard.target);
    const englishText = currentCard.direction === 'mk-en' ? currentCard.target : currentCard.source;
    
    const isFav = toggleFavorite({
      id: currentCard.id,
      macedonian: macedonianText,
      english: englishText,
      category: currentCard.category || undefined,
    });
    
    setCurrentCardFavorited(isFav);
    
    // Refresh favorites deck
    const favorites = readFavorites();
    const favoritesFlashcards: Flashcard[] = favorites.map((fav: FavoriteItem) => ({
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
  }, [currentCard]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (event.key === ' ' && !isInputField) {
        event.preventDefault();
        toggleReveal();
      } else if (event.key === 'ArrowRight' && !isInputField) {
        goNext();
      } else if (event.key === 'ArrowLeft' && !isInputField) {
        goPrevious();
      } else if (event.key === 'Escape') {
        // Escape works even in input fields to skip
        skipCard();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrevious, toggleReveal, skipCard]);

  const accuracy = reviewedCount > 0 ? Math.round((correctAnswers / reviewedCount) * 100) : 0;
  const progressPercent = total > 0 ? Math.round(((safeIndex + 1) / total) * 100) : 0;

  // Generate multiple choice options
  const multipleChoiceOptions = useMemo(() => {
    if (!currentCard || deck.length < 2) return [];
    const correctAnswer = currentCard.target;
    
    // Get other answers from the deck (excluding current)
    const otherAnswers = deck
      .filter((card) => card.id !== currentCard.id)
      .map((card) => card.target)
      .filter((answer, idx, arr) => arr.indexOf(answer) === idx); // unique
    
    // Shuffle and pick 3 wrong answers
    const shuffled = [...otherAnswers].sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, 3);
    
    // Combine with correct answer and shuffle
    const allOptions = [correctAnswer, ...wrongAnswers];
    return allOptions.sort(() => Math.random() - 0.5);
  }, [currentCard, deck]);

  // Handle multiple choice selection
  const handleChoiceSelect = useCallback((choice: string) => {
    if (!currentCard || feedback) return;
    
    setSelectedChoice(choice);
    const isCorrect = choice.trim().toLowerCase() === currentCard.target.trim().toLowerCase();
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setRevealed(true);
    setReviewedCount((prev) => prev + 1);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }, [currentCard, feedback]);

  // Generate hint - show first letter(s) and word length
  const generateHint = useCallback(() => {
    if (!currentCard?.target) return;
    const target = currentCard.target.trim();
    const words = target.split(/\s+/);
    const hintParts = words.map((word) => {
      if (word.length <= 2) return word[0] + '_'.repeat(word.length - 1);
      return word.slice(0, 2) + '_'.repeat(word.length - 2);
    });
    setHint(hintParts.join(' '));
  }, [currentCard?.target]);

  // Handler for selecting a custom deck from dropdown
  const handleSelectCustomDeck = useCallback((deckId: string) => {
    setActiveCustomDeckId(deckId);
    setDeckType('custom');
    setIndex(0);
    resetCardState();

    // Fetch custom deck cards
    fetch(`/api/decks/${deckId}/cards`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch deck');
        return res.json();
      })
      .then((data) => {
        const flashcards: Flashcard[] = data.cards.map((card: unknown) => {
          const c = card as { id: string; macedonian: string; english: string };
          return {
            id: c.id,
            source: c.macedonian,
            target: c.english,
            direction: 'mk-en' as const,
            category: undefined,
            difficulty: 'custom',
            audioClip: null,
          };
        });
        setCustomDeckCards(flashcards);
      })
      .catch((error) => {
        console.error('Failed to load custom deck:', error);
        setCustomDeckCards([]);
        setActiveCustomDeckId(null);
        setDeckType('curated');
      });
  }, [resetCardState]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-24 px-3 sm:gap-5 sm:px-4 sm:pb-6">
      <section className="lab-hero" data-testid="practice-hero">
        <div className="flex flex-col gap-3 sm:gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
          >
            <Link href={`/${locale}/dashboard`} aria-label={navT('backToDashboard')}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {navT('backToDashboard')}
            </Link>
          </Button>
          <header className="page-header">
            <div className="page-header-content">
              <p className="page-header-badge">{t('badge')}</p>
              <h1 className="page-header-title">{t('title')}</h1>
              <p className="page-header-subtitle">{t('subtitle')}</p>
            </div>
          </header>
        </div>

        {/* Progress Stats */}
        {reviewedCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
            <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary" data-testid="practice-stat">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('drills.reviewedCount', { count: reviewedCount })}</span>
            </div>
            <div className="rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium text-white" data-testid="practice-stat">
              {t('drills.accuracyLabel')}: <span className="text-primary">{accuracy}%</span>
            </div>
            {streak > 2 && (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300" data-testid="practice-stat">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('drills.streakLabel', { count: streak })}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Practice Modes Navigation */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Link
          href={`/${locale}/practice/pronunciation`}
          className="group glass-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-primary/5 hover:border-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Volume2 className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {t('modes.pronunciation.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('modes.pronunciation.description')}
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" aria-hidden="true" />
        </Link>

        <Link
          href={`/${locale}/practice/grammar`}
          className="group glass-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-primary/5 hover:border-primary/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Brain className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {t('modes.grammar.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('modes.grammar.description')}
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </section>

      <div className="glass-card space-y-5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7" data-testid="practice-workspace">
        {/* Practice Streak Calendar */}
        <PracticeStreakCalendar weeks={8} />
        
        {/* SRS, Mistakes & Favorites Badges */}
        {(srsDueDeck.length > 0 || mistakesDeck.length > 0 || favoritesDeck.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2.5">
            {srsDueDeck.length > 0 && (
              <Button
                variant={deckType === 'srs' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 gap-2 rounded-full px-4 text-xs font-semibold"
                onClick={() => {
                  setDeckType('srs');
                  setActiveCustomDeckId(null);
                  resetCardState();
                }}
              >
                <Brain className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('drills.smartReview')}</span>
                <Badge variant="outline" className="ml-1 bg-primary/10 px-1.5 text-[10px] font-bold">
                  {srsDueDeck.length}
                </Badge>
              </Button>
            )}
            {favoritesDeck.length > 0 && (
              <Button
                variant={deckType === 'favorites' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 gap-2 rounded-full px-4 text-xs font-semibold"
                onClick={() => {
                  setDeckType('favorites');
                  setActiveCustomDeckId(null);
                  resetCardState();
                }}
              >
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('drills.favorites', { default: 'Favorites' })}</span>
                <Badge variant="outline" className="ml-1 bg-pink-500/10 text-pink-400 px-1.5 text-[10px] font-bold">
                  {favoritesDeck.length}
                </Badge>
              </Button>
            )}
            {mistakesDeck.length > 0 && (
              <Button
                variant={deckType === 'mistakes' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 gap-2 rounded-full px-4 text-xs font-semibold"
                onClick={() => {
                  setDeckType('mistakes');
                  setActiveCustomDeckId(null);
                  resetCardState();
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('drills.reviewMistakes')}</span>
                <Badge variant="outline" className="ml-1 bg-destructive/10 text-destructive px-1.5 text-[10px] font-bold">
                  {mistakesDeck.length}
                </Badge>
              </Button>
            )}
            {deckType === 'mistakes' && mistakesDeck.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  clearWrongAnswers();
                  setMistakesDeck([]);
                  setDeckType('curated');
                  resetCardState();
                }}
              >
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {t('drills.clearMistakes')}
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-4 sm:gap-3" data-testid="practice-panels">
          <DeckToggle
            label={t('savedDeck.badge')}
            count={savedDeck.length}
            active={deckType === 'saved'}
            disabled={!savedDeck.length}
            onClick={() => {
              setDeckType('saved');
              setActiveCustomDeckId(null);
              resetCardState();
            }}
          />
          <DeckToggle
            label={t('translation.tabLabel')}
            count={historyDeck.length}
            active={deckType === 'history'}
            disabled={!historyDeck.length}
            onClick={() => {
              setDeckType('history');
              setActiveCustomDeckId(null);
              resetCardState();
            }}
          />
          <DeckToggle
            label={t('cards.translate.title')}
            count={curatedFlashcards.length}
            active={deckType === 'curated'}
            onClick={() => {
              setDeckType('curated');
              setActiveCustomDeckId(null);
              resetCardState();
            }}
          />
          <div className="w-full">
            <CustomDecksDropdown
              decks={customDecks}
              activeCustomDeckId={activeCustomDeckId}
              onSelectDeck={handleSelectCustomDeck}
              disabled={customDecks.length === 0}
            />
          </div>
        </div>

        {/* Practice Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-muted/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {t('drills.modeLabel', { default: 'Mode' })}
            </span>
            <Button
              type="button"
              size="sm"
              variant={practiceMode === 'typing' ? 'secondary' : 'ghost'}
              className="h-9 rounded-full px-3 text-xs font-semibold"
              onClick={() => setPracticeMode('typing')}
            >
              {t('drills.modeTyping', { default: 'Typing' })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={practiceMode === 'multiple-choice' ? 'secondary' : 'ghost'}
              className="h-9 rounded-full px-3 text-xs font-semibold"
              onClick={() => setPracticeMode('multiple-choice')}
            >
              {t('drills.modeMultipleChoice', { default: 'Multiple Choice' })}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-primary"
              onClick={endSession}
              disabled={reviewedCount === 0}
            >
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {t('drills.endSession', { default: 'End Session' })}
            </Button>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/20 px-2.5 py-1.5 text-[10px] text-muted-foreground">
              <Keyboard className="h-3 w-3" aria-hidden="true" />
              <span>Space: {t('drills.revealAnswerShort', { default: 'Reveal' })} | Esc: {t('drills.skip', { default: 'Skip' })} | ←→: {t('drills.navigate', { default: 'Nav' })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-muted/10 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {t('drills.difficultyLabel', { default: 'Difficulty' })}
          </span>
          {[
            { value: 'all', label: t('drills.allLevels', { default: 'All' }) },
            { value: 'beginner', label: t('drills.difficultyBeginner', { default: 'Beginner' }) },
            { value: 'intermediate', label: t('drills.difficultyIntermediate', { default: 'Intermediate' }) },
            { value: 'advanced', label: t('drills.difficultyAdvanced', { default: 'Advanced' }) },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={difficultyFilter === option.value ? 'secondary' : 'ghost'}
              className="h-9 rounded-full px-3 text-xs font-semibold"
              onClick={() => setDifficultyFilter(option.value as typeof difficultyFilter)}
              disabled={deckType !== 'curated'}
            >
              {option.label}
            </Button>
          ))}
          {deckType !== 'curated' && (
            <span className="text-[11px] text-muted-foreground">
              {t('drills.difficultyFilterHelper', { default: 'Switch to the curated deck to apply filters.' })}
            </span>
          )}
        </div>

        {!deck.length ? (
          <Alert className="rounded-2xl border border-border/60 bg-muted/20">
            <AlertDescription className="text-sm text-muted-foreground">
              {t('savedDeck.emptyDescription')}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">{t('drills.progressLabel', { current: safeIndex + 1, total })}</span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span className="font-semibold">{currentCard?.direction === 'en-mk' ? 'EN → MK' : 'MK → EN'}</span>
                <span className="rounded-full bg-muted/20 px-2.5 py-1 font-bold">
                  {safeIndex + 1} / {total}
                </span>
              </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {currentCard?.difficulty && (
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                  {formatDifficultyLabel(currentCard.difficulty)}
                </Badge>
              )}
              {currentCard?.category && (
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {currentCard.category}
                </Badge>
              )}
              {/* TTS Button - for all cards */}
              {ttsSupported && currentCard && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'h-8 gap-1.5 rounded-full px-2.5 text-xs',
                    isSpeakingTTS ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
                  onClick={() => {
                    if (isSpeakingTTS) {
                      stopTTS();
                    } else {
                      const textToSpeak = currentCard.macedonian || (currentCard.direction === 'mk-en' ? currentCard.source : currentCard.target);
                      speakText(textToSpeak, 'mk');
                    }
                  }}
                  aria-label={isSpeakingTTS ? t('drills.stopAudio', { default: 'Stop' }) : t('drills.listenTTS', { default: 'Listen' })}
                >
                  {isSpeakingTTS ? (
                    <VolumeX className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {isSpeakingTTS ? t('drills.stopAudio', { default: 'Stop' }) : t('drills.listenTTS', { default: 'Listen' })}
                  </span>
                </Button>
              )}
              {/* Favorite Button */}
              {currentCard && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'h-8 gap-1.5 rounded-full px-2.5 text-xs',
                    currentCardFavorited ? 'text-pink-400' : 'text-muted-foreground hover:text-pink-400'
                  )}
                  onClick={handleToggleFavorite}
                  aria-label={currentCardFavorited ? t('drills.unfavorite', { default: 'Remove from favorites' }) : t('drills.favorite', { default: 'Add to favorites' })}
                >
                  <Heart className={cn('h-4 w-4', currentCardFavorited && 'fill-current')} aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {currentCardFavorited ? t('drills.unfavorite', { default: 'Saved' }) : t('drills.favorite', { default: 'Save' })}
                  </span>
                </Button>
              )}
              {currentCard?.audioClip?.url && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full border-white/20 bg-white/5 text-white hover:border-primary/50 hover:text-primary"
                    onClick={() => handlePlayAudio('normal')}
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-semibold">
                      {isPlayingAudio
                        ? t('drills.playingAudio', { default: 'Playing…' })
                        : t('drills.listenButton', { default: 'Listen' })}
                    </span>
                  </Button>
                  {currentCard.audioClip?.slowUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-full border border-white/15 bg-white/5 text-white hover:border-primary/50 hover:text-primary"
                      onClick={() => handlePlayAudio('slow')}
                    >
                      {t('drills.slowButton', { default: 'Slow' })}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
            <div className="mt-5 space-y-4 sm:mt-7 sm:space-y-5 w-full min-w-0">
              <p className="text-xl font-semibold leading-tight text-white break-words sm:text-2xl md:text-3xl">{currentCard?.source}</p>
              <div className={cn(
                'rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all duration-300 w-full min-w-0',
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}>
                <p className="text-base font-medium text-primary break-words sm:text-lg">
                  {currentCard?.target}
                </p>
              </div>
            </div>

              {/* Practice Input Area - Typing or Multiple Choice */}
              {practiceMode === 'typing' ? (
                <form onSubmit={handleSubmitGuess} className="mt-4 space-y-2.5 sm:mt-6 w-full min-w-0">
                  <div className="space-y-1.5 w-full min-w-0">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white sm:text-sm" htmlFor="practice-guess">
                        {t('drills.wordInputLabel')}
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-primary"
                          onClick={generateHint}
                          disabled={revealed || !!hint}
                        >
                          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                          {t('drills.hintButton')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                          onClick={skipCard}
                        >
                          <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                          {t('drills.skip', { default: 'Skip' })}
                        </Button>
                      </div>
                    </div>
                    {hint && !revealed && (
                      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                        <span className="font-medium">{t('drills.hintLabel')}: </span>
                        <span className="font-mono tracking-wide">{hint}</span>
                      </div>
                    )}
                  <div className="flex flex-col items-center gap-3 sm:flex-row w-full min-w-0">
                    <Input
                      id="practice-guess"
                      value={guess}
                      onChange={(event) => setGuess(event.target.value)}
                      placeholder={t('drills.wordInputPlaceholder')}
                      className="flex-[3] min-h-[54px] min-w-0 rounded-3xl border border-primary/40 bg-white/8 px-4 text-lg text-white placeholder:text-muted-foreground w-full"
                    />
                    <Button
                      type="submit"
                      className="min-h-[54px] w-full max-w-[200px] sm:w-auto sm:flex-[1] sm:max-w-[140px] rounded-3xl px-6 text-base font-semibold shadow-lg transition-all hover:scale-105 disabled:hover:scale-100"
                      disabled={!deck.length || !guess.trim()}
                    >
                      {t('drills.submitWord')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('drills.wordInputHelper')}</p>
                  {feedback && (
                    <div
                      role="status"
                      className={cn(
                        'animate-in slide-in-from-top-2 fade-in duration-300 rounded-2xl border px-4 py-3 text-sm shadow-lg',
                        feedback === 'correct'
                          ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50'
                          : 'border-amber-400/60 bg-amber-500/15 text-amber-50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {feedback === 'correct' ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" aria-hidden="true" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {feedback === 'correct' ? t('drills.feedbackCorrect') : t('drills.feedbackIncorrectTitle')}
                          </p>
                          {feedback === 'incorrect' && (
                            <p className="mt-1 text-xs opacity-90">
                              {t('drills.feedbackIncorrect', { answer: currentCard?.target })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
              ) : (
                /* Multiple Choice Mode */
                <div className="mt-4 space-y-3 sm:mt-6 w-full min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white sm:text-sm">
                      {t('drills.chooseAnswer', { default: 'Choose the correct answer' })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                      onClick={skipCard}
                    >
                      <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('drills.skip', { default: 'Skip' })}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {multipleChoiceOptions.map((option, idx) => (
                      <Button
                        key={`${option}-${idx}`}
                        type="button"
                        variant="outline"
                        className={cn(
                          'min-h-[52px] rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all',
                          !feedback && 'hover:border-primary/60 hover:bg-primary/10',
                          selectedChoice === option && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20 text-emerald-50',
                          selectedChoice === option && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20 text-amber-50',
                          feedback && option === currentCard?.target && 'border-emerald-400 bg-emerald-500/15',
                          feedback && selectedChoice !== option && option !== currentCard?.target && 'opacity-50'
                        )}
                        onClick={() => handleChoiceSelect(option)}
                        disabled={!!feedback}
                      >
                        <span className="mr-2 text-muted-foreground">{['A', 'B', 'C', 'D'][idx]}.</span>
                        {option}
                      </Button>
                    ))}
                  </div>
                  {feedback && (
                    <div
                      role="status"
                      className={cn(
                        'animate-in slide-in-from-top-2 fade-in duration-300 rounded-2xl border px-4 py-3 text-sm shadow-lg',
                        feedback === 'correct'
                          ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50'
                          : 'border-amber-400/60 bg-amber-500/15 text-amber-50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {feedback === 'correct' ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" aria-hidden="true" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {feedback === 'correct' ? t('drills.feedbackCorrect') : t('drills.feedbackIncorrectTitle')}
                          </p>
                          {feedback === 'incorrect' && (
                            <p className="mt-1 text-xs opacity-90">
                              {t('drills.feedbackIncorrect', { answer: currentCard?.target })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-6 sm:grid-cols-5 sm:gap-4 w-full min-w-0">
              <Button
                variant="outline"
                className="min-h-[52px] min-w-0 rounded-2xl font-semibold transition-all hover:scale-105 gap-1.5"
                onClick={goPrevious}
                disabled={!deck.length}
                aria-label="Previous card"
              >
                <ArrowLeft className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
              <Button
                variant="secondary"
                className="col-span-2 sm:col-span-3 min-h-[52px] min-w-0 rounded-2xl font-semibold transition-all hover:scale-105 px-3 sm:px-4"
                onClick={toggleReveal}
                disabled={!deck.length}
              >
                <Eye className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="ml-1.5 sm:ml-2 text-sm sm:text-base sm:hidden">{t('drills.revealAnswerShort')}</span>
                <span className="ml-2 text-base hidden sm:inline">{t('drills.revealAnswer')}</span>
              </Button>
              <Button
                variant="outline"
                className="min-h-[52px] min-w-0 rounded-2xl font-semibold transition-all hover:scale-105 gap-1.5"
                onClick={goNext}
                disabled={!deck.length}
                aria-label="Next card"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground sm:text-left">
              {t('drills.revealHelper', { default: 'Reveal the answer without marking your attempt wrong.' })}
            </p>
            </div>
            <p className="text-xs text-muted-foreground">{t('translation.description')}</p>
          </div>
        )}
      </div>

      {/* Session Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-6 w-6 text-primary" aria-hidden="true" />
              {t('drills.sessionComplete', { default: 'Session Complete!' })}
            </DialogTitle>
            <DialogDescription>
              {t('drills.sessionSummaryDesc', { default: 'Great work! Here\'s how you did:' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
                <div className="text-3xl font-bold text-primary">{reviewedCount}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('drills.cardsReviewed', { default: 'Cards Reviewed' })}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">{accuracy}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('drills.accuracyLabel', { default: 'Accuracy' })}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
                <div className="text-3xl font-bold text-white">{correctAnswers}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('drills.correctCount', { default: 'Correct' })}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-white">
                  <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <span>{Math.floor(getSessionDuration().minutes)}:{String(getSessionDuration().seconds).padStart(2, '0')}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('drills.timeSpent', { default: 'Time Spent' })}
                </div>
              </div>
            </div>
            {streak > 2 && (
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">🔥 {streak}</div>
                <div className="text-xs text-emerald-300/80 mt-1">
                  {t('drills.bestStreak', { default: 'Best Streak' })}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowSummary(false);
                setSessionCompleted(false);
              }}
            >
              {t('drills.continueLabel', { default: 'Continue' })}
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowSummary(false);
                setSessionCompleted(false);
                setReviewedCount(0);
                setCorrectAnswers(0);
                setStreak(0);
                setIndex(0);
                resetCardState();
              }}
            >
              {t('drills.startNew', { default: 'Start New Session' })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type DeckToggleProps = {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function DeckToggle({ label, count, active, disabled, onClick }: DeckToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex h-full w-full min-h-[68px] min-w-0 flex-col items-start justify-between gap-1.5 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all min-[400px]:px-4 sm:px-5 sm:py-4',
        active
          ? 'border-primary/70 bg-primary/15 text-white shadow-md ring-1 ring-primary/25'
          : 'border-border/60 text-foreground/85 hover:border-primary/40 hover:text-white hover:bg-primary/5',
        disabled && 'opacity-45 cursor-not-allowed hover:border-border/60 hover:text-foreground/85 hover:bg-transparent',
      )}
    >
      <span className="min-w-0 text-left leading-tight text-[13px] min-[400px]:text-sm line-clamp-2">{label}</span>
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors flex-shrink-0',
          active ? 'bg-primary/30 text-primary-foreground' : 'bg-muted/60 text-foreground/80 group-hover:bg-primary/15'
        )}
      >
        {count}
      </span>
    </button>
  );
}
