'use client';

/**
 * DialogueReviewCard - Contextual vocabulary practice within dialogues
 * 
 * Shows a dialogue-based review exercise where learners practice
 * weak vocabulary in meaningful conversational context.
 * 
 * Features:
 * - Displays dialogue context with speaker labels
 * - Highlights focus vocabulary
 * - Cloze-style fill-in-the-blank exercises
 * - Progress tracking
 * 
 * Parity: Must match Android DialogueReviewCard.tsx
 */

import { useState } from 'react';
import { MessageCircle, User, CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Dialogue, VocabularyItem } from '@/lib/learn/dialogue-review';

interface DialogueReviewCardProps {
  /** The dialogue being reviewed */
  dialogue: Dialogue;
  /** Current line index being practiced */
  currentLineIndex: number;
  /** The vocabulary word to fill in */
  targetWord: VocabularyItem;
  /** Cloze sentence with blank */
  clozeSentence: string;
  /** English translation hint */
  translationHint: string;
  /** Callback when answer is submitted */
  onAnswer: (answer: string, isCorrect: boolean) => void;
  /** Callback to continue to next exercise */
  onContinue: () => void;
  /** Progress info */
  progress?: { current: number; total: number };
}

export function DialogueReviewCard({
  dialogue,
  currentLineIndex,
  targetWord,
  clozeSentence,
  translationHint,
  onAnswer,
  onContinue,
  progress,
}: DialogueReviewCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentLine = dialogue.lines[currentLineIndex];

  const handleCheck = () => {
    const normalized = userAnswer.toLowerCase().trim();
    const correct = 
      normalized === targetWord.macedonian.toLowerCase() ||
      clozeSentence.replace('______', normalized).toLowerCase() === currentLine.textMk.toLowerCase();
    
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(userAnswer, correct);
  };

  const handleContinue = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    onContinue();
  };

  return (
    <div className="space-y-4">
      {/* Header with dialogue info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">{dialogue.title_en}</h3>
            <p className="text-xs text-muted-foreground">{dialogue.title_mk}</p>
          </div>
        </div>
        {progress && (
          <span className="text-sm text-muted-foreground">
            {progress.current}/{progress.total}
          </span>
        )}
      </div>

      {/* Dialogue context - show surrounding lines */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
        {dialogue.lines.slice(
          Math.max(0, currentLineIndex - 1),
          currentLineIndex + 2
        ).map((line, idx) => {
          const actualIndex = Math.max(0, currentLineIndex - 1) + idx;
          const isCurrent = actualIndex === currentLineIndex;
          
          return (
            <div
              key={idx}
              className={cn(
                'flex gap-3 transition-opacity',
                !isCurrent && 'opacity-50'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                isCurrent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {line.speaker}
                </p>
                <p className={cn(
                  'text-sm',
                  isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {isCurrent ? clozeSentence : line.textMk}
                </p>
                {!isCurrent && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {line.textEn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Translation hint */}
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">Translation:</p>
        <p className="text-sm text-foreground">{translationHint}</p>
      </div>

      {/* Answer input */}
      <div className="space-y-3">
        <Input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Fill in the blank..."
          disabled={showResult}
          className="h-12 text-base"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
              handleCheck();
            }
          }}
        />

        {/* Word hint */}
        {!showResult && (
          <p className="text-xs text-muted-foreground text-center">
            Looking for: <span className="font-medium">{targetWord.english}</span>
          </p>
        )}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className={cn(
          'rounded-xl border-2 p-4',
          isCorrect 
            ? 'border-green-500/50 bg-green-500/10' 
            : 'border-amber-500/50 bg-amber-500/10'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Correct!
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Not quite
                </span>
              </>
            )}
          </div>
          
          {!isCorrect && (
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Correct answer: </span>
              <strong>{targetWord.macedonian}</strong>
            </p>
          )}

          <p className="text-sm text-muted-foreground mt-2">
            <strong>{currentLine.speaker}:</strong> {currentLine.textMk}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!showResult ? (
          <Button
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
            className="flex-1"
          >
            Check
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            className="flex-1"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * DialogueReviewIntro - Introduction card for dialogue review session
 */
export function DialogueReviewIntro({
  dialogue,
  focusWords,
  onStart,
}: {
  dialogue: Dialogue;
  focusWords: VocabularyItem[];
  onStart: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">
          📖 {dialogue.title_en}
        </h2>
        <p className="text-muted-foreground mt-1">{dialogue.title_mk}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Practice these words in a real conversation context:
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {focusWords.map((word, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium text-foreground">{word.macedonian}</span>
            <span className="text-muted-foreground">({word.english})</span>
          </span>
        ))}
      </div>

      <Button onClick={onStart} size="lg" className="mt-4">
        Start Practice
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

export default DialogueReviewCard;
