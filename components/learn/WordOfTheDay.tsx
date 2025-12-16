'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Volume2, VolumeX, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  type WordOfDayKey = Parameters<typeof t>[0];
  const [word, setWord] = useState<WordOfTheDayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translateWithFallback = (key: WordOfDayKey, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  useEffect(() => {
    // Check if TTS is supported
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setTtsSupported(false);
    }
  }, []);

  const speakWord = useCallback((text: string, lang: 'mk' | 'en' = 'mk') => {
    if (!window.speechSynthesis || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Macedonian uses Serbian or Slavic voices as fallback
    utterance.lang = lang === 'mk' ? 'sr-RS' : 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);

    trackEvent(AnalyticsEvents.WORD_OF_DAY_LOADED, {
      action: 'tts_played',
      text: text.slice(0, 30),
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

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
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-3 md:p-5 lg:p-6">
        <div className="flex items-center justify-center py-6 md:py-10">
          <div
            role="status"
            aria-live="polite"
            aria-label={loadingLabel}
            className="flex flex-col items-center gap-2"
          >
            <Loader2 aria-hidden="true" className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            <span className="sr-only">{loadingLabel}</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !word) {
    return (
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-3 md:p-5 lg:p-6">
        <div className="flex items-center justify-center py-6 md:py-10 text-muted-foreground">
          <p className="text-sm md:text-base">{error || 'No word available today'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-3 md:p-5 lg:p-6">
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative space-y-2.5 md:space-y-4 lg:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Sparkles className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
            <h3 className="text-sm md:text-lg font-semibold text-foreground">
              {t('title')}
            </h3>
          </div>
          <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
            {t(`partOfSpeech.${word.partOfSpeech}`)}
          </Badge>
        </div>

        {/* Main Word */}
        <div className="space-y-2.5 md:space-y-4">
          <div className="flex items-center gap-2.5 md:gap-4">
            <span className="text-2xl md:text-4xl lg:text-[40px]">{word.icon}</span>
            <div className="flex-1 space-y-1.5 md:space-y-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                  {word.macedonian}
                </h4>
                {ttsSupported && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 md:h-10 md:w-10 rounded-full p-0 hover:bg-primary/10"
                    onClick={() => isSpeaking ? stopSpeaking() : speakWord(word.macedonian, 'mk')}
                    aria-label={isSpeaking ? t('stopSpeaking') : t('listenToWord')}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                    ) : (
                      <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Pronunciation:
                </span>
                <span className="font-serif italic text-sm md:text-base text-muted-foreground/80">
                  {word.pronunciation?.trim()
                    ? `[${word.pronunciation.trim()}]`
                    : pronunciationFallback}
                </span>
                {ttsSupported && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="ml-1 px-1.5 py-0 text-[9px] md:text-[10px] font-medium text-muted-foreground/70 border-muted-foreground/30 cursor-help"
                        >
                          <Info className="h-2.5 w-2.5 mr-0.5" />
                          {t('ttsLabel')}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-center">
                        <p className="text-xs">{t('ttsTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-1.5">
            <p className="text-base md:text-xl lg:text-2xl font-medium text-primary">
              {word.english}
            </p>
          </div>
        </div>

        {/* Example Sentence */}
        <div className="space-y-1.5 md:space-y-2 rounded-xl bg-muted/40 p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm md:text-base font-medium text-foreground leading-relaxed flex-1">
              {word.exampleMk}
            </p>
            {ttsSupported && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 shrink-0 rounded-full p-0 hover:bg-primary/10"
                onClick={() => isSpeaking ? stopSpeaking() : speakWord(word.exampleMk, 'mk')}
                aria-label={t('listenToExample')}
              >
                {isSpeaking ? (
                  <VolumeX className="h-3.5 w-3.5 text-primary animate-pulse" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                )}
              </Button>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {word.exampleEn}
          </p>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground">
          {t('footer')}
        </p>
      </div>
    </Card>
  );
}
