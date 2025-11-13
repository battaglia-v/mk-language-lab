import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import practicePrompts from '@/data/practice-vocabulary.json';
import {
  splitClozeSentence,
  ALL_CATEGORIES,
  INITIAL_HEARTS,
  SESSION_TARGET,
  getPracticeCategories,
  getPracticePromptsForSession,
  calculateSessionProgress,
  calculateAccuracy,
  selectNextPracticeIndex,
  evaluatePracticeAnswer,
  getExpectedAnswer,
} from '@mk/practice';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { ClozeContext, PracticeDirection, PracticeDrillMode, PracticeItem } from '@/components/learn/quick-practice/types';

const DEFAULT_PRACTICE_ITEMS: PracticeItem[] = (practicePrompts as PracticeItem[]).map((item, index) => ({
  ...item,
  id: item.id ?? `prompt-${index + 1}`,
}));

export type QuickPracticeSessionOptions = {
  prompts?: PracticeItem[];
  initialPromptId?: string | null;
};

export function useQuickPracticeSession(options: QuickPracticeSessionOptions = {}) {
  const promptsSource = options.prompts && options.prompts.length > 0 ? options.prompts : DEFAULT_PRACTICE_ITEMS;
  const initialPromptId = options.initialPromptId ?? null;

  const categories = useMemo(() => getPracticeCategories(promptsSource), [promptsSource]);

  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [direction, setDirection] = useState<PracticeDirection>('mkToEn');
  const [practiceMode, setPracticeMode] = useState<PracticeDrillMode>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState('');
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [hearts, setHearts] = useState(INITIAL_HEARTS);
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const categoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { streak, xp, level, updateProgress } = useGameProgress();
  type ProgressUpdatePayload = Parameters<typeof updateProgress>[0];
  const scheduleProgressUpdate = useCallback(
    (updates: ProgressUpdatePayload) => {
      const run = () => {
        void updateProgress(updates).catch(() => undefined);
      };
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(run);
      } else {
        setTimeout(run, 0);
      }
    },
    [updateProgress]
  );

  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    function handleClick(event: MouseEvent) {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isCategoryMenuOpen]);

  useEffect(() => () => {
    if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
  }, []);

  const practiceItems = useMemo(
    () =>
      getPracticePromptsForSession({
        prompts: promptsSource,
        category,
        practiceMode,
        direction,
      }),
    [promptsSource, category, practiceMode, direction]
  );

  const isClozeMode = practiceMode === 'cloze';

  const hasAvailablePrompts = practiceItems.length > 0;
  const currentItem =
    currentIndex >= 0 && currentIndex < practiceItems.length ? practiceItems[currentIndex] : undefined;

  useEffect(() => {
    if (!practiceItems.length) {
      setCurrentIndex(-1);
      setAnswer('');
      setFeedback(null);
      setRevealedAnswer('');
      setTotalAttempts(0);
      setCorrectCount(0);
      setIsCelebrating(false);
      return;
    }
    let nextIndex = Math.floor(Math.random() * practiceItems.length);
    if (initialPromptId) {
      const forcedIndex = practiceItems.findIndex((item) => item.id === initialPromptId);
      if (forcedIndex >= 0) {
        nextIndex = forcedIndex;
      }
    }
    setCurrentIndex(nextIndex);
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setTotalAttempts(0);
    setCorrectCount(0);
    setIsCelebrating(false);
  }, [practiceItems, initialPromptId]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setIsCelebrating(false);
  }, [direction, practiceMode]);

  const clozeContext: ClozeContext | undefined = currentItem
    ? direction === 'enToMk'
      ? currentItem.contextMk
      : currentItem.contextEn
    : undefined;

  const clozeParts = useMemo(() => {
    if (!clozeContext || !isClozeMode) return null;
    const result = splitClozeSentence(clozeContext.sentence);
    return result.hasBlank ? result : null;
  }, [clozeContext, isClozeMode]);

  const sessionProgress = calculateSessionProgress(correctCount, SESSION_TARGET);
  const accuracy = calculateAccuracy(correctCount, totalAttempts);

  const handleNext = () => {
    if (!practiceItems.length) return;
    if (practiceItems.length === 1) {
      setAnswer('');
      setFeedback(null);
      setRevealedAnswer('');
      return;
    }
    const nextIndex = selectNextPracticeIndex(currentIndex, practiceItems.length);
    setCurrentIndex(nextIndex);
    setAnswer('');
    setFeedback(null);
    setIsCelebrating(false);
    setRevealedAnswer('');
  };

  const handleReveal = () => {
    if (!currentItem) return;
    const expectedAnswer = getExpectedAnswer(currentItem, direction);
    if (!expectedAnswer) return;
    setFeedback(null);
    setIsCelebrating(false);
    setRevealedAnswer(expectedAnswer);
  };

  const handleReset = () => {
    setAnswer('');
    setFeedback(null);
    setTotalAttempts(0);
    setCorrectCount(0);
    setIsCelebrating(false);
    setRevealedAnswer('');
    setShowCompletionModal(false);
    setShowGameOverModal(false);
    setHearts(INITIAL_HEARTS);
    trackEvent(AnalyticsEvents.PRACTICE_SESSION_NEW, {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
    });
  };

  const handleContinue = () => {
    setShowCompletionModal(false);
    trackEvent(AnalyticsEvents.PRACTICE_SESSION_CONTINUE, {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
    });
  };

  const handleCheck = async () => {
    if (!currentItem || !answer.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const evaluation = evaluatePracticeAnswer(answer, currentItem, direction);
    if (!evaluation) {
      return;
    }
    const { isCorrect, expectedAnswer } = evaluation;

    const analyticsPayload = {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
    };

    const newTotalAttempts = totalAttempts + 1;
    setTotalAttempts(newTotalAttempts);

    try {
      if (isCorrect) {
        const newCorrectCount = correctCount + 1;
        setCorrectCount(newCorrectCount);
        setFeedback('correct');
        setRevealedAnswer('');
        setIsCelebrating(true);
        if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = setTimeout(() => setIsCelebrating(false), 1200);
        scheduleProgressUpdate({ xp: xp + 10, streak: streak + 1 });
        trackEvent(AnalyticsEvents.PRACTICE_ANSWER_CORRECT, analyticsPayload);
        if (isClozeMode) {
          trackEvent(AnalyticsEvents.PRACTICE_CLOZE_ANSWER_CORRECT, analyticsPayload);
        }
        if (newCorrectCount === SESSION_TARGET) {
          setShowCompletionModal(true);
          trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
            ...analyticsPayload,
            correctCount: newCorrectCount,
            totalAttempts: newTotalAttempts,
            accuracy: Math.round((newCorrectCount / newTotalAttempts) * 100),
          });
        }
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = setTimeout(handleNext, 1500);
      } else {
        setFeedback('incorrect');
        setRevealedAnswer(expectedAnswer);
        setIsCelebrating(false);
        scheduleProgressUpdate({ xp: xp + 5 });
        const newHearts = Math.max(0, hearts - 1);
        setHearts(newHearts);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        if (newHearts === 0) {
          setShowGameOverModal(true);
          trackEvent(AnalyticsEvents.PRACTICE_GAME_OVER, {
            ...analyticsPayload,
            correctCount,
            totalAttempts: newTotalAttempts,
          });
        }
        trackEvent(AnalyticsEvents.PRACTICE_ANSWER_INCORRECT, analyticsPayload);
        if (isClozeMode) {
          trackEvent(AnalyticsEvents.PRACTICE_CLOZE_ANSWER_INCORRECT, analyticsPayload);
        }
        if (autoAdvanceTimeoutRef.current) {
          clearTimeout(autoAdvanceTimeoutRef.current);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    categories,
    category,
    setCategory,
    direction,
    setDirection,
    practiceMode,
    setPracticeMode,
    answer,
    setAnswer,
    feedback,
    revealedAnswer,
    totalAttempts,
    correctCount,
    sessionProgress,
    accuracy,
    hearts,
    isShaking,
    isSubmitting,
    isCelebrating,
    showCompletionModal,
    setShowCompletionModal,
    showGameOverModal,
    setShowGameOverModal,
    isClozeMode,
    hasAvailablePrompts,
    currentItem,
    clozeContext,
    clozeParts,
    handleCheck,
    handleNext,
    handleReveal,
    handleReset,
    handleContinue,
    categoryButtonRef,
    categoryMenuRef,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    isActionMenuOpen,
    setIsActionMenuOpen,
    streak,
    xp,
    level,
    SESSION_TARGET,
  };
}

export type QuickPracticeSessionState = ReturnType<typeof useQuickPracticeSession>;
