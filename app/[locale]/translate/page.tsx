'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
  ArrowLeft,
  Languages,
  BookOpen,
  X,
  Lightbulb,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ReaderWorkspace } from '@/components/reader/ReaderWorkspace';
import type { ReaderDirectionOption } from '@/components/translate/useReaderWorkspace';

const MAX_CHARACTERS = 1800;

export default function TranslatePage() {
  const t = useTranslations('translate');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const { addToast } = useToast();
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

  const [panel, setPanel] = useState<'history' | 'saved'>('history');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [showReaderHint, setShowReaderHint] = useState(false);
  const [readerHintDismissed, setReaderHintDismissed] = useState(false);
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

  // Check if we should show the Reader hint
  useEffect(() => {
    const dismissed = localStorage.getItem('reader-hint-dismissed');
    if (dismissed) {
      setReaderHintDismissed(true);
      return;
    }

    // Show hint if translated text is long (>100 words)
    if (translatedText && !isTranslating) {
      const wordCount = translatedText.trim().split(/\s+/).length;
      if (wordCount > 100) {
        setShowReaderHint(true);
      }
    }
  }, [translatedText, isTranslating]);

  const handleDismissReaderHint = () => {
    setShowReaderHint(false);
    setReaderHintDismissed(true);
    localStorage.setItem('reader-hint-dismissed', 'true');
  };

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
    <div className="space-y-4 sm:space-y-6">
      <section className="lab-hero" data-testid="translate-hero">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
            >
              <Link href={`/${locale}/dashboard`} aria-label={navT('backToDashboard')}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT('backToDashboard')}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-[44px] rounded-full border border-border/60 px-4 text-sm text-muted-foreground"
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
          <header className="page-header">
            <div className="page-header-content">
              <p className="page-header-badge">{t('badge')}</p>
              <h1 className="page-header-title">{t('title')}</h1>
              <p className="page-header-subtitle">{t('subtitle')}</p>
            </div>
          </header>
        </div>
      </section>

      <Tabs defaultValue="translate" className="w-full">
        <TabsList className="w-fit mb-6 p-1.5 bg-muted/40 backdrop-blur-sm border border-border/60">
          <TabsTrigger value="translate" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/90 data-[state=active]:to-emerald-600/90 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
            <Languages className="h-4 w-4" aria-hidden="true" />
            {t('translateTab')}
          </TabsTrigger>
          <TabsTrigger value="reader" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-primary data-[state=active]:text-slate-900 data-[state=active]:shadow-lg transition-all duration-200">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {t('readerTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="mt-0">
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
            className="glass-card rounded-2xl sm:rounded-[28px] p-4 sm:p-5 md:p-7"
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
              className="min-h-[120px] resize-none rounded-2xl border border-border/60 bg-background/50 px-3.5 py-3 text-sm shadow-inner placeholder:text-muted-foreground sm:min-h-[140px] sm:px-4 sm:text-base"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:mt-4 sm:gap-3">
              <span id="translate-character-count">{characterCount}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-[44px] rounded-full border border-border/60 px-4 text-xs text-muted-foreground"
                  onClick={handleClear}
                >
                  {t('clearButton')}
                </Button>
                <Button
                  type="submit"
                  className="min-h-[44px] rounded-full px-5 text-sm sm:px-7"
                  disabled={isTranslating}
                >
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

          <section className="glass-card space-y-3.5 rounded-2xl sm:rounded-[28px] p-4 sm:p-5 md:p-7 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{t('resultLabel')}</p>
                <p className="text-xs text-muted-foreground">
                  {detectedLanguage ? t('detectedLanguage', { language: detectedLanguage }) : t('resultEmptyDescription')}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="ml-auto min-h-[44px] rounded-full border border-border/60 px-4 text-xs text-muted-foreground"
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
              className="min-h-[180px] rounded-2xl border border-border/60 bg-background/50 px-3.5 py-3.5 shadow-inner sm:min-h-[200px] sm:px-4 sm:py-4"
              aria-live="polite"
            >
              {isTranslating ? (
                <StreamingSkeleton />
              ) : translatedText ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white sm:text-base">{streamedText}</p>
              ) : (
                <p className="text-xs text-muted-foreground sm:text-sm">{t('resultPlaceholder')}</p>
              )}
            </div>
            {showReaderHint && !readerHintDismissed && (
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-amber-500/10 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      💡 {t('readerHintTitle')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('readerHintDescription')}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-2 bg-gradient-to-r from-amber-500 to-primary text-slate-900 hover:from-amber-600 hover:to-primary/90"
                      onClick={() => {
                        const tabsList = document.querySelector('[role="tablist"]');
                        const readerTab = tabsList?.querySelector('[value="reader"]') as HTMLButtonElement;
                        readerTab?.click();
                        handleDismissReaderHint();
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                      {t('readerHintTryNow')}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={handleDismissReaderHint}
                    aria-label="Dismiss hint"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
            {currentPayload ? (
              <Button
                type="button"
                variant={isCurrentSaved ? 'secondary' : 'default'}
                className="w-full min-h-[48px] rounded-2xl px-4 py-3 text-sm sm:min-h-[52px] sm:px-5 sm:py-4 sm:text-base"
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
                className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 p-1"
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
        </TabsContent>

        <TabsContent value="reader" className="mt-0">
          <ReaderWorkspace
            directionOptions={directionOptions as ReaderDirectionOption[]}
            defaultDirectionId={directionId}
          />
        </TabsContent>
      </Tabs>
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
    <div className="glass-card rounded-2xl sm:rounded-[26px] p-4 sm:p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-[44px] rounded-full border border-border/60 px-4 text-xs text-muted-foreground"
          onClick={onSwap}
          aria-label={swapLabel}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {swapLabel}
        </Button>
      </div>
      <div
        className="mt-3 flex flex-1 flex-wrap gap-1.5 rounded-2xl border border-border/60 bg-gradient-to-r from-[#2b1216] via-[#131525] to-[#103420] p-1 sm:mt-4 sm:gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option, index) => {
          const isActive = option.id === activeId;
          const isFirst = index === 0;
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                'touch-target flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[16px] px-3 py-2 text-xs font-semibold transition sm:rounded-[18px] sm:px-4 sm:text-sm md:text-base',
                isActive
                  ? isFirst
                    ? 'bg-gradient-to-r from-[#7c1f2d] to-[#b23542] text-white shadow-[0_18px_36px_rgba(0,0,0,0.55)]'
                    : 'bg-gradient-to-r from-[#1f6b3c] to-[#31a45b] text-white shadow-[0_18px_36px_rgba(0,0,0,0.55)]'
                  : 'bg-transparent text-muted-foreground hover:text-white',
                'border border-white/5 backdrop-blur'
              )}
              onClick={() => onChange(option.id)}
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
            >
              <span>{option.label}</span>
            </button>
          );
        })}
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
        active
          ? 'border border-border/60 bg-primary text-primary-foreground'
          : 'border border-transparent text-muted-foreground hover:border-border/60 hover:text-white',
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
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
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
            className="glass-card rounded-2xl p-4"
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
                  variant="ghost"
                  className="min-h-[44px] rounded-full border border-border/60 px-4 text-xs font-semibold text-foreground"
                  onClick={() => onLoad(phrase)}
                >
                  {loadLabel}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={removeLabel}
                  className="min-h-[44px] min-w-[44px] rounded-full border border-border/60 text-muted-foreground"
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
