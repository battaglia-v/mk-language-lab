'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, RotateCcw, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NextLessonCTAProps {
  /** Whether user has completed any lessons */
  hasStartedLearning: boolean;
  /** Current lesson progress info */
  currentLesson?: {
    unitName: string;
    lessonNumber: number;
    lessonTitle: string;
    progress: number; // 0-100
    /** What the user will learn in this lesson (outcome-focused) */
    learningOutcome?: string;
    /** Number of new vocabulary words in this lesson */
    vocabularyCount?: number;
    /** Main grammar topic (if any) */
    grammarTopic?: string;
  };
  /** Number of cards due for review */
  reviewCardsDue?: number;
  /** Locale for href */
  locale: string;
  /** Translations */
  t: {
    continueLearning: string;
    startLearning: string;
    startFirstLesson: string;
    pickUpWhereLeft: string;
    reviewDue: string;
    lessonProgress: string;
    /** "Today You'll Learn" header */
    todayYouWillLearn?: string;
    /** New words label */
    newWords?: string;
  };
  /** Additional class name */
  className?: string;
}

/**
 * NextLessonCTA - Primary call-to-action card for learning
 * 
 * Shows either "Start Learning" for new users or "Continue Lesson"
 * with progress for returning users. Also shows review reminder.
 * 
 * Enhanced with "Today You'll Learn" daily focus to show specific
 * learning outcomes (not just generic "continue learning").
 */
export function NextLessonCTA({
  hasStartedLearning,
  currentLesson,
  reviewCardsDue = 0,
  locale,
  t,
  className,
}: NextLessonCTAProps) {
  const showReviewBanner = reviewCardsDue > 0;
  const hasTodayFocus = currentLesson?.learningOutcome || currentLesson?.grammarTopic;

  return (
    <Card className={cn(
      "border border-border/60 bg-card shadow-sm",
      "transition-shadow hover:shadow-md",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {hasStartedLearning ? t.continueLearning : t.startLearning}
            </CardTitle>
            <CardDescription className="text-sm">
              {hasStartedLearning ? t.pickUpWhereLeft : t.startFirstLesson}
            </CardDescription>
          </div>
          {currentLesson && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {currentLesson.progress}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* TODAY YOU'LL LEARN - Daily Focus Section */}
        {hasTodayFocus && (
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t.todayYouWillLearn || "Today You'll Learn"}
              </span>
            </div>
            <p className="font-semibold text-foreground">
              {currentLesson?.learningOutcome || currentLesson?.grammarTopic}
            </p>
            {currentLesson?.vocabularyCount && currentLesson.vocabularyCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {currentLesson.vocabularyCount} {t.newWords || 'new words'}
              </p>
            )}
          </div>
        )}

        {/* Current Lesson Info */}
        {currentLesson && (
          <div className="rounded-xl border border-border/40 bg-white/5 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {currentLesson.unitName}
            </p>
            <p className="mt-1 font-semibold text-foreground">
              Lesson {currentLesson.lessonNumber}: {currentLesson.lessonTitle}
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${currentLesson.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <Button
          asChild
          size="sm"
          className="rounded-full px-4"
        >
          <Link href={`/${locale}/practice`}>
            <BookOpen className="h-4 w-4" />
            {hasStartedLearning ? t.continueLearning : t.startLearning}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {/* Review Banner */}
        {showReviewBanner && (
          <Link
            href={`/${locale}/practice?deck=srs`}
            className={cn(
              "flex items-center justify-between rounded-xl p-3",
              "border border-amber-500/30 bg-amber-500/10",
              "transition-all hover:bg-amber-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <RotateCcw className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {t.reviewDue.replace('{count}', String(reviewCardsDue))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep your knowledge fresh
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-400" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
