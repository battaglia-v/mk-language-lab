'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, RotateCcw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface PictureMatchItem {
  id: string;
  imageUrl: string;
  imageAlt: string;
  textMk: string;
  textEn: string;
}

interface PictureMatchExerciseProps {
  /** Items to match (pictures with sentences) */
  items: PictureMatchItem[];
  /** Instructions for the exercise */
  instructions?: string;
  /** Exercise mode: 'click-match' requires clicking sentence then picture */
  mode?: 'click-match';
  /** Callback when exercise is completed */
  onComplete?: (correct: number, total: number) => void;
  /** Show translations after matching */
  showTranslation?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * PictureMatchExercise - Match sentences to pictures
 * 
 * Based on textbook exercise "Поврзи ги речениците со сликите"
 * (Connect the sentences with the pictures)
 * 
 * Features:
 * - Click sentence then click matching picture
 * - Visual feedback for correct/incorrect matches
 * - Shuffled sentence order
 * - Progress tracking
 * - Accessible keyboard navigation
 */
export function PictureMatchExercise({
  items,
  instructions = 'Match each sentence to the correct picture',
  mode = 'click-match',
  onComplete,
  showTranslation = true,
  className,
}: PictureMatchExerciseProps) {
  // State
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // sentenceId -> pictureId
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  // Shuffle sentences (keep pictures in original order)
  const shuffledSentences = useMemo(() => {
    const sentences = items.map(item => ({
      id: item.id,
      textMk: item.textMk,
      textEn: item.textEn,
    }));
    // Fisher-Yates shuffle
    for (let i = sentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
    }
    return sentences;
  }, [items]);

  // Calculate progress
  const correctMatches = Object.keys(matches).length;
  const totalItems = items.length;
  const progress = (correctMatches / totalItems) * 100;

  // Check if a sentence is matched
  const isSentenceMatched = useCallback(
    (sentenceId: string) => sentenceId in matches,
    [matches]
  );

  // Check if a picture is matched
  const isPictureMatched = useCallback(
    (pictureId: string) => Object.values(matches).includes(pictureId),
    [matches]
  );

  // Get which sentence matches a picture
  const getSentenceForPicture = (pictureId: string) => {
    const entry = Object.entries(matches).find(([, pId]) => pId === pictureId);
    return entry ? entry[0] : null;
  };

  // Handle sentence click
  const handleSentenceClick = useCallback((sentenceId: string) => {
    if (isSentenceMatched(sentenceId) || isComplete) return;
    setSelectedSentence(sentenceId === selectedSentence ? null : sentenceId);
  }, [isSentenceMatched, isComplete, selectedSentence]);

  // Handle picture click
  const handlePictureClick = useCallback((pictureId: string) => {
    if (isPictureMatched(pictureId) || isComplete || !selectedSentence) return;

    // Check if the match is correct (sentenceId should equal pictureId for correct match)
    const isCorrect = selectedSentence === pictureId;

    if (isCorrect) {
      const newMatches = { ...matches, [selectedSentence]: pictureId };
      setMatches(newMatches);
      setSelectedSentence(null);

      // Check if complete
      if (Object.keys(newMatches).length === totalItems) {
        setIsComplete(true);
        onComplete?.(Object.keys(newMatches).length, totalItems);
      }
    } else {
      // Mark as incorrect attempt
      setIncorrectAttempts(prev => new Set([...prev, `${selectedSentence}-${pictureId}`]));
      
      // Flash incorrect feedback
      setTimeout(() => {
        setIncorrectAttempts(prev => {
          const newSet = new Set(prev);
          newSet.delete(`${selectedSentence}-${pictureId}`);
          return newSet;
        });
      }, 600);
    }
  }, [isPictureMatched, selectedSentence, matches, totalItems, isComplete, onComplete]);

  // Reset exercise
  const handleReset = useCallback(() => {
    setSelectedSentence(null);
    setMatches({});
    setIncorrectAttempts(new Set());
    setIsComplete(false);
  }, []);

  // Get sentence text by ID
  const getSentenceText = (sentenceId: string) => {
    const item = items.find(i => i.id === sentenceId);
    return item ? { textMk: item.textMk, textEn: item.textEn } : null;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Picture Matching</h3>
          <p className="text-sm text-muted-foreground">{instructions}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {correctMatches}/{totalItems}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sentences Column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Sentences
          </h4>
          <div className="space-y-2">
            {shuffledSentences.map((sentence) => {
              const isMatched = isSentenceMatched(sentence.id);
              const isSelected = selectedSentence === sentence.id;

              return (
                <button
                  key={sentence.id}
                  onClick={() => handleSentenceClick(sentence.id)}
                  disabled={isMatched || isComplete}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 text-left transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                    isMatched && 'bg-green-500/10 border-green-500/30 opacity-60',
                    isSelected && !isMatched && 'bg-primary/10 border-primary ring-2 ring-primary/20',
                    !isMatched && !isSelected && 'border-border hover:border-primary/50 hover:bg-muted/50',
                    (isMatched || isComplete) && 'cursor-default'
                  )}
                >
                  <p className="font-medium">{sentence.textMk}</p>
                  {showTranslation && isMatched && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {sentence.textEn}
                    </p>
                  )}
                  {isMatched && (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pictures Column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Pictures</h4>
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const isMatched = isPictureMatched(item.id);
              const matchedSentenceId = getSentenceForPicture(item.id);
              const matchedSentence = matchedSentenceId ? getSentenceText(matchedSentenceId) : null;
              const isIncorrect = selectedSentence && incorrectAttempts.has(`${selectedSentence}-${item.id}`);

              return (
                <button
                  key={item.id}
                  onClick={() => handlePictureClick(item.id)}
                  disabled={isMatched || isComplete || !selectedSentence}
                  className={cn(
                    'relative aspect-square rounded-lg border-2 overflow-hidden transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                    isMatched && 'border-green-500/50',
                    isIncorrect && 'border-red-500 animate-shake',
                    !isMatched && selectedSentence && !isIncorrect && 'border-primary/50 hover:border-primary cursor-pointer',
                    !isMatched && !selectedSentence && 'border-border opacity-50',
                    (isMatched || isComplete || !selectedSentence) && !isIncorrect && 'cursor-default'
                  )}
                >
                  {/* Placeholder for image - using colored background with alt text */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center p-2">
                    <span className="text-xs text-center text-muted-foreground">
                      {item.imageAlt}
                    </span>
                  </div>

                  {/* Actual image (when available) */}
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  )}

                  {/* Match overlay */}
                  {isMatched && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  )}

                  {/* Incorrect flash */}
                  {isIncorrect && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion message */}
      {isComplete && (
        <Card className="p-6 bg-green-500/10 border-green-500/20 text-center">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                Excellent! All matched correctly!
              </p>
              <p className="text-sm text-muted-foreground">
                You matched {correctMatches} out of {totalItems} pictures
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions hint */}
      {!isComplete && !selectedSentence && correctMatches === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          👆 Click a sentence, then click the matching picture
        </p>
      )}
      {!isComplete && selectedSentence && (
        <p className="text-sm text-primary text-center animate-pulse">
          Now click the matching picture →
        </p>
      )}
    </div>
  );
}

export default PictureMatchExercise;
