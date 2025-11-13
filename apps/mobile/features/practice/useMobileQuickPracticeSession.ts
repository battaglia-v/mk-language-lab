import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePracticePromptsQuery } from '@mk/api-client';
import {
  ALL_CATEGORIES,
  INITIAL_HEARTS,
  SESSION_TARGET,
  buildPracticeDeck,
  calculateAccuracy,
  calculateSessionProgress,
  evaluatePracticeAnswer,
  getPracticeCategories,
  getPracticePromptsForSession,
  selectNextPracticeIndex,
} from '@mk/practice';
import type {
  PracticeCardContent,
  PracticeCardKind,
  PracticeDirection,
  PracticeEvaluationResult,
  PracticeItem,
} from '@mk/practice';
import { queueDeckAudioPrefetch } from './hooks/useAudioPrompt';
import { getApiBaseUrl } from '../../lib/api';
import { authenticatedFetch } from '../../lib/auth';

export type PracticeDeckMode = PracticeCardKind;

export type QuickPracticeCompletionSummary = {
  deckId: string;
  category: string;
  direction: PracticeDirection;
  practiceMode: PracticeDeckMode;
  correctCount: number;
  totalAttempts: number;
  accuracy: number;
  heartsRemaining: number;
};

type QuickPracticeSessionOptions = {
  onSessionComplete?: (summary: QuickPracticeCompletionSummary) => void;
};

type QuickPracticeSession = {
  isLoading: boolean;
  categories: string[];
  category: string;
  setCategory: (value: string) => void;
  direction: PracticeDirection;
  setDirection: (value: PracticeDirection) => void;
  practiceMode: PracticeDeckMode;
  setPracticeMode: (mode: PracticeDeckMode) => void;
  deckId: string;
  currentCard?: PracticeCardContent;
  nextCard?: PracticeCardContent;
  evaluateAnswer: (value: string) => PracticeEvaluationResult | null;
  handleResult: (result: 'correct' | 'incorrect' | 'skip') => void;
  submitAnswer: (value: string, options?: { autoAdvance?: boolean }) => PracticeEvaluationResult | null;
  skipCard: () => void;
  advanceCard: () => void;
  handleReveal: () => void;
  hearts: number;
  correctCount: number;
  totalAttempts: number;
  accuracy: number;
  sessionProgress: number;
  showCompletionModal: boolean;
  setShowCompletionModal: (open: boolean) => void;
  showGameOverModal: boolean;
  setShowGameOverModal: (open: boolean) => void;
  handleReset: () => void;
  handleContinue: () => void;
};

