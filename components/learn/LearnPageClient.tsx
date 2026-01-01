'use client';

import Link from 'next/link';
import { Flame, Zap, Play, BookOpen, ChevronRight, Lock, Check, GraduationCap, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getLocalXP } from '@/lib/gamification/local-xp';
import type { LessonPath as LessonPathData, LessonNode } from '@/lib/learn/lesson-path-types';

type TrackId = 'basics' | 'advanced';

interface LearnPageClientProps {
  locale: string;
  streak: number;
  todayXP: number;
  dailyGoalXP: number;
  totalLessons: number;
  continueHref: string;
  nextLessonTitle: string;
  nextLessonSubtitle: string;
  starterPath: LessonPathData;
  advancedPath: LessonPathData;
}

export function LearnPageClient({
  locale,
  streak: initialStreak,
  todayXP: initialTodayXP,
  dailyGoalXP,
  continueHref,
  starterPath,
  advancedPath,
}: LearnPageClientProps) {
  // Use local XP state for real-time updates
  const [localState, setLocalState] = useState({ todayXP: initialTodayXP, streak: initialStreak });
  const [activeTrack, setActiveTrack] = useState<TrackId>('basics');

  useEffect(() => {
    const state = getLocalXP();
    setLocalState({ todayXP: state.todayXP, streak: state.streak });
  }, []);

  const todayXP = Math.max(localState.todayXP, initialTodayXP);
  const streak = Math.max(localState.streak, initialStreak);
  const goalProgress = dailyGoalXP > 0 ? Math.min(100, Math.round((todayXP / dailyGoalXP) * 100)) : 0;
  const isGoalComplete = todayXP >= dailyGoalXP;

  // Get current path based on selected track
  const currentPath = activeTrack === 'basics' ? starterPath : advancedPath;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24 sm:pb-6">
      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Learn Macedonian
            </h1>
            <p className="text-base text-muted-foreground">
              Just 5 minutes — you&apos;ve got this.
            </p>
          </div>

          {/* Daily Goal Ring - Large and centered */}
          <div className="flex flex-col items-center gap-3 py-4">
            <DailyGoalRing
              progress={goalProgress}
              todayXP={todayXP}
              goalXP={dailyGoalXP}
              complete={isGoalComplete}
            />
            <div className="flex items-center gap-4">
              {/* Streak */}
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                streak > 0 ? 'bg-orange-500/15' : 'bg-muted/30'
              )}>
                <Flame className={cn('h-5 w-5', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-bold', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')}>
                  {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </div>
              {/* XP */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-primary">{todayXP} XP</span>
              </div>
            </div>
          </div>

          {/* Primary CTA - Start Today's Lesson */}
          <Link
            href={continueHref}
            className={cn(
              'group flex items-center justify-center gap-3 rounded-2xl p-5',
              'bg-gradient-to-r from-primary to-amber-500',
              'text-primary-foreground shadow-lg shadow-primary/25',
              'transition-all duration-200 hover:shadow-xl hover:scale-[1.01]',
              'active:scale-[0.99]'
            )}
          >
            <Play className="h-6 w-6" fill="currentColor" />
            <span className="text-xl font-bold">Start today&apos;s lesson</span>
          </Link>

          {/* Secondary CTA */}
          <Link
            href={`/${locale}/practice`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card hover:border-primary/30 active:scale-[0.99]"
          >
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Quick practice</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* Track Switcher */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => setActiveTrack('basics')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all',
                activeTrack === 'basics'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Basics</span>
            </button>
            <button
              onClick={() => setActiveTrack('advanced')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all',
                activeTrack === 'advanced'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Conversations</span>
            </button>
          </div>

          {/* Your Path Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{currentPath.title}</h2>
              <span className="text-sm text-muted-foreground">
                {currentPath.completedCount}/{currentPath.totalCount} complete
              </span>
            </div>

            {/* Lesson Cards */}
            <div className="space-y-2">
              {currentPath.nodes.map((node, index) => (
                <LessonNodeCard
                  key={node.id}
                  node={node}
                  locale={locale}
                  lessonNumber={index + 1}
                />
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3 pt-2">
              <Progress
                value={(currentPath.completedCount / currentPath.totalCount) * 100}
                className="h-2 flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {Math.round((currentPath.completedCount / currentPath.totalCount) * 100)}%
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * Large circular goal ring with XP display
 */
function DailyGoalRing({
  progress,
  todayXP,
  goalXP,
  complete,
}: {
  progress: number;
  todayXP: number;
  goalXP: number;
  complete: boolean;
}) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
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
            'transition-all duration-700',
            complete ? 'text-emerald-500' : 'text-primary'
          )}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {complete ? (
          <>
            <Check className="h-8 w-8 text-emerald-500" strokeWidth={3} />
            <span className="text-xs font-medium text-emerald-500 mt-1">Goal met!</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold tabular-nums">{todayXP}</span>
            <span className="text-xs text-muted-foreground">/ {goalXP} XP</span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Individual lesson node card in the path
 */
function LessonNodeCard({
  node,
  locale,
  lessonNumber,
}: {
  node: LessonNode;
  locale: string;
  lessonNumber: number;
}) {
  const isCompleted = node.status === 'completed';
  const isNext = node.status === 'available' || node.status === 'in_progress';
  const isLocked = node.status === 'locked';

  // Type-based styling
  const getTypeStyle = () => {
    switch (node.type) {
      case 'checkpoint':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'story':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'review':
        return 'border-amber-500/30 bg-amber-500/5';
      default:
        return '';
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border p-4 transition-all',
        isCompleted && 'border-emerald-500/30 bg-emerald-500/5',
        isNext && 'border-primary/50 bg-primary/5 shadow-md shadow-primary/10',
        isLocked && 'border-border/30 bg-muted/10 opacity-60',
        !isCompleted && !isNext && !isLocked && getTypeStyle()
      )}
    >
      {/* Lesson number / status */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm',
          isCompleted && 'bg-emerald-500 text-white',
          isNext && 'bg-primary text-primary-foreground',
          isLocked && 'bg-muted text-muted-foreground'
        )}
      >
        {isCompleted ? <Check className="h-5 w-5" /> : isLocked ? <Lock className="h-4 w-4" /> : lessonNumber}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold', isLocked && 'text-muted-foreground')}>
          {node.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {node.description || node.titleMk || ''}
        </p>
      </div>

      {/* XP reward */}
      {!isCompleted && !isLocked && (
        <div className="flex items-center gap-1 text-sm">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-500">+{node.xpReward}</span>
        </div>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <Check className="h-5 w-5 text-emerald-500" />
      )}

      {/* Arrow for next lesson */}
      {isNext && (
        <ChevronRight className="h-5 w-5 text-primary" />
      )}
    </div>
  );

  if (isLocked || !node.href) {
    return content;
  }

  return (
    <Link href={`/${locale}${node.href}`}>
      {content}
    </Link>
  );
}
