'use client';

import { FormEvent, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Eye, EyeOff, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:mt-4 sm:gap-3">
          <span id="reader-character-count">{characterCount}</span>
          <div className="flex flex-wrap gap-2">
            <TextImporter
              onImportURL={handleImportFromURL}
              onImportFile={handleImportFromFile}
              isImporting={isImporting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!inputText && !analyzedData}
              className="min-h-[44px]"
            >
              {t('clearButton')}
            </Button>
            <Button
              type="submit"
              disabled={!inputText.trim() || isAnalyzing}
              className="min-h-[44px] font-bold"
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

      {analyzedData && (
        <div className="glass-card rounded-2xl sm:rounded-[28px] p-4 sm:p-5 md:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                {t('readerDifficultyLabel')}:
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                  analyzedData.difficulty.level === 'beginner' && 'bg-green-600/20 text-green-400',
                  analyzedData.difficulty.level === 'intermediate' && 'bg-yellow-600/20 text-yellow-400',
                  analyzedData.difficulty.level === 'advanced' && 'bg-red-600/20 text-red-400'
                )}
              >
                {t(`readerDifficulty${analyzedData.difficulty.level.charAt(0).toUpperCase() + analyzedData.difficulty.level.slice(1)}`)}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleReveal}
              className="min-h-[44px]"
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
