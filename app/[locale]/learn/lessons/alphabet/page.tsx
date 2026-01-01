'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Volume2, Check, Sparkles, BookOpen, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout';
import { cn } from '@/lib/utils';
import alphabetData from '@/data/alphabet-deck.json';

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

  const progress = Math.round((viewedLetters.size / alphabet.items.length) * 100);

  const speakLetter = (letter: AlphabetLetter) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setPlayingLetter(letter.id);

    // Speak the letter itself
    const utterance = new SpeechSynthesisUtterance(letter.letter.split(' ')[0]);
    utterance.lang = 'sr-RS'; // Serbian is closest to Macedonian
    utterance.rate = 0.7;
    utterance.onend = () => setPlayingLetter(null);
    window.speechSynthesis.speak(utterance);

    // Mark as viewed
    setViewedLetters(prev => new Set([...prev, letter.id]));
  };

  const speakWord = (word: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'sr-RS';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <PageContainer size="lg" className="flex flex-col gap-5 pb-24 sm:gap-6 sm:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2">
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
          <TabsTrigger value="learn" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            {t('learn', { default: 'Learn' })}
          </TabsTrigger>
          <TabsTrigger value="special" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            {t('special', { default: 'Special' })}
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-1.5">
            <Mic className="h-4 w-4" />
            {t('practice', { default: 'Practice' })}
          </TabsTrigger>
        </TabsList>

        {/* Learn Tab - Full Alphabet Grid */}
        <TabsContent value="learn" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {alphabet.items.map((letter) => (
              <Card
                key={letter.id}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]',
                  viewedLetters.has(letter.id) && 'border-emerald-500/30 bg-emerald-500/5',
                  playingLetter === letter.id && 'border-primary ring-2 ring-primary/20'
                )}
                onClick={() => speakLetter(letter)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{letter.latinEquiv}</span>
                    {viewedLetters.has(letter.id) && (
                      <Check className="h-3 w-3 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-3xl font-bold mb-1">{letter.letter}</div>
                  <div className="text-xs text-muted-foreground mb-2">{letter.ipa}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(letter.exampleWord.mk);
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                    {letter.exampleWord.mk}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">{letter.exampleWord.en}</p>
                </CardContent>
              </Card>
            ))}
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
              <p>{t('tip3', { default: 'Tap any letter to hear its pronunciation!' })}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Letters Tab */}
        <TabsContent value="special" className="mt-4 space-y-6">
          {/* Unique Macedonian Letters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                {t('uniqueTitle', { default: 'Unique Macedonian Letters' })}
              </CardTitle>
              <CardDescription>{alphabet.uniqueLetters.notes}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {alphabet.items
                  .filter(l => alphabet.uniqueLetters.letters.includes(l.letter))
                  .map((letter) => (
                    <Card
                      key={letter.id}
                      className="cursor-pointer hover:border-amber-500/50 transition-all"
                      onClick={() => speakLetter(letter)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl font-bold text-amber-400 mb-2">{letter.letter}</div>
                        <div className="text-sm font-medium">{letter.latinEquiv}</div>
                        <div className="text-xs text-muted-foreground">{letter.ipa}</div>
                        <p className="text-xs mt-2">{letter.notes}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Soft Letter Pairs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('softPairsTitle', { default: 'Soft Consonant Pairs' })}
              </CardTitle>
              <CardDescription>
                {t('softPairsDesc', { default: 'These letters come in hard/soft pairs. The soft versions are palatalized.' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {alphabet.softLetters.pairs.map((pair, idx) => (
                  <div key={idx} className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl">{pair.hard}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-2xl text-primary">{pair.soft}</span>
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
              <Button asChild className="w-full">
                <Link href={`/${locale}/practice/pronunciation`}>
                  <Mic className="h-4 w-4 mr-2" />
                  {t('pronunciationPractice', { default: 'Pronunciation Practice' })}
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
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
                <Check className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  {t('completedTitle', { default: 'Lesson Complete!' })}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('completedDesc', { default: 'You\'ve viewed all 31 letters. Great job!' })}
                </p>
                <Button asChild>
                  <Link href={`/${locale}/learn/paths/a1`}>
                    {t('continue', { default: 'Continue to Next Lesson' })}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
