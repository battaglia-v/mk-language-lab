'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, Eye, Sparkles, PlayCircle, X, Trophy, TrendingUp, Settings, MoreVertical, Heart, Check, XCircle, Flame, Zap, Shield } from 'lucide-react';
import practicePrompts from '@/data/practice-vocabulary.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { useGameProgress } from '@/hooks/useGameProgress';

const ALL_CATEGORIES = 'all';
const SESSION_TARGET = 5;

type PracticeItem = {
  macedonian: string;
  english: string;
  category?: string;
};

type PracticeDirection = 'mkToEn' | 'enToMk';

type Level = 'beginner' | 'intermediate' | 'advanced';

type QuickPracticeWidgetProps = {
  title?: string;
  description?: string;
  className?: string;
  layout?: 'default' | 'compact';
};

const PRACTICE_ITEMS = practicePrompts as PracticeItem[];

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
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ');

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
  const [mode, setMode] = useState<PracticeDirection>('mkToEn');
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

  // Use custom hook for game progress (database-backed with localStorage fallback)
  const { streak, xp, level, updateProgress, isLoading: isProgressLoading } = useGameProgress();

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

  useEffect(() => {
    if (!filteredItems.length) {
      setCurrentIndex(-1);
      setAnswer('');
      setFeedback(null);
      setRevealedAnswer('');
      setTotalAttempts(0);
      setCorrectCount(0);
      setIsCelebrating(false);
      return;
    }

    setCurrentIndex(Math.floor(Math.random() * filteredItems.length));
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setTotalAttempts(0);
    setCorrectCount(0);
    setIsCelebrating(false);
  }, [filteredItems]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setIsCelebrating(false);
  }, [mode]);

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
    currentIndex >= 0 && currentIndex < filteredItems.length ? filteredItems[currentIndex] : undefined;

  const promptLabel = mode === 'mkToEn' ? t('practicePromptLabelMk') : t('practicePromptLabelEn');
  const promptValue = currentItem ? (mode === 'mkToEn' ? currentItem.macedonian : currentItem.english) : '—';
  const placeholder = mode === 'mkToEn' ? t('practicePlaceholderMk') : t('practicePlaceholderEn');
  const expectedAnswer = currentItem
    ? mode === 'mkToEn'
      ? currentItem.english
      : currentItem.macedonian
    : '';
  const categoryLabel = currentItem?.category
    ? `${t('practiceCategoryLabel')}: ${formatCategory(currentItem.category)}`
    : t('practiceAllCategories');

  const handleCheck = async () => {
    if (!currentItem || !answer.trim()) {
      return;
    }

    const normalizedAnswer = normalizeAnswer(answer);
    const normalizedExpected = normalizeAnswer(expectedAnswer);

    // ✅ ALWAYS increment total attempts for ALL answer submissions
    const newTotalAttempts = totalAttempts + 1;
    setTotalAttempts(newTotalAttempts);

    if (normalizedAnswer === normalizedExpected) {
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
      await updateProgress({ xp: xp + 10, streak: streak + 1 });

      // Track correct answer
      trackEvent(AnalyticsEvents.PRACTICE_ANSWER_CORRECT, {
        mode,
        category: category === ALL_CATEGORIES ? 'all' : category,
      });

      // Check for session completion (5 correct answers)
      if (newCorrectCount === SESSION_TARGET) {
        setShowCompletionModal(true);
        trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
          mode,
          category: category === ALL_CATEGORIES ? 'all' : category,
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
      await updateProgress({ xp: xp + 5 });

      // Decrease hearts and trigger shake animation
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Check for game over
      if (newHearts === 0) {
        setShowGameOverModal(true);
        trackEvent(AnalyticsEvents.PRACTICE_GAME_OVER, {
          mode,
          category: category === ALL_CATEGORIES ? 'all' : category,
          correctCount,
          totalAttempts: newTotalAttempts,
        });
      }

      // Track incorrect answer
      trackEvent(AnalyticsEvents.PRACTICE_ANSWER_INCORRECT, {
        mode,
        category: category === ALL_CATEGORIES ? 'all' : category,
      });

      // Clear any pending auto-advance if answer was incorrect
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    }
  };

  const handleNext = () => {
    if (filteredItems.length === 0) {
      return;
    }

    if (filteredItems.length === 1) {
      setAnswer('');
      setFeedback(null);
      setRevealedAnswer('');
      return;
    }

    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * filteredItems.length);
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
      mode,
      category: category === ALL_CATEGORIES ? 'all' : category,
    });
  };

  const handleContinuePracticing = () => {
    setShowCompletionModal(false);
    trackEvent(AnalyticsEvents.PRACTICE_SESSION_CONTINUE, {
      mode,
      category: category === ALL_CATEGORIES ? 'all' : category,
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
    handleCheck();

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
            <div className="flex items-center gap-2">
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
                        ? 'fill-[#ef4444] text-[#ef4444]'
                        : 'fill-muted text-muted'
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                aria-label="Toggle settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Mobile: Compact inline progress */}
          <div className="flex md:hidden items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
              {correctCount}/{SESSION_TARGET}
            </span>
            {totalAttempts > 0 && (
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold', getAccuracyBadge(accuracy).color)}>
                <TrendingUp className="h-3 w-3" />
                {accuracy}%
              </span>
            )}
          </div>

          {/* Desktop: Full progress section */}
          <div className="hidden md:block rounded-2xl border border-border/30 bg-background/60 p-3 md:p-4 shadow-inner">
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
              <span className="text-muted-foreground">{t('practiceProgressSummary', { count: correctCount })}</span>
              {totalAttempts > 0 && (
                <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold', getAccuracyBadge(accuracy).color)}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('practiceAccuracy', { value: accuracy })} • {getAccuracyBadge(accuracy).label}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={cn('flex-1 flex flex-col space-y-2 md:space-y-4', isModalVariant ? 'px-6 pb-6 md:px-10 md:pb-10 lg:px-12' : 'pb-4 md:pb-6')}>
          {/* Settings panel - hidden on mobile unless showSettings is true */}
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  aria-label={t('practiceFilterLabel')}
                  className={cn('w-full h-9', isModalVariant && 'md:h-12 md:text-base')}
                >
                  <SelectValue placeholder={t('practiceAllCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES}>{t('practiceAllCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {formatCategory(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  variant={mode === 'mkToEn' ? 'default' : 'outline'}
                  onClick={() => setMode('mkToEn')}
                  aria-pressed={mode === 'mkToEn'}
                  className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
                >
                  {t('practiceModeMkToEn')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'enToMk' ? 'default' : 'outline'}
                  onClick={() => setMode('enToMk')}
                  aria-pressed={mode === 'enToMk'}
                  className={cn(isModalVariant && 'md:h-10', 'px-2 text-xs')}
                >
                  {t('practiceModeEnToMk')}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 rounded-xl border border-border/40 bg-muted/30 p-3 md:p-4 md:rounded-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{promptLabel}</p>
            <p className={cn('break-words font-semibold text-foreground', isModalVariant ? 'text-3xl' : 'text-xl md:text-2xl')}>
              {promptValue}
            </p>
            <Badge variant="secondary" className="mt-2 w-fit text-xs">
              {categoryLabel}
            </Badge>
          </div>

          <form className="space-y-2 md:space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Input
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={placeholder}
                className={cn('rounded-xl border-border/40 bg-background/80', isModalVariant ? 'h-14 text-xl' : 'h-11 text-base md:h-12 md:text-lg', 'pr-10')}
                aria-label={placeholder}
                disabled={!isReady}
              />
              {/* Mobile: Skip button as icon in input */}
              <button
                type="button"
                onClick={handleNext}
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
                disabled={!filteredItems.length}
                aria-label={t('nextPrompt')}
              >
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Mobile: Simplified 2-button layout */}
            <div className="md:hidden flex flex-col gap-2">
              <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={!isReady || !answer.trim()}>
                {t('checkAnswer')}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReveal}
                  className="flex-1 gap-1.5 text-xs"
                  disabled={!isReady}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('practiceRevealAnswer')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 gap-1.5 text-xs"
                  disabled={!isReady && !answer}
                >
                  {t('practiceReset')}
                </Button>
              </div>
            </div>

            {/* Desktop: Full 4-button grid */}
            <div className="hidden md:grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button type="submit" size={isModalVariant ? 'lg' : 'default'} className="w-full gap-2" disabled={!isReady || !answer.trim()}>
                {t('checkAnswer')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size={isModalVariant ? 'lg' : 'default'}
                onClick={handleNext}
                className="w-full gap-2"
                disabled={!filteredItems.length}
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
                'rounded-xl px-4 py-3 font-semibold flex items-center gap-2',
                feedback === 'correct'
                  ? 'bg-[#22c55e] text-white'
                  : 'bg-[#ef4444] text-white',
                isShaking && feedback === 'incorrect' && 'animate-shake'
              )}
            >
              {feedback === 'correct' ? (
                <>
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span>{t('correctAnswer')}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 flex-shrink-0" />
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

          {!isReady && (
            <p className="text-sm text-muted-foreground">{t('practiceEmptyCategory')}</p>
          )}
        </div>
      </div>
    );
  };

  // Track when modal is opened (only for compact layout)
  useEffect(() => {
    if (layout === 'compact' && isModalOpen) {
      trackEvent(AnalyticsEvents.PRACTICE_MODAL_OPENED, {
        mode,
        category: category === ALL_CATEGORIES ? 'all' : category,
      });
    }
  }, [isModalOpen, mode, category, layout]);

  // Track when completion modal is viewed
  useEffect(() => {
    if (showCompletionModal) {
      trackEvent(AnalyticsEvents.PRACTICE_COMPLETION_MODAL_VIEWED, {
        mode,
        category: category === ALL_CATEGORIES ? 'all' : category,
        correctCount,
        totalAttempts,
        accuracy,
      });
    }
  }, [showCompletionModal, mode, category, correctCount, totalAttempts, accuracy]);

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
                      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/10">
                <Heart className="h-8 w-8 text-[#ef4444]" />
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

        {/* Confetti CSS */}
        <style jsx>{`
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
        `}</style>
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
                variant={mode === 'mkToEn' ? 'default' : 'ghost'}
                onClick={() => setMode('mkToEn')}
                className="flex-1"
              >
                {t('practiceModeMkToEn')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'enToMk' ? 'default' : 'ghost'}
                onClick={() => setMode('enToMk')}
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
              <span>{t('practiceProgressSummary', { count: correctCount })}</span>
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
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/10">
              <Heart className="h-8 w-8 text-[#ef4444]" />
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

      {/* Confetti CSS */}
      <style jsx>{`
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
      `}</style>
    </Dialog>
  );
}
