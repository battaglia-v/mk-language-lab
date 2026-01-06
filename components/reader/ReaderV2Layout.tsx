'use client';

import { ReactNode, useState, createContext, useContext, useCallback } from 'react';
import { ArrowLeft, Settings, BookOpen, MessageSquare, Library, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GlossaryDrawer } from './GlossaryDrawer';

interface ReaderV2ContextValue {
  /** Whether tap-translate is enabled */
  tapTranslateEnabled: boolean;
  setTapTranslateEnabled: (enabled: boolean) => void;
  /** Whether sentence mode is enabled */
  sentenceModeEnabled: boolean;
  setSentenceModeEnabled: (enabled: boolean) => void;
  /** Whether glossary drawer is open */
  glossaryOpen: boolean;
  setGlossaryOpen: (open: boolean) => void;
  /** Saved words in glossary */
  savedWords: SavedWord[];
  addToGlossary: (word: SavedWord) => void;
  removeFromGlossary: (wordId: string) => void;
  /** Current locale */
  locale: string;
}

export interface SavedWord {
  id: string;
  original: string;
  translation: string;
  partOfSpeech?: string;
  savedAt: Date;
}

const ReaderV2Context = createContext<ReaderV2ContextValue | null>(null);

export function useReaderV2() {
  const context = useContext(ReaderV2Context);
  if (!context) {
    throw new Error('useReaderV2 must be used within ReaderV2Layout');
  }
  return context;
}

interface ReaderV2LayoutProps {
  /** Page title */
  title: string;
  /** Back URL */
  backUrl: string;
  /** Reading progress (0-100) */
  progress?: number;
  /** Estimated reading time in minutes */
  estimatedMinutes?: number;
  /** Difficulty level */
  difficulty?: string;
  /** Preferred font size */
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  /** Locale */
  locale: string;
  /** Main reading content */
  children: ReactNode;
  /** On settings click */
  onSettingsClick?: () => void;
}

/**
 * ReaderV2Layout - Mobile-first reader with sticky controls
 *
 * Features:
 * - Sticky header with back, title, progress
 * - Sticky footer with tap translate, sentence mode, glossary toggles
 * - Scrollable reading pane with large line-height
 * - Glossary drawer for saved words
 */
