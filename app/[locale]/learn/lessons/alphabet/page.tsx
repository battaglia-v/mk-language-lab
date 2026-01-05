'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, Sparkles, BookOpen, Mic, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import alphabetData from '@/data/alphabet-deck.json';

const STORAGE_KEY = 'mkll:alphabet-progress';

interface AlphabetLetter {
  id: string;
  letter: string;
  latinEquiv: string;
  ipa: string;
  audio: string;
  exampleWord: {
    mk: string;
    en: string;
  };
  notes: string;
}

interface AlphabetDeck {
  meta: {
    id: string;
    title: string;
    titleMk: string;
    description: string;
    descriptionMk: string;
  };
  items: AlphabetLetter[];
  uniqueLetters: {
    description: string;
    letters: string[];
    notes: string;
  };
  softLetters: {
    description: string;
    pairs: Array<{ hard: string; soft: string }>;
  };
}

const alphabet = alphabetData as AlphabetDeck;

export default function AlphabetLessonPage() {
  const locale = useLocale();
  const t = useTranslations('alphabet');
  const [viewedLetters, setViewedLetters] = useState<Set<string>>(new Set());
  const [playingLetter, setPlayingLetter] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addToast } = useToast();
  const hasCalledCompletion = useRef(false);

  const progress = Math.round((viewedLetters.size / alphabet.items.length) * 100);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setViewedLetters(new Set(parsed));
        }
        // Check if already completed
        if (parsed.length >= alphabet.items.length) {
          setIsCompleted(true);
        }
      }
    } catch (e) {
      console.warn('[Alphabet] Failed to load progress:', e);
    }
  }, []);

  // Save progress to localStorage when letters change
  useEffect(() => {
    if (viewedLetters.size > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...viewedLetters]));
      } catch (e) {
        console.warn('[Alphabet] Failed to save progress:', e);
      }
    }
  }, [viewedLetters]);

  // Mark lesson complete when all letters viewed
  const markLessonComplete = useCallback(async () => {
    if (hasCalledCompletion.current || isCompleted) return;
    hasCalledCompletion.current = true;
    setIsCompleting(true);

    try {
      const response = await fetch('/api/practice/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctCount: alphabet.items.length,
          totalCount: alphabet.items.length,
          type: 'alphabet',
        }),
      });

      if (!response.ok) throw new Error('Failed to record completion');

      const data = await response.json();
      setIsCompleted(true);
      addToast({
        title: t('completedTitle', { default: 'Lesson Complete!' }),
        description: `+${data.xpEarned} XP earned!`,
        type: 'success',
      });
    } catch (error) {
      console.error('[Alphabet] Failed to mark complete:', error);
      hasCalledCompletion.current = false;
      addToast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        type: 'error',
      });
    } finally {
      setIsCompleting(false);
    }
  }, [isCompleted, addToast, t]);

  // Auto-complete when 100% reached
  useEffect(() => {
    if (progress >= 100 && !isCompleted && !hasCalledCompletion.current) {
      markLessonComplete();
    }
  }, [progress, isCompleted, markLessonComplete]);

  const markLetterViewed = (letter: AlphabetLetter) => {
    // Mark as viewed (audio coming soon - no TTS)
    setViewedLetters(prev => new Set([...prev, letter.id]));
    setPlayingLetter(letter.id);
    // Brief visual feedback then clear
    setTimeout(() => setPlayingLetter(null), 300);
  };

  return (
    <PageContainer size="lg" className="flex flex-col gap-5 pb-24 sm:gap-6 sm:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2" data-testid="alphabet-back-to-a1">
          <Link href={`/${locale}/learn/paths/a1`}>
            <ArrowLeft className="h-4 w-4" />
            {t('backToPath', { default: 'Back to A1 Path' })}
          </Link>
        </Button>
      </div>

      {/* Title & Progress */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {locale === 'mk' ? alphabet.meta.titleMk : alphabet.meta.title}
          </h1>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            A1
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {locale === 'mk' ? alphabet.meta.descriptionMk : alphabet.meta.description}
        </p>

        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground">
            {viewedLetters.size}/{alphabet.items.length} {t('lettersViewed', { default: 'letters viewed' })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="learn" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn" className="gap-1.5" data-testid="alphabet-tab-learn">
            <BookOpen className="h-4 w-4" />
            {t('learn', { default: 'Learn' })}
          </TabsTrigger>
          <TabsTrigger value="special" className="gap-1.5" data-testid="alphabet-tab-special">
            <Sparkles className="h-4 w-4" />
            {t('special', { default: 'Special' })}
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-1.5" data-testid="alphabet-tab-practice">
            <Mic className="h-4 w-4" />
            {t('practice', { default: 'Practice' })}
          </TabsTrigger>
        </TabsList>

        {/* Learn Tab - Full Alphabet Grid */}
        <TabsContent value="learn" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {alphabet.items.map((letter) => (
              <Card
                key={letter.id}
                className={cn(
                  'relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md',
                  'min-h-[140px]',
                  viewedLetters.has(letter.id) && 'border-emerald-500/30 bg-emerald-500/5',
                  playingLetter === letter.id && 'border-primary ring-2 ring-primary/20'
                )}
              >
                {/* Clickable overlay for the main card area */}
                {/* eslint-disable-next-line react/forbid-elements -- transparent overlay needs raw button */}
                <button
                  type="button"
                  aria-label={`Letter ${letter.letter}, ${letter.latinEquiv}. Tap to mark as viewed.`}
                  data-testid={`alphabet-letter-${letter.id}`}
                  className="absolute inset-0 z-10 cursor-pointer touch-manipulation"
                  onClick={() => markLetterViewed(letter)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      markLetterViewed(letter);
                    }
                  }}
                />
                <CardContent className="p-4 sm:p-5 text-center flex flex-col justify-center h-full pointer-events-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{letter.latinEquiv}</span>
                    {viewedLetters.has(letter.id) && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-4xl sm:text-3xl font-bold mb-1">{letter.letter}</div>
                  <div className="text-sm text-muted-foreground mb-2">{letter.ipa}</div>
                  <div className="text-sm font-medium">{letter.exampleWord.mk}</div>
                  <p className="text-xs text-muted-foreground">{letter.exampleWord.en}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Audio Coming Soon Notice */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-2">
              <Volume2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-200">
                <strong>Native audio coming soon</strong> — we&apos;re recording proper pronunciations. For now, tap letters to mark them as viewed.
              </p>
            </div>
          </div>

          {/* Pronunciation Notes */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('tipTitle', { default: 'Pronunciation Tips' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{t('tip1', { default: 'Macedonian is phonetic - each letter makes one sound, always.' })}</p>
              <p>{t('tip2', { default: 'The stress usually falls on the third-to-last syllable (antepenultimate).' })}</p>
              <p>{t('tip3', { default: 'Use the IPA guides above to learn each sound.' })}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Letters Tab */}
        <TabsContent value="special" className="mt-4 space-y-6">
          {/* Unique Macedonian Letters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                {t('uniqueTitle', { default: 'Unique Macedonian Letters' })}
              </CardTitle>
              <CardDescription className="text-sm">{alphabet.uniqueLetters.notes}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {alphabet.items
                  .filter(l => alphabet.uniqueLetters.letters.includes(l.letter))
                  .map((letter) => (
                    <Card
                      key={letter.id}
                      className="relative overflow-hidden hover:border-amber-500/50 transition-all border-amber-500/20 bg-amber-500/5"
                    >
                      {/* eslint-disable-next-line react/forbid-elements -- transparent overlay needs raw button */}
                      <button
                        type="button"
                        aria-label={`Letter ${letter.letter}. Tap to view.`}
                        data-testid={`alphabet-special-letter-${letter.id}`}
                        className="absolute inset-0 z-10 cursor-pointer touch-manipulation"
                        onClick={() => markLetterViewed(letter)}
                      />
                      <CardContent className="p-4 pointer-events-none">
                        <div className="flex items-center gap-4 sm:flex-col sm:text-center sm:gap-2">
                          {/* Letter display */}
                          <div className="flex items-center gap-3 sm:flex-col sm:gap-1">
                            <div className="text-4xl font-bold text-amber-400">{letter.letter}</div>
                            <div className="text-left sm:text-center">
                              <div className="text-sm font-medium">{letter.latinEquiv}</div>
                              <div className="text-xs text-muted-foreground">{letter.ipa}</div>
                            </div>
                          </div>
                          {/* Notes - compact on mobile */}
                          <p className="text-xs text-muted-foreground flex-1 line-clamp-2 sm:line-clamp-3">
                            {letter.notes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Soft Letter Pairs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t('softPairsTitle', { default: 'Soft Consonant Pairs' })}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('softPairsDesc', { default: 'These letters come in hard/soft pairs. The soft versions are palatalized.' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {alphabet.softLetters.pairs.map((pair, idx) => (
                  <div key={idx} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-2xl font-medium">{pair.hard}</span>
                      <span className="text-muted-foreground text-sm">→</span>
                      <span className="text-2xl font-medium text-primary">{pair.soft}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('hardToSoft', { default: 'hard → soft' })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('practiceTitle', { default: 'Ready to Practice?' })}
              </CardTitle>
              <CardDescription>
                {t('practiceDesc', { default: 'Test your knowledge of the Macedonian alphabet' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" data-testid="alphabet-go-pronunciation-practice">
                <Link href={`/${locale}/practice/pronunciation`}>
                  <Mic className="h-4 w-4 mr-2" />
                  {t('pronunciationPractice', { default: 'Pronunciation Practice' })}
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full" data-testid="alphabet-go-alphabet-quiz">
                <Link href={`/${locale}/practice/session?deck=cyrillic-alphabet-v1&difficulty=all`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t('alphabetQuiz', { default: 'Alphabet Quiz' })}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {progress >= 100 && (
            <Card className="border-emerald-500/30 bg-emerald-500/10">
              <CardContent className="pt-6 text-center">
                {isCompleting ? (
                  <>
                    <Loader2 className="h-12 w-12 mx-auto text-emerald-400 mb-3 animate-spin" />
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                      {t('saving', { default: 'Saving Progress...' })}
                    </h3>
                  </>
                ) : (
                  <>
                    <Check className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                      {t('completedTitle', { default: 'Lesson Complete!' })}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('completedDesc', { default: 'You\'ve viewed all 31 letters. Great job!' })}
                    </p>
                    <Button asChild className="min-h-[44px]" data-testid="alphabet-continue-to-a1">
                      <Link href={`/${locale}/learn/paths/a1`}>
                        {t('continue', { default: 'Continue to Next Lesson' })}
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
