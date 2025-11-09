'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeftRight, Check, Copy, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

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

export default function TranslatePage() {
  const t = useTranslations('translate');

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

  const [directionId, setDirectionId] = useState<DirectionOption['id']>('en-mk');
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
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const shortcutHintId = 'translate-shortcut-hint';
  const characterCountId = 'translate-character-count';


  const directionLabelMap = useMemo(() => {
    return directionOptions.reduce<Record<DirectionOption['id'], string>>((acc, option) => {
      acc[option.id] = option.label;
      return acc;
    }, {} as Record<DirectionOption['id'], string>);
  }, [directionOptions]);

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

      // Track translation request
      trackEvent(AnalyticsEvents.TRANSLATION_REQUESTED, {
        direction: directionId,
        textLength: text.length,
      });

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

          // Track translation failure
          trackEvent(AnalyticsEvents.TRANSLATION_FAILED, {
            direction: directionId,
            retryable,
          });

          throw new Error(errorMsg);
        }

        const trimmedTranslation = data.translatedText.trim();
        setTranslatedText(trimmedTranslation);
        setDetectedLanguage(data.detectedSourceLang ?? null);
        setCopiedState('idle');

        // Track successful translation
        trackEvent(AnalyticsEvents.TRANSLATION_SUCCESS, {
          direction: directionId,
          textLength: text.length,
        });

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
    [directionId, inputText, selectedDirection.sourceLang, selectedDirection.targetLang, t]
  );

  const handleCopy = useCallback(async () => {
    if (!translatedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopiedState('copied');
      window.setTimeout(() => setCopiedState('idle'), 1500);

      // Track translation copy
      trackEvent(AnalyticsEvents.TRANSLATION_COPIED, {
        direction: directionId,
      });
    } catch (error) {
      console.error('Copy failed', error);
      setErrorMessage(t('copyError'));
    }
  }, [directionId, t, translatedText]);

  const handleHistoryLoad = useCallback((entry: TranslationHistoryEntry) => {
    setDirectionId(entry.directionId);
    setInputText(entry.sourceText);
    setTranslatedText(entry.translatedText);
    setDetectedLanguage(null);
    setErrorMessage(null);
    setCopiedState('idle');
  }, []);


  const characterCountLabel = t('characterCount', {
    count: inputText.length,
    limit: MAX_CHARACTERS,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Compact Header Bar */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            {t('title')}
          </h1>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
            {t('badge')}
          </Badge>
        </div>
      </div>

      {/* Main Content - Full Screen */}
      <div className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-4 py-3 md:py-4">
          <form className="flex-1 flex flex-col gap-3 md:gap-4" onSubmit={handleTranslate}>
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="flex items-center gap-1.5"
                    role="radiogroup"
                    aria-label={t('directionsGroupLabel')}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={directionId === 'en-mk' ? 'default' : 'outline'}
                      onClick={() => handleDirectionChange('en-mk')}
                      role="radio"
                      aria-checked={directionId === 'en-mk'}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      EN → MK
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={directionId === 'mk-en' ? 'default' : 'outline'}
                      onClick={() => handleDirectionChange('mk-en')}
                      role="radio"
                      aria-checked={directionId === 'mk-en'}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      MK → EN
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSwapDirections}
                    aria-label={t('swapDirections')}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="translate-input" className="text-sm font-semibold text-foreground">
                    {t('inputLabel')}
                  </label>
                  <Textarea
                    id="translate-input"
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder={selectedDirection.placeholder}
                    maxLength={MAX_CHARACTERS}
                    aria-describedby={characterCountId}
                    className="min-h-20 md:min-h-24 resize-none text-base"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        void handleTranslate();
                      }
                    }}
                  />
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <span id={characterCountId}>{characterCountLabel}</span>
                  </div>
                </div>

                {/* Primary Action Button - Full width on mobile, Duolingo-style */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="submit"
                    disabled={isTranslating}
                    size="lg"
                    className="w-full sm:w-auto gap-2 h-12 text-base font-semibold"
                  >
                    {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    {t('translateButton')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={!inputText && !translatedText}
                    className="w-full sm:w-auto"
                  >
                    {t('clearButton')}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-foreground">
                      {t('resultLabel')}
                    </span>
                    {translatedText ? (
                      <Button type="button" variant="ghost" size="sm" className="gap-1.5 h-8" onClick={handleCopy}>
                        {copiedState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="text-xs">{copiedState === 'copied' ? t('copied') : t('copyButton')}</span>
                      </Button>
                    ) : null}
                  </div>
                  <div
                    className="min-h-20 md:min-h-24 whitespace-pre-wrap rounded-xl border-2 border-border/50 bg-background/80 p-3 md:p-4 text-base leading-relaxed text-foreground"
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
          </form>

          {/* Translation History */}
          {history.length > 0 && (
            <Card className="border-border/40 bg-card/60 backdrop-blur mt-4">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/20"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t('historyTitle')}</p>
                  <p className="text-xs text-muted-foreground">
                    {history.length} {history.length === 1 ? 'translation' : 'translations'}
                  </p>
                </div>
                {isHistoryExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {isHistoryExpanded && (
                <CardContent className="border-t border-border/40 pt-4">
                  <ul className="space-y-2">
                    {history.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-lg border border-border/30 bg-background/60 p-3"
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
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
