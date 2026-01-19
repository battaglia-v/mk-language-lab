'use client';

/**
 * WeeklyProgressCard - Shows weekly learning progress
 * 
 * Displays:
 * - Weekly XP earned vs goal
 * - Daily activity breakdown
 * - Streak status
 * - Progress toward next milestone
 * 
 * Parity: Must match Android WeeklyProgressCard.tsx
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, Flame, Target, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DayActivity {
  date: string; // ISO date
  xp: number;
  goalMet: boolean;
}

interface WeeklyProgressCardProps {
  /** XP earned this week */
  weeklyXP: number;
  /** Weekly XP goal */
  weeklyGoal?: number;
  /** Current streak */
  streak: number;
  /** Days active this week (0-7) */
  daysActive: number;
  /** Daily breakdown (last 7 days) */
  dailyActivity?: DayActivity[];
  /** Whether to show compact version */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeeklyProgressCard({
  weeklyXP,
  weeklyGoal = 100,
  streak,
  daysActive,
  dailyActivity,
  compact = false,
  className,
}: WeeklyProgressCardProps) {
  const progress = useMemo(() => {
    return Math.min(100, Math.round((weeklyXP / weeklyGoal) * 100));
  }, [weeklyXP, weeklyGoal]);

  const isGoalMet = weeklyXP >= weeklyGoal;

  // Generate last 7 days if not provided
  const days = useMemo(() => {
    if (dailyActivity && dailyActivity.length > 0) {
      return dailyActivity.slice(-7);
    }
    
    // Generate placeholder days
    const result: DayActivity[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().split('T')[0],
        xp: 0,
        goalMet: false,
      });
    }
    return result;
  }, [dailyActivity]);

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-4 rounded-xl border border-border/60 bg-card/80 p-3',
        className
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">This Week</span>
            <span className="text-sm font-bold text-primary">{weeklyXP} XP</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('border border-border/60 bg-card shadow-sm', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Weekly Progress
          </CardTitle>
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-bold">{streak}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Weekly XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Goal</span>
            <span className={cn(
              'font-semibold',
              isGoalMet ? 'text-green-500' : 'text-foreground'
            )}>
              {weeklyXP} / {weeklyGoal} XP
            </span>
          </div>
          <Progress 
            value={progress} 
            className={cn('h-2', isGoalMet && '[&>div]:bg-green-500')} 
          />
          {isGoalMet && (
            <p className="text-xs text-green-500 font-medium">
              🎉 Weekly goal achieved!
            </p>
          )}
        </div>

        {/* Daily Activity Grid */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Daily Activity</p>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const date = new Date(day.date);
              const dayOfWeek = date.getDay();
              const isToday = day.date === new Date().toISOString().split('T')[0];
              
              return (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {WEEKDAYS[dayOfWeek]}
                  </span>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors',
                      day.goalMet && 'bg-green-500/20 text-green-500',
                      day.xp > 0 && !day.goalMet && 'bg-primary/20 text-primary',
                      day.xp === 0 && 'bg-muted/50 text-muted-foreground',
                      isToday && 'ring-2 ring-primary/50'
                    )}
                    title={`${day.date}: ${day.xp} XP`}
                  >
                    {day.goalMet ? '✓' : day.xp > 0 ? day.xp : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{daysActive}</p>
              <p className="text-[10px] text-muted-foreground">Days Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <Link 
            href="/stats" 
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View Stats
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyProgressCard;
