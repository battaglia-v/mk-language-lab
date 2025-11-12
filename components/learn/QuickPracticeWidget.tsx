'use client';

import { Fragment, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, Eye, Sparkles, PlayCircle, X, Trophy, TrendingUp, MoreVertical, Heart, Check, XCircle, Flame, Zap, Shield, EllipsisVertical, ChevronDown } from 'lucide-react';
import practicePrompts from '@/data/practice-vocabulary.json';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { splitClozeSentence } from '@/lib/cloze';
import { useGameProgress } from '@/hooks/useGameProgress';

const ALL_CATEGORIES = 'all';
const SESSION_TARGET = 5;

type ClozeContext = {
  sentence: string;
  translation: string;
};

type PracticeItem = {
  macedonian: string;
  english: string;
  englishAlternates?: string[];  // Optional array of alternate English translations
  macedonianAlternates?: string[];  // Optional array of alternate Macedonian translations
  category?: string;
  contextMk?: ClozeContext;
  contextEn?: ClozeContext;
};

type PracticeDirection = 'mkToEn' | 'enToMk';
type PracticeDrillMode = 'flashcard' | 'cloze';

type Level = 'beginner' | 'intermediate' | 'advanced';

type QuickPracticeWidgetProps = {
  title?: string;
  description?: string;
  className?: string;
  layout?: 'default' | 'compact';
};

const PRACTICE_ITEMS = practicePrompts as PracticeItem[];

