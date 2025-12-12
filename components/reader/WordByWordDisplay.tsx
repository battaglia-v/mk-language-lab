'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyzedTextData, WordAnalysis } from '@/components/translate/useReaderWorkspace';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  // In focus mode, show translation for the focused word
  const showTranslation = revealMode === 'revealed' || isRevealed || (focusMode && isFocused);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggleReveal}
            className={cn(
              'relative inline-flex cursor-pointer select-none flex-col text-left',
              'rounded-lg border border-white/10 bg-white/5 shadow-sm',
              'px-2 py-1.5 min-w-[56px] max-w-[140px] sm:px-2.5 sm:py-2 sm:min-w-[72px] sm:max-w-[180px]',
              'transition-all duration-200 hover:border-primary/50 hover:bg-white/10 active:scale-[0.97]',
              showTranslation && 'ring-1 ring-primary/40',
              // Focus mode styling
              focusMode && !isFocused && 'opacity-40 scale-95',
              focusMode && isFocused && 'ring-2 ring-primary scale-105 bg-primary/10 shadow-lg shadow-primary/20'
            )}
            aria-label={`${word.original}: ${word.translation}`}
          >
            <span className="block text-sm font-semibold text-white leading-tight break-words sm:text-base">
              {word.original}
            </span>
            {showTranslation ? (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-tight sm:mt-1 sm:rounded-full sm:px-2 sm:text-[11px]">
                {word.translation}
              </span>
            ) : (
              <span className="mt-0.5 inline-flex items-center rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground leading-tight sm:mt-1 sm:rounded-full sm:px-2 sm:text-[11px]">
                {t('readerRevealHint', { default: 'Tap to reveal' })}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="glass-card max-w-sm p-3 space-y-2"
        >
          <p className="font-semibold text-sm">{word.original}</p>

          {/* Primary translation */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{word.translation}</p>

            {/* Alternative translations if available */}
            {word.alternativeTranslations && word.alternativeTranslations.length > 0 && (
              <div className="pt-1 border-t border-border/30">
                <p className="text-xs text-muted-foreground/70 mb-1">
                  {t('readerAlsoMeans')}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {word.alternativeTranslations.map((alt, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary/90 border border-primary/20"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1.5 italic">
                  {t('readerCheckFullTranslation')}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              'bg-background/80 border border-border/50'
            )}>
              {t(`readerPos${word.pos.charAt(0).toUpperCase() + word.pos.slice(1)}`)}
            </span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              word.difficulty === 'basic' && 'bg-green-600/20 text-green-400',
              word.difficulty === 'intermediate' && 'bg-yellow-600/20 text-yellow-400',
              word.difficulty === 'advanced' && 'bg-red-600/20 text-red-400'
            )}>
              {t(`readerDifficulty${word.difficulty.charAt(0).toUpperCase() + word.difficulty.slice(1)}`)}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
