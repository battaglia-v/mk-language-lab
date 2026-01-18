/**
 * PracticeStatsCard - Practice statistics display
 * 
 * Shows practice history, accuracy, and progress stats
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  TrendingUp,
  Target,
  Zap,
  Calendar,
  ChevronRight,
  Award,
  BarChart2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptic } from '../lib/haptics';

const STATS_KEY = 'mkll:practice-stats';

// ============================================================================
// Types
// ============================================================================

export type PracticeStats = {
  totalSessions: number;
  totalCardsReviewed: number;
  totalCorrect: number;
  totalXPEarned: number;
  bestStreak: number;
  averageAccuracy: number;
  lastPracticeDate: string | null;
  weeklyProgress: number[]; // Last 7 days
};

// ============================================================================
// Storage
// ============================================================================

async function readStats(): Promise<PracticeStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.error('[PracticeStats] Failed to read:', error);
  }
  return {
    totalSessions: 0,
    totalCardsReviewed: 0,
    totalCorrect: 0,
    totalXPEarned: 0,
    bestStreak: 0,
    averageAccuracy: 0,
    lastPracticeDate: null,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  };
}

async function writeStats(stats: PracticeStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('[PracticeStats] Failed to write:', error);
  }
}

/**
 * Record a completed practice session
 */
export async function recordPracticeStats(session: {
  cardsReviewed: number;
  correctCount: number;
  xpEarned: number;
  maxStreak: number;
}): Promise<void> {
  const stats = await readStats();
  
  stats.totalSessions += 1;
  stats.totalCardsReviewed += session.cardsReviewed;
  stats.totalCorrect += session.correctCount;
  stats.totalXPEarned += session.xpEarned;
  stats.bestStreak = Math.max(stats.bestStreak, session.maxStreak);
  stats.averageAccuracy = stats.totalCardsReviewed > 0
    ? Math.round((stats.totalCorrect / stats.totalCardsReviewed) * 100)
    : 0;
  stats.lastPracticeDate = new Date().toISOString();
  
  // Update weekly progress (shift left and add today)
  const today = new Date().getDay();
  stats.weeklyProgress[today] = (stats.weeklyProgress[today] || 0) + session.cardsReviewed;
  
  await writeStats(stats);
}

// ============================================================================
// Component
// ============================================================================

type PracticeStatsCardProps = {
  /** Compact mode for embedding in other screens */
  compact?: boolean;
  /** Called when card is pressed */
  onPress?: () => void;
};

export function PracticeStatsCard({ compact = false, onPress }: PracticeStatsCardProps) {
  const [stats, setStats] = useState<PracticeStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      readStats().then(setStats);
    }, [])
  );

  const handlePress = () => {
    haptic.selection();
    if (onPress) {
      onPress();
    } else {
      router.push('/achievements');
    }
  };

  if (!stats) return null;

  // Calculate days since last practice
  const daysSinceLastPractice = stats.lastPracticeDate
    ? Math.floor(
        (Date.now() - new Date(stats.lastPracticeDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactStat}>
            <Target size={14} color="#22c55e" />
            <Text style={styles.compactValue}>{stats.averageAccuracy}%</Text>
          </View>
          <View style={styles.compactDivider} />
          <View style={styles.compactStat}>
            <Zap size={14} color="#f6d83b" />
            <Text style={styles.compactValue}>{stats.totalXPEarned}</Text>
          </View>
          <View style={styles.compactDivider} />
          <View style={styles.compactStat}>
            <Award size={14} color="#f97316" />
            <Text style={styles.compactValue}>{stats.bestStreak}</Text>
          </View>
        </View>
        <ChevronRight size={16} color="rgba(247,248,251,0.4)" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BarChart2 size={18} color="#f6d83b" />
          <Text style={styles.title}>Practice Stats</Text>
        </View>
        <ChevronRight size={18} color="rgba(247,248,251,0.4)" />
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
            <Target size={18} color="#22c55e" />
          </View>
          <Text style={styles.statValue}>{stats.averageAccuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(246,216,59,0.15)' }]}>
            <Zap size={18} color="#f6d83b" />
          </View>
          <Text style={styles.statValue}>{stats.totalXPEarned.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
            <Award size={18} color="#f97316" />
          </View>
          <Text style={styles.statValue}>{stats.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
            <TrendingUp size={18} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.weeklySection}>
        <Text style={styles.weeklyTitle}>This Week</Text>
        <View style={styles.weeklyBars}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
            const value = stats.weeklyProgress[index] || 0;
            const maxValue = Math.max(...stats.weeklyProgress, 1);
            const height = (value / maxValue) * 40;
            const isToday = index === new Date().getDay();

            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(height, 4) },
                      isToday && styles.barToday,
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Calendar size={14} color="rgba(247,248,251,0.4)" />
        <Text style={styles.footerText}>
          {daysSinceLastPractice === 0
            ? 'Practiced today'
            : daysSinceLastPractice === 1
            ? 'Last practice: yesterday'
            : daysSinceLastPractice !== null
            ? `Last practice: ${daysSinceLastPractice} days ago`
            : 'No practice history yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Styles
// ============================================================================

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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  weeklySection: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#222536',
  },
  weeklyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 10,
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 40,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(246,216,59,0.3)',
    minHeight: 4,
  },
  barToday: {
    backgroundColor: '#f6d83b',
  },
  dayLabel: {
    fontSize: 10,
    color: 'rgba(247,248,251,0.4)',
  },
  dayLabelToday: {
    color: '#f6d83b',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#222536',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222536',
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  compactDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#222536',
    marginHorizontal: 12,
  },
});

export default PracticeStatsCard;
