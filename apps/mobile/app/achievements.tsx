/**
 * Achievements Screen
 * 
 * Gallery view of all achievements and badges
 * Mirrors PWA's profile badges section
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/profile/BadgesSection.tsx (PWA)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Trophy,
  Zap,
  Flame,
  BookOpen,
  Star,
  Lock,
} from 'lucide-react-native';
import {
  getAllAchievements,
  getAchievementStats,
  type Achievement,
} from '../lib/achievements';
import { haptic } from '../lib/haptics';

type CategoryFilter = 'all' | 'learning' | 'streak' | 'practice' | 'special';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  learning: 'Learning',
  streak: 'Streaks',
  practice: 'Practice',
  special: 'Special',
};

const CATEGORY_COLORS: Record<Achievement['category'], string> = {
  learning: '#22c55e',
  streak: '#f97316',
  practice: '#3b82f6',
  special: '#a855f7',
};

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<{
    unlocked: number;
    total: number;
    totalXP: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAchievements = useCallback(async () => {
    try {
      const [allAchievements, achievementStats] = await Promise.all([
        getAllAchievements(),
        getAchievementStats(),
      ]);
      setAchievements(allAchievements);
      setStats(achievementStats);
    } catch (error) {
      console.error('[Achievements] Failed to load:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAchievements();
    }, [loadAchievements])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadAchievements();
  };

  const filteredAchievements = achievements.filter((a) =>
    selectedCategory === 'all' ? true : a.category === selectedCategory
  );

  const unlockedCount = filteredAchievements.filter((a) => a.unlockedAt).length;
  const lockedCount = filteredAchievements.filter((a) => !a.unlockedAt).length;

  // Sort: unlocked first, then by category
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    return 0;
  });

  const renderAchievementCard = (achievement: Achievement) => {
    const isUnlocked = !!achievement.unlockedAt;
    const categoryColor = CATEGORY_COLORS[achievement.category];

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          isUnlocked && styles.achievementCardUnlocked,
          isUnlocked && { borderColor: `${categoryColor}40` },
        ]}
        activeOpacity={0.7}
        onPress={() => haptic.selection()}
      >
        {/* Category indicator */}
        <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />

        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            isUnlocked
              ? { backgroundColor: `${categoryColor}20` }
              : styles.iconContainerLocked,
          ]}
        >
          {isUnlocked ? (
            <Text style={styles.iconEmoji}>{achievement.icon}</Text>
          ) : (
            <Lock size={24} color="rgba(247,248,251,0.3)" />
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text
            style={[
              styles.achievementTitle,
              !isUnlocked && styles.achievementTitleLocked,
            ]}
          >
            {achievement.title}
          </Text>
          <Text style={styles.achievementDesc}>{achievement.description}</Text>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {achievement.category}
              </Text>
            </View>
            <View style={styles.xpBadge}>
              <Zap size={12} color={isUnlocked ? '#f6d83b' : 'rgba(247,248,251,0.3)'} />
              <Text
                style={[
                  styles.xpText,
                  !isUnlocked && styles.xpTextLocked,
                ]}
              >
                +{achievement.xpReward} XP
              </Text>
            </View>
          </View>

          {/* Unlock date */}
          {isUnlocked && achievement.unlockedAt && (
            <Text style={styles.unlockDate}>
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f6d83b" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Achievements</Text>
          {stats && (
            <Text style={styles.subtitle}>
              {stats.unlocked} / {stats.total} unlocked • {stats.totalXP.toLocaleString()} XP
            </Text>
          )}
        </View>
        <Trophy size={24} color="#f6d83b" />
      </View>

      {/* Stats summary */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Trophy size={18} color="#f6d83b" />
            <Text style={styles.statValue}>{stats.unlocked}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Lock size={18} color="rgba(247,248,251,0.4)" />
            <Text style={styles.statValue}>{stats.total - stats.unlocked}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Zap size={18} color="#f6d83b" />
            <Text style={styles.statValue}>{stats.totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      )}

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((category) => {
          const isActive = selectedCategory === category;
          const count = category === 'all'
            ? achievements.length
            : achievements.filter((a) => a.category === category).length;

          return (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => {
                haptic.selection();
                setSelectedCategory(category);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {CATEGORY_LABELS[category]}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  isActive && styles.filterCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    isActive && styles.filterCountTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Achievements grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#f6d83b"
          />
        }
      >
        {/* Section headers */}
        {unlockedCount > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Unlocked ({unlockedCount})
            </Text>
            <View style={styles.achievementsGrid}>
              {sortedAchievements
                .filter((a) => a.unlockedAt)
                .map(renderAchievementCard)}
            </View>
          </>
        )}

        {lockedCount > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Locked ({lockedCount})
            </Text>
            <View style={styles.achievementsGrid}>
              {sortedAchievements
                .filter((a) => !a.unlockedAt)
                .map(renderAchievementCard)}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#222536',
  },
  filterContainer: {
    marginTop: 16,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111827',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(246,216,59,0.15)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.6)',
  },
  filterChipTextActive: {
    color: '#f6d83b',
  },
  filterCount: {
    backgroundColor: 'rgba(247,248,251,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountActive: {
    backgroundColor: 'rgba(246,216,59,0.2)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
  },
  filterCountTextActive: {
    color: '#f6d83b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementsGrid: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 16,
  },
  achievementCardUnlocked: {
    backgroundColor: 'rgba(246,216,59,0.05)',
  },
  categoryBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerLocked: {
    backgroundColor: 'rgba(247,248,251,0.05)',
  },
  iconEmoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: 'rgba(247,248,251,0.5)',
  },
  achievementDesc: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f6d83b',
  },
  xpTextLocked: {
    color: 'rgba(247,248,251,0.3)',
  },
  unlockDate: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.4)',
    marginTop: 8,
  },
});
