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
    alternativeTranslations?: string[];
    contextHint?: string;
    partOfSpeech?: string;
    phonetic?: string;
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'basic' | 'intermediate' | 'advanced';
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
  // CEFR levels
  A1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  A2: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  B1: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  B2: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  C1: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  // Text Analyzer levels
  basic: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
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
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Popup with delightful entrance */}
          <motion.div
            initial={prefersReducedMotion 
              ? { opacity: 0 } 
              : { opacity: 0, scale: 0.85, y: 20, rotateX: -5 }
            }
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              rotateX: 0,
            }}
            exit={prefersReducedMotion 
              ? { opacity: 0 } 
              : { opacity: 0, scale: 0.95, y: 10 }
            }
            transition={{ 
              type: 'spring', 
              stiffness: 350, 
              damping: 30,
              mass: 0.8,
            }}
            className={cn(
              "fixed z-50 w-[calc(100%-2rem)] max-w-sm",
              "rounded-2xl border border-primary/20 bg-background/98 backdrop-blur-xl",
              "shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(246,216,59,0.1)]",
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "ring-1 ring-white/10",
              "sm:left-auto sm:top-auto sm:translate-x-0 sm:translate-y-0"
            )}
            style={position ? { left: position.x, top: position.y } : undefined}
          >
            {/* Header with subtle glow */}
            <motion.div 
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="flex items-start justify-between border-b border-border/40 p-4 relative overflow-hidden"
            >
              {/* Subtle gradient glow behind word */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2">
                  <motion.h3 
                    initial={prefersReducedMotion ? {} : { scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                    className="text-xl font-bold text-foreground"
                  >
                    {word.original}
                  </motion.h3>
                  {onPlayAudio && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/20 hover:scale-110 transition-all"
                        onClick={handlePlayAudio}
                        aria-label={t.playAudio}
                        data-testid="reader-word-popup-audio"
                      >
                        <Volume2 className="h-4 w-4 text-primary" />
                      </Button>
                    </motion.div>
                  )}
                </div>
                {word.phonetic && (
                  <motion.p 
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    {word.phonetic}
                  </motion.p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full relative z-10 hover:bg-white/10"
                onClick={onClose}
                aria-label="Close"
                data-testid="reader-word-popup-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Content with staggered animations */}
            <div className="space-y-4 p-4">
              {/* Translation */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <p className="text-lg font-medium text-foreground">
                  {word.translation}
                </p>

                {/* Alternative translations */}
                {word.alternativeTranslations && word.alternativeTranslations.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Also: {word.alternativeTranslations.join(', ')}
                  </p>
                )}

                {/* Context hint for words with multiple meanings */}
                {word.contextHint && (
                  <p className="text-xs text-primary/80 italic">
                    {word.contextHint}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {word.partOfSpeech && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge variant="outline" className="text-xs">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {word.partOfSpeech}
                      </Badge>
                    </motion.div>
                  )}
                  {word.difficulty && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Badge
                        variant="outline"
                        className={cn("text-xs", DIFFICULTY_COLORS[word.difficulty] || DIFFICULTY_COLORS['basic'])}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        {word.difficulty}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Examples */}
              {word.examples && word.examples.length > 0 && (
                <motion.div 
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 rounded-xl bg-white/5 p-3 border border-white/5"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Examples
                  </p>
                  {word.examples.map((example, idx) => (
                    <motion.p 
                      key={idx} 
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.1 }}
                      className="text-sm italic text-foreground/80"
                    >
                      &ldquo;{example}&rdquo;
                    </motion.p>
                  ))}
                </motion.div>
              )}

              {/* Add to Deck button with satisfying animation */}
              {onAddToDeck && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleAddToDeck}
                    disabled={isInDeck || isAddingToDeck}
                    className={cn(
                      "w-full min-h-[48px] rounded-xl transition-all",
                      isInDeck 
                        ? "bg-success/20 text-success" 
                        : "bg-primary text-[#0a0a0a] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                    data-testid="reader-word-popup-add"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isInDeck ? t.alreadyInDeck : t.addToDeck}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
