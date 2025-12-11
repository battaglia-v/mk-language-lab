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

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggleReveal}
            className={cn(
              'relative cursor-pointer select-none text-left',
              'rounded-xl border border-white/10 bg-white/5 shadow-sm',
              'px-3 py-2 min-w-[96px] max-w-[48%] sm:max-w-[32%]',
              'transition-all duration-150 hover:border-primary/40 hover:bg-white/10',
              showTranslation && 'ring-1 ring-primary/40'
            )}
            aria-label={`${word.original}: ${word.translation}`}
          >
            <span className="block text-base font-semibold text-white leading-snug">{word.original}</span>
            {showTranslation ? (
              <span className="mt-1 block text-[12px] font-semibold text-primary leading-tight">
                {word.translation}
              </span>
            ) : (
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {t('readerRevealShow')}
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
      className="min-h-[300px] rounded-2xl bg-gradient-to-b from-[#0e1324] via-[#0b1020] to-[#0a0f1b] p-4 sm:p-6 leading-relaxed border border-border/30 shadow-[0_18px_36px_rgba(0,0,0,0.28)]"
      role="region"
      aria-label="Word by word translation"
    >
      <div
        className={cn(
          "flex flex-wrap items-start gap-2",
          focusMode ? "text-lg sm:text-xl" : "text-base sm:text-lg"
        )}
      >
        {data.tokens.map((token) => {
          if (!token.isWord) {
            // Render punctuation and spaces as-is
            return (
              <span
                key={`punct-${token.index}`}
                className="whitespace-pre-wrap text-foreground"
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
