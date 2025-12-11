'use client';

import { FormEvent, useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useReaderWorkspace,
  type ReaderDirectionOption,
} from '@/components/translate/useReaderWorkspace';
import { WordByWordDisplay } from './WordByWordDisplay';
import { TextImporter } from './TextImporter';

const MAX_CHARACTERS = 5000;

type DirectionToggleProps = {
  options: ReaderDirectionOption[];
  activeId: ReaderDirectionOption['id'];
  onChange: (id: ReaderDirectionOption['id']) => void;
  onSwap: () => void;
  label: string;
  swapLabel: string;
};

function DirectionToggle({ options, activeId, onChange, onSwap, label, swapLabel }: DirectionToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="inline-flex items-center gap-1.5 rounded-2xl bg-muted p-1.5" role="group" aria-label={label}>
        {options.map((option) => {
          const isActive = option.id === activeId;
          const bgClass = option.sourceLang === 'mk' ? 'bg-red-600/90' : 'bg-green-600/90';
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                isActive
                  ? `${bgClass} text-white shadow-md`
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onSwap}
        className="min-h-[44px] rounded-full border border-border/60 px-4"
        aria-label={swapLabel}
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        <span className="ml-2">{swapLabel}</span>
      </Button>
    </div>
  );
}

type ReaderWorkspaceProps = {
  directionOptions: ReaderDirectionOption[];
  defaultDirectionId?: ReaderDirectionOption['id'];
};

export function ReaderWorkspace({ directionOptions, defaultDirectionId }: ReaderWorkspaceProps) {
  const t = useTranslations('translate');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    directionId,
    setDirectionId,
    selectedDirection,
    inputText,
    setInputText,
    analyzedData,
    isAnalyzing,
    errorMessage,
    isRetryable,
    revealMode,
    isImporting,
    handleAnalyze,
    handleToggleReveal,
    handleClear,
    handleSwapDirections,
    handleImportFromURL,
    handleImportFromFile,
  } = useReaderWorkspace({
    directionOptions,
    defaultDirectionId,
    messages: {
      genericError: t('errorGeneric'),
      importError: t('readerImportError'),
    },
    historyLimit: 12,
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(320, textarea.scrollHeight)}px`;
  }, [inputText]);

  const characterCount = t('characterCount', { count: inputText.length, limit: MAX_CHARACTERS });

  const handleCopyTranslation = async () => {
    if (!analyzedData?.fullTranslation) return;
    try {
      await navigator.clipboard?.writeText(analyzedData.fullTranslation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy translation', error);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <DirectionToggle
        options={directionOptions}
        activeId={directionId}
        onChange={setDirectionId}
        onSwap={handleSwapDirections}
        label={t('directionsGroupLabel')}
        swapLabel={t('swapDirections')}
      />

      <form
        className="glass-card rounded-2xl sm:rounded-[28px] p-4 sm:p-6 md:p-7 bg-gradient-to-b from-card/90 via-card/70 to-muted/40 border border-border/40 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          void handleAnalyze(event);
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('readerInputLabel', { default: 'Paste text to analyze' })}
            </span>
            <span id="reader-character-count" className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground/90">
              {characterCount}
            </span>
          </div>

          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(event) => setInputText(event.target.value.slice(0, MAX_CHARACTERS))}
            placeholder={selectedDirection?.placeholder || t('readerInputPlaceholder')}
            aria-label={t('readerInputLabel')}
            aria-describedby="reader-character-count"
            maxLength={MAX_CHARACTERS}
            className="min-h-[180px] resize-none rounded-2xl border border-border/40 bg-white/5 px-3.5 py-3.5 text-base font-medium shadow-inner placeholder:text-muted-foreground sm:min-h-[220px] sm:px-4 sm:text-base focus-visible:ring-2 focus-visible:ring-primary/40"
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!inputText && !analyzedData}
                className="rounded-full border border-border/60"
              >
                {t('clearButton')}
              </Button>
              <TextImporter
                onImportURL={handleImportFromURL}
                onImportFile={handleImportFromFile}
                isImporting={isImporting}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!inputText.trim() || isAnalyzing}
              className="w-full sm:w-auto rounded-full px-6 font-semibold bg-gradient-to-r from-amber-500 to-primary text-slate-900 hover:from-amber-600 hover:to-primary/90 shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span className="ml-2">{t('readerAnalyzing')}</span>
                </>
              ) : (
                t('readerAnalyzeButton')
              )}
            </Button>
          </div>
        </div>
      </form>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{errorMessage}</span>
            {isRetryable && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => void handleAnalyze()}
                className="ml-2 min-h-[44px]"
              >
                {t('retryButton')}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isAnalyzing && (
        <div className="glass-card rounded-2xl sm:rounded-[28px] p-5 sm:p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-sm" />
              <Skeleton className="h-8 w-16 rounded-sm" />
              <Skeleton className="h-8 w-24 rounded-sm" />
              <Skeleton className="h-8 w-28 rounded-sm" />
              <Skeleton className="h-8 w-20 rounded-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-sm" />
              <Skeleton className="h-8 w-20 rounded-sm" />
              <Skeleton className="h-8 w-32 rounded-sm" />
              <Skeleton className="h-8 w-16 rounded-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-sm" />
              <Skeleton className="h-8 w-24 rounded-sm" />
              <Skeleton className="h-8 w-20 rounded-sm" />
              <Skeleton className="h-8 w-36 rounded-sm" />
            </div>
          </div>
        </div>
      )}

      {!analyzedData && !isAnalyzing && !errorMessage && (
        <div className="glass-card rounded-2xl sm:rounded-[28px] p-8 sm:p-10 md:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-primary/20 mb-2">
            <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{t('readerEmptyTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('readerEmptyDescription')}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('readerEmptyExamplesLabel')}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInputText("Hello, my name is John. I am learning Macedonian and I love the beautiful language and culture.")}
                className="text-xs"
              >
                {t('readerEmptyExample1')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInputText("Здраво, јас сум Јован. Јас учам македонски и го сакам прекрасниот јазик и култура.")}
                className="text-xs"
              >
                {t('readerEmptyExample2')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {analyzedData && !isAnalyzing && (
        <div className="glass-card rounded-2xl sm:rounded-[28px] p-5 sm:p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-sm font-semibold text-muted-foreground/80">
                {t('readerDifficultyLabel')}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold border shadow-sm',
                  analyzedData.difficulty.level === 'beginner' && 'bg-green-600/12 text-green-400 border-green-600/30',
                  analyzedData.difficulty.level === 'intermediate' && 'bg-yellow-600/12 text-yellow-400 border-yellow-600/30',
                  analyzedData.difficulty.level === 'advanced' && 'bg-red-600/12 text-red-400 border-red-600/30'
                )}
              >
                {t(`readerDifficulty${analyzedData.difficulty.level.charAt(0).toUpperCase() + analyzedData.difficulty.level.slice(1)}`)}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-foreground/80 border border-border/40">
                {t('readerFullTranslation', { default: 'Full translation' })} · {analyzedData.metadata.wordCount} {t('readerWords', { default: 'words' })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={revealMode === 'hidden' ? 'default' : 'outline'}
                size="default"
                onClick={handleToggleReveal}
                className={cn(
                  "font-semibold rounded-full",
                  revealMode === 'hidden' && "bg-gradient-to-r from-green-600/90 to-emerald-600/90 hover:from-green-700 hover:to-emerald-700"
                )}
              >
                {revealMode === 'hidden' ? (
                  <>
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span className="ml-2">{t('readerRevealShow')}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                    <span className="ml-2">{t('readerRevealHide')}</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={() => void handleCopyTranslation()}
                className="rounded-full"
              >
                {copied ? t('copied', { default: 'Copied' }) : t('readerCopyTranslation', { default: 'Copy translation' })}
              </Button>
            </div>
          </div>

          <WordByWordDisplay data={analyzedData} revealMode={revealMode} />

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-border/40 bg-white/4 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('readerWords', { default: 'Words' })}</p>
              <p className="text-lg font-semibold text-foreground">{analyzedData.metadata.wordCount}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-white/4 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('readerSentences', { default: 'Sentences' })}</p>
              <p className="text-lg font-semibold text-foreground">{analyzedData.metadata.sentenceCount}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-white/4 px-4 py-3 sm:col-span-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('readerSource', { default: 'Source' })}</p>
              <p className="text-sm font-semibold text-foreground">{selectedDirection?.label}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">{t('readerFullTranslation')}:</p>
            <p className="text-sm leading-relaxed text-foreground/90">{analyzedData.fullTranslation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
