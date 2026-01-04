'use client';

import { useCallback, useEffect, useState } from 'react';
import { Volume2, Plus, BookOpen, Sparkles, Check } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface WordInfo {
  original: string;
  translation: string;
  alternativeTranslations?: string[];
  contextHint?: string;
  partOfSpeech?: string;
  phonetic?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'basic' | 'intermediate' | 'advanced';
  examples?: string[];
}

interface WordBottomSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** The word being displayed */
  word: WordInfo | null;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Callback when user saves word to glossary */
  onSaveToGlossary?: (word: WordInfo) => void;
  /** Whether the word is already saved */
  isSaved?: boolean;
  /** Current locale */
  locale: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  A1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  A2: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  B1: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  B2: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  C1: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  basic: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

/**
 * WordBottomSheet - Mobile-friendly word detail sheet
 *
 * Shows word translation, POS, difficulty, examples
 * with audio playback and save-to-glossary functionality.
 */
export function WordBottomSheet({
  open,
  word,
  onClose,
  onSaveToGlossary,
  isSaved = false,
  locale,
}: WordBottomSheetProps) {
  const [justSaved, setJustSaved] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);

  const t = {
    saveToGlossary: locale === 'mk' ? 'Зачувај во речник' : 'Save to Glossary',
    saved: locale === 'mk' ? 'Зачувано!' : 'Saved!',
    alreadySaved: locale === 'mk' ? 'Веќе зачувано' : 'Already Saved',
    listen: locale === 'mk' ? 'Слушај' : 'Listen',
    alsoMeans: locale === 'mk' ? 'Исто значи:' : 'Also:',
    inContext: locale === 'mk' ? 'Во овој контекст:' : 'In this context:',
    examples: locale === 'mk' ? 'Примери' : 'Examples',
    translating: locale === 'mk' ? 'Се преведува...' : 'Translating...',
    noTranslation: locale === 'mk' ? 'Превод не е достапен' : 'Translation not available',
    audioUnavailable: locale === 'mk' ? 'Аудиото не е достапно на овој уред.' : 'Audio isn’t available on this device.',
  };

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.speechSynthesis?.speak === 'function' &&
      typeof (window as any).SpeechSynthesisUtterance === 'function';
    setAudioSupported(Boolean(supported));
  }, []);

  const handlePlayAudio = useCallback(() => {
    if (!word || !audioSupported || !window.speechSynthesis) return;
    try {
      const signals = (window as any).__mkllSignals;
      if (signals && typeof signals === 'object') {
        signals.speechSpeakCalls = Number(signals.speechSpeakCalls || 0) + 1;
      }
    } catch {}
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.original);
    utterance.lang = 'sr-RS';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [audioSupported, word]);

  const handleSave = useCallback(() => {
    if (!word || !onSaveToGlossary || isSaved) return;
    onSaveToGlossary(word);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [word, onSaveToGlossary, isSaved]);

  if (!word) return null;

  const isLoading = word.translation === t.translating;
  const showSaved = isSaved || justSaved;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      height="auto"
      showCloseButton={true}
      testId="reader-word-sheet"
    >
      <div className="space-y-5 pb-2">
        {/* Word header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {/* Original word */}
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground">
                {word.original}
              </h3>
              {/* Audio button */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full hover:bg-primary/20"
                onClick={handlePlayAudio}
                disabled={!audioSupported}
                aria-label={t.listen}
                data-testid="reader-word-sheet-audio"
              >
                <Volume2 className="h-5 w-5 text-primary" />
              </Button>
            </div>

            {!audioSupported && (
              <p data-testid="reader-word-sheet-audio-unavailable" className="text-xs text-muted-foreground">
                {t.audioUnavailable}
              </p>
            )}

            {/* Phonetic */}
            {word.phonetic && (
              <p className="text-sm text-muted-foreground">
                {word.phonetic}
              </p>
            )}
          </div>

          {/* Difficulty badge */}
          {word.difficulty && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs shrink-0',
                DIFFICULTY_COLORS[word.difficulty] || DIFFICULTY_COLORS['basic']
              )}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {word.difficulty}
            </Badge>
          )}
        </div>

        {/* Translation */}
        <div className="space-y-2">
          <p className={cn(
            'text-xl',
            isLoading ? 'text-muted-foreground animate-pulse' : 'text-foreground'
          )}>
            {word.translation}
          </p>

          {/* Alternative translations */}
          {word.alternativeTranslations && word.alternativeTranslations.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t.alsoMeans} {word.alternativeTranslations.join(', ')}
            </p>
          )}

          {/* Context hint */}
          {word.contextHint && (
            <p className="text-sm text-primary/80 italic">
              {t.inContext} {word.contextHint}
            </p>
          )}

          {/* Part of speech */}
          {word.partOfSpeech && (
            <Badge variant="outline" className="text-xs">
              <BookOpen className="mr-1 h-3 w-3" />
              {word.partOfSpeech}
            </Badge>
          )}
        </div>

        {/* Examples */}
        {word.examples && word.examples.length > 0 && (
          <div className="space-y-2 rounded-xl bg-muted/30 p-4 border border-border/50">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.examples}
            </p>
            <div className="space-y-2">
              {word.examples.map((example, idx) => (
                <p key={idx} className="text-sm italic text-foreground/80">
                  &ldquo;{example}&rdquo;
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Save to glossary button */}
        {onSaveToGlossary && (
          <Button
            onClick={handleSave}
            disabled={showSaved || isLoading}
            className={cn(
              'w-full min-h-[52px] rounded-xl text-base font-semibold transition-all',
              showSaved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-primary text-black hover:bg-primary/90'
            )}
            size="lg"
            data-testid="reader-word-sheet-save"
          >
            {showSaved ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                {justSaved ? t.saved : t.alreadySaved}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                {t.saveToGlossary}
              </>
            )}
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
