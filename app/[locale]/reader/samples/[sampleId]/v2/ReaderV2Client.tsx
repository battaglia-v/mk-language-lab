'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ReaderV2Layout } from '@/components/reader/ReaderV2Layout';
import { TappableTextV2 } from '@/components/reader/TappableTextV2';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  readProgress,
  saveProgress,
  markCompleted as markProgressCompleted,
  migrateLegacyCompletionKeys,
} from '@/lib/reading-progress';

interface ReaderSample {
  title_en: string;
  title_mk: string;
  difficulty: string;
  estimatedMinutes: number;
  tags: string[];
  text_blocks_mk: Array<{ type: string; value: string }>;
  vocabulary: Array<{ mk: string; en: string; pos?: string; note?: string }>;
  expressions?: Array<{ mk: string; en: string; usage?: string }>;
  grammar_highlights: Array<{
    title_en: string;
    title_mk: string;
    description_en?: string;
    description_mk?: string;
    bullets?: string[];
    examples?: Array<{ mk: string; en: string; note?: string }>;
  }>;
  attribution: {
    handle: string;
    series: string;
    day?: string;
    sourceTitle?: string;
    author?: string;
  };
  analyzedData?: {
    words: Array<{
      id: string;
      original: string;
      translation: string;
      alternativeTranslations?: string[];
      contextualMeaning?: string;
      contextHint?: string;
      pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
      difficulty: 'basic' | 'intermediate' | 'advanced';
      index: number;
    }>;
    tokens: Array<{ token: string; isWord: boolean; index: number }>;
    fullTranslation: string;
  };
}

interface ReaderV2ClientProps {
  sample: ReaderSample;
  locale: string;
  sampleId: string;
}

