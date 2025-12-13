'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getActivityRange, getActivityLevel, getCurrentStreak, type DailyActivity } from '@/lib/practice-activity';
import { Flame, Calendar } from 'lucide-react';

interface PracticeStreakCalendarProps {
  /** Number of weeks to display */
  weeks?: number;
  /** Additional className */
  className?: string;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const LEVEL_COLORS = {
  0: 'bg-muted/20 border-border/30',
  1: 'bg-emerald-500/20 border-emerald-500/40',
  2: 'bg-emerald-500/40 border-emerald-500/50',
  3: 'bg-emerald-500/60 border-emerald-500/60',
  4: 'bg-emerald-500/90 border-emerald-400',
};

export function PracticeStreakCalendar({ weeks = 12, className }: PracticeStreakCalendarProps) {
  const t = useTranslations('practiceHub');
  
  const { activityData, streak, weekGrid } = useMemo(() => {
    const days = weeks * 7;
    const activity = getActivityRange(days);
    const currentStreak = getCurrentStreak();
    
    // Organize into weeks (columns) and days (rows)
    const grid: (DailyActivity | null)[][] = [];
    
    // Get the day of week for the first date
    const firstDate = new Date(activity[0]?.date || new Date());
    const startDayOfWeek = firstDate.getDay();
    
    // Pad the beginning with nulls
    let currentWeek: (DailyActivity | null)[] = Array(startDayOfWeek).fill(null);
    
    for (const day of activity) {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Pad the end if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      grid.push(currentWeek);
    }
    
    return {
      activityData: activity,
      streak: currentStreak,
      weekGrid: grid,
    };
  }, [weeks]);
  
  // Calculate totals for the period
  const periodStats = useMemo(() => {
    const activeDays = activityData.filter((d) => d.sessions > 0).length;
    const totalCards = activityData.reduce((sum, d) => sum + d.cardsReviewed, 0);
    return { activeDays, totalCards };
  }, [activityData]);
  
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-muted/10 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-white">
            {t('streakCalendar.title', { default: 'Practice Activity' })}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-400/30 px-2.5 py-1">
              <Flame className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />
              <span className="text-xs font-bold text-orange-300">
                {t('streakCalendar.currentStreak', { count: streak, default: `${streak} day streak` })}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span>
          {t('streakCalendar.activeDays', { count: periodStats.activeDays, default: `${periodStats.activeDays} active days` })}
        </span>
        <span>•</span>
        <span>
          {t('streakCalendar.cardsReviewed', { count: periodStats.totalCards, default: `${periodStats.totalCards} cards reviewed` })}
        </span>
      </div>
      
      {/* Calendar grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div
              key={`label-${idx}`}
              className="h-3 w-3 flex items-center justify-center text-[8px] text-muted-foreground font-medium"
            >
              {idx % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>
        
        {/* Week columns */}
        <div className="flex gap-1 overflow-x-auto">
          {weekGrid.map((week, weekIdx) => (
            <div key={`week-${weekIdx}`} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIdx}-${dayIdx}`}
                      className="h-3 w-3 rounded-sm"
                    />
                  );
                }
                
                const level = getActivityLevel(day.cardsReviewed);
                const date = new Date(day.date);
                const formattedDate = date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                
                return (
                  <div
                    key={day.date}
                    className={cn(
                      'h-3 w-3 rounded-sm border transition-colors cursor-default',
                      LEVEL_COLORS[level]
                    )}
                    title={`${formattedDate}: ${day.cardsReviewed} cards, ${day.sessions} sessions`}
                    aria-label={`${formattedDate}: ${day.cardsReviewed} cards reviewed`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
        <span>{t('streakCalendar.less', { default: 'Less' })}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn('h-3 w-3 rounded-sm border', LEVEL_COLORS[level as 0 | 1 | 2 | 3 | 4])}
          />
        ))}
        <span>{t('streakCalendar.more', { default: 'More' })}</span>
      </div>
    </div>
  );
}
