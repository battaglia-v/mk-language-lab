import { useEffect, useState, useCallback } from 'react';
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
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react-native';
import {
  fetchGrammarLessons,
  loadGrammarProgress,
  getDifficultyLevel,
  type GrammarLesson,
  type LessonProgress,
} from '../../lib/grammar';

type TierConfig = {
  id: 'A1' | 'A2' | 'B1';
  label: string;
  description: string;
};

const TIER_CONFIG: TierConfig[] = [
  {
    id: 'A1',
    label: 'Tier 1 - A1 Beginner',
    description: 'Alphabet, greetings, and core structures.',
  },
  {
    id: 'A2',
    label: 'Tier 2 - A2 Elementary',
    description: 'Shopping, directions, and past tense.',
  },
  {
    id: 'B1',
    label: 'Tier 3 - B1 Intermediate',
    description: 'Future tense, modals, and complex clauses.',
  },
];

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
  intermediate: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  advanced: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

export default function GrammarListScreen() {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set(['A1', 'A2', 'B1']));

  const loadData = useCallback(async () => {
    try {
      const [lessonsData, progressData] = await Promise.all([
        fetchGrammarLessons(),
        loadGrammarProgress(),
      ]);
      setLessons(lessonsData);
      setProgress(progressData);
    } catch (error) {
      console.error('[Grammar] Failed to load data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const getLessonProgress = (lessonId: string): LessonProgress | undefined => {
    return progress.find((p) => p.lessonId === lessonId);
  };

  // Group lessons by tier
  const lessonsByTier = TIER_CONFIG.map((tier) => ({
    ...tier,
    lessons: lessons.filter((l) => getDifficultyLevel(l) === tier.id),
  }));

  // Find the first incomplete lesson
  const getRecommendedLessonId = (): string | null => {
    const firstIncomplete = lessons.find((lesson) => {
      const lessonProgress = getLessonProgress(lesson.id);
      return !lessonProgress?.completed;
    });
    return firstIncomplete?.id ?? lessons[0]?.id ?? null;
  };

  const recommendedLessonId = getRecommendedLessonId();

  // Calculate overall progress
  const completedCount = progress.filter((p) => p.completed).length;
  const totalCount = lessons.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleTier = (tierId: string) => {
    setExpandedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tierId)) {
        next.delete(tierId);
      } else {
        next.add(tierId);
      }
      return next;
    });
  };

  const handleLessonPress = (lessonId: string) => {
    // Route will be valid once [lessonId].tsx is created
    router.push({ pathname: '/grammar/[lessonId]', params: { lessonId } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#f7f8fb" />
            <Text style={styles.backText}>Practice</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#f6d83b" />
          }
        >
          {/* Page Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Grammar Practice</Text>
            <Text style={styles.subtitle}>
              Master Macedonian grammar with structured exercises
            </Text>
          </View>

          {/* Overall Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressCount}>
                {completedCount} / {totalCount} lessons
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>
            <BookOpen size={24} color="#f6d83b" style={styles.progressIcon} />
          </View>

          {/* Loading state */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f6d83b" />
            </View>
          ) : (
            /* Tier sections */
            <View style={styles.tiersContainer}>
              {lessonsByTier.map((tier) => {
                if (tier.lessons.length === 0) return null;
                const isExpanded = expandedTiers.has(tier.id);

                return (
                  <View key={tier.id} style={styles.tierSection}>
                    {/* Tier Header */}
                    <TouchableOpacity
                      style={styles.tierHeader}
                      onPress={() => toggleTier(tier.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.tierInfo}>
                        <View style={styles.tierTitleRow}>
                          <Text style={styles.tierLabel}>{tier.label}</Text>
                          <View style={styles.tierBadge}>
                            <Text style={styles.tierBadgeText}>{tier.id}</Text>
                          </View>
                        </View>
                        <Text style={styles.tierDescription}>{tier.description}</Text>
                      </View>
                      {isExpanded ? (
                        <ChevronUp size={20} color="rgba(247,248,251,0.6)" />
                      ) : (
                        <ChevronDown size={20} color="rgba(247,248,251,0.6)" />
                      )}
                    </TouchableOpacity>

                    {/* Lessons List */}
                    {isExpanded && (
                      <View style={styles.lessonsContainer}>
                        {tier.lessons.map((lesson, index) => {
                          const lessonProgress = getLessonProgress(lesson.id);
                          const isCompleted = lessonProgress?.completed ?? false;
                          const isRecommended = lesson.id === recommendedLessonId;
                          const colors = difficultyColors[lesson.difficulty] || difficultyColors.beginner;

                          return (
                            <TouchableOpacity
                              key={lesson.id}
                              style={[
                                styles.lessonCard,
                                isRecommended && !isCompleted && styles.lessonCardRecommended,
                              ]}
                              onPress={() => handleLessonPress(lesson.id)}
                              activeOpacity={0.7}
                            >
                              {/* Status indicator */}
                              <View
                                style={[
                                  styles.statusIndicator,
                                  isCompleted && styles.statusCompleted,
                                  isRecommended && !isCompleted && styles.statusRecommended,
                                ]}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={18} color="#10b981" />
                                ) : isRecommended ? (
                                  <Sparkles size={18} color="#f6d83b" />
                                ) : (
                                  <Text style={styles.statusNumber}>{index + 1}</Text>
                                )}
                              </View>

                              {/* Lesson Info */}
                              <View style={styles.lessonInfo}>
                                <View style={styles.lessonTitleRow}>
                                  <Text style={styles.lessonTitle} numberOfLines={1}>
                                    {lesson.titleEn}
                                  </Text>
                                </View>

                                {/* Badges row */}
                                <View style={styles.badgesRow}>
                                  <View
                                    style={[
                                      styles.difficultyBadge,
                                      { backgroundColor: colors.bg, borderColor: colors.border },
                                    ]}
                                  >
                                    <Text style={[styles.difficultyText, { color: colors.text }]}>
                                      {lesson.difficulty}
                                    </Text>
                                  </View>
                                  {isRecommended && !isCompleted && (
                                    <View style={styles.recommendedBadge}>
                                      <Text style={styles.recommendedText}>Recommended</Text>
                                    </View>
                                  )}
                                </View>

                                {/* Meta info */}
                                <View style={styles.metaRow}>
                                  <Text style={styles.metaText}>
                                    {lesson.exercises.length} exercises
                                  </Text>
                                  {lessonProgress?.score !== undefined && (
                                    <Text style={styles.scoreText}>{lessonProgress.score}%</Text>
                                  )}
                                </View>
                              </View>

                              <ChevronRight size={18} color="rgba(247,248,251,0.4)" />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#f7f8fb',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  progressCard: {
    backgroundColor: 'rgba(246,216,59,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    position: 'relative',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  progressCount: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(247,248,251,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 4,
  },
  progressIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  tiersContainer: {
    gap: 16,
  },
  tierSection: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    overflow: 'hidden',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tierLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  tierBadge: {
    backgroundColor: 'rgba(247,248,251,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.6)',
  },
  tierDescription: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#222536',
    padding: 12,
    gap: 8,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247,248,251,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(247,248,251,0.06)',
    padding: 12,
    minHeight: 72,
  },
  lessonCardRecommended: {
    backgroundColor: 'rgba(246,216,59,0.05)',
    borderColor: 'rgba(246,216,59,0.2)',
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  statusRecommended: {
    backgroundColor: 'rgba(246,216,59,0.2)',
  },
  statusNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f6d83b',
  },
  lessonInfo: {
    flex: 1,
    marginRight: 8,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#f7f8fb',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(246,216,59,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f6d83b',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});
