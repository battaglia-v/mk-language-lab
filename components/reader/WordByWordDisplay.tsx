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
              'inline-block relative cursor-pointer',
              'px-1.5 py-0.5',
              'transition-all duration-150',
              'border-b-2',
              borderColor,
              'hover:bg-primary/10 rounded-sm',
              'select-none',
              showTranslation && 'pb-7 mb-1'
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
              <span className="absolute left-1.5 top-full mt-1 text-xs text-primary font-medium whitespace-nowrap z-10">
                {word.translation}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="glass-card max-w-xs p-3 space-y-1"
        >
          <p className="font-semibold text-sm">{word.original}</p>
          <p className="text-muted-foreground text-sm">{word.translation}</p>
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

export function WordByWordDisplay({ data, revealMode }: WordByWordDisplayProps) {
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
      className="min-h-[300px] rounded-2xl bg-background/50 p-6 sm:p-8 leading-relaxed border border-border/30"
      role="region"
      aria-label="Word by word translation"
    >
      <div className="flex flex-wrap items-start gap-1 text-xl sm:text-2xl leading-loose" style={{ lineHeight: '2.5rem' }}>
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
