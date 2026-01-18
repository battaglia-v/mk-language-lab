/**
 * DailyGoalWidget - Daily XP goal progress tracker
 * 
 * Shows progress toward daily learning goal with visual progress bar
 * Mirrors PWA's gamification daily goal component
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/gamification (PWA implementation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Flame, Target, ChevronRight, Zap, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getGamificationSummary, type GamificationSummary } from '../../lib/gamification';
import { haptic } from '../../lib/haptics';

type DailyGoalWidgetProps = {
  /** Called when user taps to view full stats */
  onViewStats?: () => void;
};

export function DailyGoalWidget({ onViewStats }: DailyGoalWidgetProps) {
  const [stats, setStats] = useState<GamificationSummary | null>(null);
  const [progressAnim] = useState(new Animated.Value(0));

  const loadStats = useCallback(async () => {
    try {
      const summary = await getGamificationSummary();
      setStats(summary);
      
      // Animate progress bar
      const progress = Math.min(summary.dailyProgress / summary.dailyGoal, 1);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.warn('[DailyGoal] Failed to load stats:', error);
    }
  }, [progressAnim]);

  // Load stats on focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handlePress = () => {
    haptic.selection();
    if (onViewStats) {
      onViewStats();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  if (!stats) {
    return null;
  }

  const { dailyProgress, dailyGoal, streak, isGoalComplete } = stats;
  const progressPercent = Math.min((dailyProgress / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - dailyProgress, 0);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.iconContainer,
            isGoalComplete && styles.iconContainerComplete,
          ]}>
            {isGoalComplete ? (
              <Trophy size={18} color="#f6d83b" />
            ) : (
              <Target size={18} color="#f6d83b" />
            )}
          </View>
          <View>
            <Text style={styles.title}>Daily Goal</Text>
            <Text style={styles.subtitle}>
              {isGoalComplete 
                ? 'Goal completed! 🎉' 
                : `${remaining} XP to go`
              }
            </Text>
          </View>
        </View>
        
        {/* Streak Badge */}
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Flame size={14} color="#f97316" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              isGoalComplete && styles.progressFillComplete,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {dailyProgress} / {dailyGoal} XP
        </Text>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Zap size={14} color="rgba(247,248,251,0.5)" />
          <Text style={styles.statText}>Level {stats.level}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>
            {stats.totalXP.toLocaleString()} total XP
          </Text>
        </View>
        <ChevronRight size={16} color="rgba(247,248,251,0.4)" />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Compact version for use in headers/cards
 */
export function DailyGoalCompact() {
  const [stats, setStats] = useState<GamificationSummary | null>(null);

  useEffect(() => {
    getGamificationSummary().then(setStats).catch(console.warn);
  }, []);

  if (!stats) return null;

  const { dailyProgress, dailyGoal, isGoalComplete } = stats;
  const progressPercent = Math.min((dailyProgress / dailyGoal) * 100, 100);

  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactProgress}>
        <View
          style={[
            styles.compactProgressFill,
            isGoalComplete && styles.compactProgressFillComplete,
            { width: `${progressPercent}%` },
          ]}
        />
      </View>
      <Text style={styles.compactText}>
        {dailyProgress}/{dailyGoal} XP
      </Text>
    </View>
  );
}

/**
 * Streak badge for use in headers
 */
export function StreakBadge() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getGamificationSummary()
      .then((s) => setStreak(s.streak))
      .catch(console.warn);
  }, []);

  if (streak === 0) return null;

  return (
    <View style={styles.streakBadgeStandalone}>
      <Flame size={16} color="#f97316" />
      <Text style={styles.streakBadgeText}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerComplete: {
    backgroundColor: 'rgba(246,216,59,0.25)',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: '#22c55e',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222536',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 2,
  },
  compactProgressFillComplete: {
    backgroundColor: '#22c55e',
  },
  compactText: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
  },
  // Standalone streak badge
  streakBadgeStandalone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f97316',
  },
});

export default DailyGoalWidget;
