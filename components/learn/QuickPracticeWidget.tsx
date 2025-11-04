'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, Eye, Sparkles, PlayCircle, X } from 'lucide-react';
import practicePrompts from '@/data/practice-vocabulary.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const ALL_CATEGORIES = 'all';
const SESSION_TARGET = 5;

type PracticeItem = {
  macedonian: string;
  english: string;
  category?: string;
};

type PracticeDirection = 'mkToEn' | 'enToMk';

type QuickPracticeWidgetProps = {
  title?: string;
  description?: string;
  className?: string;
  layout?: 'default' | 'compact';
};

const PRACTICE_ITEMS = practicePrompts as PracticeItem[];

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
  const [currentIndex, setCurrentIndex] = useState(() =>
    PRACTICE_ITEMS.length ? Math.floor(Math.random() * PRACTICE_ITEMS.length) : -1
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setAttemptCount(0);
      setCorrectCount(0);
      setIsCelebrating(false);
      return;
    }

    setCurrentIndex(Math.floor(Math.random() * filteredItems.length));
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
    setAttemptCount(0);
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
    setIsLoading(false);
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
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

  const handleCheck = () => {
    if (!currentItem || !answer.trim()) {
      return;
    }

    const normalizedAnswer = normalizeAnswer(answer);
    const normalizedExpected = normalizeAnswer(expectedAnswer);

    setAttemptCount((prev) => prev + 1);

    if (normalizedAnswer === normalizedExpected) {
      setFeedback('correct');
      setRevealedAnswer('');
      setCorrectCount((prev) => prev + 1);
      setIsCelebrating(true);
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => setIsCelebrating(false), 1200);
    } else {
      setFeedback('incorrect');
      setRevealedAnswer(expectedAnswer);
      setIsCelebrating(false);
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
    setAttemptCount(0);
    setCorrectCount(0);
    setIsCelebrating(false);
    setRevealedAnswer('');
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

  const sessionProgress = Math.min(100, Math.round((attemptCount / SESSION_TARGET) * 100));
  const accuracy = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
  const summarySubtitle = description ?? t('quickPracticeDescription');

  const renderPracticeCard = (variant: 'default' | 'modal', extraClassName?: string) => {
    const isModalVariant = variant === 'modal';

    if (isLoading) {
      return (
        <Card className={cn('border border-border/40 bg-card/70 backdrop-blur p-6', extraClassName)}>
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card
        className={cn(
          'relative overflow-hidden border border-border/40 bg-gradient-to-br from-card/85 via-card/70 to-muted/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl transition-all duration-500',
          isModalVariant ? 'h-full border-border/30 shadow-2xl' : 'shadow-lg',
          extraClassName
        )}
      >
        {isCelebrating && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/0 opacity-90 animate-pulse"
            aria-hidden="true"
          />
        )}
        <CardHeader className={cn('space-y-6', isModalVariant ? 'px-10 py-10 lg:px-12' : '')}>
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <Badge
              variant="outline"
              className="mx-auto w-fit border-primary/40 bg-primary/10 text-primary sm:mx-0"
            >
              {t('quickPractice')}
            </Badge>
            <div className="space-y-3">
              <CardTitle className={cn('text-2xl text-foreground sm:text-3xl', isModalVariant && 'sm:text-4xl')}>
                {title ?? t('quickPractice')}
              </CardTitle>
              <CardDescription className={cn('text-sm text-muted-foreground sm:text-base', isModalVariant && 'sm:text-lg')}>
                {summarySubtitle}
              </CardDescription>
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-background/60 p-4 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{t('practiceProgressLabel')}</span>
              <span>{t('practiceProgressGoal', { target: SESSION_TARGET })}</span>
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
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{t('practiceProgressSummary', { count: attemptCount })}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                <Sparkles className="h-4 w-4" />
                {t('practiceAccuracy', { value: accuracy })}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-6', isModalVariant ? 'px-10 pb-10 lg:px-12' : '')}>
          <div
            className={cn(
              'flex gap-4',
              isModalVariant ? 'flex-col lg:flex-row lg:items-end lg:gap-6' : 'flex-col sm:flex-row sm:items-end'
            )}
          >
            <div className={cn('space-y-2', isModalVariant ? 'w-full lg:flex-1' : 'flex-1')}>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('practiceFilterLabel')}
              </span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  aria-label={t('practiceFilterLabel')}
                  className={cn('w-full', isModalVariant && 'h-12 text-base')}
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
            <div className={cn('space-y-2', isModalVariant ? 'w-full lg:w-auto' : 'sm:w-auto')}>
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
                  size={isModalVariant ? 'lg' : 'sm'}
                  variant={mode === 'mkToEn' ? 'default' : 'outline'}
                  onClick={() => setMode('mkToEn')}
                  aria-pressed={mode === 'mkToEn'}
                  className={cn(isModalVariant ? 'justify-center' : 'px-3', !isModalVariant && 'sm:flex-none')}
                >
                  {t('practiceModeMkToEn')}
                </Button>
                <Button
                  type="button"
                  size={isModalVariant ? 'lg' : 'sm'}
                  variant={mode === 'enToMk' ? 'default' : 'outline'}
                  onClick={() => setMode('enToMk')}
                  aria-pressed={mode === 'enToMk'}
                  className={cn(isModalVariant ? 'justify-center' : 'px-3', !isModalVariant && 'sm:flex-none')}
                >
                  {t('practiceModeEnToMk')}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-border/40 bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{promptLabel}</p>
            <p className={cn('break-words font-semibold text-foreground', isModalVariant ? 'text-3xl' : 'text-2xl')}>
              {promptValue}
            </p>
            <Badge variant="secondary" className="mt-3 w-fit">
              {categoryLabel}
            </Badge>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={placeholder}
              className={cn('rounded-xl border-border/40 bg-background/80', isModalVariant ? 'h-14 text-xl' : 'h-12 text-lg')}
              aria-label={placeholder}
              disabled={!isReady}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                'rounded-xl px-4 py-3 text-sm font-medium',
                feedback === 'correct'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              {feedback === 'correct'
                ? t('correctAnswer')
                : t('incorrectAnswer', { answer: revealedAnswer })}
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
        </CardContent>
      </Card>
    );
  };

  if (layout !== 'compact') {
    return renderPracticeCard('default', className);
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
            <Badge variant="secondary" className="w-fit bg-secondary/20 text-secondary">
              {t('quickPractice')}
            </Badge>
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
              <span>{t('practiceProgressSummary', { count: attemptCount })}</span>
            </div>
            {attemptCount > 0 && (
              <span className="text-primary font-medium">
                {Math.round((correctCount / attemptCount) * 100)}% {t('practiceAccuracy', { value: '' }).split(':')[0]}
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
        className="h-[90vh] max-h-[760px] w-[min(96vw,900px)] max-w-none border border-border/40 bg-background/95 p-0 shadow-2xl"
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
            {renderPracticeCard('modal', 'h-full')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
