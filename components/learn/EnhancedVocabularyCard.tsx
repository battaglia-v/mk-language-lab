'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface VocabularyItem {
  id: string;
  macedonianText: string;
  englishText: string;
  transliteration?: string | null;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  gender?: string | null;
  category?: string | null;
  exampleSentenceMk?: string | null;
  exampleSentenceEn?: string | null;
  imageUrl?: string | null;
  isCore?: boolean;
}

interface EnhancedVocabularyCardProps {
  item: VocabularyItem;
  /** Display mode: 'full' shows all info, 'compact' shows minimal, 'flashcard' enables flip */
  mode?: 'full' | 'compact' | 'flashcard';
  /** Initially show translation (for full/compact modes) */
  showTranslation?: boolean;
  /** Initially show transliteration */
  showTransliteration?: boolean;
  /** Callback to add word to review deck */
  onAddToReview?: (item: VocabularyItem) => void;
  /** Whether the word is already in review deck */
  isInReviewDeck?: boolean;
  /** Animation delay for stagger effect */
  animationDelay?: number;
  /** Additional class name */
  className?: string;
}

// Part of speech colors
const POS_COLORS: Record<string, string> = {
  noun: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  verb: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  adjective: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  adverb: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  pronoun: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  preposition: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  conjunction: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  interjection: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  default: 'bg-muted text-muted-foreground border-border',
};

// Gender abbreviations
const GENDER_LABELS: Record<string, string> = {
  masculine: 'm.',
  feminine: 'f.',
  neuter: 'n.',
  m: 'm.',
  f: 'f.',
  n: 'n.',
};

// Gender colors - distinct from POS colors for clear grammatical indication
const GENDER_COLORS: Record<string, string> = {
  masculine: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  feminine: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  neuter: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  m: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  f: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  n: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  default: 'bg-muted text-muted-foreground border-border',
};

// ============================================================================
// EnhancedVocabularyCard Component
// ============================================================================

/**
 * EnhancedVocabularyCard - Rich vocabulary card with audio, examples, and visual elements
 * 
 * Features:
 * - Audio playback with TTS fallback
 * - Part of speech and gender indicators
 * - Example sentences with audio
 * - Optional image display
 * - Flashcard flip mode
 * - Add to review deck functionality
 * - Transliteration toggle
 */
