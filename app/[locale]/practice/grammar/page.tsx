'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import grammarLessonsData from '@/data/grammar-lessons.json';
import { type GrammarLesson } from '@/lib/grammar-engine';
import { PageContainer } from '@/components/layout';
import type { LessonResults } from '@/lib/lesson-runner/types';

// Lazy load the lesson wrapper
import dynamic from 'next/dynamic';
const GrammarLessonWrapper = dynamic(
  () => import('@/components/learn/GrammarLessonWrapper').then(mod => ({ default: mod.GrammarLessonWrapper })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    ),
  }
);

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt?: string;
}

export default function GrammarPracticePage() {
  const t = useTranslations('grammar');
  const locale = useLocale() as 'en' | 'mk';
  
  const [activeLesson, setActiveLesson] = useState<GrammarLesson | null>(null);
  const [lessonResults, setLessonResults] = useState<LessonResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Load progress from localStorage
  const [progress, setProgress] = useState<LessonProgress[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('grammar-progress');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Cast the imported data to the correct type
  const lessons = grammarLessonsData as GrammarLesson[];

  const difficultyColors = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  const getLessonProgress = (lessonId: string): LessonProgress | undefined => {
    return progress.find(p => p.lessonId === lessonId);
  };

  // Find the first incomplete lesson (recommended next)
  const getRecommendedLessonIndex = (): number => {
    const firstIncomplete = lessons.findIndex(lesson => {
      const lessonProgress = getLessonProgress(lesson.id);
      return !lessonProgress?.completed;
    });
    return firstIncomplete === -1 ? 0 : firstIncomplete;
  };

  const recommendedIndex = getRecommendedLessonIndex();

  const handleStartLesson = (lesson: GrammarLesson) => {
    setActiveLesson(lesson);
    setLessonResults(null);
    setShowResults(false);
  };

  const handleLessonComplete = useCallback((results: LessonResults) => {
    if (!activeLesson) return;

    // Store results
    setLessonResults(results);

    // Calculate score based on LessonRunner results
    const correctCount = results.answers.filter(a => a.correct).length;
    const totalCount = results.answers.length;
    const score = Math.round((correctCount / totalCount) * 100);

    // Save progress
    const newProgress: LessonProgress = {
      lessonId: activeLesson.id,
      completed: true,
      score,
      completedAt: new Date().toISOString(),
    };

    const updatedProgress = [
      ...progress.filter(p => p.lessonId !== activeLesson.id),
      newProgress,
    ];

    setProgress(updatedProgress);

    try {
      localStorage.setItem('grammar-progress', JSON.stringify(updatedProgress));
    } catch {
      // Ignore storage errors
    }

    setShowResults(true);
  }, [activeLesson, progress]);

  const handleBackToLessons = () => {
    setActiveLesson(null);
    setShowResults(false);
  };

  // Calculate overall progress
  const completedLessons = progress.filter(p => p.completed).length;
  const overallProgress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  // Results view
  if (showResults && activeLesson && lessonResults) {
    const correctCount = lessonResults.answers.filter(a => a.correct).length;
    const totalCount = lessonResults.answers.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const xpEarned = lessonResults.xpEarned;

    return (
      <PageContainer size="md" className="flex flex-col items-center gap-6 pb-24 sm:pb-8">
        <Card className="w-full border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <Trophy className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">{t('lessonComplete.title')}</CardTitle>
            <CardDescription>
              {locale === 'mk' ? activeLesson.titleMk : activeLesson.titleEn}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-accent">{score}%</p>
                <p className="text-xs text-muted-foreground">{t('lessonComplete.accuracy')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">{correctCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground">{t('correct')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">+{xpEarned}</p>
                <p className="text-xs text-muted-foreground">{t('lessonComplete.xpEarned')}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleBackToLessons} className="w-full" data-testid="grammar-results-back-to-lessons">
                {t('lessonComplete.continueLearning')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStartLesson(activeLesson)}
                className="w-full"
                data-testid="grammar-results-retry"
              >
                {t('lessonComplete.retryLesson')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Active lesson view
  if (activeLesson && !showResults) {
    return (
      <GrammarLessonWrapper
        lesson={activeLesson}
        onComplete={handleLessonComplete}
        onExit={handleBackToLessons}
        locale={locale}
      />
    );
  }

  // Lesson selection view
  return (
    <PageContainer size="lg" className="flex flex-col gap-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2" data-testid="grammar-back-to-practice">
          <Link href={`/${locale}/practice`}>
            <ArrowLeft className="h-4 w-4" />
            {t('backToPractice')}
          </Link>
        </Button>
      </div>

      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{t('overallProgress')}</span>
              <span className="text-muted-foreground">
                {completedLessons} / {lessons.length} {t('lessons')}
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          <BookOpen className="h-8 w-8 text-accent" />
        </CardContent>
      </Card>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('selectLesson')}</h2>
        
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const lessonProgress = getLessonProgress(lesson.id);
            const isCompleted = lessonProgress?.completed ?? false;
            const isRecommended = index === recommendedIndex;

            return (
              // eslint-disable-next-line react/forbid-elements -- Clickable card wrapper pattern
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleStartLesson(lesson)}
                className="w-full text-left"
                data-testid={`grammar-lesson-${lesson.id}`}
              >
                <Card
                  className={cn(
                    'transition-all border-white/8 bg-white/5 hover:border-accent/30 hover:bg-white/8',
                    isRecommended && !isCompleted && 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    {/* Lesson Number / Status */}
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isRecommended
                          ? 'bg-primary/20 text-primary'
                          : 'bg-accent/20 text-accent'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isRecommended ? (
                        <Sparkles className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">
                          {locale === 'mk' ? lesson.titleMk : lesson.titleEn}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn('shrink-0 text-xs', difficultyColors[lesson.difficulty])}
                        >
                          {lesson.difficulty}
                        </Badge>
                        {isRecommended && !isCompleted && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs bg-primary/10 text-primary border-primary/30"
                          >
                            {t('recommended', { default: 'Recommended' })}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {locale === 'mk' ? lesson.descriptionMk : lesson.descriptionEn}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{lesson.exercises.length} {t('exercises')}</span>
                        <span>~{Math.ceil(lesson.exercises.length * 2)} {t('minutes')}</span>
                        {lessonProgress?.score !== undefined && (
                          <span className="text-emerald-400">{lessonProgress.score}%</span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
