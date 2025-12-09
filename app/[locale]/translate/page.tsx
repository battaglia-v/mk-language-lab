'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  Copy,
  Check,
  Loader2,
  History,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomSheet, BottomSheetList } from '@/components/ui/BottomSheet';
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
    isRetryable,
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

  const { phrases, savePhrase, deletePhrase, clearAll, findMatchingPhrase } = useSavedPhrases();

  const currentPayload = useMemo(() => {
    const source = inputText.trim();
    const result = translatedText.trim();
    if (!source || !result) return null;
    return { sourceText: source, translatedText: result, directionId } as const;
  }, [directionId, inputText, translatedText]);

  const savedMatch = currentPayload ? findMatchingPhrase(currentPayload) : undefined;
  const isCurrentSaved = Boolean(savedMatch);

  const characterCount = `${inputText.length} / ${MAX_CHARACTERS}`;

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-24 sm:gap-4 sm:pb-6">
      {/* Compact Header */}
      <header className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t('title', { default: 'Translate' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('subtitle', { default: 'English ↔ Macedonian' })}
          </p>
        </div>
        <div className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="gap-2 border-white/15 bg-white/10 text-foreground hover:border-primary/50 hover:bg-primary/10"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t('history', { default: 'History' })}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSavedOpen(true)}
            className="gap-2 border-white/15 bg-white/10 text-foreground hover:border-primary/50 hover:bg-primary/10"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t('saved', { default: 'Saved' })}</span>
          </Button>
        </div>
      </header>

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
      <div className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/5 p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center">
        {directionOptions.map((option, index) => (
          <div key={option.id} className="flex w-full flex-1 items-center gap-2">
            <button
              onClick={() => setDirectionId(option.id)}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                directionId === option.id
                  ? 'bg-white text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
                  : 'border border-transparent text-white/75 hover:border-white/15 hover:bg-white/5 hover:text-white',
              )}
            >
              {option.label}
            </button>
            {index === 0 && (
              <button
                onClick={handleSwapDirections}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                aria-label={t('swapDirections', { default: 'Swap languages' })}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          void handleTranslate(e);
        }}
        className="space-y-3"
      >
        <div className="rounded-2xl border border-white/8 bg-white/5 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.45)]">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARACTERS))}
            placeholder={selectedDirection?.placeholder}
            maxLength={MAX_CHARACTERS}
            className="min-h-[160px] resize-none border-0 bg-transparent p-0 text-base text-foreground caret-primary placeholder:text-white/60 focus-visible:ring-0"
          />
          <div className="mt-3 flex items-center justify-between text-xs text-white/60">
            <span>{characterCount}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!inputText}
              className="text-white/80 hover:text-primary"
            >
              {t('clearButton', { default: 'Clear' })}
            </Button>
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
