'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Copy,
  Check,
  Loader2,
  RefreshCw,
  History,
  BookmarkPlus,
  BookmarkCheck,
  PanelRightClose,
  PanelLeftOpen,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useTranslatorWorkspace,
  type TranslationDirectionOption,
  type TranslationHistoryEntry,
} from '@/components/translate/useTranslatorWorkspace';
import { HistoryList } from '@/components/translate/HistoryList';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { SavedPhraseRecord } from '@/lib/saved-phrases';

const MAX_CHARACTERS = 1800;

export default function TranslatePage() {
  const t = useTranslations('translate');
  const locale = useLocale();
  const { addToast } = useToast();
  const directionOptions: TranslationDirectionOption[] = useMemo(
    () => [
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: t('directions.mk_en'),
        placeholder: t('inputPlaceholder.mk_en'),
      },
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: t('directions.en_mk'),
        placeholder: t('inputPlaceholder.en_mk'),
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

  const [panel, setPanel] = useState<'history' | 'saved'>('history');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { phrases, savePhrase, deletePhrase, clearAll, findMatchingPhrase } = useSavedPhrases();
  const directionLabelMap = useMemo(
    () =>
      directionOptions.reduce<Record<TranslationDirectionOption['id'], string>>((acc, option) => {
        acc[option.id] = option.label;
        return acc;
      }, {} as Record<TranslationDirectionOption['id'], string>),
    [directionOptions],
  );

  const currentPayload = useMemo(() => {
    const source = inputText.trim();
    const result = translatedText.trim();
    if (!source || !result) return null;
    return { sourceText: source, translatedText: result, directionId } as const;
  }, [directionId, inputText, translatedText]);
  const savedMatch = currentPayload ? findMatchingPhrase(currentPayload) : undefined;
  const isCurrentSaved = Boolean(savedMatch);

  useEffect(() => {
    if (isTranslating) {
      setStreamedText('');
      return;
    }
    if (!translatedText) {
      setStreamedText('');
      return;
    }
    let frame: number;
    let index = 0;
    const total = translatedText.length;
    const tick = () => {
      index = Math.min(total, index + Math.max(1, Math.floor(total / 28)));
      setStreamedText(translatedText.slice(0, index));
      if (index < total) {
        frame = window.setTimeout(tick, 16);
      }
    };
    tick();
    return () => {
      if (frame) window.clearTimeout(frame);
    };
  }, [isTranslating, translatedText]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(280, textarea.scrollHeight)}px`;
  }, [inputText]);

  const characterCount = t('characterCount', { count: inputText.length, limit: MAX_CHARACTERS });

  const handleSave = () => {
    if (!currentPayload) return;
    savePhrase(currentPayload);
    addToast({ description: t('savedToastAdded') });
  };

  const handleRemove = () => {
    if (!savedMatch) return;
    deletePhrase(savedMatch.id);
    addToast({ description: t('savedToastRemoved') });
  };

  const handleLoadSaved = (phrase: SavedPhraseRecord) => {
    const entry: TranslationHistoryEntry = {
      id: phrase.id,
      directionId: phrase.directionId,
      sourceText: phrase.sourceText,
      translatedText: phrase.translatedText,
      timestamp: new Date(phrase.createdAt).getTime(),
    };
    handleHistoryLoad(entry);
    setPanel('history');
  };

  return (
    <div className="space-y-6">
      <section className="lab-hero" data-testid="translate-hero">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{t('badge')}</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <span className="title-gradient text-4xl lowercase">македонски</span>
              <span className="text-sm text-muted-foreground">MK LANGUAGE LAB · {locale.toUpperCase()}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{t('title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-border/50 text-muted-foreground"
            onClick={() => setPanelCollapsed((prev) => !prev)}
            aria-label={panelCollapsed ? t('contextExpand') : t('contextCollapse')}
          >
            {panelCollapsed ? (
              <span className="inline-flex items-center gap-2">
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" /> {t('contextExpand')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <PanelRightClose className="h-4 w-4" aria-hidden="true" /> {t('contextCollapse')}
              </span>
            )}
          </Button>
        </div>
      </section>

      <div className={cn('lab-grid', !panelCollapsed && 'has-panel')} data-testid="translate-workspace">
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
            className="rounded-3xl border border-border/60 bg-black/30 card-padding-lg md:p-7"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              void handleTranslate(event);
            }}
          >
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(event) => setInputText(event.target.value.slice(0, MAX_CHARACTERS))}
              placeholder={selectedDirection?.placeholder}
              aria-label={t('inputLabel')}
              aria-describedby="translate-character-count"
              maxLength={MAX_CHARACTERS}
              className="min-h-[140px] resize-none rounded-3xl border border-border/60 bg-transparent text-base"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span id="translate-character-count">{characterCount}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full text-xs text-muted-foreground"
                  onClick={handleClear}
                >
                  {t('clearButton')}
                </Button>
                <Button type="submit" className="rounded-full px-6" disabled={isTranslating}>
                  {isTranslating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      {t('translatingStatus')}
                    </span>
                  ) : (
                    t('translateButton')
                  )}
                </Button>
              </div>
            </div>
          </form>

          <section className="space-y-4 rounded-3xl border border-border/60 bg-black/30 card-padding-lg md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{t('resultLabel')}</p>
                <p className="text-xs text-muted-foreground">
                  {detectedLanguage ? t('detectedLanguage', { language: detectedLanguage }) : t('resultEmptyDescription')}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="ml-auto rounded-full text-xs text-muted-foreground"
                onClick={handleCopy}
              >
                {copiedState === 'copied' ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" aria-hidden="true" /> {t('copied')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Copy className="h-4 w-4" aria-hidden="true" /> {t('copyButton')}
                  </span>
                )}
              </Button>
            </div>
            <div
              className="rounded-2xl border border-border/60 bg-black/40 p-4 min-h-[200px]"
              aria-live="polite"
            >
              {isTranslating ? (
                <StreamingSkeleton />
              ) : translatedText ? (
                <p className="whitespace-pre-wrap text-base leading-relaxed text-white">{streamedText}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t('resultPlaceholder')}</p>
              )}
            </div>
            {currentPayload ? (
              <Button
                type="button"
                variant={isCurrentSaved ? 'outline' : 'default'}
                className="w-full rounded-2xl border-border/60"
                onClick={isCurrentSaved ? handleRemove : handleSave}
              >
                <span className="flex items-center justify-center gap-2">
                  {isCurrentSaved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                  {isCurrentSaved ? t('savedPhraseButton') : t('savePhraseButton')}
                </span>
              </Button>
            ) : null}
            {errorMessage ? (
              <Alert variant="destructive" className="rounded-2xl border border-destructive/40 bg-destructive/10">
                <AlertDescription className="text-sm text-destructive-foreground">
                  {errorMessage}
                  {isRetryable ? ` ${t('retryableHint')}` : ''}
                </AlertDescription>
              </Alert>
            ) : null}
          </section>
        </div>

        {!panelCollapsed ? (
          <aside className="context-panel space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div
                role="tablist"
                aria-label={t('contextPanelLabel')}
                className="inline-flex items-center rounded-full border border-border/50 bg-black/40 p-1"
              >
                <PanelToggleButton
                  icon={History}
                  active={panel === 'history'}
                  label={t('historyTitle')}
                  onClick={() => setPanel('history')}
                />
                <PanelToggleButton
                  icon={BookmarkCheck}
                  active={panel === 'saved'}
                  label={t('savedTitle')}
                  onClick={() => setPanel('saved')}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-border/60 text-muted-foreground"
                onClick={() => setPanelCollapsed(true)}
                aria-label={t('contextCollapse')}
              >
                <PanelRightClose className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {panel === 'history' ? (
              <HistoryList
                entries={history}
                directionLabelMap={directionLabelMap}
                onSelect={handleHistoryLoad}
                emptyTitle={t('historyEmpty')}
                emptyDescription={t('historySubtitle')}
                loadLabel={t('historyLoad')}
                sourceLabel={t('inputLabel')}
                resultLabel={t('resultLabel')}
                formatTimestamp={(timestamp) =>
                  new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(timestamp)
                }
              />
            ) : (
              <SavedList
                phrases={phrases}
                directionLabelMap={directionLabelMap}
                onLoad={handleLoadSaved}
                onRemove={(id) => deletePhrase(id)}
                onClear={() => {
                  clearAll();
                  addToast({ description: t('savedToastCleared') });
                }}
                emptyTitle={t('savedEmptyTitle')}
                emptyDescription={t('savedEmptyDescription')}
                loadLabel={t('historyLoad')}
                removeLabel={t('savedRemoveLabel')}
                clearLabel={t('savedClearLabel')}
                countLabel={t('savedTitle')}
              />
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

type DirectionToggleProps = {
  options: TranslationDirectionOption[];
  activeId: TranslationDirectionOption['id'];
  onChange: (id: TranslationDirectionOption['id']) => void;
  onSwap: () => void;
  label: string;
  swapLabel: string;
};

function DirectionToggle({ options, activeId, onChange, onSwap, label, swapLabel }: DirectionToggleProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-black/30 card-padding">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full border border-border/60 text-xs text-muted-foreground"
          onClick={onSwap}
          aria-label={swapLabel}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {swapLabel}
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={cn(
              'touch-target rounded-full px-4 py-2 text-sm font-semibold transition',
              option.id === activeId
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onChange(option.id)}
            role="radio"
            aria-checked={option.id === activeId}
            aria-label={option.label}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type PanelToggleButtonProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
};

function PanelToggleButton({ icon: Icon, label, active, onClick }: PanelToggleButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        'touch-target flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition',
        active ? 'bg-white text-black' : 'text-muted-foreground hover:text-white',
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

type SavedListProps = {
  phrases: SavedPhraseRecord[];
  directionLabelMap: Record<string, string>;
  onLoad: (phrase: SavedPhraseRecord) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  emptyTitle: string;
  emptyDescription: string;
  loadLabel: string;
  removeLabel: string;
  clearLabel: string;
  countLabel: string;
};

function SavedList({
  phrases,
  directionLabelMap,
  onLoad,
  onRemove,
  onClear,
  emptyTitle,
  emptyDescription,
  loadLabel,
  removeLabel,
  clearLabel,
  countLabel,
}: SavedListProps) {
  if (!phrases.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-black/20 p-5 text-sm text-muted-foreground">
        <p className="text-base font-semibold text-white">{emptyTitle}</p>
        <p className="mt-2">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {phrases.length} · {countLabel}
        </span>
        <button
          type="button"
          className="text-muted-foreground underline decoration-dotted underline-offset-4"
          onClick={onClear}
        >
          {clearLabel}
        </button>
      </div>
      <ul className="space-y-3">
        {phrases.map((phrase) => (
          <li
            key={phrase.id}
            className="rounded-2xl border border-border/50 bg-black/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {directionLabelMap[phrase.directionId] ?? phrase.directionId}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{phrase.sourceText}</p>
                <p className="text-sm text-primary">{phrase.translatedText}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(phrase.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full border-border/60 text-xs"
                  onClick={() => onLoad(phrase)}
                >
                  {loadLabel}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={removeLabel}
                  className="text-muted-foreground"
                  onClick={() => onRemove(phrase.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StreamingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <Skeleton className="h-4 w-3/6" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
