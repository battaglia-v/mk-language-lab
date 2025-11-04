'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftRight, Check, Copy, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { useJourneyProgress } from '@/hooks/use-journey-progress';
import { isJourneyId } from '@/data/journeys';
import { JOURNEY_PRACTICE_CONTENT, type JourneyTranslationSnippet } from '@/data/journey-practice-content';

type DirectionOption = {
  id: 'mk-en' | 'en-mk';
  sourceLang: 'mk' | 'en';
  targetLang: 'mk' | 'en';
  label: string;
  placeholder: string;
};

type TranslationHistoryEntry = {
  id: string;
  directionId: DirectionOption['id'];
  sourceText: string;
  translatedText: string;
  timestamp: number;
};

const HISTORY_LIMIT = 5;
const MAX_CHARACTERS = 1800;
const TRANSLATION_SESSION_MINUTES = 6;
const SNIPPET_REVIEW_MINUTES = 3;

export default function TranslatePage() {
  const t = useTranslations('translate');
  const journeyT = useTranslations('journey');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { activeJourney } = useActiveJourney();
  const { logSession } = useJourneyProgress(activeJourney);
  const rawTips = t.raw('tips');
  const tips = Array.isArray(rawTips) ? (rawTips as string[]) : [];
  const rawFallbackSteps = t.raw('fallbackSteps');
  const fallbackSteps = Array.isArray(rawFallbackSteps) ? (rawFallbackSteps as string[]) : [];

  const directionLabels = useMemo(() => {
    const raw = t.raw('directions');
    return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<'mk_en' | 'en_mk', string>;
  }, [t]);

  const placeholderLabels = useMemo(() => {
    const raw = t.raw('inputPlaceholder');
    return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<'mk_en' | 'en_mk', string>;
  }, [t]);

  const languageLabels = useMemo(() => {
    const raw = t.raw('languageLabels');
    return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, string>;
  }, [t]);

  const directionOptions = useMemo<DirectionOption[]>(
    () => [
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: directionLabels.mk_en ?? 'Macedonian → English',
        placeholder:
          placeholderLabels.mk_en ?? 'Type Macedonian text to translate into English…',
      },
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: directionLabels.en_mk ?? 'English → Macedonian',
        placeholder:
          placeholderLabels.en_mk ?? 'Type English text to translate into Macedonian…',
      },
    ],
    [directionLabels.en_mk, directionLabels.mk_en, placeholderLabels.en_mk, placeholderLabels.mk_en]
  );

  const [directionId, setDirectionId] = useState<DirectionOption['id']>('mk-en');
  const selectedDirection = useMemo(() => {
    return directionOptions.find((option) => option.id === directionId) ?? directionOptions[0];
  }, [directionId, directionOptions]);

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [copiedState, setCopiedState] = useState<'idle' | 'copied'>('idle');
  const [history, setHistory] = useState<TranslationHistoryEntry[]>([]);
  const shortcutHintId = 'translate-shortcut-hint';
  const characterCountId = 'translate-character-count';

  const journeyParam = searchParams?.get('journey') ?? null;
  const journeyId = journeyParam && isJourneyId(journeyParam) ? journeyParam : null;
  const journeyTitle = journeyId ? journeyT(`goals.cards.${journeyId}.title`) : null;
  const journeySnippets: JourneyTranslationSnippet[] = journeyId
    ? JOURNEY_PRACTICE_CONTENT[journeyId]?.translatorSnippets ?? []
    : [];

  const directionLabelMap = useMemo(() => {
    return directionOptions.reduce<Record<DirectionOption['id'], string>>((acc, option) => {
      acc[option.id] = option.label;
      return acc;
    }, {} as Record<DirectionOption['id'], string>);
  }, [directionOptions]);

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const handleDirectionChange = useCallback((id: DirectionOption['id']) => {
    setDirectionId(id);
    setErrorMessage(null);
    setDetectedLanguage(null);
    setCopiedState('idle');
  }, []);

  const handleSwapDirections = useCallback(() => {
    setDirectionId((current) => (current === 'mk-en' ? 'en-mk' : 'mk-en'));
    setErrorMessage(null);
    setDetectedLanguage(null);
    setCopiedState('idle');
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setDetectedLanguage(null);
    setErrorMessage(null);
    setCopiedState('idle');
  }, []);

  const handleTranslate = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const text = inputText.trim();

      if (!text) {
        setTranslatedText('');
        setDetectedLanguage(null);
        setErrorMessage(null);
        setCopiedState('idle');
        return;
      }

      setIsTranslating(true);
      setErrorMessage(null);
      setIsRetryable(false);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLang: selectedDirection.sourceLang,
            targetLang: selectedDirection.targetLang,
          }),
        });

        const data = (await response.json()) as {
          translatedText?: string;
          detectedSourceLang?: string | null;
          error?: string;
          message?: string;
          retryable?: boolean;
        };

        if (!response.ok || !data.translatedText) {
          const errorMsg = data.message || data.error || 'Translation failed';
          const retryable = data.retryable ?? false;
          setIsRetryable(retryable);
          throw new Error(errorMsg);
        }

        const trimmedTranslation = data.translatedText.trim();
        setTranslatedText(trimmedTranslation);
        setDetectedLanguage(data.detectedSourceLang ?? null);
        setCopiedState('idle');

        const newEntry: TranslationHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          directionId,
          sourceText: text,
          translatedText: trimmedTranslation,
          timestamp: Date.now(),
        };

        setHistory((previous) => {
          const filtered = previous.filter(
            (entry) => entry.sourceText !== text || entry.directionId !== directionId
          );
          return [newEntry, ...filtered].slice(0, HISTORY_LIMIT);
        });

  logSession({ durationMinutes: TRANSLATION_SESSION_MINUTES });
      } catch (error) {
        console.error('Translation failed', error);
        setTranslatedText('');
        setDetectedLanguage(null);
        // Use the error message from the API if available, otherwise fallback to generic
        const message = error instanceof Error ? error.message : t('errorGeneric');
        setErrorMessage(message);
      } finally {
        setIsTranslating(false);
      }
    },
    [directionId, inputText, logSession, selectedDirection.sourceLang, selectedDirection.targetLang, t]
  );

  const handleCopy = useCallback(async () => {
    if (!translatedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopiedState('copied');
      window.setTimeout(() => setCopiedState('idle'), 1500);
    } catch (error) {
      console.error('Copy failed', error);
      setErrorMessage(t('copyError'));
    }
  }, [t, translatedText]);

  const handleHistoryLoad = useCallback((entry: TranslationHistoryEntry) => {
    setDirectionId(entry.directionId);
    setInputText(entry.sourceText);
    setTranslatedText(entry.translatedText);
    setDetectedLanguage(null);
    setErrorMessage(null);
    setCopiedState('idle');
  }, []);

  const handleLoadSnippet = useCallback(
    (snippet: JourneyTranslationSnippet) => {
      setDirectionId(snippet.sourceLang === 'mk' ? 'mk-en' : 'en-mk');
      setInputText(snippet.text);
      setTranslatedText('');
      setDetectedLanguage(null);
      setErrorMessage(null);
      setCopiedState('idle');
  logSession({ durationMinutes: SNIPPET_REVIEW_MINUTES });
    },
    [logSession]
  );

  const characterCountLabel = t('characterCount', {
    count: inputText.length,
    limit: MAX_CHARACTERS,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="space-y-4 text-center">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/5 text-primary">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t('subtitle')}</p>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl text-foreground">{t('assistantTitle')}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t('assistantDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleTranslate}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className="flex flex-wrap items-center gap-2"
                    role="radiogroup"
                    aria-label={t('directionsGroupLabel')}
                  >
                    {directionOptions.map((option) => {
                      const isActive = option.id === selectedDirection.id;
                      return (
                        <Button
                          key={option.id}
                          type="button"
                          size="sm"
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => handleDirectionChange(option.id)}
                          role="radio"
                          aria-checked={isActive}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSwapDirections}
                    aria-label={t('swapDirections')}
                    className="h-9 w-9 p-0"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="translate-input" className="text-sm font-medium text-foreground">
                    {t('inputLabel')}
                  </label>
                  <Textarea
                    id="translate-input"
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder={selectedDirection.placeholder}
                    maxLength={MAX_CHARACTERS}
                    aria-describedby={`${shortcutHintId} ${characterCountId}`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        void handleTranslate();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span id={shortcutHintId}>{t('shortcutHint')}</span>
                    <span id={characterCountId}>{characterCountLabel}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={isTranslating} className="gap-2">
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {t('translateButton')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      disabled={!inputText && !translatedText}
                    >
                      {t('clearButton')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('resultLabel')}
                    </span>
                    {translatedText ? (
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                        {copiedState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedState === 'copied' ? t('copied') : t('copyButton')}
                      </Button>
                    ) : null}
                  </div>
                  <div
                    className="min-h-32 whitespace-pre-wrap rounded-xl border border-border/50 bg-background/60 p-4 text-base text-foreground"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-busy={isTranslating}
                  >
                    {isTranslating ? (
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('translatingStatus')}
                      </span>
                    ) : translatedText ? (
                      translatedText
                    ) : (
                      <span className="text-muted-foreground">{t('resultPlaceholder')}</span>
                    )}
                  </div>
                  {detectedLanguage ? (
                    <p className="text-xs text-muted-foreground">
                      {t('detectedLanguage', {
                        language: languageLabels[detectedLanguage] ?? detectedLanguage,
                      })}
                    </p>
                  ) : null}
                  {errorMessage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-destructive" role="alert">
                        {errorMessage}
                      </p>
                      {isRetryable && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTranslate()}
                          disabled={isTranslating}
                        >
                          {t('retryButton') || 'Retry'}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>

                {history.length > 0 ? (
                  <div className="space-y-3 rounded-xl border border-border/40 bg-background/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('historyTitle')}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {history.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-lg border border-border/30 bg-background/60 p-3 text-left"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {directionLabelMap[entry.directionId] ?? entry.directionId}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleHistoryLoad(entry)}
                              >
                                {t('historyLoad')}
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{t('inputLabel')}:</span>{' '}
                                {entry.sourceText}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{t('resultLabel')}:</span>{' '}
                                {entry.translatedText}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t('historyEmpty')}</p>
                )}
              </form>
            </CardContent>
          </Card>

          {journeyId && journeySnippets.length ? (
            <Card className="border-border/40 bg-card/60 backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-foreground">
                  {t('journeyPracticeTitle', { journey: journeyTitle ?? '' })}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t('journeyPracticeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {journeySnippets.map((snippet) => {
                  const languageLabel =
                    snippet.sourceLang === 'mk' ? t('languageLabels.mk') : t('languageLabels.en');
                  return (
                    <div key={snippet.id} className="space-y-3 rounded-lg border border-border/40 bg-background/60 p-4">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground">{snippet.title}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t('journeyPracticeSourceLabel', { language: languageLabel })}
                        </p>
                      </div>
                      <p className="whitespace-pre-line text-sm text-foreground">{snippet.text}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t('journeyPracticePrompt')}
                        </p>
                        <p className="text-sm text-muted-foreground">{snippet.prompt}</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleLoadSnippet(snippet)}>
                        {t('journeyPracticeLoad')}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl text-foreground">{t('fallbackTitle')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('fallbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fallbackSteps.length > 0 ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {fallbackSteps.map((step) => (
                    <li key={step} className="rounded-lg border border-border/40 bg-background/50 p-3 text-left">
                      {step}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button asChild variant="outline">
                <Link
                  href="https://translate.google.com/?sl=mk&tl=en&op=translate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('fallbackExternalCta')}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">{t('fallbackExternalNote')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{t('tipsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {tips.map((tip) => (
                  <li key={tip} className="rounded-md border border-border/40 bg-background/40 p-3">
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="space-y-2 text-center md:text-left">
              <CardTitle className="text-xl text-foreground">{t('resourcesTitle')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('resourcesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center md:justify-start">
              <Button asChild size="lg">
                <Link href={buildHref('/resources')}>{t('resourcesCta')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
