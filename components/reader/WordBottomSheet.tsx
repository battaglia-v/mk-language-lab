'use client';

import { useCallback, useState, useEffect } from 'react';
import { Plus, BookOpen, Sparkles, Check } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

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
  const [isRevealed, setIsRevealed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Trigger reveal animation when sheet opens with new word
  useEffect(() => {
    if (open && word) {
      // Small delay to let BottomSheet start its animation first
      const timer = setTimeout(() => setIsRevealed(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsRevealed(false);
    }
  }, [open, word?.original]);

  const t = {
    saveToGlossary: locale === 'mk' ? 'Зачувај во речник' : 'Save to Glossary',
    saved: locale === 'mk' ? 'Зачувано!' : 'Saved!',
    alreadySaved: locale === 'mk' ? 'Веќе зачувано' : 'Already Saved',
    alsoMeans: locale === 'mk' ? 'Исто значи:' : 'Also:',
    inContext: locale === 'mk' ? 'Во овој контекст:' : 'In this context:',
    examples: locale === 'mk' ? 'Примери' : 'Examples',
    translating: locale === 'mk' ? 'Се преведува...' : 'Translating...',
    noTranslation: locale === 'mk' ? 'Превод не е достапен' : 'Translation not available',
  };

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
        className="pb-[calc(env(safe-area-inset-bottom,0px)+3rem)]"
      >
      <div className="space-y-5 pb-4">
        {/* Word header - animates first */}
        <div
          className={cn(
            'flex items-start justify-between gap-4',
            !prefersReducedMotion && 'transition-all duration-200',
            !prefersReducedMotion && (isRevealed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2')
          )}
          style={!prefersReducedMotion ? { animationFillMode: 'backwards' } : undefined}
        >
          <div className="space-y-1">
            {/* Original word */}
            <h3 className="text-2xl font-bold text-foreground">
              {word.original}
            </h3>

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

        {/* Translation - animates with 50ms delay */}
        <div
          className={cn(
            'space-y-2',
            !prefersReducedMotion && 'transition-all duration-200 delay-[50ms]',
            !prefersReducedMotion && (isRevealed
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2')
          )}
        >
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

        {/* Examples - animates with 100ms delay */}
        {word.examples && word.examples.length > 0 && (
          <div
            className={cn(
              'space-y-2 rounded-xl bg-muted/30 p-4 border border-border/50',
              !prefersReducedMotion && 'transition-all duration-200 delay-100',
              !prefersReducedMotion && (isRevealed
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2')
            )}
          >
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

        {/* Save to glossary button - animates with 150ms delay */}
        {onSaveToGlossary && (
          <div
            className={cn(
              !prefersReducedMotion && 'transition-all duration-200 delay-150',
              !prefersReducedMotion && (isRevealed
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2')
            )}
          >
            <Button
              onClick={handleSave}
              disabled={showSaved || isLoading}
              className={cn(
                'w-full min-h-[52px] rounded-xl text-base font-semibold transition-all',
                showSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
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
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
