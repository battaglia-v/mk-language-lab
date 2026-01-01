'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookmarkPlus, Clock, Volume2, Eye, EyeOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { cn } from '@/lib/utils';
import { addFavorite, isFavorite, removeFavorite } from '@/lib/favorites';

// Types
export type WordData = {
  id: string;
  original: string;
  translation: string;
  pos?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
};

export type SentenceData = {
  id: string;
  text: string;
  translation: string;
  words: WordData[];
};

export interface ReadingViewProps {
  title: string;
  titleMk?: string;
  locale: string;
  sentences: SentenceData[];
  difficulty?: string;
  estimatedMinutes?: number;
  onBack?: () => void;
}

/**
 * ReadingView - Kindle-style reading experience
 *
 * Clean typography, tap any word to see translation in bottom sheet.
 * Per-sentence reveal toggle. Progress tracking.
 */
export function ReadingView({
  title,
  titleMk,
  locale,
  sentences,
  difficulty,
  estimatedMinutes = 5,
  onBack,
}: ReadingViewProps) {
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [wordSheetOpen, setWordSheetOpen] = useState(false);
  const [revealedSentences, setRevealedSentences] = useState<Set<string>>(new Set());
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track saved words
  useEffect(() => {
    const saved = new Set<string>();
    sentences.forEach(s => s.words.forEach(w => {
      if (isFavorite(w.id)) saved.add(w.id);
    }));
    setSavedWords(saved);
  }, [sentences]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWordTap = useCallback((word: WordData) => {
    setSelectedWord(word);
    setWordSheetOpen(true);
  }, []);

  const handleSaveWord = useCallback((word: WordData) => {
    if (savedWords.has(word.id)) {
      removeFavorite(word.id);
      setSavedWords(prev => {
        const next = new Set(prev);
        next.delete(word.id);
        return next;
      });
    } else {
      addFavorite({
        id: word.id,
        macedonian: word.original,
        english: word.translation,
        category: 'reader',
      });
      setSavedWords(prev => new Set(prev).add(word.id));
    }
  }, [savedWords]);

  const handleListen = useCallback((text: string, lang: 'mk' | 'en') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'mk' ? 'sr-RS' : 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, []);

  const toggleSentenceReveal = useCallback((sentenceId: string) => {
    setRevealedSentences(prev => {
      const next = new Set(prev);
      if (next.has(sentenceId)) {
        next.delete(sentenceId);
      } else {
        next.add(sentenceId);
      }
      return next;
    });
  }, []);

  const totalWords = sentences.reduce((sum, s) => sum + s.words.length, 0);

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-6">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          {onBack ? (
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Link href={`/${locale}/reader`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <Progress value={scrollProgress} className="h-1.5" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>{savedWords.size}</span>
          </div>
        </div>
      </header>

      {/* Reading Content */}
      <article className="px-4 py-6 max-w-2xl mx-auto">
        {/* Title */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {titleMk && <p className="text-lg text-muted-foreground">{titleMk}</p>}
          {difficulty && (
            <span className={cn(
              'inline-block mt-3 px-2 py-1 text-xs font-medium rounded-full',
              difficulty === 'A1' && 'bg-emerald-500/20 text-emerald-400',
              difficulty === 'A2' && 'bg-green-500/20 text-green-400',
              difficulty === 'B1' && 'bg-amber-500/20 text-amber-400',
              difficulty === 'B2' && 'bg-orange-500/20 text-orange-400'
            )}>
              {difficulty}
            </span>
          )}
        </header>

        {/* Sentences */}
        <div className="space-y-6">
          {sentences.map((sentence) => {
            const isRevealed = revealedSentences.has(sentence.id);
            return (
              <div key={sentence.id} className="group">
                {/* Sentence text with tappable words */}
                <p className="text-lg leading-relaxed font-serif">
                  {sentence.words.map((word, idx) => (
                    <TappableWord
                      key={`${word.id}-${idx}`}
                      word={word}
                      isSaved={savedWords.has(word.id)}
                      onTap={handleWordTap}
                    />
                  ))}
                </p>

                {/* Per-sentence reveal toggle */}
                <button
                  onClick={() => toggleSentenceReveal(sentence.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Hide translation</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Show translation</span>
                    </>
                  )}
                </button>

                {/* Revealed translation */}
                {isRevealed && (
                  <div className="mt-2 pl-3 border-l-2 border-primary/30">
                    <p className="text-sm text-muted-foreground italic">{sentence.translation}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 mt-1 text-xs"
                      onClick={() => handleListen(sentence.translation, 'en')}
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Listen
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reading stats */}
        <footer className="mt-12 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>{totalWords} words · {sentences.length} sentences</p>
          <p className="mt-1">{savedWords.size} words saved</p>
        </footer>
      </article>

      {/* Word Lookup Bottom Sheet */}
      <BottomSheet
        open={wordSheetOpen}
        onClose={() => setWordSheetOpen(false)}
        title={selectedWord?.original || ''}
      >
        {selectedWord && (
          <WordLookupContent
            word={selectedWord}
            isSaved={savedWords.has(selectedWord.id)}
            onSave={() => handleSaveWord(selectedWord)}
            onListen={(text, lang) => handleListen(text, lang)}
          />
        )}
      </BottomSheet>
    </div>
  );
}

/**
 * TappableWord - Individual word that can be tapped for lookup
 */
function TappableWord({
  word,
  isSaved,
  onTap,
}: {
  word: WordData;
  isSaved: boolean;
  onTap: (word: WordData) => void;
}) {
  // Handle punctuation - don't make it tappable
  const isPunctuation = /^[.,!?;:'"()[\]{}—–-]+$/.test(word.original);

  if (isPunctuation) {
    return <span>{word.original}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onTap(word)}
      className={cn(
        'inline px-0.5 -mx-0.5 rounded transition-colors',
        'hover:bg-primary/20 active:bg-primary/30',
        isSaved && 'underline decoration-primary decoration-2 underline-offset-4'
      )}
    >
      {word.original}
    </button>
  );
}

/**
 * WordLookupContent - Content for the word lookup bottom sheet
 *
 * Matches redesign spec: Word + Translation + Part of speech
 * Buttons: Listen | Save word | Add to practice
 */
function WordLookupContent({
  word,
  isSaved,
  onSave,
  onListen,
}: {
  word: WordData;
  isSaved: boolean;
  onSave: () => void;
  onListen: (text: string, lang: 'mk' | 'en') => void;
}) {
  return (
    <div className="space-y-4">
      {/* Word + Translation */}
      <div className="text-center py-2">
        <p className="text-2xl font-bold">{word.original}</p>
        <p className="text-lg text-muted-foreground mt-1">{word.translation}</p>
        {word.pos && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-muted rounded-full capitalize">
            {word.pos}
          </span>
        )}
      </div>

      {/* 3-button action grid */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-col h-auto py-3 rounded-xl"
          onClick={() => onListen(word.original, 'mk')}
        >
          <Volume2 className="h-5 w-5 mb-1" />
          <span className="text-xs">Listen</span>
        </Button>
        <Button
          variant={isSaved ? 'secondary' : 'outline'}
          size="sm"
          className="flex-col h-auto py-3 rounded-xl"
          onClick={onSave}
        >
          <BookmarkPlus className="h-5 w-5 mb-1" />
          <span className="text-xs">{isSaved ? 'Saved' : 'Save word'}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-col h-auto py-3 rounded-xl"
          onClick={() => {
            // Add to practice queue (future feature)
            onSave(); // For now, just save it
          }}
        >
          <Play className="h-5 w-5 mb-1" />
          <span className="text-xs">Practice</span>
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-center text-muted-foreground">
        Saved words appear in Practice.
      </p>
    </div>
  );
}
