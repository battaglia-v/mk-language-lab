'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, BookOpenCheck, MessageCircle, Volume2, RefreshCcw } from 'lucide-react';
import practicePrompts from '@/data/practice-vocabulary.json';

type PracticeItem = {
  macedonian: string;
  english: string;
  category?: string;
};

const PRACTICE_ITEMS = practicePrompts as PracticeItem[];

export default function LearnPage() {
  const t = useTranslations('learn');
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(() =>
    PRACTICE_ITEMS.length > 0 ? Math.floor(Math.random() * PRACTICE_ITEMS.length) : 0
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState('');

  const modules = useMemo(
    () => [
      {
        title: t('vocabulary'),
        description: t('vocabularyDesc'),
        icon: BookOpen,
        gradient: 'from-pink-500 to-rose-500',
        href: '/learn/vocabulary',
      },
      {
        title: t('grammar'),
        description: t('grammarDesc'),
        icon: BookOpenCheck,
        gradient: 'from-purple-500 to-indigo-500',
        href: '/learn/grammar',
      },
      {
        title: t('phrases'),
        description: t('phrasesDesc'),
        icon: MessageCircle,
        gradient: 'from-cyan-500 to-blue-500',
        href: '/learn/phrases',
      },
      {
        title: t('pronunciation'),
        description: t('pronunciationDesc'),
        icon: Volume2,
        gradient: 'from-orange-500 to-amber-500',
        href: '/learn/pronunciation',
      },
    ],
    [t]
  );

  const currentItem = PRACTICE_ITEMS[currentIndex];

  const formatCategory = (category?: string) => {
    if (!category) return '';
    return category
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCheck = () => {
    if (!currentItem || !answer.trim()) return;

    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedExpected = currentItem.english.toLowerCase();

    if (normalizedAnswer === normalizedExpected) {
      setFeedback('correct');
      setRevealedAnswer('');
    } else {
      setFeedback('incorrect');
      setRevealedAnswer(currentItem.english);
    }
  };

  const handleNext = () => {
    if (PRACTICE_ITEMS.length === 0) {
      return;
    }

    if (PRACTICE_ITEMS.length === 1) {
      setCurrentIndex(0);
      setAnswer('');
      setFeedback(null);
      setRevealedAnswer('');
      return;
    }

    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * PRACTICE_ITEMS.length);
    }

    setCurrentIndex(nextIndex);
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
  };

  const handleReset = () => {
    setAnswer('');
    setFeedback(null);
    setRevealedAnswer('');
  };

  const isPracticeReady = Boolean(currentItem);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{t('subtitle')}</p>
          <p className="text-muted-foreground">{t('modulesIntro')}</p>
        </div>

        {/* Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={`/${locale}${module.href}`} className="group block">
                <Card className="h-full transition-all duration-300 border-border/50 bg-card/50 backdrop-blur group-hover:border-primary/50 group-hover:scale-[1.02]">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{module.title}</CardTitle>
                    <CardDescription className="text-base pt-2">{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Practice Widget */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">{t('quickPractice')}</CardTitle>
              <CardDescription className="text-base">{t('quickPracticeDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">{t('practicePromptLabel')}</p>
                  <p className="text-2xl font-semibold">{currentItem?.macedonian}</p>
                </div>
                <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                  {currentItem?.category
                    ? `${t('practiceCategoryLabel')}: ${formatCategory(currentItem.category)}`
                    : t('practiceHint')}
                </Badge>
              </div>

              <div className="space-y-3">
                <Input
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={t('practicePlaceholder')}
                  className="text-lg h-12"
                  aria-label={t('practicePlaceholder')}
                  disabled={!isPracticeReady}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleCheck} disabled={!isPracticeReady || !answer.trim()}>
                    {t('checkAnswer')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNext}
                    className="gap-2"
                    disabled={PRACTICE_ITEMS.length === 0}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {t('nextPrompt')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReset} disabled={!isPracticeReady}>
                    {t('practiceReset')}
                  </Button>
                </div>
              </div>

              {feedback && isPracticeReady && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    feedback === 'correct'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {feedback === 'correct'
                    ? t('correctAnswer')
                    : t('incorrectAnswer', { answer: revealedAnswer })}
                </div>
              )}

              {!isPracticeReady && (
                <p className="text-sm text-muted-foreground">
                  {t('practiceHint')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
