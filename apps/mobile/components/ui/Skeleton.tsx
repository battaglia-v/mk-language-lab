/**
 * Loading Skeleton Components for React Native
 * 
 * Reusable skeleton loaders for consistent loading states
 * Mirrors PWA's loading-skeletons.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/ui/loading-skeletons.tsx (PWA implementation)
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

// =============================================================================
// BASE SKELETON
// =============================================================================

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ 
  width = '100%', 
  height = 16, 
  borderRadius = 8,
  style,
}: SkeletonProps) {
  // Use useMemo to create the animated value once (avoids lint issues with refs)
  const shimmerAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  // Interpolate opacity for shimmer effect
  const opacity = useMemo(
    () => shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
    [shimmerAnim]
  );

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

// =============================================================================
// TEXT SKELETONS
// =============================================================================

export function TextSkeleton({ 
  lines = 1,
  lastLineWidth = '75%',
}: { 
  lines?: number;
  lastLineWidth?: string | number;
}) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          height={14}
          style={i > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </View>
  );
}

// =============================================================================
// CARD SKELETONS
// =============================================================================

export function LessonCardSkeleton() {
  return (
    <View style={styles.lessonCard}>
      <View style={styles.lessonCardRow}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={styles.lessonCardContent}>
          <Skeleton width="70%" height={18} />
          <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 12 }} />
        </View>
      </View>
    </View>
  );
}

export function PracticeCardSkeleton() {
  return (
    <View style={styles.practiceCard}>
      <View style={styles.practiceCardRow}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={styles.practiceCardContent}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function StoryCardSkeleton() {
  return (
    <View style={styles.storyCard}>
      <View style={styles.storyCardRow}>
        <View style={styles.storyCardContent}>
          <Skeleton width={50} height={20} borderRadius={10} />
          <Skeleton width="80%" height={18} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={14} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
    </View>
  );
}

export function ProfileCardSkeleton() {
  return (
    <View style={styles.profileCard}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width={150} height={20} style={{ marginTop: 16 }} />
      <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

// =============================================================================
// STATS SKELETONS
// =============================================================================

export function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <Skeleton width={36} height={36} borderRadius={18} />
      <Skeleton width={60} height={24} style={{ marginTop: 8 }} />
      <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
    </View>
  );
}

export function DailyGoalSkeleton() {
  return (
    <View style={styles.dailyGoalCard}>
      <View style={styles.dailyGoalHeader}>
        <Skeleton width={120} height={18} />
        <Skeleton width={50} height={14} />
      </View>
      <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 12 }} />
      <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

export function StreakSkeleton() {
  return (
    <View style={styles.streakCard}>
      <View style={styles.streakRow}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.streakContent}>
          <Skeleton width={60} height={24} />
          <Skeleton width={80} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// LIST SKELETONS
// =============================================================================

export function ListSkeleton({ 
  items = 3,
  ItemComponent = LessonCardSkeleton,
}: { 
  items?: number;
  ItemComponent?: React.ComponentType;
}) {
  return (
    <View style={styles.list}>
      {Array.from({ length: items }).map((_, i) => (
        <ItemComponent key={i} />
      ))}
    </View>
  );
}

// =============================================================================
// FULL SCREEN SKELETONS
// =============================================================================

export function LearnScreenSkeleton() {
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={100} height={24} />
        <Skeleton width={150} height={14} style={{ marginTop: 8 }} />
      </View>
      
      {/* Level tabs */}
      <View style={styles.tabs}>
        <Skeleton width={80} height={36} borderRadius={18} />
        <Skeleton width={80} height={36} borderRadius={18} />
        <Skeleton width={80} height={36} borderRadius={18} />
      </View>
      
      {/* Lesson cards */}
      <ListSkeleton items={4} ItemComponent={LessonCardSkeleton} />
    </View>
  );
}

export function PracticeScreenSkeleton() {
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={100} height={24} />
        <Skeleton width={200} height={14} style={{ marginTop: 8 }} />
      </View>
      
      {/* Mode cards */}
      <ListSkeleton items={3} ItemComponent={PracticeCardSkeleton} />
      
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
    </View>
  );
}

export function ReaderScreenSkeleton() {
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={80} height={24} />
        <Skeleton width={180} height={14} style={{ marginTop: 8 }} />
      </View>
      
      {/* Level filter */}
      <View style={styles.tabs}>
        <Skeleton width={60} height={32} borderRadius={16} />
        <Skeleton width={60} height={32} borderRadius={16} />
        <Skeleton width={60} height={32} borderRadius={16} />
        <Skeleton width={60} height={32} borderRadius={16} />
      </View>
      
      {/* Story cards */}
      <ListSkeleton items={4} ItemComponent={StoryCardSkeleton} />
    </View>
  );
}

export function ProfileScreenSkeleton() {
  return (
    <View style={styles.screen}>
      {/* Profile card */}
      <ProfileCardSkeleton />
      
      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
      
      {/* Daily goal */}
      <DailyGoalSkeleton />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1f2937',
  },
  textContainer: {
    width: '100%',
  },
  lessonCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  lessonCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lessonCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  practiceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  practiceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  storyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  storyCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  storyCardContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  dailyGoalCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContent: {
    marginLeft: 12,
  },
  list: {
    gap: 12,
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
});
