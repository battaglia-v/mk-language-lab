'use client';

import { FormEvent, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Eye, EyeOff, RefreshCw, Upload, Sparkles } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      <DirectionToggle
        options={directionOptions}
        activeId={directionId}
        onChange={setDirectionId}
        onSwap={handleSwapDirections}
        label={t('directionsGroupLabel')}
        swapLabel={t('swapDirections')}
      />

      <form
        className="glass-card rounded-2xl sm:rounded-[28px] p-4 sm:p-5 md:p-7"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          void handleAnalyze(event);
        }}
      >
        <Textarea
          ref={textareaRef}
          value={inputText}
          onChange={(event) => setInputText(event.target.value.slice(0, MAX_CHARACTERS))}
          placeholder={selectedDirection?.placeholder || t('readerInputPlaceholder')}
          aria-label={t('readerInputLabel')}
          aria-describedby="reader-character-count"
          maxLength={MAX_CHARACTERS}
          className="min-h-[160px] resize-none rounded-2xl border border-border/60 bg-background/50 px-3.5 py-3 text-sm shadow-inner placeholder:text-muted-foreground sm:min-h-[200px] sm:px-4 sm:text-base"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:mt-5">
          <span id="reader-character-count" className="text-xs text-muted-foreground">{characterCount}</span>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleClear}
              disabled={!inputText && !analyzedData}
            >
              {t('clearButton')}
            </Button>
            <TextImporter
              onImportURL={handleImportFromURL}
              onImportFile={handleImportFromFile}
              isImporting={isImporting}
            />
            <Button
              type="submit"
              size="default"
              disabled={!inputText.trim() || isAnalyzing}
              className="font-semibold bg-gradient-to-r from-amber-500 to-primary text-slate-900 hover:from-amber-600 hover:to-primary/90 shadow-lg"
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground/80">
                {t('readerDifficultyLabel')}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs font-semibold border',
                  analyzedData.difficulty.level === 'beginner' && 'bg-green-600/15 text-green-400 border-green-600/30',
                  analyzedData.difficulty.level === 'intermediate' && 'bg-yellow-600/15 text-yellow-400 border-yellow-600/30',
                  analyzedData.difficulty.level === 'advanced' && 'bg-red-600/15 text-red-400 border-red-600/30'
                )}
              >
                {t(`readerDifficulty${analyzedData.difficulty.level.charAt(0).toUpperCase() + analyzedData.difficulty.level.slice(1)}`)}
              </span>
            </div>

            <Button
              type="button"
              variant={revealMode === 'hidden' ? 'default' : 'outline'}
              size="default"
              onClick={handleToggleReveal}
              className={cn(
                "w-full sm:w-auto font-semibold",
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
          </div>

          <WordByWordDisplay data={analyzedData} revealMode={revealMode} />

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">{t('readerFullTranslation')}:</p>
            <p className="text-sm leading-relaxed">{analyzedData.fullTranslation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
