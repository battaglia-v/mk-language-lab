'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { isFavorite, addFavorite } from '@/lib/favorites';
import type { AnalyzedTextData, WordAnalysis } from '@/components/translate/useReaderWorkspace';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

type WordByWordDisplayProps = {
  data: AnalyzedTextData;
  revealMode: 'hidden' | 'revealed';
  focusMode?: boolean;
};

type WordTokenProps = {
  word: WordAnalysis;
  revealMode: 'hidden' | 'revealed';
  isRevealed: boolean;
  onToggleReveal: () => void;
  isFocused?: boolean;
  focusMode?: boolean;
};

function WordToken({ word, revealMode, isRevealed, onToggleReveal, isFocused = false, focusMode = false }: WordTokenProps) {
  const t = useTranslations('translate');
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check if word is already saved
  useEffect(() => {
    setIsSaved(isFavorite(`word-${word.original}`));
  }, [word.original]);

  // In focus mode, show translation for the focused word
  const showTranslation = revealMode === 'revealed' || isRevealed || (focusMode && isFocused);

  const handleSaveWord = () => {
    if (isSaved) return;
    addFavorite({
      id: `word-${word.original}`,
      macedonian: word.original,
      english: word.translation,
      category: 'reader',
    });
    setIsSaved(true);
    trackEvent(AnalyticsEvents.READER_WORD_CLICKED, {
      action: 'saved_to_favorites',
      partOfSpeech: word.pos,
    });
  };

  const handleClick = () => {
    onToggleReveal();
    // Track word tap for analytics
    trackEvent(AnalyticsEvents.READER_WORD_CLICKED, {
      partOfSpeech: word.pos,
      hasMultipleMeanings: word.hasMultipleMeanings || false,
    });
    // Keep popover open on first click to show details
    if (!showTranslation) {
      setIsOpen(true);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={handleClick}
          className={cn(
            'relative inline-flex cursor-pointer select-none flex-col items-start text-left',
            'rounded-xl border-2 border-white/15 bg-gradient-to-b from-white/10 to-white/5 shadow-md',
            // Improved touch targets - minimum 44px height for accessibility
            'px-3 py-2.5 min-w-[64px] max-w-[140px] min-h-[44px] sm:px-3.5 sm:py-2.5 sm:min-w-[80px] sm:max-w-[180px]',
            'transition-all duration-200 hover:border-primary/60 hover:bg-white/15 hover:shadow-lg active:scale-[0.98]',
            showTranslation && 'ring-2 ring-primary/50 border-primary/40 bg-primary/5',
            // Focus mode styling
            focusMode && !isFocused && 'opacity-30 scale-90 blur-[0.5px]',
            focusMode && isFocused && 'ring-2 ring-primary scale-110 bg-primary/15 shadow-xl shadow-primary/25 border-primary/60'
          )}
          aria-label={`${word.original}: ${word.translation}`}
        >
          <span className="block text-base font-bold text-white leading-snug tracking-wide break-words sm:text-lg">
            {word.original}
          </span>
          {showTranslation ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary leading-tight sm:px-2.5 sm:py-1 sm:text-sm">
              {word.translation}
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/70 leading-tight sm:px-2.5 sm:py-1 sm:text-xs">
              {t('readerRevealHint', { default: 'Tap' })}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
        className="w-[calc(100vw-32px)] max-w-[320px] sm:w-80 p-3 sm:p-4 space-y-2.5 sm:space-y-3 bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl rounded-xl max-h-[60vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-base text-foreground">{word.original}</p>
          {word.hasMultipleMeanings && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
              {t('readerMultipleMeanings', { default: 'context-dependent' })}
            </span>
          )}
        </div>

        {/* Primary translation with context indicator */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-foreground text-base font-semibold">{word.translation}</p>
            {word.contextualMeaning && (
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                ✓ {t('readerInContext', { default: 'in this context' })}
              </span>
            )}
          </div>

          {/* Context hint for multi-meaning words */}
          {word.contextHint && (
            <p className="text-sm text-amber-400 bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-500/25 leading-relaxed">
              💡 {word.contextHint}
            </p>
          )}

          {/* Alternative translations if available */}
          {word.alternativeTranslations && word.alternativeTranslations.length > 0 && (
            <div className="pt-2 border-t border-border/40 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {t('readerAlsoMeans', { default: 'Can also mean' })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {word.alternativeTranslations.map((alt, idx) => (
                  <span
                    key={idx}
                    className="text-sm px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground border border-border/40"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium',
              'bg-background border border-border/60'
            )}>
              {t(`readerPos${word.pos.charAt(0).toUpperCase() + word.pos.slice(1)}`)}
            </span>
            <span className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium',
              word.difficulty === 'basic' && 'bg-green-500/20 text-green-400 border border-green-500/30',
              word.difficulty === 'intermediate' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
              word.difficulty === 'advanced' && 'bg-red-500/20 text-red-400 border border-red-500/30'
            )}>
              {t(`readerDifficulty${word.difficulty.charAt(0).toUpperCase() + word.difficulty.slice(1)}`)}
            </span>
          </div>
          <Button
            type="button"
            variant={isSaved ? 'secondary' : 'ghost'}
            size="sm"
            onClick={handleSaveWord}
            disabled={isSaved}
            className={cn(
              'h-8 px-2.5 rounded-full',
              isSaved && 'text-pink-400'
            )}
          >
            <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
            <span className="ml-1.5 text-xs">{isSaved ? t('readerSaved', { default: 'Saved' }) : t('readerSave', { default: 'Save' })}</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function WordByWordDisplay({ data, revealMode, focusMode = false }: WordByWordDisplayProps) {
  const t = useTranslations('translate');
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Get only the word tokens for navigation
  const wordIndices = data.words.map((w) => w.id);

  const handleToggleWord = (wordId: string) => {
    setRevealedWords((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const goToPrev = useCallback(() => {
    setFocusedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setFocusedIndex((prev) => Math.min(wordIndices.length - 1, prev + 1));
  }, [wordIndices.length]);

  // Keyboard navigation in focus mode
  useEffect(() => {
    if (!focusMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, goToPrev, goToNext]);

  // Reset focus when entering/exiting focus mode
  useEffect(() => {
    if (focusMode) {
      setFocusedIndex(0);
    }
  }, [focusMode]);

  const currentFocusedId = wordIndices[focusedIndex];

  return (
    <div
      className="min-h-[180px] rounded-xl bg-gradient-to-b from-[#0e1324] via-[#0b1020] to-[#0a0f1b] p-3 sm:p-5 leading-relaxed border border-border/30 shadow-[0_18px_36px_rgba(0,0,0,0.28)] sm:min-h-[240px] sm:rounded-2xl"
      role="region"
      aria-label="Word by word translation"
    >
      {/* Focus mode navigation */}
      {focusMode && wordIndices.length > 0 && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goToPrev}
            disabled={focusedIndex === 0}
            className="h-8 px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('readerFocusPrev', { default: 'Previous' })}
          </Button>
          <span className="text-sm text-muted-foreground">
            {focusedIndex + 1} / {wordIndices.length}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goToNext}
            disabled={focusedIndex === wordIndices.length - 1}
            className="h-8 px-3"
          >
            {t('readerFocusNext', { default: 'Next' })}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      <div
        className={cn(
          "flex flex-wrap items-start gap-1.5 sm:gap-2.5",
          focusMode ? "text-base sm:text-xl gap-3 sm:gap-4" : "text-sm sm:text-lg"
        )}
      >
        {data.tokens.map((token) => {
          if (!token.isWord) {
            // Render punctuation and spaces as-is
            return (
              <span
                key={`punct-${token.index}`}
                className={cn(
                  "whitespace-pre-wrap text-foreground",
                  focusMode && "opacity-40"
                )}
              >
                {token.token}
              </span>
            );
          }

          // Find the corresponding word analysis
          const wordData = data.words.find((w) => w.index === token.index);
          if (!wordData) {
            return (
              <span key={`word-${token.index}`} className="px-1">
                {token.token}
              </span>
            );
          }

          return (
            <WordToken
              key={wordData.id}
              word={wordData}
              revealMode={revealMode}
              isRevealed={revealedWords.has(wordData.id)}
              onToggleReveal={() => handleToggleWord(wordData.id)}
              isFocused={currentFocusedId === wordData.id}
              focusMode={focusMode}
            />
          );
        })}
      </div>
      
      {/* Focus mode hint */}
      {focusMode && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {t('readerFocusHint', { default: 'Use arrow keys or buttons to navigate between words' })}
        </p>
      )}
    </div>
  );
}
