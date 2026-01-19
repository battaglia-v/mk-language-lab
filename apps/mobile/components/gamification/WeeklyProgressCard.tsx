/**
 * WeeklyProgressCard - Shows weekly learning progress (Android)
 * 
 * Displays:
 * - Weekly XP earned vs goal
 * - Daily activity breakdown
 * - Streak status
 * 
 * Parity: Must match PWA WeeklyProgressCard.tsx
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Flame, Calendar, ChevronRight } from 'lucide-react-native';

interface DayActivity {
  date: string;
  xp: number;
  goalMet: boolean;
}

interface WeeklyProgressCardProps {
  weeklyXP: number;
  weeklyGoal?: number;
  streak: number;
  daysActive: number;
  dailyActivity?: DayActivity[];
  compact?: boolean;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeeklyProgressCard({
  weeklyXP,
  weeklyGoal = 100,
  streak,
  daysActive,
  dailyActivity,
  compact = false,
}: WeeklyProgressCardProps) {
  const progress = useMemo(() => {
    return Math.min(100, Math.round((weeklyXP / weeklyGoal) * 100));
  }, [weeklyXP, weeklyGoal]);

  const isGoalMet = weeklyXP >= weeklyGoal;

  const days = useMemo(() => {
    if (dailyActivity && dailyActivity.length > 0) {
      return dailyActivity.slice(-7);
    }
    
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
      <View style={styles.compactContainer}>
        <View style={styles.compactIcon}>
          <TrendingUp size={20} color="#f6d83b" />
        </View>
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={styles.compactLabel}>This Week</Text>
            <Text style={styles.compactXP}>{weeklyXP} XP</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Calendar size={16} color="#f6d83b" />
          <Text style={styles.title}>Weekly Progress</Text>
        </View>
        <View style={styles.streakBadge}>
          <Flame size={16} color="#f97316" />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      {/* Weekly XP Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Weekly Goal</Text>
          <Text style={[styles.progressValue, isGoalMet && styles.progressComplete]}>
            {weeklyXP} / {weeklyGoal} XP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` },
              isGoalMet && styles.progressFillComplete
            ]} 
          />
        </View>
        {isGoalMet && (
          <Text style={styles.goalMetText}>🎉 Weekly goal achieved!</Text>
        )}
      </View>

      {/* Daily Activity Grid */}
      <View style={styles.activitySection}>
        <Text style={styles.activityLabel}>Daily Activity</Text>
        <View style={styles.daysGrid}>
          {days.map((day, i) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <View key={day.date} style={styles.dayColumn}>
                <Text style={styles.dayLabel}>{WEEKDAYS[dayOfWeek]}</Text>
                <View style={[
                  styles.dayCell,
                  day.goalMet && styles.dayCellComplete,
                  day.xp > 0 && !day.goalMet && styles.dayCellPartial,
                  isToday && styles.dayCellToday,
                ]}>
                  <Text style={[
                    styles.dayCellText,
                    day.goalMet && styles.dayCellTextComplete,
                    day.xp > 0 && !day.goalMet && styles.dayCellTextPartial,
                  ]}>
                    {day.goalMet ? '✓' : day.xp > 0 ? day.xp : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{daysActive}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  progressComplete: {
    color: '#22c55e',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: '#22c55e',
  },
  goalMetText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
    marginTop: 4,
  },
  activitySection: {
    marginBottom: 16,
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: 'rgba(247,248,251,0.5)',
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellComplete: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  dayCellPartial: {
    backgroundColor: 'rgba(246, 216, 59, 0.2)',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: 'rgba(246, 216, 59, 0.5)',
  },
  dayCellText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.5)',
  },
  dayCellTextComplete: {
    color: '#22c55e',
  },
  dayCellTextPartial: {
    color: '#f6d83b',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(247,248,251,0.5)',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f7f8fb',
  },
  compactXP: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f6d83b',
  },
});

export default WeeklyProgressCard;
