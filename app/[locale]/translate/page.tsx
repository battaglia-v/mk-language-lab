'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ArrowLeftRight, BookmarkCheck, BookmarkPlus, Check, Copy, Loader2, Sparkles, ShieldAlert, BookOpen } from 'lucide-react';
import { WebStatPill } from '@mk/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useTranslatorWorkspace,
  type TranslationDirectionOption,
} from '@/components/translate/useTranslatorWorkspace';
import { HistoryList } from '@/components/translate/HistoryList';
import { InfoPanel } from '@/components/translate/InfoPanel';
import { cn } from '@/lib/utils';
import { SavedPhrasesPanel } from '@/components/translate/SavedPhrasesPanel';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { useToast } from '@/components/ui/use-toast';

const MAX_CHARACTERS = 1800;
const GOOGLE_TRANSLATE_URL = 'https://translate.google.com/?sl=en&tl=mk';

type MobileTabValue = 'workspace' | 'history' | 'saved';

const deriveMobileTab = (value: string | null): MobileTabValue => {
  if (value === 'history' || value === 'saved') {
    return value;
  }
  return 'workspace';
};

type DirectionToggleProps = {
  options: TranslationDirectionOption[];
  activeId: TranslationDirectionOption['id'];
  onChange: (id: TranslationDirectionOption['id']) => void;
  onSwap: () => void;
  swapLabel: string;
  groupLabel: string;
};

type TranslationResultProps = {
  label: string;
  translatedText: string;
  isTranslating: boolean;
  placeholderTitle: string;
  placeholderDescription: string;
  detectedLanguageLabel?: string;
  directionLabel: string;
  characterCountLabel: string;
  shortcutHint: string;
  copyState: 'idle' | 'copied';
  onCopy: () => void;
  copyIdleLabel: string;
  copySuccessLabel: string;
  directionStatLabel: string;
  charactersStatLabel: string;
  shortcutStatLabel: string;
  saveLabel: string;
  savedLabel: string;
  removeSavedLabel: string;
  onSavePhrase?: () => void;
  onRemoveSavedPhrase?: () => void;
  canSave?: boolean;
  isSavedPhrase?: boolean;
};

