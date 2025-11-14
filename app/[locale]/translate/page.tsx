'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeftRight, Check, Copy, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { WebStatPill, WebButton } from '@mk/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const formatDirectionAbbrev = (id: DirectionOption['id']) => (id === 'en-mk' ? 'EN → MK' : 'MK → EN');

const truncateText = (text: string, limit = 24) => {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}…`;
};

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
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const characterCountId = 'translate-character-count';
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const historyTimestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    []
  );

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

  const autoResizeInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResizeInput();
  }, [autoResizeInput, inputText]);

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
    <>
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
          <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col gap-4 px-4 py-3 md:py-4">
            <form
              className="flex flex-col gap-3 rounded-3xl border border-border/40 bg-card/80 p-3 shadow-lg md:gap-4 md:p-5"
              onSubmit={handleTranslate}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className="flex w-full flex-wrap gap-2"
                  role="radiogroup"
                  aria-label={t('directionsGroupLabel')}
                >
                  <WebButton
                    asChild
                    style={{
                      flex: 1,
                      minWidth: 130,
                      justifyContent: 'center',
                      borderColor: directionId === 'en-mk' ? 'var(--brand-red)' : 'var(--border-neutral-muted)',
                      background: directionId === 'en-mk' ? 'var(--brand-red)' : 'var(--surface-frosted)',
                      color:
                        directionId === 'en-mk' ? 'var(--primary-foreground)' : 'var(--brand-red)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDirectionChange('en-mk')}
                      role="radio"
                      aria-checked={directionId === 'en-mk'}
                      className="w-full text-xs font-semibold uppercase"
                    >
                      EN → MK
                    </button>
                  </WebButton>
                  <WebButton
                    asChild
                    style={{
                      flex: 1,
                      minWidth: 130,
                      justifyContent: 'center',
                      borderColor: directionId === 'mk-en' ? 'var(--brand-red)' : 'var(--border-neutral-muted)',
                      background: directionId === 'mk-en' ? 'var(--brand-red)' : 'var(--surface-frosted)',
                      color:
                        directionId === 'mk-en' ? 'var(--primary-foreground)' : 'var(--brand-red)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDirectionChange('mk-en')}
                      role="radio"
                      aria-checked={directionId === 'mk-en'}
                      className="w-full text-xs font-semibold uppercase"
                    >
                      MK → EN
                    </button>
                  </WebButton>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleSwapDirections}
                  aria-label={t('swapDirections')}
                  className="h-9 w-9 rounded-full border border-border/40 p-0 text-muted-foreground"
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
                  ref={textareaRef}
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  placeholder={selectedDirection.placeholder}
                  maxLength={MAX_CHARACTERS}
                  aria-describedby={characterCountId}
                  className="min-h-[120px] md:min-h-[180px] resize-none rounded-2xl border border-border/60 bg-background/80 text-base"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      void handleTranslate();
                    }
                  }}
                />
                <div className="flex items-center justify-end text-[11px] text-muted-foreground sm:text-xs">
                  <span id={characterCountId}>{characterCountLabel}</span>
                </div>
              </div>

              {/* Primary Action Button - sticky on mobile */}
              <div className="sticky bottom-3 z-20 rounded-2xl border border-border/30 bg-background/95 p-2 shadow-lg sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="submit"
                    disabled={isTranslating}
                    className="h-11 w-full rounded-2xl text-sm font-semibold sm:h-12 sm:w-auto sm:text-base"
                  >
                    {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t('translateButton')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={!inputText && !translatedText}
                    className="w-full text-sm sm:w-auto"
                  >
                    {t('clearButton')}
                  </Button>
                </div>
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
                    className="min-h-[120px] whitespace-pre-wrap rounded-2xl border border-border/40 bg-background/80 p-3 md:p-4 text-base leading-relaxed text-foreground"
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

          {history.length > 0 && (
            <div className="space-y-2 md:hidden">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{t('historyTitle')}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsHistoryDialogOpen(true)}
                >
                  {t('historyViewAll')}
                </Button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
                {history.slice(0, 6).map((entry) => {
                  const entryTime = historyTimestampFormatter.format(entry.timestamp);
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      className="flex min-w-[150px] snap-center flex-col gap-2 rounded-2xl border border-border/30 bg-background/80 px-3 py-2 text-left text-[11px] shadow-sm"
                      onClick={() => handleHistoryLoad(entry)}
                    >
                      <WebStatPill
                        label={formatDirectionAbbrev(entry.directionId)}
                        value={entryTime}
                        accent="gold"
                      />
                      <span className="text-muted-foreground">{truncateText(entry.sourceText)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <Card className="hidden border-border/40 bg-card/60 backdrop-blur md:block">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/20"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t('historyTitle')}</p>
                  <p className="text-xs text-muted-foreground">
                    {history.length} {history.length === 1 ? t('historyItemSingular') : t('historyItemPlural')}
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
                    {history.map((entry) => {
                      const entryTime = historyTimestampFormatter.format(entry.timestamp);
                      return (
                        <li
                          key={entry.id}
                          className="rounded-lg border border-border/30 bg-background/60 p-3"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <WebStatPill
                                label={formatDirectionAbbrev(entry.directionId)}
                                value={entryTime}
                                accent="gold"
                              />
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
                      );
                    })}
                  </ul>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>

    <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('historyTitle')}</DialogTitle>
        </DialogHeader>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('historyEmpty')}</p>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => {
              const entryTime = historyTimestampFormatter.format(entry.timestamp);
              return (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-border/30 bg-background/80 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <WebStatPill
                      label={formatDirectionAbbrev(entry.directionId)}
                      value={entryTime}
                      accent="gold"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        handleHistoryLoad(entry);
                        setIsHistoryDialogOpen(false);
                      }}
                    >
                      {t('historyLoad')}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t('inputLabel')}:</span>{' '}
                    {entry.sourceText}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{t('resultLabel')}:</span>{' '}
                    {entry.translatedText}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
