'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Zap, Play, BookOpen, ChevronRight, Check, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getLocalXP } from '@/lib/gamification/local-xp';
import { getNextNode } from '@/lib/learn/lesson-path-types';
import type { LessonPath as LessonPathData, LessonNode } from '@/lib/learn/lesson-path-types';

type LevelId = 'beginner' | 'intermediate' | 'advanced' | 'challenge';

const LEVEL_STORAGE_KEY = 'mklanguage-level';
const ALPHABET_PROGRESS_KEY = 'mkll:alphabet-progress';
const ALPHABET_TOTAL_LETTERS = 31;

interface LearnPageClientProps {
  locale: string;
  streak: number;
  todayXP: number;
  dailyGoalXP: number;
  a1Path: LessonPathData;
  a2Path: LessonPathData;
  b1Path: LessonPathData;
  challengePath: LessonPathData;
  currentLesson?: { id: string; title: string; moduleTitle: string; lessonNumber: number };
  journeyProgress?: { completedCount: number; totalCount: number };
}

export function LearnPageClient({
  locale,
  streak: initialStreak,
  todayXP: initialTodayXP,
  dailyGoalXP,
  a1Path,
  a2Path,
  b1Path,
  challengePath,
  currentLesson,
  journeyProgress,
}: LearnPageClientProps) {
  const t = useTranslations('mobile.learn');
  const searchParams = useSearchParams();
  const router = useRouter();
  // Use local XP state for real-time updates
  const [localState, setLocalState] = useState({ todayXP: initialTodayXP, streak: initialStreak });
  const [activeLevel, setActiveLevel] = useState<LevelId>('beginner');
  const [alphabetCompleted, setAlphabetCompleted] = useState(false);

  useEffect(() => {
    const state = getLocalXP();
    setLocalState({ todayXP: state.todayXP, streak: state.streak });

    // Check alphabet completion from localStorage
    try {
      const saved = localStorage.getItem(ALPHABET_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= ALPHABET_TOTAL_LETTERS) {
          setAlphabetCompleted(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    const validLevels: LevelId[] = ['beginner', 'intermediate', 'advanced', 'challenge'];
    const levelParam = searchParams.get('level') as LevelId | null;
    if (levelParam && validLevels.includes(levelParam)) {
      setActiveLevel(levelParam);
      try {
        window.localStorage.setItem(LEVEL_STORAGE_KEY, levelParam);
      } catch {
        // Ignore storage errors (private mode, etc.)
      }
      return;
    }

    try {
      const storedLevel = window.localStorage.getItem(LEVEL_STORAGE_KEY) as LevelId | null;
      if (storedLevel && validLevels.includes(storedLevel)) {
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

  // Update A1 path with alphabet completion status from localStorage
  const a1PathWithAlphabet = useMemo((): LessonPathData => {
    // Find alphabet node and update its status
    const updatedNodes = a1Path.nodes.map((node, index) => {
      if (node.id === 'alphabet') {
        return { ...node, status: alphabetCompleted ? 'completed' : 'available' } as LessonNode;
      }
      // If alphabet is not completed, mark all other lessons as locked
      // (keeping their original status if alphabet is completed)
      if (!alphabetCompleted && index > 0) {
        return { ...node, status: 'locked' } as LessonNode;
      }
      return node;
    });

    return {
      ...a1Path,
      nodes: updatedNodes,
      completedCount: a1Path.completedCount + (alphabetCompleted ? 1 : 0),
    };
  }, [a1Path, alphabetCompleted]);

  const pathMap: Record<LevelId, LessonPathData> = {
    beginner: a1PathWithAlphabet,
    intermediate: a2Path,
    advanced: b1Path,
    challenge: challengePath,
  };
  const labelMap: Record<LevelId, string> = {
    beginner: t('basics'),
    intermediate: t('speaking'),
    advanced: t('advanced', { default: 'Advanced' }),
    challenge: t('challenge', { default: '30-Day' }),
  };
  const badgeMap: Record<LevelId, string> = {
    beginner: 'A1',
    intermediate: 'A2',
    advanced: 'B1',
    challenge: '📖',
  };
  const pathIdMap: Record<LevelId, string> = {
    beginner: 'a1',
    intermediate: 'a2',
    advanced: 'b1',
    challenge: '30day-challenge',
  };

  const currentPath = pathMap[activeLevel];
  const levelLabel = labelMap[activeLevel];
  const levelBadge = badgeMap[activeLevel];
  const nextNode = getNextNode(currentPath);
  const startNode = nextNode ?? currentPath.nodes[0];
  const pathProgress = currentPath.totalCount > 0
    ? Math.round((currentPath.completedCount / currentPath.totalCount) * 100)
    : 0;

  // Determine if we should show Continue CTA with journey progress
  const showContinueCTA = currentLesson && journeyProgress && activeLevel !== 'challenge';
  const ctaHref = showContinueCTA
    ? `/${locale}/learn/lessons/${currentLesson.id}`
    : startNode?.href
      ? `/${locale}${startNode.href}`
      : `/${locale}/learn`;
  const ctaTitle = showContinueCTA
    ? t('continueLesson', { lessonTitle: currentLesson.title })
    : startNode?.title ?? currentPath.title;
  const ctaLabel = showContinueCTA
    ? t('continueLearning')
    : t('startLesson');
  const ctaDescription = showContinueCTA
    ? `${currentLesson.moduleTitle} • ${t('lessonOf', { current: currentLesson.lessonNumber, total: journeyProgress.totalCount })}`
    : startNode?.description ?? currentPath.description;

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

          {/* Primary CTA - Start or Continue */}
          <div
            className={cn(
              'rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 shadow-sm',
              'transition-colors duration-200 hover:border-primary/30'
            )}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Play className="h-4 w-4" fill="currentColor" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-sm font-semibold text-foreground line-clamp-1">
                  {ctaTitle}
                </div>
                {ctaDescription && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {ctaDescription}
                  </div>
                )}
              </div>
              <Link
                href={ctaHref}
                data-testid="cta-start-here"
                aria-label={ctaLabel}
                className="shrink-0"
              >
                <Button size="sm" className="rounded-full px-3 gap-1.5">
                  {ctaLabel}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>


          {/* Level Selection */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold">{t('pickSkill')}</h2>
              <p className="text-sm text-muted-foreground">{t('pickSkillHelper')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1.5">
              {/* A1 - Beginner */}
              <Link
                href={`/${locale}/learn?level=beginner`}
                onClick={(event) => {
                  event.preventDefault();
                  handleLevelChange('beginner');
                }}
                role="button"
                data-testid="learn-level-beginner"
                aria-current={activeLevel === 'beginner' ? 'page' : undefined}
                aria-pressed={activeLevel === 'beginner'}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all min-h-[48px]',
                  activeLevel === 'beginner'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-semibold">{t('basics')}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">A1</span>
                </div>
              </Link>
              {/* A2 - Intermediate */}
              <Link
                href={`/${locale}/learn?level=intermediate`}
                onClick={(event) => {
                  event.preventDefault();
                  handleLevelChange('intermediate');
                }}
                role="button"
                data-testid="learn-level-intermediate"
                aria-current={activeLevel === 'intermediate' ? 'page' : undefined}
                aria-pressed={activeLevel === 'intermediate'}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all min-h-[48px]',
                  activeLevel === 'intermediate'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-semibold">{t('speaking')}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">A2</span>
                </div>
              </Link>
              {/* B1 - Advanced */}
              <Link
                href={`/${locale}/learn?level=advanced`}
                onClick={(event) => {
                  event.preventDefault();
                  handleLevelChange('advanced');
                }}
                role="button"
                data-testid="learn-level-advanced"
                aria-current={activeLevel === 'advanced' ? 'page' : undefined}
                aria-pressed={activeLevel === 'advanced'}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all min-h-[48px]',
                  activeLevel === 'advanced'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-semibold">{t('advanced', { default: 'Advanced' })}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">B1</span>
                </div>
              </Link>
              {/* 30-Day Challenge */}
              <Link
                href={`/${locale}/learn?level=challenge`}
                onClick={(event) => {
                  event.preventDefault();
                  handleLevelChange('challenge');
                }}
                role="button"
                data-testid="learn-level-challenge"
                aria-current={activeLevel === 'challenge' ? 'page' : undefined}
                aria-pressed={activeLevel === 'challenge'}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all min-h-[48px]',
                  activeLevel === 'challenge'
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-foreground shadow-sm border border-amber-500/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-semibold">{t('challenge', { default: '30-Day' })}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">📖</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Your Path Section */}
          <section className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold" data-testid="learn-path-title">
                      {currentPath.title}
                    </h2>
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
                  data-testid="cta-browse-paths"
                  className="shrink-0 text-sm font-semibold text-primary hover:underline"
                >
                  {t('browsePaths', { default: 'Browse all paths' })}
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
 * Note: All lessons are clickable - users can skip around freely
 */
function LessonNodeCard({
  node,
  locale,
  lessonNumber,
  startLabel,
}: {
  node: LessonNode;
  locale: string;
  lessonNumber: number;
  startLabel: string;
  lockTooltip?: string; // Kept for backwards compatibility but not used
}) {
  const isCompleted = node.status === 'completed';
  const isNext = node.status === 'available' || node.status === 'in_progress';
  const isNotStarted = node.status === 'locked'; // Renamed for clarity - not actually locked

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
        return 'border-border/50 bg-card/50';
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md',
        isCompleted && 'border-emerald-500/30 bg-emerald-500/5',
        isNext && 'border-primary/50 bg-primary/5 shadow-md shadow-primary/10',
        !isCompleted && !isNext && getTypeStyle()
      )}
    >
      {/* Lesson number / status */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm',
          isCompleted && 'bg-emerald-500 text-white dark:text-black',
          isNext && 'bg-primary text-black',
          isNotStarted && 'bg-muted text-muted-foreground'
        )}
      >
        {isCompleted ? <Check className="h-5 w-5" /> : lessonNumber}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          {node.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {node.description || node.titleMk || ''}
        </p>
      </div>

      {/* XP reward - show for all non-completed lessons */}
      {!isCompleted && (
        <div className="flex items-center gap-1 text-sm">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-amber-500">+{node.xpReward}</span>
        </div>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <Check className="h-5 w-5 text-emerald-500" />
      )}

      {/* Arrow for next/recommended lesson */}
      {isNext && (
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          {startLabel}
          <ChevronRight className="h-4 w-4" />
        </span>
      )}

      {/* Arrow for other lessons - subtle indicator they're clickable */}
      {!isNext && !isCompleted && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );

  // All lessons with href are clickable - no locking!
  if (!node.href) {
    return <div>{content}</div>;
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
