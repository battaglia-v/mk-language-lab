'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Zap, Play, BookOpen, ChevronRight, Lock, Check, GraduationCap, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getLocalXP } from '@/lib/gamification/local-xp';
import { getNextNode } from '@/lib/learn/lesson-path-types';
import type { LessonPath as LessonPathData, LessonNode } from '@/lib/learn/lesson-path-types';

type LevelId = 'beginner' | 'intermediate';

const LEVEL_STORAGE_KEY = 'mklanguage-level';

interface LearnPageClientProps {
  locale: string;
  streak: number;
  todayXP: number;
  dailyGoalXP: number;
  starterPath: LessonPathData;
  a2Path: LessonPathData;
}

export function LearnPageClient({
  locale,
  streak: initialStreak,
  todayXP: initialTodayXP,
  dailyGoalXP,
  starterPath,
  a2Path,
}: LearnPageClientProps) {
  const t = useTranslations('mobile.learn');
  const searchParams = useSearchParams();
  const router = useRouter();
  // Use local XP state for real-time updates
  const [localState, setLocalState] = useState({ todayXP: initialTodayXP, streak: initialStreak });
  const [activeLevel, setActiveLevel] = useState<LevelId>('beginner');

  useEffect(() => {
    const state = getLocalXP();
    setLocalState({ todayXP: state.todayXP, streak: state.streak });
  }, []);

  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam === 'beginner' || levelParam === 'intermediate') {
      setActiveLevel(levelParam);
      try {
        window.localStorage.setItem(LEVEL_STORAGE_KEY, levelParam);
      } catch {
        // Ignore storage errors (private mode, etc.)
      }
      return;
    }

    try {
      const storedLevel = window.localStorage.getItem(LEVEL_STORAGE_KEY);
      if (storedLevel === 'beginner' || storedLevel === 'intermediate') {
        setActiveLevel(storedLevel);
      }
    } catch {
      // Ignore storage errors
    }
  }, [searchParams]);

  const handleLevelChange = (level: LevelId) => {
    setActiveLevel(level);
    try {
      window.localStorage.setItem(LEVEL_STORAGE_KEY, level);
    } catch {
      // Ignore storage errors
    }
    router.replace(`/${locale}/learn?level=${level}`, { scroll: false });
  };

  const todayXP = Math.max(localState.todayXP, initialTodayXP);
  const streak = Math.max(localState.streak, initialStreak);
  const goalProgress = dailyGoalXP > 0 ? Math.min(100, Math.round((todayXP / dailyGoalXP) * 100)) : 0;
  const isGoalComplete = todayXP >= dailyGoalXP;

  const currentPath = activeLevel === 'beginner' ? starterPath : a2Path;
  const levelLabel = activeLevel === 'beginner' ? t('basics') : t('speaking');
  const levelBadge = activeLevel === 'beginner' ? 'A1' : 'A2';
  const nextNode = getNextNode(currentPath);
  const startNode = nextNode ?? currentPath.nodes[0];
  const startHref = startNode?.href
    ? `/${locale}${startNode.href}`
    : `/${locale}/learn/paths/${activeLevel === 'beginner' ? 'a1' : 'a2'}`;
  const startTitle = startNode?.title ?? currentPath.title;
  const startDescription = startNode?.description ?? currentPath.description;
  const pathProgress = currentPath.totalCount > 0
    ? Math.round((currentPath.completedCount / currentPath.totalCount) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Main Content - Full width, no extra padding (AppShell handles it) */}
      <div className="flex-1 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-base text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Daily Goal Progress */}
          <div className="flex flex-col items-center gap-3 py-4">
            {/* Label */}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('todaysGoal')}
            </span>
            <DailyGoalRing
              progress={goalProgress}
              todayXP={todayXP}
              goalXP={dailyGoalXP}
              complete={isGoalComplete}
              goalMetLabel={t('goalMet')}
            />
            {/* Streak chip with emoji - only show if streak > 0 or for context */}
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              streak > 0 ? 'bg-orange-500/15' : 'bg-muted/30'
            )}>
              <span className="text-base">{streak > 0 ? '🔥' : '📅'}</span>
              <span className={cn('text-sm font-bold', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')}>
                {streak === 0 ? t('startStreak') : streak === 1 ? t('dayCount') : t('daysCount', { count: streak })}
              </span>
            </div>
            {/* Dynamic hint */}
            <p className="text-sm text-muted-foreground text-center">
              {isGoalComplete
                ? t('hintGoalComplete')
                : t('hintBelowGoal')}
            </p>
          </div>

          {/* Primary CTA - Start Here */}
          <Link
            href={startHref}
            data-testid="learn-start-todays-lesson"
            className={cn(
              'group flex flex-col items-center gap-1 rounded-2xl p-5',
              'bg-gradient-to-r from-primary to-amber-500',
              'text-black shadow-lg shadow-primary/25',
              'transition-all duration-200 hover:shadow-xl hover:scale-[1.01]',
              'active:scale-[0.99]'
            )}
          >
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" fill="currentColor" />
              <span className="text-sm font-medium uppercase tracking-wide opacity-80">{t('startLesson')}</span>
            </div>
            <span className="text-xl font-bold text-center">{startTitle}</span>
            {startDescription && (
              <span className="text-xs font-medium text-black/70 text-center line-clamp-2">
                {startDescription}
              </span>
            )}
          </Link>

          {/* Secondary CTA */}
          <Link
            href={`/${locale}/practice`}
            data-testid="learn-quick-practice"
            className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card hover:border-primary/30 active:scale-[0.99]"
          >
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">{t('quickPractice')}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* Tertiary link */}
          <div className="text-center">
            <Link
              href={`/${locale}/translate`}
              data-testid="learn-translate-link"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t('translateSomething')} →
            </Link>
          </div>

          {/* Level Selection */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold">{t('pickSkill')}</h2>
              <p className="text-sm text-muted-foreground">{t('pickSkillHelper')}</p>
            </div>
            <div className="flex gap-2 rounded-xl bg-muted/50 p-1.5">
              <button
                type="button"
                onClick={() => handleLevelChange('beginner')}
                data-testid="learn-level-beginner"
                aria-current={activeLevel === 'beginner' ? 'page' : undefined}
                aria-pressed={activeLevel === 'beginner'}
                className={cn(
                  'flex-1 flex items-center gap-2 rounded-lg px-3 py-3 text-left transition-all min-h-[44px]',
                  activeLevel === 'beginner'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{t('basics')}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">A1</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange('intermediate')}
                data-testid="learn-level-intermediate"
                aria-current={activeLevel === 'intermediate' ? 'page' : undefined}
                aria-pressed={activeLevel === 'intermediate'}
                className={cn(
                  'flex-1 flex items-center gap-2 rounded-lg px-3 py-3 text-left transition-all min-h-[44px]',
                  activeLevel === 'intermediate'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{t('speaking')}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">A2</span>
                </div>
              </button>
            </div>
          </div>

          {/* Your Path Section */}
          <section className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{currentPath.title}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      <span className="text-[10px] font-bold text-foreground">{levelBadge}</span>
                      {levelLabel}
                    </span>
                  </div>
                  {currentPath.description && (
                    <p className="text-sm text-muted-foreground">{currentPath.description}</p>
                  )}
                </div>
                <Link
                  href={`/${locale}/learn/paths`}
                  data-testid="learn-browse-paths"
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  {t('learningPaths')} →
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {currentPath.completedCount}/{currentPath.totalCount} {t('complete')}
                </span>
                <span>{pathProgress}%</span>
              </div>
            </div>

            {/* Lesson Cards */}
            <div className="space-y-2">
              {currentPath.nodes.map((node, index) => (
                <LessonNodeCard
                  key={node.id}
                  node={node}
                  locale={locale}
                  lessonNumber={index + 1}
                  startLabel={t('start')}
                  lockTooltip={t('lockTooltip')}
                />
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3 pt-2">
              <Progress value={pathProgress} className="h-2 flex-1" />
              <span className="text-sm text-muted-foreground">{pathProgress}%</span>
            </div>
          </section>
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
  goalMetLabel,
}: {
  progress: number;
  todayXP: number;
  goalXP: number;
  complete: boolean;
  goalMetLabel: string;
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
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
        {complete ? (
          <>
            <Check className="h-7 w-7 text-emerald-500" strokeWidth={3} />
            <span className="text-[10px] font-semibold text-emerald-500 mt-0.5 text-center leading-tight max-w-[80px]">{goalMetLabel}</span>
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
  startLabel,
  lockTooltip,
}: {
  node: LessonNode;
  locale: string;
  lessonNumber: number;
  startLabel: string;
  lockTooltip: string;
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
          isNext && 'bg-primary text-black',
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

      {/* Arrow for next lesson - or "Start" text for clarity */}
      {isNext && (
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          {startLabel}
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );

  if (isLocked || !node.href) {
    return (
      <div className="cursor-not-allowed" title={lockTooltip}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/${locale}${node.href}`}
      data-testid={`learn-node-${node.id}`}
      className="block transition-transform active:scale-[0.99]"
      scroll={true}
    >
      {content}
    </Link>
  );
}
