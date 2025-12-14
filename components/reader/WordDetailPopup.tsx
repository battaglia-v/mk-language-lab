'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Plus, X, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface WordDetailPopupProps {
  /** Whether the popup is visible */
  isOpen: boolean;
  /** The word being displayed */
  word: {
    original: string;
    translation: string;
    partOfSpeech?: string;
    phonetic?: string;
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    examples?: string[];
  };
  /** Position for popup (relative to trigger) */
  position?: { x: number; y: number };
  /** Callback when popup should close */
  onClose: () => void;
  /** Callback when user clicks "Add to Deck" */
  onAddToDeck?: (word: WordDetailPopupProps['word']) => void;
  /** Callback when user clicks audio button */
  onPlayAudio?: (text: string) => void;
  /** Whether the word is already in user's deck */
  isInDeck?: boolean;
  /** Translations */
  t: {
    addToDeck: string;
    alreadyInDeck: string;
    playAudio: string;
    difficulty: string;
  };
}

const DIFFICULTY_COLORS: Record<string, string> = {
  A1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  A2: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  B1: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  B2: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  C1: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

/**
 * WordDetailPopup - Shows word details when user taps a word in Reader
 * 
 * Displays translation, part of speech, pronunciation, difficulty level,
 * and options to play audio or add to vocabulary deck.
 */
export function WordDetailPopup({
  isOpen,
  word,
  position,
  onClose,
  onAddToDeck,
  onPlayAudio,
  isInDeck = false,
  t,
}: WordDetailPopupProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isAddingToDeck, setIsAddingToDeck] = useState(false);

  const handleAddToDeck = useCallback(async () => {
    if (!onAddToDeck || isInDeck) return;
    setIsAddingToDeck(true);
    try {
      await onAddToDeck(word);
    } finally {
      setIsAddingToDeck(false);
    }
  }, [onAddToDeck, word, isInDeck]);

  const handlePlayAudio = useCallback(() => {
    onPlayAudio?.(word.original);
  }, [onPlayAudio, word.original]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              "fixed z-50 w-[calc(100%-2rem)] max-w-sm",
              "rounded-2xl border border-border/60 bg-background/95 backdrop-blur-lg",
              "shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "sm:left-auto sm:top-auto sm:translate-x-0 sm:translate-y-0"
            )}
            style={position ? { left: position.x, top: position.y } : undefined}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/40 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {word.original}
                  </h3>
                  {onPlayAudio && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/20"
                      onClick={handlePlayAudio}
                      aria-label={t.playAudio}
                    >
                      <Volume2 className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </div>
                {word.phonetic && (
                  <p className="text-sm text-muted-foreground">
                    {word.phonetic}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4 p-4">
              {/* Translation */}
              <div className="space-y-1">
                <p className="text-lg font-medium text-foreground">
                  {word.translation}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {word.partOfSpeech && (
                    <Badge variant="outline" className="text-xs">
                      <BookOpen className="mr-1 h-3 w-3" />
                      {word.partOfSpeech}
                    </Badge>
                  )}
                  {word.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", DIFFICULTY_COLORS[word.difficulty])}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      {word.difficulty}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Examples */}
              {word.examples && word.examples.length > 0 && (
                <div className="space-y-2 rounded-xl bg-white/5 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Examples
                  </p>
                  {word.examples.map((example, idx) => (
                    <p key={idx} className="text-sm italic text-foreground/80">
                      &ldquo;{example}&rdquo;
                    </p>
                  ))}
                </div>
              )}

              {/* Add to Deck button */}
              {onAddToDeck && (
                <Button
                  onClick={handleAddToDeck}
                  disabled={isInDeck || isAddingToDeck}
                  className={cn(
                    "w-full min-h-[48px] rounded-xl",
                    isInDeck 
                      ? "bg-success/20 text-success" 
                      : "bg-primary/20 text-primary hover:bg-primary/30"
                  )}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isInDeck ? t.alreadyInDeck : t.addToDeck}
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
