'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Copy,
  Check,
  Loader2,
  History,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  ArrowLeftRight,
  ClipboardPaste,
  Volume2,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomSheet, BottomSheetList } from '@/components/ui/BottomSheet';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  useTranslatorWorkspace,
  type TranslationDirectionOption,
} from '@/components/translate/useTranslatorWorkspace';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout';

const MAX_CHARACTERS = 1800;

export default function TranslatePage() {
  const t = useTranslations('translate');
  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [moreOpen, setMoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [lastTranslatedInput, setLastTranslatedInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const directionOptions: TranslationDirectionOption[] = useMemo(
    () => [
      { id: 'en-mk', sourceLang: 'en', targetLang: 'mk', label: t('directions.en_mk'), placeholder: t('inputPlaceholder.en_mk') },
      { id: 'mk-en', sourceLang: 'mk', targetLang: 'en', label: t('directions.mk_en'), placeholder: t('inputPlaceholder.mk_en') },
    ],
    [t],
  );

  const directionUiOptions = useMemo(
    () =>
      directionOptions.map((opt) => ({
        value: opt.id,
        label: (
          <>
            <span className="sm:hidden">{opt.sourceLang.toUpperCase()} → {opt.targetLang.toUpperCase()}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </>
        ),
      })),
    [directionOptions],
  );

  const {
    directionId, setDirectionId, selectedDirection, inputText, setInputText,
    translatedText, isTranslating, errorMessage, copiedState, history,
    handleTranslate: originalHandleTranslate, handleSwapDirections, handleClear, handleCopy, handleHistoryLoad,
  } = useTranslatorWorkspace({
    directionOptions,
    defaultDirectionId: 'en-mk',
    messages: { genericError: t('errorGeneric'), copyError: t('copyError') },
    historyLimit: 12,
  });

  const { phrases, savePhrase, deletePhrase, findMatchingPhrase } = useSavedPhrases();

  // Wrap translate to track last input
  const handleTranslate = async (e: FormEvent<HTMLFormElement>) => {
    await originalHandleTranslate(e);
    setLastTranslatedInput(inputText.trim());
  };

  const currentPayload = useMemo(() => {
    const source = inputText.trim();
    const result = translatedText.trim();
    if (!source || !result) return null;
    return { sourceText: source, translatedText: result, directionId } as const;
  }, [directionId, inputText, translatedText]);

  const savedMatch = currentPayload ? findMatchingPhrase(currentPayload) : undefined;
  const isCurrentSaved = Boolean(savedMatch);
  const inputChanged = inputText.trim() !== lastTranslatedInput && inputText.trim().length > 0;
  const showStickyButton = inputChanged && !translatedText;

  const handleSaveToggle = () => {
    if (!currentPayload) return;
    if (isCurrentSaved && savedMatch) {
      deletePhrase(savedMatch.id);
      addToast({ type: 'info', description: t('phraseUnsaved') });
    } else {
      savePhrase(currentPayload);
      addToast({ type: 'success', description: t('phraseSaved') });
    }
  };

  const handleListen = () => {
    if (!translatedText || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(translatedText);
    u.lang = directionId === 'en-mk' ? 'mk-MK' : 'en-US';
    u.rate = 0.85;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handlePaste = async () => {
    try {
      if (!navigator?.clipboard?.readText) {
        addToast({ type: 'error', description: t('pasteUnavailable', { default: 'Clipboard blocked.' }) });
        return;
      }
      const clip = await navigator.clipboard.readText();
      if (!clip) {
        addToast({ type: 'info', description: t('pasteEmpty', { default: 'Clipboard empty.' }) });
        return;
      }
      setInputText(clip.slice(0, MAX_CHARACTERS));
      textareaRef.current?.focus();
    } catch {
      addToast({ type: 'error', description: t('pasteError', { default: 'Clipboard error.' }) });
    }
  };

  return (
    <PageContainer size="md" className="flex flex-col gap-4 pb-28 sm:pb-6">
      {/* Minimal Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title', { default: 'Translate' })}</h1>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => setMoreOpen(true)}>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      {/* Direction Toggle */}
      <div className="flex items-center gap-2">
        <SegmentedControl
          options={directionUiOptions}
          value={directionId}
          onChange={setDirectionId}
          className="flex-1"
          ariaLabel={t('directionsGroupLabel', { default: 'Translation direction' })}
        />
        <button
          onClick={handleSwapDirections}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t('swapDirections', { default: 'Swap' })}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); void handleTranslate(e); }} className="space-y-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARACTERS))}
            placeholder={selectedDirection?.placeholder}
            maxLength={MAX_CHARACTERS}
            className="min-h-[140px] resize-none rounded-2xl border-border/40 bg-muted/20 p-4 text-base placeholder:text-muted-foreground focus-visible:ring-primary/40"
          />
          <div className="absolute bottom-3 right-3 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePaste}
              aria-label={t('paste', { default: 'Paste text' })}
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
            {inputText && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClear}
                aria-label={t('clearButton', { default: 'Clear' })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{inputText.length}/{MAX_CHARACTERS}</span>
        </div>

        {/* Desktop Translate Button */}
        <Button
          type="submit"
          size="lg"
          className="hidden sm:flex w-full bg-gradient-to-r from-primary to-amber-500 text-lg font-bold text-slate-950"
          disabled={isTranslating || !inputText.trim()}
        >
          {isTranslating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('translatingStatus')}</> : t('translateButton')}
        </Button>
      </form>

      {/* Error */}
      {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}

      {/* Result Bubble */}
      {translatedText && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 animate-feedback-correct">
          <p className="text-base text-foreground whitespace-pre-wrap mb-4">{translatedText}</p>
          <div className="flex items-center gap-2 border-t border-border/30 pt-3">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 h-10 rounded-full">
              {copiedState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="text-sm">{copiedState === 'copied' ? t('copied') : t('copyButton')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSaveToggle} disabled={!currentPayload} className="gap-2 h-10 rounded-full">
              {isCurrentSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <BookmarkPlus className="h-4 w-4" />}
              <span className="text-sm">{isCurrentSaved ? t('saved') : t('saveButton')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleListen} className="gap-2 h-10 rounded-full">
              <Volume2 className={cn('h-4 w-4', isSpeaking && 'text-primary animate-pulse')} />
              <span className="text-sm">{t('listen', { default: 'Listen' })}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Button - only when input changed */}
      {showStickyButton && (
        <div className="fixed bottom-[calc(var(--mobile-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-40 border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-lg sm:hidden">
          <Button
            type="button"
            onClick={(e) => { e.preventDefault(); void handleTranslate(e as unknown as FormEvent<HTMLFormElement>); }}
            size="lg"
            className="w-full min-h-[48px] bg-gradient-to-r from-primary to-amber-500 text-lg font-bold text-slate-950"
            disabled={isTranslating}
          >
            {isTranslating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('translatingStatus')}</> : t('translateButton')}
          </Button>
        </div>
      )}

      {/* More Menu Bottom Sheet */}
      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t('optionsTitle', { default: 'Options' })}>
        <div className="space-y-2">
          <button onClick={() => { setMoreOpen(false); setHistoryOpen(true); }} className="flex w-full items-center gap-3 rounded-xl p-4 hover:bg-muted/30">
            <History className="h-5 w-5" /><span className="flex-1 text-left font-medium">{t('history', { default: 'History' })}</span>
            <span className="text-sm text-muted-foreground">{history.length}</span>
          </button>
          <button onClick={() => { setMoreOpen(false); setSavedOpen(true); }} className="flex w-full items-center gap-3 rounded-xl p-4 hover:bg-muted/30">
            <BookmarkPlus className="h-5 w-5" /><span className="flex-1 text-left font-medium">{t('savedTitle', { default: 'Saved phrases' })}</span>
            <span className="text-sm text-muted-foreground">{phrases.length}</span>
          </button>
        </div>
      </BottomSheet>

      {/* History Bottom Sheet */}
      <BottomSheet open={historyOpen} onClose={() => setHistoryOpen(false)} title={t('historyTitle', { default: 'Recent translations' })}>
        {history.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('historyEmpty', { default: 'Your latest translations will appear here.' })}</p>
        ) : (
          <BottomSheetList items={history} onItemClick={(item) => { handleHistoryLoad(item); setHistoryOpen(false); }}
            renderItem={(item) => (
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.sourceText}</p>
                <p className="text-sm text-muted-foreground">{item.translatedText}</p>
              </div>
            )}
          />
        )}
      </BottomSheet>

      {/* Saved Bottom Sheet */}
      <BottomSheet open={savedOpen} onClose={() => setSavedOpen(false)} title={t('savedTitle', { default: 'Saved phrases' })}>
        {phrases.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('savedEmptyDescription', { default: 'Save translations to unlock a custom practice deck.' })}</p>
        ) : (
          <div className="space-y-2">
            {phrases.map((phrase) => (
              <div key={phrase.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{phrase.sourceText}</p>
                  <p className="text-sm text-muted-foreground">{phrase.translatedText}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deletePhrase(phrase.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>
    </PageContainer>
  );
}
