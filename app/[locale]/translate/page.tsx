'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Copy, Check, Loader2, RefreshCw, History, BookmarkPlus, BookmarkCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslatorWorkspace, type TranslationDirectionOption } from '@/components/translate/useTranslatorWorkspace';
import { HistoryList } from '@/components/translate/HistoryList';
import { SavedPhrasesPanel } from '@/components/translate/SavedPhrasesPanel';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

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
  const [streamedText, setStreamedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { phrases, savePhrase, deletePhrase, clearAll, findMatchingPhrase } = useSavedPhrases();
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
    textarea.style.height = `${Math.min(240, textarea.scrollHeight)}px`;
  }, [inputText]);

  const characterCount = t('characterCount', { count: inputText.length, limit: MAX_CHARACTERS });
  const practiceHref = `/${locale}/practice?practiceFixture=saved-phrases`;
  const manageHref = `/${locale}/translate?panel=saved`;

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

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="ml-auto flex items-center gap-3 rounded-full border border-border/60 px-4 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('liveStatus')}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <DirectionToggle
            options={directionOptions}
            activeId={directionId}
            onChange={setDirectionId}
            onSwap={handleSwapDirections}
          />
          <form
            className="glass-card space-y-4 p-6"
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
              className="min-h-[120px] resize-none rounded-2xl border border-border/60 bg-background/70 text-base"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{characterCount}</span>
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

          <div className="glass-card space-y-3 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('resultLabel')}</p>
                <p className="text-sm text-muted-foreground">{detectedLanguage ? t('detectedLanguage', { language: detectedLanguage }) : t('resultEmptyDescription')}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-xs text-muted-foreground"
                onClick={handleCopy}
              >
                {copiedState === 'copied' ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" aria-hidden="true" /> {t('copied')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="h-4 w-4" aria-hidden="true" /> {t('copyButton')}
                  </span>
                )}
              </Button>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 min-h-[180px]">
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
                variant="outline"
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
          </div>
        </div>

        <div className="glass-card p-6">
          <Tabs value={panel} onValueChange={(value) => setPanel(value as 'history' | 'saved')}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-background/60">
              <TabsTrigger value="history" className="rounded-2xl">
                <History className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('historyTitle')}
              </TabsTrigger>
              <TabsTrigger value="saved" className="rounded-2xl">
                <BookmarkCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('savedTitle')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
                <HistoryList
                  entries={history}
                  directionLabelMap={directionOptions.reduce<Record<TranslationDirectionOption['id'], string>>((acc, option) => {
                    acc[option.id] = option.label;
                    return acc;
                  }, {} as Record<TranslationDirectionOption['id'], string>)}
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
            </TabsContent>
            <TabsContent value="saved" className="mt-4">
              <SavedPhrasesPanel
                phrases={phrases}
                directionLabelMap={directionOptions.reduce<Record<string, string>>((acc, option) => {
                  acc[option.id] = option.label;
                  return acc;
                }, {})}
                onRemove={deletePhrase}
                onClear={clearAll}
                practiceHref={practiceHref}
                manageHref={manageHref}
                labels={{
                  title: t('savedTitle'),
                  description: t('savedSubtitle'),
                  emptyTitle: t('savedEmptyTitle'),
                  emptyDescription: t('savedEmptyDescription'),
                  practiceCta: t('savedPracticeCta'),
                  manageCta: t('savedManageCta'),
                  removeLabel: t('savedRemoveLabel'),
                  clearLabel: t('savedClearLabel'),
                  timestampLabel: (value: string) => new Date(value).toLocaleString(),
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

type DirectionToggleProps = {
  options: TranslationDirectionOption[];
  activeId: TranslationDirectionOption['id'];
  onChange: (id: TranslationDirectionOption['id']) => void;
  onSwap: () => void;
};

function DirectionToggle({ options, activeId, onChange, onSwap }: DirectionToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border/60 bg-background/70 p-4">
      {options.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant={option.id === activeId ? 'default' : 'ghost'}
          className={cn(
            'rounded-2xl border border-transparent px-4',
            option.id === activeId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
      <Button type="button" variant="outline" className="rounded-2xl border-border/60" onClick={onSwap}>
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Swap
      </Button>
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