export function useMobileQuickPracticeSession(options: QuickPracticeSessionOptions = {}): QuickPracticeSession {
  const { onSessionComplete } = options;
  const apiBaseUrl = getApiBaseUrl();
  const { data = [], isLoading } = usePracticePromptsQuery({
    baseUrl: apiBaseUrl ?? undefined,
    fetcher: authenticatedFetch,
  });
  const prompts = data as PracticeItem[];

  const baseCategories = useMemo(() => getPracticeCategories(prompts), [prompts]);
  const categories = useMemo(() => [ALL_CATEGORIES, ...baseCategories], [baseCategories]);

  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [direction, setDirection] = useState<PracticeDirection>('mkToEn');
  const [practiceMode, setPracticeMode] = useState<PracticeDeckMode>('typing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [hearts, setHearts] = useState(INITIAL_HEARTS);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  const practiceItems = useMemo(
    () =>
      getPracticePromptsForSession({
        prompts,
        category,
        practiceMode: practiceMode === 'cloze' ? 'cloze' : 'flashcard',
        direction,
      }),
    [prompts, category, practiceMode, direction]
  );

  const deck = useMemo(
    () => buildPracticeDeck(practiceItems, { direction, variant: practiceMode }),
    [practiceItems, direction, practiceMode]
  );
  const deckId = useMemo(
    () => buildDeckFingerprint(deck, practiceMode, direction, category),
    [deck, practiceMode, direction, category]
  );
  const completionNotifiedRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    setTotalAttempts(0);
    setCorrectCount(0);
    setHearts(INITIAL_HEARTS);
    completionNotifiedRef.current = false;
  }, [deck.length, practiceMode, direction, category]);

  useEffect(() => {
    if (deck.length === 0) {
      return;
    }
    void queueDeckAudioPrefetch(deckId, deck);
  }, [deck, deckId]);

  const currentCard = deck[currentIndex];
  const nextCard = deck.length > 1 ? deck[(currentIndex + 1) % deck.length] : undefined;

  const accuracy = calculateAccuracy(correctCount, totalAttempts);
  const sessionProgress = calculateSessionProgress(correctCount, SESSION_TARGET);

  const advanceCard = useCallback(() => {
    if (!deck.length) return;
    setCurrentIndex((prev) => selectNextPracticeIndex(prev, deck.length));
  }, [deck.length]);

  const skipCard = useCallback(() => {
    advanceCard();
  }, [advanceCard]);

  const evaluateAnswer = useCallback(
    (value: string) => {
      if (!currentCard) return null;
      return evaluatePracticeAnswer(value, currentCard.item, direction);
    },
    [currentCard, direction]
  );

  const applyResult = useCallback(
    (result: 'correct' | 'incorrect') => {
      setTotalAttempts((prev) => prev + 1);
      if (result === 'correct') {
        setCorrectCount((prev) => {
          const next = Math.min(prev + 1, SESSION_TARGET);
          if (next >= SESSION_TARGET) {
            setShowCompletionModal(true);
          }
          return next;
        });
        return;
      }
      setHearts((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) {
          setShowGameOverModal(true);
        }
        return next;
      });
    },
    [
      setCorrectCount,
      setHearts,
      setShowCompletionModal,
      setShowGameOverModal,
      setTotalAttempts,
    ]
  );

  const handleResult = useCallback(
    (result: 'correct' | 'incorrect' | 'skip') => {
      if (result === 'skip') {
        skipCard();
        return;
      }
      applyResult(result);
      advanceCard();
    },
    [advanceCard, applyResult, skipCard]
  );

  const submitAnswer = useCallback(
    (value: string, options?: { autoAdvance?: boolean }) => {
      const evaluation = evaluateAnswer(value);
      if (!evaluation) return null;
      applyResult(evaluation.isCorrect ? 'correct' : 'incorrect');
      if (options?.autoAdvance) {
        advanceCard();
      }
      return evaluation;
    },
    [advanceCard, applyResult, evaluateAnswer]
  );

  const handleReveal = useCallback(() => {
    // Placeholder for analytics; actual UI handles showing answers locally.
  }, []);

  const handleReset = useCallback(() => {
    setCorrectCount(0);
    setTotalAttempts(0);
    setHearts(INITIAL_HEARTS);
    setShowCompletionModal(false);
    setShowGameOverModal(false);
    setCurrentIndex(0);
  }, []);

  const handleContinue = useCallback(() => {
    setShowCompletionModal(false);
    setCorrectCount(0);
    setTotalAttempts(0);
    setHearts(INITIAL_HEARTS);
    completionNotifiedRef.current = false;
    advanceCard();
  }, [advanceCard]);

  useEffect(() => {
    if (correctCount < SESSION_TARGET || completionNotifiedRef.current) {
      return;
    }
    completionNotifiedRef.current = true;
    onSessionComplete?.({
      deckId,
      category,
      direction,
      practiceMode,
      correctCount,
      totalAttempts,
      accuracy,
      heartsRemaining: hearts,
    });
  }, [
    accuracy,
    category,
    correctCount,
    deckId,
    direction,
    hearts,
    onSessionComplete,
    practiceMode,
    totalAttempts,
  ]);

  return {
    isLoading,
    categories,
    category,
    setCategory,
    direction,
    setDirection,
    practiceMode,
    setPracticeMode,
    deckId,
    currentCard,
    nextCard,
    evaluateAnswer,
    handleResult,
    submitAnswer,
    skipCard,
    advanceCard,
    handleReveal,
    hearts,
    correctCount,
    totalAttempts,
    accuracy,
    sessionProgress,
    showCompletionModal,
    setShowCompletionModal,
    showGameOverModal,
    setShowGameOverModal,
    handleReset,
    handleContinue,
  };
}

function buildDeckFingerprint(
  deck: PracticeCardContent[],
  mode: PracticeDeckMode,
  direction: PracticeDirection,
  category: string
) {
  if (deck.length === 0) {
    return `${mode}:${direction}:${category}:empty`;
  }
  const hashSource = deck
    .map((card) => card.id)
    .sort()
    .join('|');
  let hash = 0;
  for (let i = 0; i < hashSource.length; i += 1) {
    hash = (hash << 5) - hash + hashSource.charCodeAt(i);
    hash |= 0;
  }
  return `${mode}:${direction}:${category}:${Math.abs(hash)}`;
}
