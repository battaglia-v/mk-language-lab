'use client';

import Link from 'next/link';
import { Flame, Target, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LearnHeaderProps {
  streak: number;
  todayXP: number;
  dailyGoalXP: number;
  continueHref?: string;
  locale?: string; // Optional, kept for API compatibility
}

export function LearnHeader({
  streak,
  todayXP,
  dailyGoalXP,
  continueHref,
}: LearnHeaderProps) {
  const goalProgress = dailyGoalXP > 0 ? Math.min(100, Math.round((todayXP / dailyGoalXP) * 100)) : 0;
  const isGoalComplete = todayXP >= dailyGoalXP;

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        {/* Streak */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
            streak > 0
              ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20'
              : 'bg-muted/30'
          )}
        >
          <Flame
            className={cn('h-5 w-5', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')}
          />
          <span className={cn('font-bold tabular-nums', streak > 0 ? 'text-orange-500' : 'text-muted-foreground')}>
            {streak}
          </span>
        </div>

        {/* Daily Goal Progress - compact */}
        <div className="flex-1 max-w-[200px]">
          <div className="flex items-center gap-2">
            <Target
              className={cn(
                'h-4 w-4 flex-shrink-0',
                isGoalComplete ? 'text-green-500' : 'text-muted-foreground'
              )}
            />
            <Progress
              value={goalProgress}
              className={cn('h-2 flex-1', isGoalComplete && '[&>div]:bg-green-500')}
            />
            <span className={cn(
              'text-xs font-medium tabular-nums whitespace-nowrap',
              isGoalComplete ? 'text-green-500' : 'text-muted-foreground'
            )}>
              {todayXP}/{dailyGoalXP}
            </span>
          </div>
        </div>

        {/* Continue button */}
        {continueHref && (
          <Link
            href={continueHref}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all',
              'bg-primary text-black shadow-md hover:shadow-lg',
              'hover:scale-105 active:scale-95'
            )}
          >
            <Play className="h-4 w-4" fill="currentColor" />
            <span className="hidden sm:inline">Continue</span>
          </Link>
        )}
      </div>
    </div>
  );
}
