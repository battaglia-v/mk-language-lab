'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    async function fetchWordOfTheDay() {
      try {
        const response = await fetch('/api/word-of-the-day');

        if (!response.ok) {
          throw new Error('Failed to fetch word of the day');
        }

        const data = await response.json();
        setWord(data);
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
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error || !word) {
    return (
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p>{error || 'No word available today'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t('title')}
            </h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t(`partOfSpeech.${word.partOfSpeech}`)}
          </Badge>
        </div>

        {/* Main Word */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{word.icon}</span>
            <div className="flex-1 space-y-2">
              <h4 className="text-4xl font-bold text-foreground">
                {word.macedonian}
              </h4>
              <p className="text-lg text-muted-foreground">
                [{word.pronunciation}]
              </p>
            </div>
          </div>

          <p className="text-2xl font-medium text-primary">
            {word.english}
          </p>
        </div>

        {/* Example Sentence */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <p className="text-base font-medium text-foreground">
            {word.exampleMk}
          </p>
          <p className="text-sm text-muted-foreground">
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