export default function TranslatePage() {
  const t = useTranslations('translate');
  const locale = useLocale();
  const searchParams = useSearchParams();
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

  const directionOptions = useMemo<TranslationDirectionOption[]>(
    () => [
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: directionLabels.mk_en ?? 'Macedonian → English',
        placeholder: placeholderLabels.mk_en ?? 'Type Macedonian sentences to translate into English…',
      },
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: directionLabels.en_mk ?? 'English → Macedonian',
        placeholder: placeholderLabels.en_mk ?? 'Type English sentences to translate into Macedonian…',
      },
    ],
    [directionLabels.en_mk, directionLabels.mk_en, placeholderLabels.en_mk, placeholderLabels.mk_en]
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
  });

  const { toast } = useToast();
  const { phrases, savePhrase, deletePhrase, clearAll, findMatchingPhrase } = useSavedPhrases();

  const panelParam = searchParams?.get('panel');
  const [mobileTab, setMobileTab] = useState<MobileTabValue>(() => deriveMobileTab(panelParam));
  useEffect(() => {
    setMobileTab(deriveMobileTab(panelParam));
  }, [panelParam]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const historyTimestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    []
  );
  const savedTimestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputText]);

  const characterCountLabel = t('characterCount', { count: inputText.length, limit: MAX_CHARACTERS });
  const directionLabelMap = useMemo(() => {
    return directionOptions.reduce<Record<TranslationDirectionOption['id'], string>>((acc, option) => {
      acc[option.id] = option.label;
      return acc;
    }, {} as Record<TranslationDirectionOption['id'], string>);
  }, [directionOptions]);

  const practiceHref = `/${locale}/practice?practiceFixture=saved-phrases`;
  const translatorSavedHref = `/${locale}/translate?panel=saved`;

  const currentPayload = useMemo(() => {
    const source = inputText.trim();
    const result = translatedText.trim();
    if (!source || !result) return null;
    return { sourceText: source, translatedText: result, directionId } as const;
  }, [directionId, inputText, translatedText]);
  const savedMatch = currentPayload ? findMatchingPhrase(currentPayload) : undefined;
  const isCurrentSaved = Boolean(savedMatch);

  const handleSaveCurrentPhrase = () => {
    if (!currentPayload) return;
    savePhrase(currentPayload);
    toast({ description: t('savedToastAdded') });
  };

  const handleRemoveCurrentPhrase = () => {
    if (!savedMatch) return;
    deletePhrase(savedMatch.id);
    toast({ description: t('savedToastRemoved') });
  };

  const handleClearSaved = () => {
    if (!phrases.length) return;
    clearAll();
    toast({ description: t('savedToastCleared') });
  };

  const tips = useMemo(() => {
    const raw = t.raw('tips');
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const fallbackSteps = useMemo(() => {
    const raw = t.raw('fallbackSteps');
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const savedPanelLabels = {
    title: t('savedTitle'),
    description: t('savedSubtitle'),
    emptyTitle: t('savedEmptyTitle'),
    emptyDescription: t('savedEmptyDescription'),
    practiceCta: t('savedPracticeCta'),
    manageCta: t('savedManageCta'),
    removeLabel: t('savedRemoveLabel'),
    clearLabel: t('savedClearLabel'),
    timestampLabel: (value: string) =>
      t('savedTimestamp', {
        value: savedTimestampFormatter.format(new Date(value)),
      }),
  } as const;

  const savedPhrasesPane = (
    <SavedPhrasesPanel
      phrases={phrases}
      directionLabelMap={directionLabelMap}
      onRemove={deletePhrase}
      onClear={handleClearSaved}
      practiceHref={practiceHref}
      manageHref={translatorSavedHref}
      labels={savedPanelLabels}
    />
  );

  const workspacePaneClass = 'glass-card rounded-3xl p-5 shadow-lg';
  const workspacePane = (
    <div className={cn(workspacePaneClass, 'space-y-5')}>
      <DirectionToggle
        options={directionOptions}
        activeId={directionId}
        onChange={(id) => setDirectionId(id)}
        onSwap={handleSwapDirections}
        swapLabel={t('swapDirections')}
        groupLabel={t('directionsGroupLabel')}
      />

      <form
        className="space-y-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          void handleTranslate(event);
        }}
      >
        <div className="space-y-2">
          <label htmlFor="translate-input" className="text-sm font-semibold text-foreground">
            {t('inputLabel')}
          </label>
          <Textarea
            id="translate-input"
            ref={textareaRef}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={selectedDirection?.placeholder}
            maxLength={MAX_CHARACTERS}
            aria-describedby="translate-character-count"
            className="min-h-[140px] resize-none rounded-2xl border border-border/60 bg-background/80 text-base"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void handleTranslate();
              }
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
            <span id="translate-character-count">{characterCountLabel}</span>
            <span>{t('shortcutHint')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={isTranslating}
            className="h-11 w-full rounded-2xl text-sm font-semibold sm:h-12 sm:w-auto sm:text-base"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('translatingStatus')}
              </>
            ) : (
              t('translateButton')
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="h-11 rounded-2xl border border-border/40 text-sm font-semibold text-muted-foreground"
          >
            {t('clearButton')}
          </Button>
        </div>
      </form>

      {errorMessage ? (
        <Alert variant="destructive" className="rounded-2xl border border-destructive/30 bg-destructive/10">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <TranslationResult
        label={t('resultLabel')}
        translatedText={translatedText}
        isTranslating={isTranslating}
        placeholderTitle={t('resultEmptyTitle')}
        placeholderDescription={t('resultEmptyDescription')}
        detectedLanguageLabel={
          detectedLanguage ? t('detectedLanguage', { language: languageLabels[detectedLanguage] ?? detectedLanguage }) : undefined
        }
        directionLabel={directionLabelMap[directionId]}
        characterCountLabel={characterCountLabel}
        shortcutHint={t('shortcutHint')}
        copyState={copiedState}
        onCopy={handleCopy}
        copyIdleLabel={t('copyButton')}
        copySuccessLabel={t('copied')}
        directionStatLabel={t('directionsGroupLabel')}
        charactersStatLabel={t('characterCount', { count: inputText.length, limit: MAX_CHARACTERS })}
        shortcutStatLabel={t('shortcutHint')}
        saveLabel={t('savePhraseButton')}
        savedLabel={t('savedPhraseButton')}
        removeSavedLabel={t('removeSavedPhraseButton')}
        onSavePhrase={handleSaveCurrentPhrase}
        onRemoveSavedPhrase={handleRemoveCurrentPhrase}
        canSave={Boolean(currentPayload)}
        isSavedPhrase={isCurrentSaved}
      />
    </div>
  );

  const insightsPane = (
    <div className="space-y-6">
      <div className={cn(workspacePaneClass, 'space-y-4')}>
        <div>
          <p className="text-base font-semibold text-white">{t('historyTitle')}</p>
          <p className="text-sm text-slate-300">{t('historySubtitle')}</p>
        </div>
        <HistoryList
          entries={history}
          directionLabelMap={directionLabelMap}
          onSelect={handleHistoryLoad}
          emptyTitle={t('historyTitle')}
          emptyDescription={t('historyEmpty')}
          loadLabel={t('historyLoad')}
          sourceLabel={t('inputLabel')}
          resultLabel={t('resultLabel')}
          formatTimestamp={(timestamp) => historyTimestampFormatter.format(timestamp)}
          showSkeleton={isTranslating && history.length === 0 && Boolean(inputText)}
        />
      </div>

      <InfoPanel
        title={t('fallbackTitle')}
        description={t('fallbackDescription')}
        items={fallbackSteps}
        icon={<ShieldAlert className="h-4 w-4" />}
        cta={{
          label: t('fallbackExternalCta'),
          href: GOOGLE_TRANSLATE_URL,
          note: t('fallbackExternalNote'),
          external: true,
        }}
      />

      <InfoPanel
        title={t('tipsTitle')}
        items={tips}
        icon={<Sparkles className="h-4 w-4" />}
      />

      <InfoPanel
        title={t('resourcesTitle')}
        description={t('resourcesDescription')}
        icon={<BookOpen className="h-4 w-4" />}
        cta={{
          label: t('resourcesCta'),
          href: '/resources',
        }}
      />
    </div>
  );

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section
          data-testid="translate-hero"
          className="glass-card rounded-3xl p-5 shadow-lg md:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-white">{t('title')}</p>
              <p className="text-sm text-slate-300">{t('subtitle')}</p>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
              {t('badge')}
            </Badge>
          </div>
        </section>

        <section
          data-testid="translate-workspace"
          className="glass-card rounded-3xl p-4 shadow-lg md:p-6"
        >
          <div className="md:hidden">
            <Tabs value={mobileTab} onValueChange={(value) => setMobileTab(value as MobileTabValue)}>
              <TabsList className="w-full">
                <TabsTrigger value="workspace" className="flex-1">
                  {t('workspaceTab')}
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">
                  {t('savedTab')}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  {t('historyTab')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="workspace" className="mt-4">
                {workspacePane}
              </TabsContent>
              <TabsContent value="saved" className="mt-4">
                {savedPhrasesPane}
              </TabsContent>
              <TabsContent value="history" className="mt-4 space-y-6">
                {insightsPane}
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden gap-6 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {workspacePane}
            <div className="space-y-6">
              {savedPhrasesPane}
              {insightsPane}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DirectionToggle({ options, activeId, onChange, onSwap, swapLabel, groupLabel }: DirectionToggleProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid w-full grid-cols-2 gap-2" role="radiogroup" aria-label={groupLabel}>
        {options.map((option) => {
          const isActive = option.id === activeId;
          return (
            <Button
              key={option.id}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onChange(option.id)}
              role="radio"
              aria-checked={isActive}
              className="h-11 rounded-2xl border border-border/60 text-xs font-semibold uppercase tracking-wide"
            >
              {option.label}
            </Button>
          );
        })}
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onSwap}
        aria-label={swapLabel}
        className="h-11 w-11 rounded-full border border-border/60 p-0 text-muted-foreground"
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TranslationResult({
  label,
  translatedText,
  isTranslating,
  placeholderTitle,
  placeholderDescription,
  detectedLanguageLabel,
  directionLabel,
  characterCountLabel,
  shortcutHint,
  copyState,
  onCopy,
  copyIdleLabel,
  copySuccessLabel,
  directionStatLabel,
  charactersStatLabel,
  shortcutStatLabel,
  saveLabel,
  savedLabel,
  removeSavedLabel,
  onSavePhrase,
  onRemoveSavedPhrase,
  canSave = false,
  isSavedPhrase = false,
}: TranslationResultProps) {
  const showSkeleton = isTranslating && !translatedText;
  const isSaved = Boolean(isSavedPhrase);
  const canSavePhrase = Boolean(canSave);
  const saveButtonDisabled = !translatedText || (!isSaved && !canSavePhrase);
  const saveButtonHandler = () => {
    if (isSaved) {
      onRemoveSavedPhrase?.();
    } else {
      onSavePhrase?.();
    }
  };
  return (
    <div className="space-y-4 rounded-3xl border border-border/40 bg-background/60 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {detectedLanguageLabel ? (
            <p className="text-xs text-muted-foreground">{detectedLanguageLabel}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!translatedText}
            onClick={onCopy}
            className="rounded-full border-border/60 text-xs font-semibold"
          >
            {copyState === 'copied' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {copySuccessLabel}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {copyIdleLabel}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant={isSaved ? 'default' : 'secondary'}
            disabled={saveButtonDisabled}
            onClick={saveButtonHandler}
            aria-label={isSaved ? removeSavedLabel : saveLabel}
            className="rounded-full border-border/60 text-xs font-semibold"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                {savedLabel}
              </>
            ) : (
              <>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                {saveLabel}
              </>
            )}
          </Button>
        </div>
      </div>

      <div
        aria-live="polite"
        className="min-h-[150px] rounded-2xl border border-border/40 bg-card/70 p-4 text-base leading-relaxed text-foreground"
      >
        {showSkeleton ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : translatedText ? (
          <p className="whitespace-pre-wrap">{translatedText}</p>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{placeholderTitle}</p>
            <p>{placeholderDescription}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <WebStatPill label={directionStatLabel} value={directionLabel} accent="gold" />
        <WebStatPill label={charactersStatLabel} value={characterCountLabel} accent="red" />
        <WebStatPill label={shortcutStatLabel} value={shortcutHint} accent="green" />
      </div>
    </div>
  );
}
