'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, CheckCircle2, Lock, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import grammarLessonsData from '@/data/grammar-lessons.json';
import { type GrammarLesson } from '@/lib/grammar-engine';

// Lazy load the exercise component
import dynamic from 'next/dynamic';
const GrammarExerciseCard = dynamic(
  () => import('@/components/learn/GrammarExerciseCard').then(mod => mod.GrammarExerciseCard),
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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<Record<string, { correct: boolean; xpEarned: number }>>({});
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

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    // Lesson unlocked if previous lesson is completed
    const previousLesson = lessons[index - 1];
    const previousProgress = getLessonProgress(previousLesson.id);
    return previousProgress?.completed ?? false;
  };

  const handleStartLesson = (lesson: GrammarLesson) => {
    setActiveLesson(lesson);
    setCurrentExerciseIndex(0);
    setExerciseResults({});
    setShowResults(false);
  };

  const handleExerciseComplete = useCallback((result: {
    exerciseId: string;
    correct: boolean;
    attempts: number;
    xpEarned: number;
    skipped: boolean;
  }) => {
    setExerciseResults(prev => ({
      ...prev,
      [result.exerciseId]: { correct: result.correct, xpEarned: result.xpEarned },
    }));
    
    // Advance to next exercise or show results
    if (!activeLesson) return;
    
    if (currentExerciseIndex < activeLesson.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Lesson complete - calculate and save score
      // Need to include this result in the count
      const allResults = {
        ...exerciseResults,
        [result.exerciseId]: { correct: result.correct, xpEarned: result.xpEarned },
      };
      const correctCount = Object.values(allResults).filter(r => r.correct).length;
      const totalCount = activeLesson.exercises.length;
      const score = Math.round((correctCount / totalCount) * 100);
      
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
    }
  }, [activeLesson, currentExerciseIndex, exerciseResults, progress]);

  const handleBackToLessons = () => {
    setActiveLesson(null);
    setShowResults(false);
  };

  const handleSkip = useCallback(() => {
    if (!activeLesson) return;
    if (currentExerciseIndex < activeLesson.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  }, [activeLesson, currentExerciseIndex]);

  const currentExercise = activeLesson?.exercises[currentExerciseIndex];

  // Calculate overall progress
  const completedLessons = progress.filter(p => p.completed).length;
  const overallProgress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  // Exercise translations - must be before any conditional returns
  const exerciseTranslations = useMemo(() => ({
    checkAnswer: t('checkAnswer'),
    tryAgain: t('tryAgain'),
    skip: t('exit'),
    next: t('nextExercise'),
    correct: t('correct'),
    incorrect: t('incorrect'),
    showHint: t('showAnswer'),
    tapToSelect: 'Tap to select',
    arrangeWords: 'Arrange the words',
    findError: 'Find the error',
    fillBlank: t('exerciseTypes.fillBlank'),
  }), [t]);

  // Results view
  if (showResults && activeLesson) {
    const correctCount = Object.values(exerciseResults).filter(r => r.correct).length;
    const totalCount = activeLesson.exercises.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const xpEarned = Object.values(exerciseResults).reduce((sum, r) => sum + r.xpEarned, 0);

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 pb-24 sm:pb-8">
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
              <Button onClick={handleBackToLessons} className="w-full">
                {t('lessonComplete.continueLearning')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStartLesson(activeLesson)}
                className="w-full"
              >
                {t('lessonComplete.retryLesson')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active lesson view
  if (activeLesson && currentExercise) {
    const progressPercent = ((currentExerciseIndex + 1) / activeLesson.exercises.length) * 100;

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-24 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLessons}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('exit')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('exerciseProgress', { current: currentExerciseIndex + 1, total: activeLesson.exercises.length })}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="h-2" />

        {/* Exercise Card */}
        <GrammarExerciseCard
          exercise={currentExercise}
          locale={locale}
          onComplete={handleExerciseComplete}
          onSkip={handleSkip}
          t={exerciseTranslations}
        />
      </div>
    );
  }

  // Lesson selection view
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/practice`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backToPractice')}
          </Button>
        </Link>
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
            const isUnlocked = isLessonUnlocked(index);
            const isCompleted = lessonProgress?.completed ?? false;

            return (
              <Card
                key={lesson.id}
                className={cn(
                  'transition-all',
                  isUnlocked
                    ? 'cursor-pointer border-white/8 bg-white/5 hover:border-accent/30 hover:bg-white/8'
                    : 'cursor-not-allowed border-white/5 bg-white/2 opacity-60'
                )}
                onClick={() => isUnlocked && handleStartLesson(lesson)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Lesson Number / Status */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isUnlocked
                        ? 'bg-accent/20 text-accent'
                        : 'bg-white/10 text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isUnlocked ? (
                      index + 1
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">
                        {locale === 'mk' ? lesson.titleMk : lesson.titleEn}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn('shrink-0 text-xs', difficultyColors[lesson.difficulty])}
                      >
                        {lesson.difficulty}
                      </Badge>
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
                  {isUnlocked && (
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