export function ReaderV2Client({ sample, locale, sampleId }: ReaderV2ClientProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [grammarOpen, setGrammarOpen] = useState(false);
  const [vocabOpen, setVocabOpen] = useState(false);
  // Vocabulary reveal state (matching lesson VocabularySection pattern)
  const [revealedVocab, setRevealedVocab] = useState<Set<number>>(new Set());
  const [showAllVocab, setShowAllVocab] = useState(false);
  // Grammar expand state (matching lesson GrammarSection pattern)
  const [expandedGrammar, setExpandedGrammar] = useState<Record<number, boolean>>({});
  const [scrollPercent, setScrollPercent] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isComplete, setIsComplete] = useState(false);

  // Refs for time tracking and debouncing
  const sessionStartRef = useRef<number>(Date.now());
  const previousTimeSpentRef = useRef<number>(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollRestoredRef = useRef(false);

  const title = locale === 'mk' ? sample.title_mk : sample.title_en;
  const backUrl = `/${locale}/reader`;
  const completionKey = `mkll:reader-v2-complete:${sampleId}`;

  const t = {
    grammar: locale === 'mk' ? 'Граматика' : 'Grammar',
    vocabulary: locale === 'mk' ? 'Речник' : 'Vocabulary',
    viewGrammar: locale === 'mk' ? 'Види граматика' : 'View Grammar',
    viewVocabulary: locale === 'mk' ? 'Види вокабулар' : 'View Vocabulary',
    keyWords: locale === 'mk' ? 'Клучни зборови' : 'Key Words',
    expressions: locale === 'mk' ? 'Изрази' : 'Expressions',
    examples: locale === 'mk' ? 'Примери' : 'Examples',
    markComplete: locale === 'mk' ? 'Заврши читање' : 'Mark Complete',
    completed: locale === 'mk' ? 'Завршено!' : 'Completed!',
    settings: locale === 'mk' ? 'Поставки' : 'Settings',
    fontSize: locale === 'mk' ? 'Големина на текст' : 'Font Size',
    theme: locale === 'mk' ? 'Тема' : 'Theme',
    tapToReveal: locale === 'mk' ? 'Допри за превод' : 'Tap to reveal',
    showAll: locale === 'mk' ? 'Покажи сите' : 'Show All',
    hideAll: locale === 'mk' ? 'Сокриј сите' : 'Hide All',
    showMore: locale === 'mk' ? 'Покажи повеќе' : 'Show more',
    showLess: locale === 'mk' ? 'Покажи помалку' : 'Show less',
  };

  // Vocabulary reveal helpers
  const toggleVocabReveal = (idx: number) => {
    if (showAllVocab) return;
    setRevealedVocab(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const isVocabRevealed = (idx: number) => showAllVocab || revealedVocab.has(idx);

  // Grammar expand helper
  const toggleGrammarExpand = (idx: number) => {
    setExpandedGrammar(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Calculate current time spent
  const getCurrentTimeSpent = useCallback(() => {
    const sessionTime = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    return previousTimeSpentRef.current + sessionTime;
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    (newScrollPercent: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress(sampleId, {
          scrollPercent: newScrollPercent,
          timeSpentSeconds: getCurrentTimeSpent(),
        });
      }, 2000);
    },
    [sampleId, getCurrentTimeSpent]
  );

  // Load existing progress and migrate legacy keys on mount
  useEffect(() => {
    // Migrate any legacy completion keys first
    migrateLegacyCompletionKeys();

    // Load progress from new system
    const existingProgress = readProgress(sampleId);
    if (existingProgress) {
      setIsComplete(existingProgress.isCompleted);
      setScrollPercent(existingProgress.scrollPercent);
      previousTimeSpentRef.current = existingProgress.timeSpentSeconds;
    } else {
      // Check legacy key for backward compatibility
      try {
        const legacyComplete = localStorage.getItem(completionKey) === 'true';
        if (legacyComplete) {
          setIsComplete(true);
          setScrollPercent(100);
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [sampleId, completionKey]);

  // Restore scroll position after content renders
  useEffect(() => {
    if (initialScrollRestoredRef.current) return;

    const container = scrollContainerRef.current;
    const existingProgress = readProgress(sampleId);

    if (container && existingProgress && existingProgress.scrollPercent > 0) {
      // Wait for content to render
      requestAnimationFrame(() => {
        const maxScroll = container.scrollHeight - container.clientHeight;
        const targetScroll = (existingProgress.scrollPercent / 100) * maxScroll;
        container.scrollTop = targetScroll;
        initialScrollRestoredRef.current = true;
      });
    } else {
      initialScrollRestoredRef.current = true;
    }
  }, [sampleId]);

  // Save progress on unmount
  useEffect(() => {
    const sessionStart = sessionStartRef.current;
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save final progress on unmount (if not completed)
      if (!isComplete) {
        saveProgress(sampleId, {
          scrollPercent,
          timeSpentSeconds:
            previousTimeSpentRef.current +
            Math.floor((Date.now() - sessionStart) / 1000),
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId]);

  const handleMarkComplete = () => {
    if (isComplete) return;
    setIsComplete(true);

    // Update new progress system
    markProgressCompleted(sampleId);

    // Also update legacy key for backward compatibility
    try {
      localStorage.setItem(completionKey, 'true');
    } catch {
      // Ignore localStorage errors
    }
  };

  // Handle scroll progress on the scroll container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrolled = container.scrollTop;
      const height = container.scrollHeight - container.clientHeight;
      const progress = height > 0 ? Math.round((scrolled / height) * 100) : 0;
      const clampedProgress = Math.min(progress, 100);

      setScrollPercent(clampedProgress);
      debouncedSave(clampedProgress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [debouncedSave]);

  return (
    <ReaderV2Layout
      title={title}
      backUrl={backUrl}
      progress={scrollPercent}
      estimatedMinutes={sample.estimatedMinutes}
      difficulty={sample.difficulty}
      fontSize={fontSize}
      locale={locale}
      onSettingsClick={() => setSettingsOpen(true)}
      scrollContainerRef={scrollContainerRef}
    >
      {/* Reading content */}
      <div className="space-y-6">
        {/* Text blocks */}
        {sample.text_blocks_mk.map((block, idx) => {
          if (block.type === 'p') {
            return (
              <TappableTextV2
                key={idx}
                text={block.value}
                vocabulary={sample.vocabulary}
                analyzedData={sample.analyzedData}
                className="text-foreground"
              />
            );
          }
          if (block.type === 'h2') {
            return (
              <h2 key={idx} className="text-xl font-semibold text-foreground mt-8 mb-4">
                {block.value}
              </h2>
            );
          }
          if (block.type === 'note') {
            return (
              <div
                key={idx}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
              >
                <span className="font-medium">Note:</span> {block.value}
              </div>
            );
          }
          return null;
        })}

        {/* Quick access buttons */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGrammarOpen(true)}
            className="gap-2"
            data-testid="reader-v2-open-grammar"
          >
            <Lightbulb className="h-4 w-4" />
            {t.viewGrammar}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVocabOpen(true)}
            className="gap-2"
            data-testid="reader-v2-open-vocabulary"
          >
            <BookOpen className="h-4 w-4" />
            {t.viewVocabulary}
          </Button>
        </div>

        {/* Attribution */}
        <div className="text-xs text-muted-foreground pt-4 border-t border-border/30">
          {/* MLC Badge for curated content */}
          {(sample.attribution.handle === '@mklanguagelab' ||
            sample.attribution.handle?.toLowerCase().includes('mlc')) && (
            <Badge
              variant="secondary"
              className="mb-2 text-xs bg-amber-500/20 text-amber-300 border-amber-500/30"
            >
              {locale === 'mk' ? 'Содржина од МЈК' : 'Content by MLC'}
            </Badge>
          )}
          <p>
            {sample.attribution.series}
            {sample.attribution.day && ` • Day ${sample.attribution.day}`}
          </p>
          <p className="mt-1">
            Source: {sample.attribution.sourceTitle || 'Original content'}
            {sample.attribution.author && ` by ${sample.attribution.author}`}
          </p>
          <p className="mt-1">Content by {sample.attribution.handle}</p>
        </div>

        {/* Mark complete CTA */}
        <div className="pt-6 pb-4">
          <Button
            className="w-full min-h-[52px] text-base font-semibold gap-2"
            size="lg"
            onClick={handleMarkComplete}
            disabled={isComplete}
            data-testid="reader-v2-mark-complete"
          >
            <CheckCircle className="h-5 w-5" />
            {isComplete ? t.completed : t.markComplete}
          </Button>
        </div>
      </div>

      {/* Settings Sheet */}
      <BottomSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t.settings}
        height="auto"
        testId="reader-v2-settings-sheet"
      >
        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
              {t.fontSize}
            </label>
            <div className="flex gap-2">
              {['sm', 'base', 'lg', 'xl'].map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setFontSize(size as typeof fontSize)}
                  data-testid={`reader-v2-font-size-${size}`}
                  aria-pressed={fontSize === size}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Grammar Sheet - styled like lesson GrammarSection */}
      <BottomSheet
        open={grammarOpen}
        onClose={() => setGrammarOpen(false)}
        title={t.grammar}
        height="auto"
        testId="reader-v2-grammar-sheet"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {sample.grammar_highlights.map((highlight, idx) => {
            const isExpanded = expandedGrammar[idx];
            const examples = highlight.examples || [];
            const visibleExamples = isExpanded ? examples : examples.slice(0, 3);

            return (
              <div
                key={idx}
                className="p-4 rounded-lg bg-secondary/5 border border-secondary/20"
              >
                {/* Title - secondary color like lesson GrammarSection */}
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  {locale === 'mk' ? highlight.title_mk : highlight.title_en}
                </h3>

                {/* Description */}
                {(highlight.description_mk || highlight.description_en) && (
                  <p className="text-base text-muted-foreground leading-relaxed mb-3">
                    {locale === 'mk' ? highlight.description_mk : highlight.description_en}
                  </p>
                )}

                {/* Bullets */}
                {highlight.bullets && highlight.bullets.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80 mb-3">
                    {highlight.bullets.map((bullet, bidx) => (
                      <li key={bidx}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {/* Examples - numbered list like lesson GrammarSection */}
                {examples.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-secondary/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      {t.examples}
                    </p>
                    <ol className="space-y-3 list-none">
                      {visibleExamples.map((ex, eidx) => (
                        <li key={eidx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-medium flex items-center justify-center">
                            {eidx + 1}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-base font-medium leading-relaxed">{ex.mk}</p>
                            <p className="text-sm text-muted-foreground italic">{ex.en}</p>
                            {ex.note && (
                              <p className="text-xs text-muted-foreground/70 italic">{ex.note}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                    {examples.length > 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGrammarExpand(idx)}
                        className="mt-3 text-secondary hover:text-secondary/80 gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            {t.showLess}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            {t.showMore} ({examples.length - 3})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* Vocabulary Sheet - styled like lesson VocabularySection */}
      <BottomSheet
        open={vocabOpen}
        onClose={() => setVocabOpen(false)}
        title={`${t.vocabulary} (${sample.vocabulary.length})`}
        height="auto"
        testId="reader-v2-vocab-sheet"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Show All / Hide All toggle */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-border">
            <p className="text-sm text-muted-foreground">
              {t.keyWords}
            </p>
            <Button
              variant={showAllVocab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAllVocab(!showAllVocab)}
              className="gap-2"
            >
              {showAllVocab ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>{t.hideAll}</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>{t.showAll}</span>
                </>
              )}
            </Button>
          </div>

          {/* Vocabulary cards - tap to reveal like lesson */}
          <div className="space-y-3">
            {sample.vocabulary.map((vocab, idx) => {
              const revealed = isVocabRevealed(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleVocabReveal(idx)}
                  className={cn(
                    'p-4 rounded-xl cursor-pointer transition-all duration-200 select-none',
                    'hover:shadow-md hover:scale-[1.01]',
                    revealed
                      ? 'bg-card border border-primary/30'
                      : 'bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20'
                  )}
                >
                  <div className="space-y-2">
                    {/* Macedonian word - always visible */}
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xl font-bold text-primary">{vocab.mk}</span>
                      {vocab.pos && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {vocab.pos}
                        </Badge>
                      )}
                    </div>

                    {/* English translation - revealed on tap */}
                    <div
                      className={cn(
                        'transition-all duration-300 overflow-hidden',
                        revealed ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'
                      )}
                    >
                      <p className="text-lg font-medium">{vocab.en}</p>
                      {vocab.note && (
                        <p className="text-sm text-muted-foreground italic mt-1">{vocab.note}</p>
                      )}
                    </div>

                    {/* Tap hint - shown when hidden */}
                    {!revealed && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {t.tapToReveal}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expressions */}
          {sample.expressions && sample.expressions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t.expressions}
              </h4>
              {sample.expressions.map((expr, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1"
                >
                  <p className="font-semibold text-amber-600 dark:text-amber-400">{expr.mk}</p>
                  <p className="text-sm text-muted-foreground">{expr.en}</p>
                  {expr.usage && (
                    <p className="text-xs text-muted-foreground/70 italic">{expr.usage}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </ReaderV2Layout>
  );
}
