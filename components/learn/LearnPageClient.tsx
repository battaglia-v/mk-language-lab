'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Flame, Zap, Target, Play, BookOpen, RotateCcw, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LessonPath } from './LessonPath';
import { cn } from '@/lib/utils';
import type { LessonPath as LessonPathData } from '@/lib/learn/lesson-path-types';

interface LearnPageClientProps {
  locale: string;
  streak: number;
  todayXP: number;
  dailyGoalXP: number;
  totalLessons: number;
  continueHref: string;
  nextLessonTitle: string;
  nextLessonSubtitle: string;
  lessonPath: LessonPathData;
}

export function LearnPageClient({
  locale,
  streak,
  todayXP,
  dailyGoalXP,
  totalLessons,
  continueHref,
  nextLessonTitle,
  nextLessonSubtitle,
  lessonPath,
}: LearnPageClientProps) {
  const t = useTranslations('learn');
  const [showPath, setShowPath] = useState(false);

  const goalProgress = dailyGoalXP > 0 ? Math.min(100, Math.round((todayXP / dailyGoalXP) * 100)) : 0;
  const isGoalComplete = todayXP >= dailyGoalXP;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24 sm:pb-6">
      {/* Sticky Game Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Streak */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              streak > 0 ? 'bg-orange-500/15' : 'bg-muted/30'
            )}
          >
            <Flame className={cn('h-4 w-4', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
            <span className={cn('text-sm font-bold tabular-nums', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')}>
              {streak}
            </span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tabular-nums text-primary">{todayXP}</span>
          </div>

          {/* Goal Ring */}
          <div className="flex items-center gap-2">
            <GoalRing progress={goalProgress} complete={isGoalComplete} />
            <span className={cn(
              'text-xs font-medium tabular-nums',
              isGoalComplete ? 'text-emerald-500' : 'text-muted-foreground'
            )}>
              {todayXP}/{dailyGoalXP}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Title - Short and motivating */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              {isGoalComplete ? "Goal complete! 🎉" : "Ready to learn?"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isGoalComplete
                ? "Keep your streak alive"
                : `${dailyGoalXP - todayXP} XP to reach your goal`}
            </p>
          </div>

          {/* Dominant Continue CTA - Compact horizontal layout */}
          <Link
            href={continueHref}
            className={cn(
              'group flex items-center gap-4 rounded-2xl p-4',
              'bg-gradient-to-r from-primary to-amber-500',
              'text-primary-foreground shadow-lg shadow-primary/20',
              'transition-all duration-200 hover:shadow-xl hover:shadow-primary/25',
              'active:scale-[0.99]'
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold truncate">{nextLessonTitle}</p>
              <p className="text-sm opacity-80 truncate">{nextLessonSubtitle}</p>
            </div>
            <span className="shrink-0 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold">
              {t('continue', { default: 'Continue' })}
            </span>
          </Link>

          {/* Secondary Actions - Smaller */}
          <div className="grid grid-cols-3 gap-2">
            <Link
              href={`/${locale}/practice`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-3 transition-colors hover:bg-card hover:border-primary/30"
            >
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Practice</span>
            </Link>
            <Link
              href={`/${locale}/practice/session?deck=mistakes`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-3 transition-colors hover:bg-card hover:border-primary/30"
            >
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Review</span>
            </Link>
            <button
              onClick={() => setShowPath(!showPath)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-3 transition-colors hover:bg-card hover:border-primary/30"
            >
              <Compass className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Explore</span>
            </button>
          </div>

          {/* Daily Goal Progress Bar */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Goal</span>
              <span className={cn(
                'text-sm font-bold tabular-nums',
                isGoalComplete ? 'text-emerald-500' : 'text-muted-foreground'
              )}>
                {goalProgress}%
              </span>
            </div>
            <Progress
              value={goalProgress}
              className={cn('h-3', isGoalComplete && '[&>div]:bg-emerald-500')}
            />
            {isGoalComplete && (
              <p className="text-xs text-emerald-500 mt-2 text-center font-medium">
                ✓ Come back tomorrow for a new goal
              </p>
            )}
          </div>

          {/* Expandable Lesson Path */}
          <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <button
              onClick={() => setShowPath(!showPath)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{totalLessons} lessons completed</p>
                  <p className="text-xs text-muted-foreground">View learning path</p>
                </div>
              </div>
              {showPath ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {showPath && (
              <div className="border-t border-border/50 p-4">
                <LessonPath path={lessonPath} locale={locale} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Circular progress ring for goal visualization
 */
function GoalRing({
  progress,
  complete,
  size = 24,
}: {
  progress: number;
  complete: boolean;
  size?: number;
}) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500',
            complete ? 'text-emerald-500' : 'text-primary'
          )}
        />
      </svg>
      {complete && (
        <Target className="absolute inset-0 m-auto h-3 w-3 text-emerald-500" strokeWidth={3} />
      )}
    </div>
  );
}
