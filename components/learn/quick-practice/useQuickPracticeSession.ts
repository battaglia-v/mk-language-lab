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
  PRACTICE_DIFFICULTIES,
  getPracticeDifficultyPreset,
} from '@mk/practice';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { useGameProgress } from '@/hooks/useGameProgress';
import type {
  ClozeContext,
  PracticeDirection,
  PracticeDrillMode,
  PracticeItem,
  PracticeDifficultyId,
  QuickPracticeTalisman,
} from '@/components/learn/quick-practice/types';

const DEFAULT_PRACTICE_ITEMS: PracticeItem[] = (practicePrompts as PracticeItem[]).map((item, index) => ({
  ...item,
  id: item.id ?? `prompt-${index + 1}`,
}));

const TALISMAN_LIBRARY: Record<QuickPracticeTalisman['id'], QuickPracticeTalisman> = {
  perfect: {
    id: 'perfect',
    title: 'Flawless Run',
    description: 'Maintain 100% accuracy for the full deck.',
    xpMultiplier: 1.25,
  },
  streak: {
    id: 'streak',
    title: 'Streak Master',
    description: 'Answer 10 cards in a row without mistakes.',
    xpMultiplier: 1.15,
  },
};

const STREAK_TALISMAN_THRESHOLD = 10;

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
  const [difficulty, setDifficulty] = useState<PracticeDifficultyId>('casual');
  const difficultyPreset = useMemo(() => getPracticeDifficultyPreset(difficulty), [difficulty]);
  const timerDuration = difficultyPreset.timerSeconds ?? null;
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timerDuration);
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
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [perfectEligible, setPerfectEligible] = useState(true);
  const [activeTalismans, setActiveTalismans] = useState<QuickPracticeTalisman[]>([]);
  const [talismanMultiplier, setTalismanMultiplier] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const categoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bestStreakRef = useRef(0);
  const perfectEligibleRef = useRef(true);
  const timerExpiredRef = useRef(false);
  const totalAttemptsRef = useRef(0);
  const correctCountRef = useRef(0);

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
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  useEffect(() => {
    bestStreakRef.current = bestStreak;
  }, [bestStreak]);

  useEffect(() => {
    perfectEligibleRef.current = perfectEligible;
  }, [perfectEligible]);

  useEffect(() => {
    totalAttemptsRef.current = totalAttempts;
  }, [totalAttempts]);

  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  useEffect(() => {
    setTimeRemaining(timerDuration);
  }, [timerDuration]);

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

  useEffect(() => {
    if (!timerDuration) {
      setTimeRemaining(null);
      return;
    }
    setTimeRemaining(timerDuration);
    timerExpiredRef.current = false;
  }, [currentItem, timerDuration]);

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

  const finalizeTalismans = useCallback(
    (nextCorrect: number, nextAttempts: number) => {
      const talismans: QuickPracticeTalisman[] = [];
      if (perfectEligibleRef.current && nextCorrect > 0 && nextCorrect === nextAttempts) {
        talismans.push(TALISMAN_LIBRARY.perfect);
      }
      if (bestStreakRef.current >= STREAK_TALISMAN_THRESHOLD) {
        talismans.push(TALISMAN_LIBRARY.streak);
      }
      setActiveTalismans(talismans);
      const multiplier = talismans.reduce((acc, talisman) => acc * talisman.xpMultiplier, 1);
      setTalismanMultiplier(multiplier);
      if (talismans.length > 0) {
        const bonusXp = Math.round(10 * (multiplier - 1));
        if (bonusXp > 0) {
          scheduleProgressUpdate({ xp: xp + bonusXp });
        }
      }
    },
    [scheduleProgressUpdate, xp]
  );

  const applyAttempt = useCallback(
    (result: 'correct' | 'incorrect') => {
      const nextTotalAttempts = totalAttemptsRef.current + 1;
      totalAttemptsRef.current = nextTotalAttempts;
      setTotalAttempts(nextTotalAttempts);

      if (result === 'correct') {
        const nextCorrectCount = Math.min(correctCountRef.current + 1, SESSION_TARGET);
        correctCountRef.current = nextCorrectCount;
        setCorrectCount(nextCorrectCount);
        setCurrentStreak((prev) => {
          const next = prev + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
        const xpGain = Math.round(10 * difficultyPreset.xpMultiplier);
        scheduleProgressUpdate({ xp: xp + xpGain, streak: streak + 1 });
        if (nextCorrectCount === SESSION_TARGET) {
          const computedAccuracy = Math.round((nextCorrectCount / nextTotalAttempts) * 100);
          finalizeTalismans(nextCorrectCount, nextTotalAttempts);
          setShowCompletionModal(true);
          trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
            direction,
            category: category === ALL_CATEGORIES ? 'all' : category,
            drillMode: practiceMode,
            correctCount: nextCorrectCount,
            totalAttempts: nextTotalAttempts,
            accuracy: computedAccuracy,
            difficulty,
          });
        }
      } else {
        setCurrentStreak(0);
        setPerfectEligible(false);
        const xpGain = Math.max(2, Math.round(4 * difficultyPreset.xpMultiplier));
        scheduleProgressUpdate({ xp: xp + xpGain });
        setHearts((prev) => {
          const next = Math.max(prev - difficultyPreset.heartPenalty, 0);
          if (next === 0) {
            setShowGameOverModal(true);
            trackEvent(AnalyticsEvents.PRACTICE_GAME_OVER, {
              direction,
              category: category === ALL_CATEGORIES ? 'all' : category,
              drillMode: practiceMode,
              correctCount: correctCountRef.current,
              totalAttempts: nextTotalAttempts,
              difficulty,
            });
          }
          return next;
        });
      }
    },
    [
      category,
      difficulty,
      difficultyPreset.heartPenalty,
      difficultyPreset.xpMultiplier,
      direction,
      finalizeTalismans,
      practiceMode,
      scheduleProgressUpdate,
      streak,
      xp,
    ]
  );

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
    if (timerDuration) {
      setTimeRemaining(timerDuration);
      timerExpiredRef.current = false;
    }
  };

  const handleReveal = () => {
    if (!currentItem) return;
    const expectedAnswer = getExpectedAnswer(currentItem, direction);
    if (!expectedAnswer) return;
    setFeedback(null);
    setIsCelebrating(false);
    setRevealedAnswer(expectedAnswer);
  };

  useEffect(() => {
    if (!timerDuration || timeRemaining === null) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    if (showCompletionModal || showGameOverModal || !currentItem) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }
    if (timeRemaining <= 0) {
      if (!timerExpiredRef.current) {
        timerExpiredRef.current = true;
        applyAttempt('incorrect');
        const expectedAnswer = getExpectedAnswer(currentItem, direction);
        if (expectedAnswer) {
          setRevealedAnswer(expectedAnswer);
        }
        setFeedback('incorrect');
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        return Math.max(prev - 1, 0);
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [
    applyAttempt,
    currentItem,
    direction,
    showCompletionModal,
    showGameOverModal,
    timeRemaining,
    timerDuration,
  ]);

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
    setCurrentStreak(0);
    setBestStreak(0);
    setPerfectEligible(true);
    setActiveTalismans([]);
    setTalismanMultiplier(1);
    totalAttemptsRef.current = 0;
    correctCountRef.current = 0;
    if (timerDuration) {
      setTimeRemaining(timerDuration);
      timerExpiredRef.current = false;
    } else {
      setTimeRemaining(null);
    }
    trackEvent(AnalyticsEvents.PRACTICE_SESSION_NEW, {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
    });
  };

  const handleContinue = () => {
    setShowCompletionModal(false);
    setActiveTalismans([]);
    setTalismanMultiplier(1);
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
      setIsSubmitting(false);
      return;
    }
    const { isCorrect, expectedAnswer } = evaluation;
    const analyticsPayload = {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
      difficulty,
    };

    try {
      applyAttempt(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect) {
        setFeedback('correct');
        setRevealedAnswer('');
        setIsCelebrating(true);
        if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = setTimeout(() => setIsCelebrating(false), 1200);
        trackEvent(AnalyticsEvents.PRACTICE_ANSWER_CORRECT, analyticsPayload);
        if (isClozeMode) {
          trackEvent(AnalyticsEvents.PRACTICE_CLOZE_ANSWER_CORRECT, analyticsPayload);
        }
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = setTimeout(handleNext, 1500);
      } else {
        setFeedback('incorrect');
        setRevealedAnswer(expectedAnswer);
        setIsCelebrating(false);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
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
    difficulty,
    setDifficulty,
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
    timeRemaining,
    activeTalismans,
    talismanMultiplier,
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
