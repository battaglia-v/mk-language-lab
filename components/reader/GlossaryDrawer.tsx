'use client';

import { useState, useCallback } from 'react';
import { Trash2, Volume2, Shuffle, ChevronRight, X } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SavedWord } from './ReaderV2Layout';
import { cn } from '@/lib/utils';

interface GlossaryDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
  /** Saved words */
  words: SavedWord[];
  /** Callback to remove a word */
  onRemoveWord: (wordId: string) => void;
  /** Current locale */
  locale: string;
}

/**
 * GlossaryDrawer - Shows saved words with mini flashcard review option
 *
 * Features:
 * - List of saved words from reading sessions
 * - Audio playback for each word
 * - Remove individual words
 * - "Review Now" mini flashcard mode
 */
export function GlossaryDrawer({
  open,
  onClose,
  words,
  onRemoveWord,
  locale,
}: GlossaryDrawerProps) {
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const t = {
    glossary: locale === 'mk' ? 'Мој речник' : 'My Glossary',
    empty: locale === 'mk' ? 'Немате зачувани зборови' : 'No saved words yet',
    emptyHint: locale === 'mk'
      ? 'Допрете збор додека читате за да го зачувате'
      : 'Tap words while reading to save them',
    reviewNow: locale === 'mk' ? 'Вежбај сега' : 'Review Now',
    showAnswer: locale === 'mk' ? 'Покажи превод' : 'Show Translation',
    next: locale === 'mk' ? 'Следен' : 'Next',
    done: locale === 'mk' ? 'Готово' : 'Done',
    wordsCount: locale === 'mk' ? 'зборови' : 'words',
    remove: locale === 'mk' ? 'Избриши' : 'Remove',
    listen: locale === 'mk' ? 'Слушај' : 'Listen',
  };

  const handlePlayAudio = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sr-RS';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleNextCard = useCallback(() => {
    setShowTranslation(false);
    if (currentCardIndex < words.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Finished review
      setReviewMode(false);
      setCurrentCardIndex(0);
    }
  }, [currentCardIndex, words.length]);

  const startReview = useCallback(() => {
    setCurrentCardIndex(0);
    setShowTranslation(false);
    setReviewMode(true);
  }, []);

  const exitReview = useCallback(() => {
    setReviewMode(false);
    setCurrentCardIndex(0);
    setShowTranslation(false);
  }, []);

  // Review mode view
  if (reviewMode && words.length > 0) {
    const currentWord = words[currentCardIndex];
    const isLast = currentCardIndex === words.length - 1;

    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        height="auto"
        showCloseButton={false}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={exitReview}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              Exit
            </button>
            <span className="text-sm text-muted-foreground">
              {currentCardIndex + 1} / {words.length}
            </span>
          </div>

          {/* Flashcard */}
          <div className="min-h-[200px] flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6">
            {/* Original word */}
            <div className="text-center space-y-3">
              <p className="text-3xl font-bold text-foreground">
                {currentWord.original}
              </p>
              {currentWord.partOfSpeech && (
                <Badge variant="outline" className="text-xs">
                  {currentWord.partOfSpeech}
                </Badge>
              )}

              {/* Audio button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAudio(currentWord.original)}
                className="mt-2"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {t.listen}
              </Button>
            </div>

            {/* Translation (revealed) */}
            {showTranslation && (
              <div className="mt-6 pt-6 border-t border-border w-full text-center">
                <p className="text-xl text-muted-foreground">
                  {currentWord.translation}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!showTranslation ? (
              <Button
                onClick={() => setShowTranslation(true)}
                className="flex-1"
                size="lg"
              >
                {t.showAnswer}
              </Button>
            ) : (
              <Button
                onClick={handleNextCard}
                className="flex-1"
                size="lg"
              >
                {isLast ? t.done : t.next}
                {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            )}
          </div>
        </div>
      </BottomSheet>
    );
  }

  // Normal glossary list view
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t.glossary}
      description={words.length > 0 ? `${words.length} ${t.wordsCount}` : undefined}
      height="auto"
    >
      <div className="space-y-4">
        {/* Empty state */}
        {words.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground">{t.empty}</p>
            <p className="text-sm text-muted-foreground/70">{t.emptyHint}</p>
          </div>
        )}

        {/* Review button */}
        {words.length > 0 && (
          <Button
            onClick={startReview}
            className="w-full"
            size="lg"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {t.reviewNow}
          </Button>
        )}

        {/* Word list */}
        {words.length > 0 && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {words.map((word) => (
              <div
                key={word.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                {/* Word info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {word.original}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {word.translation}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePlayAudio(word.original)}
                    aria-label={t.listen}
                  >
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRemoveWord(word.id)}
                    aria-label={t.remove}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