export function EnhancedVocabularyCard({
  item,
  mode = 'full',
  showTranslation: initialShowTranslation = true,
  showTransliteration: initialShowTransliteration = true,
  onAddToReview,
  isInReviewDeck = false,
  animationDelay = 0,
  className,
}: EnhancedVocabularyCardProps) {
  // State
  const [showTranslation, setShowTranslation] = useState(
    mode === 'flashcard' ? false : initialShowTranslation
  );
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showTransliteration] = useState(initialShowTransliteration);

  // Handle flashcard flip
  const handleFlip = () => {
    if (mode === 'flashcard') {
      setIsFlipped(!isFlipped);
      setShowTranslation(!showTranslation);
    }
  };

  // Get part of speech color
  const getPosColor = (pos?: string | null) => {
    if (!pos) return POS_COLORS.default;
    return POS_COLORS[pos.toLowerCase()] || POS_COLORS.default;
  };

  // Get gender color
  const getGenderColor = (gender?: string | null) => {
    if (!gender) return GENDER_COLORS.default;
    return GENDER_COLORS[gender.toLowerCase()] || GENDER_COLORS.default;
  };

  // Parse gender from translation text (for adjectives where gender may be in parentheses)
  const parseGenderFromText = (text: string): string | null => {
    const match = text.match(/\((masculine|feminine|neuter)\)/i);
    return match ? match[1].toLowerCase() : null;
  };

  // Get effective gender (from item.gender or parsed from englishText)
  const effectiveGender = item.gender || parseGenderFromText(item.englishText);

  // Check if item has an example sentence
  const hasExample = !!(item.exampleSentenceMk || item.exampleSentenceEn);

  // Handle compact mode click
  const handleCompactClick = () => {
    if (hasExample) {
      setShowExample(!showExample);
    }
  };

  // Render compact mode
  if (mode === 'compact') {
    return (
      <Card
        onClick={hasExample ? handleCompactClick : undefined}
        className={cn(
          'p-3 transition-all duration-200',
          'hover:shadow-md hover:scale-[1.01]',
          hasExample && 'cursor-pointer',
          className
        )}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex items-center gap-3">
          {/* Word */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-primary">{item.macedonianText}</span>
              {showTransliteration && item.transliteration && (
                <span className="text-xs text-muted-foreground font-mono">
                  /{item.transliteration}/
                </span>
              )}
            </div>
            {showTranslation && (
              <p className="text-sm text-muted-foreground truncate">{item.englishText}</p>
            )}
          </div>

          {/* Part of speech and gender badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {item.partOfSpeech && (
              <Badge variant="outline" className={cn('text-xs', getPosColor(item.partOfSpeech))}>
                {item.partOfSpeech}
              </Badge>
            )}
            {effectiveGender && (
              <Badge variant="outline" className={cn('text-xs', getGenderColor(effectiveGender))}>
                {GENDER_LABELS[effectiveGender] || effectiveGender}
              </Badge>
            )}
          </div>
        </div>

        {/* Example sentence reveal */}
        <div
          className={cn(
            'transition-all duration-300 overflow-hidden',
            showExample ? 'opacity-100 max-h-40 mt-3 pt-3 border-t border-border/50' : 'opacity-0 max-h-0'
          )}
        >
          {item.exampleSentenceMk && (
            <p className="text-sm font-medium">{item.exampleSentenceMk}</p>
          )}
          {item.exampleSentenceEn && (
            <p className="text-sm text-muted-foreground italic mt-1">
              {item.exampleSentenceEn}
            </p>
          )}
        </div>

        {/* Tap for example hint */}
        {hasExample && !showExample && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Tap for example
          </p>
        )}
      </Card>
    );
  }

  // Render flashcard mode
  if (mode === 'flashcard') {
    return (
      <div
        className={cn('perspective-1000', className)}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <Card
          onClick={handleFlip}
          className={cn(
            'relative min-h-[200px] p-6 cursor-pointer transition-transform duration-500 preserve-3d',
            'hover:shadow-lg',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* Front (Macedonian) */}
          <div
            className={cn(
              'absolute inset-0 p-6 backface-hidden flex flex-col items-center justify-center text-center',
              isFlipped && 'invisible'
            )}
          >
            {item.imageUrl && (
              <div className="relative h-16 w-16 mb-4">
                <Image
                  src={item.imageUrl}
                  alt={item.englishText}
                  fill
                  className="object-cover rounded-lg"
                  sizes="64px"
                />
              </div>
            )}
            <p className="text-2xl font-bold text-primary mb-2">{item.macedonianText}</p>
            {showTransliteration && item.transliteration && (
              <p className="text-sm text-muted-foreground font-mono">/{item.transliteration}/</p>
            )}
            <p className="text-xs text-muted-foreground mt-4">Tap to reveal</p>
          </div>

          {/* Back (English) */}
          <div
            className={cn(
              'absolute inset-0 p-6 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center',
              !isFlipped && 'invisible'
            )}
          >
            <p className="text-xl font-semibold mb-2">{item.englishText}</p>
            {item.partOfSpeech && (
              <Badge variant="outline" className={cn('mb-4', getPosColor(item.partOfSpeech))}>
                {item.partOfSpeech}
              </Badge>
            )}
            {item.exampleSentenceMk && (
              <div className="text-sm text-muted-foreground">
                <p className="italic">{item.exampleSentenceMk}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Render full mode (default)
  return (
    <Card
      className={cn(
        'p-5 space-y-4 transition-all duration-200',
        'hover:shadow-md',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Optional image */}
        {item.imageUrl && (
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={item.imageUrl}
              alt={item.englishText}
              fill
              className="object-cover rounded-lg"
              sizes="64px"
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Macedonian word */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-primary">
              {item.macedonianText}
            </span>
            {item.pronunciation && (
              <span className="text-sm text-muted-foreground">
                [{item.pronunciation}]
              </span>
            )}
          </div>
          {showTransliteration && item.transliteration && (
            <p className="text-sm text-muted-foreground font-mono mt-0.5">
              /{item.transliteration}/
            </p>
          )}

          {/* English translation */}
          {showTranslation && (
            <p className="text-lg mt-1">{item.englishText}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {item.partOfSpeech && (
              <Badge variant="outline" className={cn('text-xs', getPosColor(item.partOfSpeech))}>
                {item.partOfSpeech}
              </Badge>
            )}
            {effectiveGender && (
              <Badge variant="outline" className={cn('text-xs', getGenderColor(effectiveGender))}>
                {GENDER_LABELS[effectiveGender] || effectiveGender}
              </Badge>
            )}
            {item.category && (
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            )}
            {item.isCore === false && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Bonus
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Example sentence */}
      {item.exampleSentenceMk && (
        <div className="pt-3 border-t border-border/50">
          <button
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            {showExample ? 'Hide example' : 'Show example'}
          </button>

          {showExample && (
            <div className="mt-3 pl-6 space-y-1">
              <p className="text-sm font-medium">{item.exampleSentenceMk}</p>
              {item.exampleSentenceEn && (
                <p className="text-sm text-muted-foreground italic">
                  {item.exampleSentenceEn}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add to review action */}
      {onAddToReview && (
        <div className="pt-3 border-t border-border/50">
          <Button
            variant={isInReviewDeck ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onAddToReview(item)}
            disabled={isInReviewDeck}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            {isInReviewDeck ? 'In Review Deck' : 'Add to Review'}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default EnhancedVocabularyCard;

