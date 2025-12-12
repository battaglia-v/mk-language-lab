'use client';

import { FormEvent, useRef, useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Focus,
  Bookmark,
  BookmarkCheck,
  Volume2,
  Copy as CopyIcon,
  Clock3,
  History,
  Languages,
} from 'lucide-react';
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
const SAVED_SENTENCES_KEY = 'mkll:reader-saved-sentences';
const STREAK_KEY = 'mkll:reader-streak';

const formatElapsed = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

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
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1" role="group" aria-label={label}>
        {options.map((option) => {
          const isActive = option.id === activeId;
          const bgClass = option.sourceLang === 'mk' ? 'bg-red-600/90' : 'bg-green-600/90';
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'min-h-[36px] rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:min-h-[40px] sm:px-3.5 sm:py-2 sm:text-sm',
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
        className="min-h-[36px] rounded-full border border-border/60 px-2.5 sm:min-h-[40px] sm:px-3.5"
        aria-label={swapLabel}
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="ml-1.5 text-xs sm:text-sm">{swapLabel}</span>
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
  const [focusMode, setFocusMode] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streak, setStreak] = useState(1);
  const [savedSentences, setSavedSentences] = useState<
    Array<{ id: string; text: string; translation: string; directionId: ReaderDirectionOption['id']; savedAt: number }>
  >([]);
  const [copiedSentenceId, setCopiedSentenceId] = useState<string | null>(null);

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
    history,
    isImporting,
    handleAnalyze,
    handleToggleReveal,
    handleClear,
    handleSwapDirections,
    handleHistoryLoad,
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedRaw = localStorage.getItem(SAVED_SENTENCES_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) {
          setSavedSentences(parsed);
        }
      }

      const streakRaw = localStorage.getItem(STREAK_KEY);
      if (streakRaw) {
        const parsed = JSON.parse(streakRaw);
        if (parsed?.count) {
          setStreak(parsed.count);
        }
      }
    } catch (error) {
      console.error('Failed to load reader local data', error);
    }
  }, []);

  useEffect(() => {
    if (!analyzedData) {
      setElapsedMs(0);
      return;
    }

    const start = Date.now();
    setElapsedMs(0);

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 1000);

    if (typeof window !== 'undefined') {
      try {
        const today = new Date().toDateString();
        const raw = localStorage.getItem(STREAK_KEY);
        let nextCount = 1;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.lastAt === today) {
            nextCount = parsed.count ?? 1;
          } else {
            nextCount = (parsed?.count ?? 0) + 1;
          }
        }
        setStreak(nextCount);
        localStorage.setItem(STREAK_KEY, JSON.stringify({ count: nextCount, lastAt: today }));
      } catch (error) {
        console.error('Failed to update reader streak', error);
      }
    }

    return () => {
      window.clearInterval(intervalId);
    };
  }, [analyzedData]);

  const characterCount = t('characterCount', { count: inputText.length, limit: MAX_CHARACTERS });

  const sentences = useMemo(() => {
    if (!analyzedData) return [];
    const wordsByIndex = new Map(analyzedData.words.map((word) => [word.index, word]));
    const chunks: Array<{ id: string; text: string; translation: string }> = [];
    let bucket: typeof analyzedData.tokens = [];

    analyzedData.tokens.forEach((token, idx) => {
      bucket.push(token);
      const isTerminal = /[.!?]/.test(token.token.trim()) || idx === analyzedData.tokens.length - 1;
      if (isTerminal) {
        const sentenceId = bucket[0]?.index ?? chunks.length;
        const text = bucket.map((t) => t.token).join('').trim();
        const translation = bucket
          .map((t) => (t.isWord ? wordsByIndex.get(t.index)?.translation ?? t.token : t.token))
          .join('')
          .trim();

        if (text) {
          chunks.push({
            id: `sentence-${sentenceId}-${chunks.length}`,
            text,
            translation: translation || analyzedData.fullTranslation,
          });
        }
        bucket = [];
      }
    });

    return chunks;
  }, [analyzedData]);

  const persistSavedSentences = (
    updater:
      | Array<{ id: string; text: string; translation: string; directionId: ReaderDirectionOption['id']; savedAt: number }>
      | ((
          previous: Array<{ id: string; text: string; translation: string; directionId: ReaderDirectionOption['id']; savedAt: number }>,
        ) => Array<{ id: string; text: string; translation: string; directionId: ReaderDirectionOption['id']; savedAt: number }>),
  ) => {
    setSavedSentences((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVED_SENTENCES_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const isSavedSentence = (id: string) => savedSentences.some((sentence) => sentence.id === id);

  const toggleSaveSentence = (sentence: { id: string; text: string; translation: string }) => {
    persistSavedSentences((prev) => {
      const exists = prev.some((entry) => entry.id === sentence.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== sentence.id);
      }
      const next = [{ ...sentence, directionId, savedAt: Date.now() }, ...prev];
      return next.slice(0, 30);
    });
  };

  const handleCopySentence = async (sentence: { id: string; text: string; translation: string }) => {
    try {
      await navigator.clipboard?.writeText(`${sentence.text}\n${sentence.translation}`);
      setCopiedSentenceId(sentence.id);
      setTimeout(() => setCopiedSentenceId(null), 2000);
    } catch (error) {
      console.error('Failed to copy sentence', error);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleListen = async (text: string, lang?: 'mk' | 'en') => {
    // Determine language from context or parameter
    const language = lang ?? (selectedDirection?.sourceLang === 'mk' ? 'mk' : 'en');

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsPlaying(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        // Fallback to browser TTS if API fails
        console.warn('TTS API failed, falling back to browser speech');
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language === 'mk' ? 'mk-MK' : 'en-US';
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        // Fallback to browser TTS
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language === 'mk' ? 'mk-MK' : 'en-US';
          window.speechSynthesis.speak(utterance);
        }
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      // Fallback to browser TTS
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'mk' ? 'mk-MK' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const elapsedLabel = formatElapsed(elapsedMs);
  const recentHistory = history.slice(0, 6);

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
    <div className="space-y-5 sm:space-y-6 pb-28">
      <div className="rounded-xl border border-border/30 bg-white/5 p-3 sm:p-4 shadow-[0_14px_40px_rgba(0,0,0,0.25)] space-y-3">
        <DirectionToggle
          options={directionOptions}
          activeId={directionId}
          onChange={setDirectionId}
          onSwap={handleSwapDirections}
          label={t('directionsGroupLabel')}
          swapLabel={t('swapDirections')}
        />
        <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 sm:gap-2.5">
          <Button
            type="button"
            variant={revealMode === 'hidden' ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleReveal}
            className="flex-1 min-w-[100px] rounded-lg min-h-[40px] text-xs sm:text-sm whitespace-nowrap"
          >
            {revealMode === 'hidden' ? (
              <>
                <Eye className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="ml-1.5 truncate">{t('readerRevealShow')}</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="ml-1.5 truncate">{t('readerRevealHide')}</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            variant={focusMode ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFocusMode((prev) => !prev)}
            className="flex-1 min-w-[100px] rounded-lg min-h-[40px] text-xs sm:text-sm whitespace-nowrap"
            title={t('readerFocusTooltip', { default: 'Focus mode highlights one word at a time for easier learning' })}
          >
            <Focus className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="ml-1.5 truncate">
              {focusMode
                ? t('readerFocusOff', { default: 'Exit focus' })
                : t('readerFocusOn', { default: 'Focus mode' })}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!analyzedData}
            onClick={() => void handleCopyTranslation()}
            className="flex-1 min-w-[100px] rounded-lg min-h-[40px] text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="truncate">
              {copied ? t('copied', { default: 'Copied' }) : t('readerCopyTranslation', { default: 'Copy translation' })}
            </span>
          </Button>
        </div>
      </div>

      {recentHistory.length > 0 && (
        <div className="rounded-xl border border-border/30 bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('readerRecent', { default: 'Recent reads' })}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {t('readerTapToLoad', { default: 'Tap to reopen' })}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {recentHistory.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleHistoryLoad(entry)}
                className="flex-shrink-0 w-[160px] sm:w-[180px] rounded-xl border border-border/30 bg-[#0c1224]/70 px-2.5 py-2 text-left shadow-inner transition-colors hover:border-primary/50 hover:bg-[#0f152a] active:scale-[0.98]"
              >
                <p className="line-clamp-2 text-[11px] font-medium text-foreground/90 leading-snug">
                  {entry.sourceText}
                </p>
                <div className="mt-1.5 flex flex-row flex-nowrap items-center gap-1.5 text-[9px] text-muted-foreground">
                  <span className="flex-shrink-0 whitespace-nowrap rounded bg-white/5 px-1.5 py-0.5 border border-border/40">
                    {entry.analyzedData.metadata.wordCount} {t('readerWords', { default: 'words' })}
                  </span>
                  <span className="flex-shrink-0 whitespace-nowrap rounded bg-white/5 px-1.5 py-0.5 border border-border/40">
                    {entry.analyzedData.metadata.sentenceCount} sent.
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="rounded-2xl sm:rounded-[28px] p-3 sm:p-5 md:p-6 bg-white/5 border border-border/40 shadow-[0_18px_48px_rgba(0,0,0,0.25)]"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          void handleAnalyze(event);
        }}
      >
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-semibold text-foreground">
                {t('readerInputLabel', { default: 'Paste text to analyze' })}
              </span>
              <span className="text-[11px] text-muted-foreground line-clamp-2 sm:line-clamp-none">
                {t('readerInputHelper', { default: 'Paste or type up to 5000 characters.' })}
              </span>
            </div>
            <span id="reader-character-count" className="flex-shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground/90">
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
            className="min-h-[140px] resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[15px] font-medium shadow-inner placeholder:text-muted-foreground sm:min-h-[200px] sm:px-4 sm:text-base focus-visible:ring-2 focus-visible:ring-primary/40"
          />

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={!inputText && !analyzedData}
                  className="rounded-full border border-border/60 min-h-[40px] px-3 text-xs"
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
                className="w-full sm:w-auto rounded-xl px-5 font-semibold min-h-[44px] bg-gradient-to-r from-amber-500 to-primary text-slate-900 hover:from-amber-600 hover:to-primary/90 shadow-lg"
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
                onClick={() => {
                  setDirectionId('en-mk');
                  setInputText("Good morning! How are you today? I'm going to the market to buy some fresh vegetables.");
                }}
                className="text-xs"
              >
                {t('readerEmptyExample1')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDirectionId('mk-en');
                  setInputText("Добро утро! Како си денес? Одам на пазар да купам свежо зеленчук.");
                }}
                className="text-xs"
              >
                {t('readerEmptyExample2')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {analyzedData && !isAnalyzing && (
        <div className="rounded-2xl sm:rounded-[28px] p-5 sm:p-6 md:p-8 space-y-6 bg-white/5 border border-border/40 shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
            <div className="col-span-2 rounded-xl border border-border/40 bg-white/5 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t('readerDifficultyLabel')}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border shadow-sm',
                    analyzedData.difficulty.level === 'beginner' && 'bg-green-600/12 text-green-400 border-green-600/30',
                    analyzedData.difficulty.level === 'intermediate' && 'bg-yellow-600/12 text-yellow-400 border-yellow-600/30',
                    analyzedData.difficulty.level === 'advanced' && 'bg-red-600/12 text-red-400 border-red-600/30'
                  )}
                >
                  {t(`readerDifficulty${analyzedData.difficulty.level.charAt(0).toUpperCase() + analyzedData.difficulty.level.slice(1)}`)}
                </p>
                <span className="rounded-full border border-border/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {selectedDirection?.label}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-white/5 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t('readerWords', { default: 'Words' })}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {analyzedData.metadata.wordCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-white/5 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t('readerSentences', { default: 'Sentences' })}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {analyzedData.metadata.sentenceCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-white/5 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {t('readerSessionTime', { default: 'Session' })}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{elapsedLabel}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-white/5 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <span role="img" aria-hidden="true">🔥</span>
                {t('readerStreak', { default: 'Day streak' })}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{streak}</p>
            </div>
          </div>

          <WordByWordDisplay data={analyzedData} revealMode={revealMode} focusMode={focusMode} />

          {/* Full Natural Translation - prominent placement */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 to-primary/3 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-sm font-semibold text-primary">{t('readerFullTranslation')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleListen(analyzedData.fullTranslation)}
                  disabled={isPlaying}
                  className="rounded-full h-8 w-8 p-0"
                  aria-label={t('readerListen', { default: 'Listen' })}
                >
                  {isPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(analyzedData.fullTranslation);
                  }}
                  className="rounded-full h-8 w-8 p-0"
                  aria-label={t('readerCopy', { default: 'Copy' })}
                >
                  <CopyIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-foreground">{analyzedData.fullTranslation}</p>
          </div>

          {sentences.length > 0 && (
            <div className="space-y-4 rounded-2xl border border-border/40 bg-white/3 p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                  <p className="text-sm font-semibold">
                    {t('readerSentences', { default: 'Sentences' })} · {sentences.length}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {t('readerDrill', { default: 'Save, listen, or copy to review later.' })}
                </span>
              </div>

              <div className="space-y-4">
                {sentences.map((sentence) => {
                  const saved = isSavedSentence(sentence.id);
                  return (
                    <div
                      key={sentence.id}
                      className="rounded-xl bg-[#0c1224]/80 border border-border/40 p-4 sm:p-5 shadow-inner space-y-3"
                    >
                      <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">{sentence.text}</p>
                      <p className="text-sm sm:text-base text-primary/90 leading-relaxed">{sentence.translation}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={saved ? 'secondary' : 'outline'}
                          onClick={() => toggleSaveSentence(sentence)}
                          className="rounded-full min-h-[44px] px-4"
                        >
                          {saved ? (
                            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Bookmark className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span className="ml-2">
                            {saved
                              ? t('readerSaved', { default: 'Saved' })
                              : t('readerSave', { default: 'Save' })}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleCopySentence(sentence)}
                          className="rounded-full min-h-[44px] px-4"
                        >
                          <CopyIcon className="h-4 w-4" aria-hidden="true" />
                          <span className="ml-2">
                            {copiedSentenceId === sentence.id
                              ? t('copied', { default: 'Copied' })
                              : t('readerCopy', { default: 'Copy' })}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleListen(sentence.text)}
                          disabled={isPlaying}
                          className="rounded-full min-h-[44px] px-4"
                        >
                          {isPlaying ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Volume2 className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span className="ml-2">{t('readerListen', { default: 'Listen' })}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
