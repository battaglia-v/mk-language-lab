'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCcw, Eye } from 'lucide-react';
import practicePrompts from '@/data/practice-vocabulary.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ALL_CATEGORIES = 'all';

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
      return;
    }

    setCurrentIndex(Math.floor(Math.random() * filteredItems.length));
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
  }, [filteredItems]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
  }, [mode]);

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

    if (normalizedAnswer === normalizedExpected) {
      setFeedback('correct');
      setRevealedAnswer('');
    } else {
      setFeedback('incorrect');
      setRevealedAnswer(expectedAnswer);
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
    setRevealedAnswer('');
  };

  const handleReset = () => {
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
  };

  const handleReveal = () => {
    if (!currentItem) {
      return;
    }
    setFeedback(null);
    setRevealedAnswer(expectedAnswer);
  };

  const isReady = Boolean(currentItem);

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-card/85 via-card/70 to-muted/40 backdrop-blur border-border/40',
        layout === 'compact' ? 'shadow-lg' : '',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">{title ?? t('quickPractice')}</CardTitle>
        <CardDescription className="text-sm md:text-base">
          {description ?? t('quickPracticeDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)] sm:items-end lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceFilterLabel')}
            </span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label={t('practiceFilterLabel')}>
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
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('practiceModeLabel')}
            </span>
            <div className="inline-flex rounded-lg border border-border/60 bg-background/60 p-1">
              <Button
                type="button"
                size="sm"
                variant={mode === 'mkToEn' ? 'default' : 'outline'}
                onClick={() => setMode('mkToEn')}
                aria-pressed={mode === 'mkToEn'}
                className="px-3"
              >
                {t('practiceModeMkToEn')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'enToMk' ? 'default' : 'outline'}
                onClick={() => setMode('enToMk')}
                aria-pressed={mode === 'enToMk'}
                className="px-3"
              >
                {t('practiceModeEnToMk')}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{promptLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{promptValue}</p>
          <Badge variant="secondary" className="mt-3 w-fit">
            {categoryLabel}
          </Badge>
        </div>

        <div className="space-y-3">
          <Input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={placeholder}
            className="h-12 text-lg"
            aria-label={placeholder}
            disabled={!isReady}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCheck} disabled={!isReady || !answer.trim()}>
              {t('checkAnswer')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              className="gap-2"
              disabled={!filteredItems.length}
            >
              <RefreshCcw className="h-4 w-4" />
              {t('nextPrompt')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleReveal} disabled={!isReady}>
              <Eye className="h-4 w-4" />
              {t('practiceRevealAnswer')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset} disabled={!isReady && !answer}>
              {t('practiceReset')}
            </Button>
          </div>
        </div>

        {feedback && isReady ? (
          <div
            className={cn(
              'rounded-lg px-4 py-3 text-sm font-medium',
              feedback === 'correct'
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {feedback === 'correct'
              ? t('correctAnswer')
              : t('incorrectAnswer', { answer: revealedAnswer })}
          </div>
        ) : null}

        {!feedback && revealedAnswer ? (
          <div className="rounded-lg border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {t('practiceAnswerRevealed', { answer: revealedAnswer })}
          </div>
        ) : null}

        {!isReady && (
          <p className="text-sm text-muted-foreground">{t('practiceEmptyCategory')}</p>
        )}
      </CardContent>
    </Card>
  );
}