const CONFETTI_STYLES = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100%) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .confetti {
    position: absolute;
    width: 8px;
    height: 8px;
    animation: confetti-fall 3s linear infinite;
    opacity: 0;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;

const getLevelInfo = (level: Level) => {
  const levelConfig = {
    beginner: {
      label: 'Beginner',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      nextThreshold: 200,
    },
    intermediate: {
      label: 'Intermediate',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      nextThreshold: 500,
    },
    advanced: {
      label: 'Advanced',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      nextThreshold: null,
    },
  };
  return levelConfig[level];
};

const formatCategory = (category?: string) => {
  if (!category) return '';
  return category
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeAnswer = (value: string) =>
  value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and their contents (e.g., "(informal)")
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim(); // Trim again after removing parentheses

export function QuickPracticeWidget({
  title,
  description,
  className,
  layout = 'default',
}: QuickPracticeWidgetProps) {
  const t = useTranslations('learn');
  const categories = useMemo(() => {
    const unique = new Set<string>();
    PRACTICE_ITEMS.forEach((item) => {
      if (item.category) {
        unique.add(item.category);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, []);

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [isShaking, setIsShaking] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const isOverlayActive = showCompletionModal || showGameOverModal;
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  // Use custom hook for game progress (database-backed with localStorage fallback)
  const { streak, xp, level, updateProgress } = useGameProgress();

  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with random index after mount to avoid hydration mismatch
  useEffect(() => {
    if (PRACTICE_ITEMS.length && !isInitialized) {
      setCurrentIndex(Math.floor(Math.random() * PRACTICE_ITEMS.length));
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const filteredItems = useMemo(() => {
    if (category === ALL_CATEGORIES) {
      return PRACTICE_ITEMS;
    }
    return PRACTICE_ITEMS.filter((item) => item.category === category);
  }, [category]);

  const isClozeMode = practiceMode === 'cloze';

  const practiceItems = useMemo(() => {
    if (!isClozeMode) {
      return filteredItems;
    }
    return filteredItems.filter((item) => {
      const context = direction === 'enToMk' ? item.contextMk : item.contextEn;
      return Boolean(context?.sentence && context.sentence.includes('{{blank}}'));
    });
  }, [filteredItems, direction, isClozeMode]);

  const hasAvailablePrompts = practiceItems.length > 0;

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

    setCurrentIndex(Math.floor(Math.random() * practiceItems.length));
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setTotalAttempts(0);
    setCorrectCount(0);
    setIsCelebrating(false);
  }, [practiceItems]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setIsCelebrating(false);
  }, [direction, practiceMode]);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const currentItem =
    currentIndex >= 0 && currentIndex < practiceItems.length ? practiceItems[currentIndex] : undefined;

  const clozeContext = currentItem
    ? direction === 'enToMk'
      ? currentItem.contextMk
      : currentItem.contextEn
    : undefined;
  const promptLabel = isClozeMode
    ? t('practiceClozePromptLabel')
    : direction === 'mkToEn'
      ? t('practicePromptLabelMk')
      : t('practicePromptLabelEn');
  const placeholder = isClozeMode
    ? t('practiceClozePlaceholder')
    : direction === 'mkToEn'
      ? t('practicePlaceholderMk')
      : t('practicePlaceholderEn');
  const expectedAnswer = currentItem
    ? direction === 'mkToEn'
      ? currentItem.english
      : currentItem.macedonian
    : '';
  const promptContent: ReactNode = (() => {
    if (!currentItem) {
      return '—';
    }
    if (isClozeMode && clozeContext) {
      const { segments, hasBlank } = splitClozeSentence(clozeContext.sentence);
      if (!hasBlank) {
        return clozeContext.sentence;
      }
      return segments.reduce<ReactNode[]>((acc, segment, index) => {
        if (segment) {
          acc.push(
            <span key={`segment-${index}`} className="whitespace-pre-wrap">
              {segment}
            </span>
          );
        }
        if (index < segments.length - 1) {
          acc.push(
            <span
              key={`blank-${index}`}
              className="mx-1 inline-flex min-w-[72px] justify-center rounded-full border border-dashed border-border/60 bg-muted px-3 py-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              ______
            </span>
          );
        }
        return acc;
      }, []);
    }
    return direction === 'mkToEn' ? currentItem.macedonian : currentItem.english;
  })();
  const clozeTranslation = isClozeMode ? clozeContext?.translation : null;
  const categoryLabel = currentItem?.category
    ? `${t('practiceCategoryLabel')}: ${formatCategory(currentItem.category)}`
    : t('practiceAllCategories');

  const handleCheck = async () => {
    if (!currentItem || !answer.trim() || isSubmitting) {
      return;
    }

    // Prevent double-clicks by setting submitting state
    setIsSubmitting(true);

    try {
      const normalizedAnswer = normalizeAnswer(answer);
      const normalizedExpected = normalizeAnswer(expectedAnswer);

      // Build array of all valid answers (primary + alternates)
      const validAnswers = [normalizedExpected];
      if (direction === 'mkToEn' && currentItem.englishAlternates) {
        validAnswers.push(...currentItem.englishAlternates.map(normalizeAnswer));
      } else if (direction === 'enToMk' && currentItem.macedonianAlternates) {
        validAnswers.push(...currentItem.macedonianAlternates.map(normalizeAnswer));
      }
      const analyticsPayload = {
        direction,
        category: category === ALL_CATEGORIES ? 'all' : category,
        drillMode: practiceMode,
      };

      // ✅ ALWAYS increment total attempts for ALL answer submissions
      const newTotalAttempts = totalAttempts + 1;
      setTotalAttempts(newTotalAttempts);

      // Check if answer matches any valid option
      if (validAnswers.some(valid => normalizedAnswer === valid)) {
      // Increment correct count
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      setFeedback('correct');
      setRevealedAnswer('');
      setIsCelebrating(true);
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => setIsCelebrating(false), 1200);

      // Award XP and update streak for correct answer (database-backed)
      void updateProgress({ xp: xp + 10, streak: streak + 1 }).catch(() => undefined);

      // Track correct answer
      trackEvent(AnalyticsEvents.PRACTICE_ANSWER_CORRECT, analyticsPayload);
      if (isClozeMode) {
        trackEvent(AnalyticsEvents.PRACTICE_CLOZE_ANSWER_CORRECT, analyticsPayload);
      }

      // Check for session completion (5 correct answers)
      if (newCorrectCount === SESSION_TARGET) {
        setShowCompletionModal(true);
        trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
          ...analyticsPayload,
          correctCount: newCorrectCount,
          totalAttempts: newTotalAttempts,
          accuracy: Math.round((newCorrectCount / newTotalAttempts) * 100),
        });
      }

      // Auto-advance to next prompt after showing success feedback
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      setFeedback('incorrect');
      setRevealedAnswer(expectedAnswer);
      setIsCelebrating(false);

      // Award participation XP for incorrect answer (database-backed)
      void updateProgress({ xp: xp + 5 }).catch(() => undefined);

      // Decrease hearts and trigger shake animation
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Check for game over
      if (newHearts === 0) {
        setShowGameOverModal(true);
        trackEvent(AnalyticsEvents.PRACTICE_GAME_OVER, {
          ...analyticsPayload,
          correctCount,
          totalAttempts: newTotalAttempts,
        });
      }

      // Track incorrect answer
      trackEvent(AnalyticsEvents.PRACTICE_ANSWER_INCORRECT, analyticsPayload);
      if (isClozeMode) {
        trackEvent(AnalyticsEvents.PRACTICE_CLOZE_ANSWER_INCORRECT, analyticsPayload);
      }

      // Clear any pending auto-advance if answer was incorrect
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    }
    } finally {
      // Always reset submitting state to allow next submission
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (practiceItems.length === 0) {
      return;
    }

    if (practiceItems.length === 1) {
      setAnswer('');
      setFeedback(null);
      setRevealedAnswer('');
      return;
    }

    let nextIndex = currentIndex;
    const maxAttempts = practiceItems.length * 2;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const candidateIndex = Math.floor(Math.random() * practiceItems.length);
      if (candidateIndex !== currentIndex) {
        nextIndex = candidateIndex;
        break;
      }
    }

    setCurrentIndex(nextIndex);
    setAnswer('');
    setFeedback(null);
    setIsCelebrating(false);
    setRevealedAnswer('');
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
    setHearts(5);
    trackEvent(AnalyticsEvents.PRACTICE_SESSION_NEW, {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
    });
  };

  const handleContinuePracticing = () => {
    setShowCompletionModal(false);
    trackEvent(AnalyticsEvents.PRACTICE_SESSION_CONTINUE, {
      direction,
      category: category === ALL_CATEGORIES ? 'all' : category,
      drillMode: practiceMode,
    });
  };

  const handleReveal = () => {
    if (!currentItem) {
      return;
    }
    setFeedback(null);
    setIsCelebrating(false);
    setRevealedAnswer(expectedAnswer);
  };

  const isReady = Boolean(currentItem);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleCheck();
  };

  const handleInstantSubmit = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'touch' || isPrimaryDisabled) {
      return;
    }
    event.preventDefault();
    void handleCheck();
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isPrimaryDisabled) {
      return;
    }
    event.preventDefault();
    void handleCheck();
  };

  // Helper function to get accuracy badge color and label
  const getAccuracyBadge = (accuracyValue: number) => {
    if (accuracyValue >= 90) {
      return {
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        label: t('practiceAccuracyExcellent'),
      };
    } else if (accuracyValue >= 70) {
      return {
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        label: t('practiceAccuracyGood'),
      };
    } else {
      return {
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        label: t('practiceAccuracyNeedsWork'),
      };
    }
  };

  // Progress based on correct answers (5 correct = 100%)
  const sessionProgress = Math.min(100, Math.round((correctCount / SESSION_TARGET) * 100));
  // ✅ Accuracy now calculated correctly using total attempts
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const summarySubtitle = description ?? t('quickPracticeDescription');
  const isPrimaryDisabled = !isReady || !answer.trim() || isSubmitting;

  const renderPracticeCard = (variant: 'default' | 'modal', extraClassName?: string) => {
    const isModalVariant = variant === 'modal';

    return (
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-500',
          isModalVariant ? 'border border-border/40 rounded-2xl bg-gradient-to-br from-card/85 via-card/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl shadow-2xl' : 'flex-1 flex flex-col',
          extraClassName
        )}
      >
        {isCelebrating && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/0 opacity-90 animate-pulse"
            aria-hidden="true"
          />
        )}
        <span className="sr-only" aria-live="polite">
          {t('practiceProgressSummary', { count: totalAttempts })}
        </span>
        <span className="sr-only" aria-live="polite">
          {t('practiceProgressSummary', { count: correctCount })}
        </span>
        <div className={cn('space-y-2 md:space-y-4', isModalVariant ? 'px-6 py-4 md:px-10 md:py-8 lg:px-12' : 'py-3 md:py-4')}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className={cn('text-lg font-semibold text-foreground md:text-2xl', isModalVariant && 'md:text-3xl')}>
                {title ?? t('quickPractice')}
              </h2>
              <p className={cn('hidden md:block text-sm text-muted-foreground', isModalVariant && 'md:text-base')}>
                {summarySubtitle}
              </p>
            </div>
            {/* Mobile: Duolingo-style minimal header - only Streak + Hearts when keyboard open */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Streak Display */}
              <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 border border-orange-500/20">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{streak}</span>
              </div>
              {/* Hearts Display - always visible like Duolingo */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'h-4 w-4 transition-all duration-200',
                      i < hearts
                        ? 'fill-[var(--brand-red)] text-[var(--brand-red)]'
                        : 'fill-muted text-muted'
                    )}
                  />
                ))}
              </div>
              {/* Settings icon only when keyboard closed */}
              {!isInputFocused && (
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors ml-auto"
                  aria-label="Toggle settings"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {/* Desktop: All badges in horizontal layout */}
            <div className="hidden md:flex items-center gap-2">
              {/* Streak Display */}
              <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 border border-orange-500/20">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{streak}</span>
              </div>
              {/* Level Display */}
              {(() => {
                const levelInfo = getLevelInfo(level);
                return (
                  <div className={cn("flex items-center gap-1 rounded-full px-2 py-1 border", levelInfo.bgColor, levelInfo.borderColor)}>
                    <Shield className={cn("h-4 w-4", levelInfo.color)} />
                    <span className={cn("text-xs font-bold", levelInfo.color)}>{levelInfo.label}</span>
                  </div>
                );
              })()}
              {/* XP Display */}
              <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 border border-yellow-500/20">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-600">{xp}</span>
              </div>
              {/* Hearts Display */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      i < hearts
                        ? 'fill-[var(--brand-red)] text-[var(--brand-red)]'
                        : 'fill-muted text-muted'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Mobile: Secondary stats shown only when keyboard closed */}
          {!isInputFocused && (
            <div className="md:hidden flex items-center gap-2">
              {/* Level Badge */}
              {(() => {
                const levelInfo = getLevelInfo(level);
                return (
                  <div className={cn("flex items-center gap-1 rounded-full px-2 py-1 border text-xs", levelInfo.bgColor, levelInfo.borderColor)}>
                    <Shield className={cn("h-3.5 w-3.5", levelInfo.color)} />
                    <span className={cn("font-bold", levelInfo.color)}>{levelInfo.label}</span>
                  </div>
                );
              })()}
              {/* XP Badge */}
              <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 border border-yellow-500/20">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-600">{xp} XP</span>
              </div>
            </div>
          )}
          {/* Mobile: Compact inline progress - hidden when keyboard is visible */}
          {!isInputFocused && (
            <div className="flex md:hidden items-center gap-2 text-xs">
              <span className="sr-only">
                {t('practiceProgressSummary', { count: totalAttempts })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
                {correctCount}/{SESSION_TARGET}
              </span>
              {totalAttempts > 0 && (
                <>
                  <span className="sr-only">
                    {t('practiceAccuracy', { value: accuracy })}
                  </span>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold', getAccuracyBadge(accuracy).color)}>
                    <TrendingUp className="h-3 w-3" />
                    {accuracy}%
                  </span>
                </>
              )}
            </div>
          )}

          {/* Desktop: Full progress section - hidden when keyboard is visible on mobile */}
          {!isInputFocused && (
            <div
              className="hidden md:block rounded-2xl border border-border/30 bg-background/60 p-3 md:p-4 shadow-inner"
              aria-hidden={isOverlayActive || undefined}
            >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{t('practiceProgressLabel')}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {t('practiceProgressCount', { current: correctCount, target: SESSION_TARGET })}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/40">
              <div
                role="progressbar"
                aria-valuenow={sessionProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${sessionProgress}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">{t('practiceProgressSummary', { count: totalAttempts })}</span>
              {totalAttempts > 0 && (
                <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold', getAccuracyBadge(accuracy).color)}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('practiceAccuracy', { value: accuracy })} • {getAccuracyBadge(accuracy).label}
                </span>
              )}
            </div>
          </div>
          )}
        </div>
        <div className={cn('flex-1 flex flex-col space-y-2 md:space-y-4', isModalVariant ? 'px-6 pb-6 md:px-10 md:pb-10 lg:px-12' : 'pb-4 md:pb-6')}>
          {/* Settings panel - hidden on mobile when keyboard is visible */}
          {!isInputFocused && (
            <div
              className={cn(
                'flex gap-2 md:gap-4',
                isModalVariant ? 'flex-col lg:flex-row lg:items-end lg:gap-6' : 'flex-col sm:flex-row sm:items-end',
                !showSettings && 'hidden md:flex'
              )}
            >
            <div className={cn('space-y-1.5', isModalVariant ? 'w-full lg:flex-1' : 'flex-1')}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceFilterLabel')}
              </span>
              <div className="relative">
                <button
                  ref={categoryButtonRef}
                  type="button"
                  role="combobox"
                  aria-label={t('practiceFilterLabel')}
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryMenuOpen}
                  aria-controls="practice-category-options"
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm font-medium text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    isModalVariant && 'md:h-12 md:text-base',
                    isCategoryMenuOpen && 'ring-2 ring-ring/50'
                  )}
                  onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                >
                  <span className="truncate">
                    {category === ALL_CATEGORIES ? t('practiceAllCategories') : formatCategory(category)}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isCategoryMenuOpen && 'rotate-180')} />
                </button>
                {isCategoryMenuOpen && (
                  <div
                    ref={categoryMenuRef}
                    id="practice-category-options"
                    role="listbox"
                    className="absolute z-20 mt-2 w-full rounded-md border border-border/40 bg-background/95 p-1 shadow-lg"
                  >
                    {[ALL_CATEGORIES, ...categories].map((cat) => {
                      const isSelected = category === cat;
                      return (
                        <button
                          key={cat || 'all'}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={cn(
                            'flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-left text-sm',
                            isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
                          )}
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryMenuOpen(false);
                          }}
                        >
                          <span>{cat === ALL_CATEGORIES ? t('practiceAllCategories') : formatCategory(cat)}</span>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className={cn('space-y-1.5', isModalVariant ? 'w-full lg:w-auto' : 'sm:w-auto')}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceModeLabel')}
              </span>
              <div
                className={cn(
                  'flex rounded-xl border border-border/60 bg-background/60 p-1',
                  isModalVariant ? 'flex-col gap-3 lg:flex-row' : 'w-full sm:w-max'
                )}
              >
                <Button
                  type="button"
                  size="sm"
                  variant={direction === 'mkToEn' ? 'default' : 'outline'}
                  onClick={() => setDirection('mkToEn')}
                  aria-pressed={direction === 'mkToEn'}
                  className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
                >
                  {t('practiceModeMkToEn')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={direction === 'enToMk' ? 'default' : 'outline'}
                  onClick={() => setDirection('enToMk')}
                  aria-pressed={direction === 'enToMk'}
                  className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
                >
                  {t('practiceModeEnToMk')}
                </Button>
              </div>
            </div>
            <div className={cn('space-y-1.5', isModalVariant ? 'w-full lg:w-auto' : 'sm:w-auto')}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceDrillModeLabel')}
              </span>
              <div
                className={cn(
                  'flex rounded-xl border border-border/60 bg-background/60 p-1',
                  isModalVariant ? 'flex-col gap-3 lg:flex-row' : 'w-full sm:w-max'
                )}
              >
                <Button
                  type="button"
                  size="sm"
                  variant={practiceMode === 'flashcard' ? 'default' : 'outline'}
                  onClick={() => setPracticeMode('flashcard')}
                  aria-pressed={practiceMode === 'flashcard'}
                  className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
                >
                  {t('practiceDrillModeFlashcard')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={practiceMode === 'cloze' ? 'default' : 'outline'}
                  onClick={() => setPracticeMode('cloze')}
                  aria-pressed={practiceMode === 'cloze'}
                  className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
                >
                  {t('practiceDrillModeCloze')}
                </Button>
              </div>
            </div>
            </div>
          )}

          {/* Prompt section - Duolingo-style speech bubble */}
          <div className={cn(
            'relative space-y-2 rounded-2xl bg-white dark:bg-slate-800 p-4 md:p-6 md:rounded-3xl shadow-lg border-2 border-slate-200 dark:border-slate-700',
            isInputFocused && 'sticky top-0 z-20 shadow-xl md:shadow-lg md:static p-3 md:p-6',
            'transition-all duration-200 hover:shadow-xl'
          )}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{promptLabel}</p>
            <p className={cn('break-words font-bold text-slate-900 dark:text-white leading-tight', isModalVariant ? 'text-4xl' : isInputFocused ? 'text-xl' : 'text-2xl md:text-3xl')}>
              {promptContent}
            </p>
            <Badge variant="secondary" className={cn('mt-2 w-fit text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-none', isInputFocused && 'mt-1')}>
              {categoryLabel}
            </Badge>
            {isClozeMode && clozeTranslation ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{t('practiceClozeTranslationLabel')}:</span>{' '}
                {clozeTranslation}
              </p>
            ) : null}
          </div>

          <form
            className={cn(
              'space-y-2 md:space-y-4',
              isInputFocused && 'space-y-1.5 pb-6 md:space-y-4 md:pb-0'
            )}
            onSubmit={handleSubmit}
          >
            <div className="relative">
              <Input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
                  // Add small delay to prevent interfering with button clicks
                  setTimeout(() => setIsInputFocused(false), 100);
                }}
                placeholder={placeholder}
                className={cn(
                  'rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                  'focus:border-[var(--brand-green)] focus:ring-4 focus:ring-[color:rgb(47_191_113_/_0.25)] transition-all duration-200',
                  'font-medium placeholder:text-slate-400',
                  isModalVariant ? 'h-14 text-xl' : isInputFocused ? 'h-11 text-base' : 'h-12 text-base md:h-14 md:text-lg',
                  'pr-10'
                )}
                aria-label={placeholder}
                disabled={!isReady}
              />
              {/* Mobile: Skip button as icon in input */}
              <button
                type="button"
                onClick={handleNext}
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
                disabled={!practiceItems.length}
                aria-label={t('practiceSkipPrompt')}
              >
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Mobile: Duolingo-style chunky check button */}
            <div className="md:hidden flex flex-col gap-3">
              <Button
                type="button"
                size="lg"
                className={cn(
                  'w-full text-base font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200',
                  isInputFocused ? 'h-11' : 'h-14',
                  'bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white border-b-4 border-[var(--brand-green-dark)] active:border-b-0 active:mt-1',
                  'rounded-2xl hover:-translate-y-0.5 active:translate-y-0',
                  'disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 disabled:hover:translate-y-0'
                )}
                disabled={isPrimaryDisabled}
                onPointerDown={handleInstantSubmit}
                onClick={handleButtonClick}
              >
                {t('checkAnswer')}
              </Button>
              {!isInputFocused && (
                <div className="flex justify-end">
                  <DropdownMenu open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-full border border-border/50"
                        aria-label={t('practiceMoreActions')}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-sm">
                    <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('practiceDrillModeLabel')}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        setPracticeMode('flashcard');
                      }}
                    >
                      <span className="flex-1">{t('practiceDrillModeFlashcard')}</span>
                      {practiceMode === 'flashcard' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        setPracticeMode('cloze');
                      }}
                    >
                      <span className="flex-1">{t('practiceDrillModeCloze')}</span>
                      {practiceMode === 'cloze' && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleReveal();
                      }}
                        disabled={!isReady}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        {t('practiceRevealAnswer')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          handleReset();
                        }}
                      >
                        <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                        {t('practiceReset')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Desktop: Full 4-button grid */}
            <div className="hidden md:grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={handleCheck}
                size={isModalVariant ? 'lg' : 'default'}
                className={cn(
                  'w-full gap-2 font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200',
                  'bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white border-b-4 border-[var(--brand-green-dark)] active:border-b-0',
                  'rounded-2xl hover:-translate-y-0.5 active:translate-y-0 h-12',
                  'disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 disabled:hover:translate-y-0'
                )}
                disabled={!isReady || !answer.trim() || isSubmitting}
              >
                {t('checkAnswer')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size={isModalVariant ? 'lg' : 'default'}
                onClick={handleNext}
                className="w-full gap-2"
                disabled={!practiceItems.length}
              >
                <RefreshCcw className="h-4 w-4" />
                {t('nextPrompt')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size={isModalVariant ? 'lg' : 'default'}
                onClick={handleReveal}
                className="w-full gap-2"
                disabled={!isReady}
              >
                <Eye className="h-4 w-4" />
                {t('practiceRevealAnswer')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size={isModalVariant ? 'lg' : 'default'}
                onClick={handleReset}
                className="w-full gap-2"
                disabled={!isReady && !answer}
              >
                {t('practiceReset')}
              </Button>
            </div>
          </form>

          {feedback && isReady ? (
            <div
              className={cn(
                'rounded-2xl px-5 py-4 font-bold text-lg flex items-center gap-3 shadow-lg border-2',
                feedback === 'correct'
                  ? 'bg-[var(--brand-mint)] dark:bg-[var(--brand-green)] border-[var(--brand-green)] text-[var(--brand-green-dark)] dark:text-white'
                  : 'bg-[var(--brand-rose)] dark:bg-[var(--brand-red)] border-[var(--brand-red)] text-[var(--brand-red)] dark:text-white',
                isShaking && feedback === 'incorrect' && 'animate-shake'
              )}
            >
              {feedback === 'correct' ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-green)] dark:bg-white flex-shrink-0">
                    <Check className="h-5 w-5 text-white dark:text-[var(--brand-green)]" />
                  </div>
                  <span>{t('correctAnswer')}</span>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-red)] dark:bg-white flex-shrink-0">
                    <XCircle className="h-5 w-5 text-white dark:text-[var(--brand-red)]" />
                  </div>
                  <span>{t('incorrectAnswer', { answer: revealedAnswer })}</span>
                </>
              )}
            </div>
          ) : null}

          {!feedback && revealedAnswer ? (
            <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {t('practiceAnswerRevealed', { answer: revealedAnswer })}
            </div>
          ) : null}

          {!hasAvailablePrompts && (
            <p className="text-sm text-muted-foreground">
              {isClozeMode ? t('practiceClozeUnavailable') : t('practiceEmptyCategory')}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Track when modal is opened (only for compact layout)
  useEffect(() => {
    if (layout === 'compact' && isModalOpen) {
      trackEvent(AnalyticsEvents.PRACTICE_MODAL_OPENED, {
        direction,
        category: category === ALL_CATEGORIES ? 'all' : category,
        drillMode: practiceMode,
      });
    }
  }, [isModalOpen, direction, category, layout, practiceMode]);

  // Track when completion modal is viewed
  useEffect(() => {
    if (showCompletionModal) {
      trackEvent(AnalyticsEvents.PRACTICE_COMPLETION_MODAL_VIEWED, {
        direction,
        category: category === ALL_CATEGORIES ? 'all' : category,
        drillMode: practiceMode,
        correctCount,
        totalAttempts,
        accuracy,
      });
    }
  }, [showCompletionModal, direction, category, correctCount, totalAttempts, accuracy, practiceMode]);

  useEffect(() => {
    if (!isCategoryMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategoryMenuOpen]);

  if (layout !== 'compact') {
    return (
      <>
        {renderPracticeCard('default', className)}
        {/* Session Completion Modal */}
        <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
          <DialogContent className="max-w-md">
            {/* Confetti Effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
              <div className="confetti-container">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      backgroundColor: ['#2fbf71', '#f7c948', '#d7263d', '#4c1d95', '#0ea5e9'][Math.floor(Math.random() * 5)],
                    }}
                  />
                ))}
              </div>
            </div>

            <DialogHeader className="relative z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-center text-2xl">
                {t('practiceSessionCompleteTitle')}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t('practiceSessionCompleteMessage', { target: SESSION_TARGET })}
              </DialogDescription>
            </DialogHeader>

            <div className="relative z-10 space-y-4 py-4">
              <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('practiceSessionCompleteStats')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteCorrect')}</span>
                    <span className="text-lg font-bold text-primary">{correctCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteTotalAttempts')}</span>
                    <span className="text-lg font-bold">{totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteAccuracy')}</span>
                    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', getAccuracyBadge(accuracy).color)}>
                      {accuracy}% • {getAccuracyBadge(accuracy).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-1 pb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
                <div
                  role="progressbar"
                  aria-valuenow={sessionProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${sessionProgress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {t('practiceProgressSummary', { count: totalAttempts })}
              </p>
            </div>

            <DialogFooter className="relative z-10 flex-col gap-2 sm:flex-col">
              <Button onClick={handleReset} size="lg" className="w-full gap-2">
                <RefreshCcw className="h-4 w-4" />
                {t('practiceStartNewSession')}
              </Button>
              <Button onClick={handleContinuePracticing} variant="outline" size="lg" className="w-full">
                {t('practiceContinuePracticing')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Game Over Modal */}
        <Dialog open={showGameOverModal} onOpenChange={setShowGameOverModal}>
          <DialogContent className="max-w-md">
            <DialogHeader className="relative z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(215,38,61,0.2)] to-[rgba(215,38,61,0.1)]">
                <Heart className="h-8 w-8 text-[var(--brand-red)]" />
              </div>
              <DialogTitle className="text-center text-2xl">
                {t('practiceGameOverTitle') || 'Out of Hearts!'}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t('practiceGameOverMessage') || 'You ran out of hearts. Review your mistakes and try again!'}
              </DialogDescription>
            </DialogHeader>

            <div className="relative z-10 space-y-4 py-4">
              <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('practiceSessionCompleteStats') || 'Session Stats'}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteCorrect') || 'Correct'}</span>
                    <span className="text-lg font-bold text-primary">{correctCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteTotalAttempts') || 'Total Attempts'}</span>
                    <span className="text-lg font-bold">{totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteAccuracy') || 'Accuracy'}</span>
                    <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', getAccuracyBadge(accuracy).color)}>
                      {accuracy}% • {getAccuracyBadge(accuracy).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="relative z-10 flex-col gap-2 sm:flex-col">
              <Button onClick={handleReset} size="lg" className="w-full gap-2">
                <RefreshCcw className="h-4 w-4" />
                {t('practiceTryAgain') || 'Try Again'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card
        className={cn(
          'relative h-full overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-background/40 to-secondary/10 p-6 transition-all duration-300',
          className
        )}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground md:text-2xl">
              {title ?? t('quickPractice')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('quickPracticeLaunchDescription')}
            </p>
          </div>

          {/* Mode Selector - visible before opening modal */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceModeLabel')}
            </span>
            <div className="flex w-full gap-2 rounded-xl border border-border/60 bg-background/60 p-1">
              <Button
                type="button"
                size="sm"
                variant={direction === 'mkToEn' ? 'default' : 'ghost'}
                onClick={() => setDirection('mkToEn')}
                className="flex-1"
              >
                {t('practiceModeMkToEn')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={direction === 'enToMk' ? 'default' : 'ghost'}
                onClick={() => setDirection('enToMk')}
                className="flex-1"
              >
                {t('practiceModeEnToMk')}
              </Button>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t('practiceProgressSummary', { count: totalAttempts })}</span>
            </div>
            {totalAttempts > 0 && (
              <span className="text-primary font-medium">
                {Math.round((correctCount / totalAttempts) * 100)}% {t('practiceAccuracy', { value: '' }).split(':')[0]}
              </span>
            )}
          </div>

          {/* Launch Button */}
          <DialogTrigger asChild>
            <Button type="button" size="lg" className="w-full btn-glow gap-3">
              <PlayCircle className="h-5 w-5" />
              {t('quickPracticeLaunch')}
            </Button>
          </DialogTrigger>
        </div>
      </Card>
      <DialogContent
        showCloseButton={false}
        className="h-[85vh] md:h-[90vh] max-h-[680px] md:max-h-[760px] w-[min(96vw,900px)] max-w-none border border-border/40 bg-background/95 p-0 shadow-2xl"
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceModalTitle')}
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                {title ?? t('quickPractice')}
              </h3>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={t('practiceClose')}
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
            {renderPracticeCard('modal')}
          </div>
        </div>
      </DialogContent>

      {/* Session Completion Modal */}
        <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-md">
          {/* Confetti Effect */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <div className="confetti-container">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#2fbf71', '#f7c948', '#d7263d', '#4c1d95', '#0ea5e9'][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>
          </div>

          <DialogHeader className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">
              {t('practiceSessionCompleteTitle')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('practiceSessionCompleteMessage', { target: SESSION_TARGET })}
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 space-y-4 py-4">
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceSessionCompleteStats')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteCorrect')}</span>
                  <span className="text-lg font-bold text-primary">{correctCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteTotalAttempts')}</span>
                  <span className="text-lg font-bold">{totalAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteAccuracy')}</span>
                  <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', getAccuracyBadge(accuracy).color)}>
                    {accuracy}% • {getAccuracyBadge(accuracy).label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="relative z-10 flex-col gap-2 sm:flex-col">
            <Button onClick={handleReset} size="lg" className="w-full gap-2">
              <RefreshCcw className="h-4 w-4" />
              {t('practiceStartNewSession')}
            </Button>
            <Button onClick={handleContinuePracticing} variant="outline" size="lg" className="w-full">
              {t('practiceContinuePracticing')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Over Modal */}
      <Dialog open={showGameOverModal} onOpenChange={setShowGameOverModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="relative z-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(215,38,61,0.2)] to-[rgba(215,38,61,0.1)]">
              <Heart className="h-8 w-8 text-[var(--brand-red)]" />
            </div>
            <DialogTitle className="text-center text-2xl">
              {t('practiceGameOverTitle') || 'Out of Hearts!'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('practiceGameOverMessage') || 'You ran out of hearts. Review your mistakes and try again!'}
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 space-y-4 py-4">
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceSessionCompleteStats') || 'Session Stats'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteCorrect') || 'Correct'}</span>
                  <span className="text-lg font-bold text-primary">{correctCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteTotalAttempts') || 'Total Attempts'}</span>
                  <span className="text-lg font-bold">{totalAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('practiceSessionCompleteAccuracy') || 'Accuracy'}</span>
                  <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold', getAccuracyBadge(accuracy).color)}>
                    {accuracy}% • {getAccuracyBadge(accuracy).label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="relative z-10 flex-col gap-2 sm:flex-col">
            <Button onClick={handleReset} size="lg" className="w-full gap-2">
              <RefreshCcw className="h-4 w-4" />
              {t('practiceTryAgain') || 'Try Again'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style
        data-confetti
        dangerouslySetInnerHTML={{ __html: CONFETTI_STYLES }}
      />
    </Dialog>
  );
}
