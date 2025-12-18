'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  History,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  RefreshCw,
  BookOpen,
  ClipboardPaste,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomSheet, BottomSheetList } from '@/components/ui/BottomSheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTranslatorWorkspace,
  type TranslationDirectionOption,
} from '@/components/translate/useTranslatorWorkspace';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const MAX_CHARACTERS = 1800;

export default function TranslatePage() {
  const t = useTranslations('translate');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  const directionOptions: TranslationDirectionOption[] = useMemo(
    () => [
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: t('directions.en_mk'),
        placeholder: t('inputPlaceholder.en_mk'),
      },
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: t('directions.mk_en'),
        placeholder: t('inputPlaceholder.mk_en'),
      },
    ],
    [t],
  );

  const {
    directionId,
    setDirectionId,
    selectedDirection,
    inputText,
    setInputText,
    translatedText,
    detectedLanguage,
    isTranslating,
    errorMessage,
    copiedState,
    history,
    handleTranslate,
    handleSwapDirections,
    handleClear,
    handleCopy,
    handleHistoryLoad,
  } = useTranslatorWorkspace({
    directionOptions,
    defaultDirectionId: 'en-mk',
    messages: {
      genericError: t('errorGeneric'),
      copyError: t('copyError'),
    },
    historyLimit: 12,
  });

  const { phrases, savePhrase, deletePhrase, findMatchingPhrase } = useSavedPhrases();

  const currentPayload = useMemo(() => {
    const source = inputText.trim();
    const result = translatedText.trim();
    if (!source || !result) return null;
    return { sourceText: source, translatedText: result, directionId } as const;
  }, [directionId, inputText, translatedText]);

  const savedMatch = currentPayload ? findMatchingPhrase(currentPayload) : undefined;
  const isCurrentSaved = Boolean(savedMatch);

  const characterCount = `${inputText.length} / ${MAX_CHARACTERS}`;
  const pasteLabel = t('paste', { default: 'Paste text' }) || 'Paste text';
  const pasteHelper = t('pasteHelper', { default: 'Paste and translate instantly.' });
  const historyLabel = t('history', { default: 'History' }) || 'History';
  const savedLabel = t('saved', { default: 'Saved' }) || 'Saved';
  const historyCount = history.length;
  const savedCount = phrases.length;
  const historyCountLabel = historyCount > 99 ? '99+' : historyCount;
  const savedCountLabel = savedCount > 99 ? '99+' : savedCount;
  const showLoadingSkeleton = isTranslating && !translatedText;
  const counterTone = (() => {
    const ratio = inputText.length / MAX_CHARACTERS;
    if (ratio >= 0.92) return 'text-red-200';
    if (ratio >= 0.75) return 'text-amber-200';
    if (ratio > 0.4) return 'text-white/75';
    return 'text-white/65';
  })();
  const sourceLabel = t('inputLabel', { default: 'Source text' });
  const inputHelper = t('inputHelper', { default: 'Paste or type up to 1800 characters.' });

  const handleSaveToggle = () => {
    if (!currentPayload) return;

    if (isCurrentSaved && savedMatch) {
      deletePhrase(savedMatch.id);
      addToast({
        type: 'info',
        description: t('phraseUnsaved'),
      });
    } else {
      savePhrase(currentPayload);
      addToast({
        type: 'success',
        description: t('phraseSaved'),
      });
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator?.clipboard?.readText) {
        addToast({
          type: 'error',
          description: t('pasteUnavailable', { default: 'Clipboard access is blocked in this browser.' }),
        });
        return;
      }

      const clip = await navigator.clipboard.readText();
      if (!clip) {
        addToast({
          type: 'info',
          description: t('pasteEmpty', { default: 'Clipboard is empty.' }),
        });
        return;
      }

      const next = clip.slice(0, MAX_CHARACTERS);
      setInputText(next);
      textareaRef.current?.focus();
      addToast({
        type: 'success',
        description: t('pasted', { default: 'Pasted text from clipboard.' }),
      });
    } catch (error) {
      console.error('[translate] paste failed', error);
      addToast({
        type: 'error',
        description: t('pasteError', { default: 'Unable to read clipboard. Check permissions and try again.' }),
      });
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-3 pb-24 px-4 sm:max-w-3xl sm:gap-4 sm:pb-6">
      {/* Back Navigation */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
      >
        <Link href={`/${locale}/learn`} aria-label={navT('backToDashboard')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {navT('backToDashboard')}
        </Link>
      </Button>

      {/* Compact Header */}
      <TooltipProvider delayDuration={120}>
        <header className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t('title', { default: 'Translate' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('subtitle', { default: 'English ↔ Macedonian' })}
            </p>
            {/* Version badge removed for production */}
          </div>
          <div className="flex flex-wrap gap-2 min-w-0 sm:justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryOpen(true)}
                  className="gap-2 border-white/15 bg-white/10 text-foreground hover:border-primary/50 hover:bg-primary/10"
                >
                  <History className="h-4 w-4" aria-hidden="true" />
                  <span>{historyLabel}</span>
                  <span className="flex min-w-[1.75rem] items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-semibold leading-[16px] text-white/90">
                    {historyCountLabel}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="text-sm">
                {t('historyTooltip', { default: 'View your recent translations' })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSavedOpen(true)}
                  className="gap-2 border-white/15 bg-white/10 text-foreground hover:border-primary/50 hover:bg-primary/10"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>{savedLabel}</span>
                  <span className="flex min-w-[1.75rem] items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-semibold leading-[16px] text-white/90">
                    {savedCountLabel}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center" className="text-sm">
                {t('savedTooltip', { default: 'Open your saved phrases' })}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>
      </TooltipProvider>
      <p className="text-xs text-white/75 sm:hidden">
        {t('historyTooltip', { default: 'History: recent translations' })} · {t('savedTooltip', { default: 'Saved: your phrases' })}
      </p>

      {/* Link to Reader */}
      <Link
        href={`/${locale}/reader`}
        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors hover:border-primary/40 hover:bg-primary/5 sm:p-4"
      >
        <BookOpen className="h-4 w-4 text-white/80" />
        <span className="text-foreground">
          {t('tryReader', { default: 'Try Reader mode for longer texts' })}
        </span>
      </Link>

      {/* Direction Toggle */}
      <div className="rounded-2xl border border-white/8 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            {t('directionsGroupLabel', { default: 'Translation direction' })}
          </p>
          <button
            onClick={handleSwapDirections}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary sm:text-sm"
            aria-label={t('swapDirections', { default: 'Swap languages' })}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">{t('swapDirections', { default: 'Swap languages' })}</span>
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {directionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setDirectionId(option.id)}
              className={cn(
                'flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                directionId === option.id
                  ? 'bg-white text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
                  : 'border border-transparent text-white/85 hover:border-white/15 hover:bg-white/5 hover:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          void handleTranslate(e);
        }}
        className="space-y-3"
      >
        <div className="rounded-2xl border border-white/8 bg-white/5 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                {sourceLabel}
              </p>
              <p className="text-sm text-white/80">{inputHelper}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                className="h-10 gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-white/90 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              >
                <ClipboardPaste className="h-4 w-4" />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold">{pasteLabel}</span>
                  <span className="text-[11px] text-white/70">{pasteHelper}</span>
                </div>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!inputText}
                className="h-10 rounded-full border border-white/10 bg-white/10 px-4 text-white/80 hover:border-primary/60 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
              >
                {t('clearButton', { default: 'Clear' })}
              </Button>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARACTERS))}
            placeholder={selectedDirection?.placeholder}
            maxLength={MAX_CHARACTERS}
            className="min-h-[180px] resize-none rounded-2xl border border-white/10 bg-black/20 p-3 text-base text-foreground caret-primary placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-white/75">
            <span className={cn('font-medium transition-colors', counterTone)}>{characterCount}</span>
            <span className="text-white/75">{t('charactersLabel', { default: 'Characters used' })}</span>
          </div>
        </div>

        {/* Translate Button - Prominent */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-[#ffe16a] via-primary to-[#f4c542] text-lg font-bold text-slate-950 shadow-[0_18px_40px_rgba(0,0,0,0.45)] hover:brightness-[0.97]"
          disabled={isTranslating || !inputText.trim()}
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('translatingStatus', { default: 'Translating...' })}
            </>
          ) : (
            t('translateButton', { default: 'Translate' })
          )}
        </Button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {showLoadingSkeleton && (
        <div className="space-y-3 rounded-2xl border border-white/8 bg-white/5 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-24 rounded-lg bg-white/10" />
            <Skeleton className="h-8 w-16 rounded-full bg-white/15" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-4/5 bg-white/10" />
          </div>
        </div>
      )}

      {/* Result */}
      {translatedText && (
        <div className="space-y-3 rounded-2xl border border-white/8 bg-white/5 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {t('resultLabel', { default: 'Translation' })}
              </p>
              {detectedLanguage && (
                <p className="text-xs text-muted-foreground">
                  {t('detectedLanguage', { language: detectedLanguage })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copiedState === 'copied' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('copied', { default: 'Copied' })}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('copyButton', { default: 'Copy' })}
                    </span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={!currentPayload}
                className="gap-2"
              >
                {isCurrentSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">
                      {t('saved', { default: 'Saved' })}
                    </span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('saveButton', { default: 'Save' })}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-base text-foreground">{translatedText}</p>
        </div>
      )}

      {/* History Bottom Sheet */}
      <BottomSheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={t('history', { default: 'Translation History' })}
        description={t('historyDescription', { default: 'Your recent translations' })}
      >
        {history.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t('historyEmpty', { default: 'No history yet' })}
          </p>
        ) : (
          <BottomSheetList
            items={history}
            onItemClick={(item) => {
              handleHistoryLoad(item);
              setHistoryOpen(false);
            }}
            renderItem={(item) => (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{item.sourceText}</p>
                <p className="text-sm text-muted-foreground">{item.translatedText}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          />
        )}
      </BottomSheet>

      {/* Saved Phrases Bottom Sheet */}
      <BottomSheet
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        title={t('saved', { default: 'Saved Phrases' })}
        description={t('savedDescription', { default: 'Your bookmarked translations' })}
      >
        {phrases.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t('savedEmpty', { default: 'No saved phrases yet' })}
          </p>
        ) : (
          <div className="space-y-2">
            {phrases.map((phrase) => (
              <div
                key={phrase.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{phrase.sourceText}</p>
                  <p className="text-sm text-muted-foreground">{phrase.translatedText}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(phrase.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePhrase(phrase.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
