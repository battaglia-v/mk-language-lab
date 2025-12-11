'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { AnalyzedTextData, WordAnalysis } from '@/components/translate/useReaderWorkspace';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
};

function WordToken({ word, revealMode, isRevealed, onToggleReveal }: WordTokenProps) {
  const t = useTranslations('translate');
  const showTranslation = revealMode === 'revealed' || isRevealed;

  // Get POS color class
  const posColorMap: Record<string, string> = {
    noun: 'border-[var(--pos-noun)]',
    verb: 'border-[var(--pos-verb)]',
    adjective: 'border-[var(--pos-adjective)]',
    adverb: 'border-[var(--pos-adverb)]',
    other: 'border-[var(--pos-other)]',
  };

  const borderColor = posColorMap[word.pos] || posColorMap.other;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onClick={onToggleReveal}
            className={cn(
              'inline-block relative cursor-pointer rounded-lg',
              'px-2 py-1',
              'transition-all duration-150',
              'border-b-2 bg-white/2 hover:bg-white/6',
              borderColor,
              'select-none',
              showTranslation && 'pb-8 mb-1'
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleReveal();
              }
            }}
            aria-label={`${word.original}: ${word.translation}`}
          >
            <span className="font-normal">{word.original}</span>
            {showTranslation && (
              <span className="absolute left-1.5 top-full mt-1 text-[11px] text-primary font-semibold whitespace-nowrap z-10 bg-background/95 px-2 py-1 rounded-full shadow">
                {word.translation}
              </span>
            )}
          </span>
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
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

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

  return (
    <div
      className="min-h-[300px] rounded-2xl bg-gradient-to-b from-[#0e1324] via-[#0b1020] to-[#0a0f1b] p-6 sm:p-8 leading-relaxed border border-border/30 shadow-[0_18px_48px_rgba(0,0,0,0.32)]"
      role="region"
      aria-label="Word by word translation"
    >
      <div
        className={cn(
          "flex flex-wrap items-start gap-1.5 leading-loose",
          focusMode ? "text-[22px] sm:text-[24px]" : "text-[20px] sm:text-[22px]"
        )}
        style={{ lineHeight: focusMode ? '2.8rem' : '2.6rem' }}
      >
        {data.tokens.map((token) => {
          if (!token.isWord) {
            // Render punctuation and spaces as-is
            return (
              <span
                key={`punct-${token.index}`}
                className="whitespace-pre-wrap"
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
            />
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground space-y-1">
        <p>
          <strong>{data.metadata.wordCount}</strong> words • <strong>{data.metadata.sentenceCount}</strong> sentences
        </p>
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 border-b-2 border-[var(--pos-noun)]" />
            <span>Noun</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 border-b-2 border-[var(--pos-verb)]" />
            <span>Verb</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 border-b-2 border-[var(--pos-adjective)]" />
            <span>Adjective</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 border-b-2 border-[var(--pos-adverb)]" />
            <span>Adverb</span>
          </div>
        </div>
      </div>
    </div>
  );
}
