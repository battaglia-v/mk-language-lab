'use client';

import { useEffect, useState } from 'react';
import { Flame, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLocalXP, isGoalComplete } from '@/lib/gamification/local-xp';

/**
 * TopGameBar - Duolingo-style stats bar
 *
 * Shows:
 * - Streak (flame icon + days)
 * - XP progress (lightning + X/Y)
 * - Goal ring (target icon + progress)
 *
 * Minimal design, fits in nav or page header
 */

export type TopGameBarProps = {
  className?: string;
  /** Show in compact mode (icons only on mobile) */
  compact?: boolean;
  /** Show streak even if 0 */
  showZeroStreak?: boolean;
};

export function TopGameBar({
  className,
  compact = false,
  showZeroStreak = false,
}: TopGameBarProps) {
  const [stats, setStats] = useState({
    streak: 0,
    todayXP: 0,
    dailyGoal: 10,
    goalComplete: false,
  });

  useEffect(() => {
    const data = getLocalXP();
    setStats({
      streak: data.streak,
      todayXP: data.todayXP,
      dailyGoal: data.dailyGoal,
      goalComplete: isGoalComplete(),
    });
  }, []);

  const progressPercent = Math.min(
    (stats.todayXP / stats.dailyGoal) * 100,
    100
  );

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-full bg-white/5 px-3 py-1.5',
        className
      )}
    >
      {/* Streak */}
      {(stats.streak > 0 || showZeroStreak) && (
        <div className="flex items-center gap-1.5">
          <Flame
            className={cn(
              'h-4 w-4',
              stats.streak > 0 ? 'text-orange-400' : 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              stats.streak > 0 ? 'text-orange-400' : 'text-muted-foreground',
              compact && 'hidden sm:inline'
            )}
          >
            {stats.streak}
          </span>
        </div>
      )}

      {/* XP Progress */}
      <div className="flex items-center gap-1.5">
        <Zap className="h-4 w-4 text-primary" />
        <span
          className={cn(
            'text-sm font-semibold tabular-nums text-primary',
            compact && 'hidden sm:inline'
          )}
        >
          {stats.todayXP}
          <span className="text-muted-foreground">/{stats.dailyGoal}</span>
        </span>
      </div>

      {/* Goal Ring */}
      <div className="flex items-center gap-1.5">
        <GoalRing progress={progressPercent} complete={stats.goalComplete} />
        {!compact && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {stats.goalComplete ? 'Done!' : `${Math.round(progressPercent)}%`}
          </span>
        )}
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
  size = 18,
}: {
  progress: number;
  complete: boolean;
  size?: number;
}) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
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
            'transition-all duration-500',
            complete ? 'text-emerald-400' : 'text-primary'
          )}
        />
      </svg>
      {complete && (
        <Target
          className="absolute inset-0 m-auto h-2.5 w-2.5 text-emerald-400"
          strokeWidth={3}
        />
      )}
    </div>
  );
}

/**
 * Standalone streak badge for use in other components
 */
export function StreakBadge({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  if (streak <= 0) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5',
        className
      )}
    >
      <Flame className="h-3.5 w-3.5 text-orange-400" />
      <span className="text-xs font-bold text-orange-400">{streak}</span>
    </div>
  );
}

/**
 * XP display badge
 */
export function XPBadge({
  earned,
  goal,
  className,
}: {
  earned: number;
  goal: number;
  className?: string;
}) {
  const complete = earned >= goal;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        complete ? 'bg-emerald-500/15' : 'bg-primary/15',
        className
      )}
    >
      <Zap
        className={cn(
          'h-3.5 w-3.5',
          complete ? 'text-emerald-400' : 'text-primary'
        )}
      />
      <span
        className={cn(
          'text-xs font-bold',
          complete ? 'text-emerald-400' : 'text-primary'
        )}
      >
        {earned}/{goal}
      </span>
    </div>
  );
}
