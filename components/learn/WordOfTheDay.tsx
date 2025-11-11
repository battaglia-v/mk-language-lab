'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

type WordOfTheDayData = {
  macedonian: string;
  pronunciation: string;
  english: string;
  partOfSpeech: string;
  exampleMk: string;
  exampleEn: string;
  icon: string;
};

export function WordOfTheDay() {
  const t = useTranslations('wordOfTheDay');
  const [word, setWord] = useState<WordOfTheDayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translateWithFallback = (key: string, fallback: string) => {
    const value = t(key as any);
    return value === key ? fallback : value;
  };

  const loadingLabel = translateWithFallback('loading', 'Loading word of the day...');
  const pronunciationFallback = translateWithFallback(
    'pronunciationFallback',
    'Pronunciation unavailable'
  );

  useEffect(() => {
    async function fetchWordOfTheDay() {
      try {
        const response = await fetch('/api/word-of-the-day');

        if (!response.ok) {
          throw new Error('Failed to fetch word of the day');
        }

        const data = await response.json();
        setWord(data);

        // Track successful word of the day load
        trackEvent(AnalyticsEvents.WORD_OF_DAY_LOADED, {
          partOfSpeech: data.partOfSpeech,
        });
      } catch (err) {
        console.error('Error fetching word of the day:', err);
        setError('Could not load word of the day');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWordOfTheDay();
  }, []);

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center py-8 md:py-12">
          <div role="status" aria-live="polite" aria-label={loadingLabel} className="flex flex-col items-center gap-2">
            <Loader2 aria-hidden="true" className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <span className="sr-only">{loadingLabel}</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !word) {
    return (
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center py-8 md:py-12 text-muted-foreground">
          <p className="text-sm md:text-base">{error || 'No word available today'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-6 lg:p-8">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative space-y-3 md:space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold text-foreground">
              {t('title')}
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t(`partOfSpeech.${word.partOfSpeech}`)}
          </Badge>
        </div>

        {/* Main Word */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-3xl md:text-4xl lg:text-5xl">{word.icon}</span>
            <div className="flex-1 space-y-2 md:space-y-3">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                {word.macedonian}
              </h4>
              <div className="flex items-baseline gap-1.5 md:gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Pronunciation:
                </span>
                <span className="font-serif italic text-sm md:text-base text-muted-foreground/80">
                  {word.pronunciation?.trim()
                    ? `[${word.pronunciation.trim()}]`
                    : pronunciationFallback}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40">
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-primary">
              {word.english}
            </p>
          </div>
        </div>

        {/* Example Sentence */}
        <div className="space-y-1.5 md:space-y-2 rounded-lg bg-muted/50 p-3 md:p-4">
          <p className="text-sm md:text-base font-medium text-foreground">
            {word.exampleMk}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {word.exampleEn}
          </p>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          {t('footer')}
        </p>
      </div>
    </Card>
  );
}
