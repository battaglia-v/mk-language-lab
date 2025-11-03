'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Clock, Flame, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { JourneyId } from '@/data/journeys';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { useJourneyProgress } from '@/hooks/use-journey-progress';
import { Button } from '@/components/ui/button';
import { ActiveJourneyStat } from '@/components/journey/ActiveJourneyStat';
import { JourneyStepsStat } from '@/components/journey/JourneyStepsStat';
import { JourneyLastSessionStat } from '@/components/journey/JourneyLastSessionStat';

export type JourneyGoalMeta = Record<JourneyId, { accent: string; minutes: number }>;

type StatKey = 'activeGoal' | 'steps' | 'lastSession';

type StatDescriptor = {
  key: StatKey;
  label: string;
  fallback?: string;
};

type HeroProgressSummaryProps = {
  stats: StatDescriptor[];
  practiceHref: string;
  journeyMeta: JourneyGoalMeta;
  fallbackMinutes?: number;
  estimatedMinutesPerSession?: number;
};

const DEFAULT_FALLBACK_MINUTES = 45;
const DEFAULT_SESSION_MINUTES = 15;

export function HeroProgressSummary({
  stats,
  practiceHref,
  journeyMeta,
  fallbackMinutes = DEFAULT_FALLBACK_MINUTES,
  estimatedMinutesPerSession = DEFAULT_SESSION_MINUTES,
}: HeroProgressSummaryProps) {
  const t = useTranslations('journey');
  const { activeJourney } = useActiveJourney();
  const { isHydrated, sessionsToday, minutesToday, minutesThisWeek, totalMinutes, streakCount } = useJourneyProgress(activeJourney);

  const recommendedMinutes = useMemo(() => {
    if (!activeJourney) {
      return fallbackMinutes;
    }

    return journeyMeta[activeJourney]?.minutes ?? fallbackMinutes;
  }, [activeJourney, fallbackMinutes, journeyMeta]);

  const resolvedMinutesToday = isHydrated
    ? minutesToday
    : sessionsToday * estimatedMinutesPerSession;
  const resolvedMinutesThisWeek = isHydrated ? minutesThisWeek : 0;
  const resolvedTotalMinutes = isHydrated ? totalMinutes : 0;

  const progressPercent = recommendedMinutes > 0
    ? Math.min(100, Math.round((resolvedMinutesToday / recommendedMinutes) * 100))
    : 0;
  const displayPercent = Number.isFinite(progressPercent) ? progressPercent : 0;
  const displayStreak = isHydrated ? streakCount : 0;
  const displayMinutesToday = Math.max(0, Math.round(resolvedMinutesToday));
  const displayMinutesThisWeek = Math.max(0, Math.round(resolvedMinutesThisWeek));
  const displayTotalMinutes = Math.max(0, Math.round(resolvedTotalMinutes));

  const renderStatContent = (key: StatKey, fallback?: string) => {
    switch (key) {
      case 'activeGoal':
        return <ActiveJourneyStat />;
      case 'steps':
        return <JourneyStepsStat />;
      case 'lastSession':
        return <JourneyLastSessionStat />;
      default:
        return fallback ?? null;
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <span>{t('progress.streakLabel', { count: displayStreak })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-secondary" />
          <span>{t('progress.goalLabel', { minutes: recommendedMinutes })}</span>
        </div>
      </div>
      <Button size="lg" className="w-full gap-2 sm:w-auto" asChild>
        <Link href={practiceHref}>
          <PlayCircle className="h-5 w-5" />
          {t('progress.cta')}
        </Link>
      </Button>
      <div>
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>{t('progress.sessionLabel')}</span>
          <span>{displayPercent}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${displayPercent}%` }}
          />
        </div>
        <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{t('progress.minutesTodayLabel', { minutes: displayMinutesToday })}</span>
          <span>{t('progress.minutesWeekLabel', { minutes: displayMinutesThisWeek })}</span>
        </div>
        <p className="text-xs text-muted-foreground/80">
          {t('progress.minutesTotalLabel', { minutes: displayTotalMinutes })}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-2xl border border-white/10 bg-background/70 p-5 shadow-lg shadow-black/5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <div className="pt-3 text-2xl font-semibold text-foreground">
              {renderStatContent(stat.key, stat.fallback)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