export function ReaderV2Layout({
  title,
  backUrl,
  progress = 0,
  estimatedMinutes,
  difficulty,
  fontSize = 'base',
  locale,
  children,
  onSettingsClick,
}: ReaderV2LayoutProps) {
  // Reader state
  const [tapTranslateEnabled, setTapTranslateEnabled] = useState(true);
  const [sentenceModeEnabled, setSentenceModeEnabled] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('reader-glossary');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const addToGlossary = useCallback((word: SavedWord) => {
    setSavedWords((prev) => {
      const exists = prev.some((w) => w.id === word.id);
      if (exists) return prev;
      const updated = [...prev, word];
      localStorage.setItem('reader-glossary', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromGlossary = useCallback((wordId: string) => {
    setSavedWords((prev) => {
      const updated = prev.filter((w) => w.id !== wordId);
      localStorage.setItem('reader-glossary', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const contextValue: ReaderV2ContextValue = {
    tapTranslateEnabled,
    setTapTranslateEnabled,
    sentenceModeEnabled,
    setSentenceModeEnabled,
    glossaryOpen,
    setGlossaryOpen,
    savedWords,
    addToGlossary,
    removeFromGlossary,
    locale,
  };

  const t = {
    tapTranslate: locale === 'mk' ? 'Допир' : 'Tap',
    sentenceMode: locale === 'mk' ? 'Реченици' : 'Sentences',
    glossary: locale === 'mk' ? 'Речник' : 'Glossary',
    save: locale === 'mk' ? 'Зачувај' : 'Save',
    saveComingSoon: locale === 'mk' ? 'Наскоро' : 'Coming soon',
    back: locale === 'mk' ? 'Назад' : 'Back',
    minRead: locale === 'mk' ? 'мин' : 'min',
  };

  const proseSize =
    fontSize === 'sm'
      ? 'prose-p:text-base sm:prose-p:text-lg'
      : fontSize === 'lg'
        ? 'prose-p:text-xl sm:prose-p:text-2xl'
        : fontSize === 'xl'
          ? 'prose-p:text-2xl sm:prose-p:text-3xl'
          : 'prose-p:text-lg sm:prose-p:text-xl';

  return (
    <ReaderV2Context.Provider value={contextValue}>
      <div className="flex h-[100dvh] flex-col bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Back button */}
            <Link
              href={backUrl}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label={t.back}
              data-testid="reader-v2-back"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>

            {/* Title & metadata */}
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate text-base">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {estimatedMinutes && (
                  <span>~{estimatedMinutes} {t.minRead}</span>
                )}
                {difficulty && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                    difficulty === 'A1' && 'bg-emerald-500/20 text-emerald-400',
                    difficulty === 'A2' && 'bg-sky-500/20 text-sky-400',
                    difficulty === 'B1' && 'bg-amber-500/20 text-amber-400',
                    difficulty === 'B2' && 'bg-purple-500/20 text-purple-400',
                  )}>
                    {difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Settings */}
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={onSettingsClick}
                aria-label="Settings"
                data-testid="reader-v2-settings"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <Progress
            value={progress}
            className="h-1 rounded-none"
          />
        </header>

        {/* Scrollable Reading Pane */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-6 sm:px-6 md:px-8">
            {/* Reading content with optimal typography */}
            <article
              className={cn(
                'prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:tracking-wide',
                proseSize
              )}
            >
              {children}
            </article>
          </div>
        </main>

        {/* Sticky Footer Controls */}
        <footer className="sticky bottom-0 z-30 flex-shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm safe-area-pb">
          <div className="flex items-center justify-around px-2 py-2">
            {/* Tap Translate Toggle */}
            <button
              onClick={() => setTapTranslateEnabled(!tapTranslateEnabled)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors min-w-[64px] min-h-[52px]',
                tapTranslateEnabled
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              aria-pressed={tapTranslateEnabled}
              data-testid="reader-v2-toggle-tap"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">{t.tapTranslate}</span>
            </button>

            {/* Sentence Mode Toggle */}
            <button
              onClick={() => setSentenceModeEnabled(!sentenceModeEnabled)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors min-w-[64px] min-h-[52px]',
                sentenceModeEnabled
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              aria-pressed={sentenceModeEnabled}
              data-testid="reader-v2-toggle-sentences"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">{t.sentenceMode}</span>
            </button>

            {/* Glossary Button */}
            <button
              onClick={() => setGlossaryOpen(true)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors min-w-[64px] min-h-[52px] relative',
                'text-muted-foreground hover:bg-muted'
              )}
              data-testid="reader-v2-open-glossary"
            >
              <Library className="h-5 w-5" />
              <span className="text-xs font-medium">{t.glossary}</span>
              {savedWords.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-black flex items-center justify-center">
                  {savedWords.length}
                </span>
              )}
            </button>

            {/* Save Current */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title={t.saveComingSoon}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg transition-colors min-w-[64px] min-h-[52px]',
                'text-muted-foreground opacity-50 cursor-not-allowed'
              )}
              data-testid="reader-v2-save-disabled"
            >
              <Bookmark className="h-5 w-5" />
              <span className="text-xs font-medium">{t.save}</span>
            </button>
          </div>
        </footer>

        {/* Glossary Drawer */}
        <GlossaryDrawer
          open={glossaryOpen}
          onClose={() => setGlossaryOpen(false)}
          words={savedWords}
          onRemoveWord={removeFromGlossary}
          locale={locale}
        />
      </div>
    </ReaderV2Context.Provider>
  );
}
