import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, BookOpen, Clock, ChevronRight, AlertCircle } from 'lucide-react-native';
import { LessonCard } from '../../components/LessonCard';
import { fetchCurriculum, CurriculumPaths, LessonPath } from '../../lib/curriculum';
import { fetchChallengeStories, ChallengeStory } from '../../lib/reader';
import { LearnScreenSkeleton } from '../../components/ui/Skeleton';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { WordOfTheDay } from '../../components/learn/WordOfTheDay';
import { DailyGoalWidget } from '../../components/learn/DailyGoalWidget';
import { WelcomeBanner } from '../../components/WelcomeBanner';
import { haptic } from '../../lib/haptics';

type Level = 'a1' | 'a2' | 'b1' | 'challenge';

// Map onboarding level to curriculum level
function mapUserLevelToTab(userLevel: string | null): Level {
  switch (userLevel) {
    case 'beginner':
      return 'a1';
    case 'intermediate':
      return 'a2';
    case 'advanced':
      return 'b1';
    default:
      return 'a1';
  }
}

const LEVEL_LABELS: Record<Level, { title: string; subtitle: string }> = {
  a1: { title: 'A1', subtitle: 'Beginner' },
  a2: { title: 'A2', subtitle: 'Elementary' },
  b1: { title: 'B1', subtitle: 'Intermediate' },
  challenge: { title: '30 Days', subtitle: 'Challenge' },
};

export default function LearnScreen() {
  const [curriculum, setCurriculum] = useState<CurriculumPaths | null>(null);
  const [challengeStories, setChallengeStories] = useState<ChallengeStory[]>([]);
  const [activeLevel, setActiveLevel] = useState<Level>('a1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLevelLoaded, setInitialLevelLoaded] = useState(false);

  // Load user's preferred level from onboarding on first mount
  useEffect(() => {
    const loadUserLevel = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem('mkll:user-level');
        if (savedLevel && !initialLevelLoaded) {
          const mappedLevel = mapUserLevelToTab(savedLevel);
          setActiveLevel(mappedLevel);
        }
        setInitialLevelLoaded(true);
      } catch (e) {
        console.warn('[Learn] Failed to load user level:', e);
        setInitialLevelLoaded(true);
      }
    };
    loadUserLevel();
  }, [initialLevelLoaded]);

  const loadData = useCallback(async () => {
    try {
      const [curriculumData, challengeData] = await Promise.all([
        fetchCurriculum(),
        fetchChallengeStories().catch(() => []),
      ]);
      setCurriculum(curriculumData);
      setChallengeStories(challengeData);
      setError(null);
    } catch (err) {
      setError('Failed to load curriculum');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: loadData,
  });

  const handleLessonPress = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  const handleChallengeStoryPress = (storyId: string) => {
    router.push(`/reader/${storyId}`);
  };

  const currentPath: LessonPath | null = 
    activeLevel === 'challenge' ? null : (curriculum ? curriculum[activeLevel] : null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LearnScreenSkeleton />
      </SafeAreaView>
    );
  }

  // Get challenge progress
  const challengeCompletedCount = challengeStories.filter(s => s.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Level Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {(['a1', 'a2', 'b1', 'challenge'] as Level[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.tab, 
              activeLevel === level && styles.tabActive,
              level === 'challenge' && styles.tabChallenge,
              level === 'challenge' && activeLevel === level && styles.tabChallengeActive,
            ]}
            onPress={() => {
              if (level !== activeLevel) {
                haptic.selection();
              }
              setActiveLevel(level);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeLevel === level }}
            accessibilityLabel={`${LEVEL_LABELS[level].title} ${LEVEL_LABELS[level].subtitle}`}
          >
            {level === 'challenge' && <Sparkles size={14} color={activeLevel === level ? '#a855f7' : 'rgba(168,85,247,0.6)'} />}
            <Text style={[
              styles.tabTitle, 
              activeLevel === level && styles.tabTitleActive,
              level === 'challenge' && styles.tabTitleChallenge,
              level === 'challenge' && activeLevel === level && styles.tabTitleChallengeActive,
            ]}>
              {LEVEL_LABELS[level].title}
            </Text>
            <Text style={[
              styles.tabSubtitle, 
              activeLevel === level && styles.tabSubtitleActive,
              level === 'challenge' && styles.tabSubtitleChallenge,
            ]}>
              {LEVEL_LABELS[level].subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Bar */}
      {activeLevel !== 'challenge' && currentPath && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentPath.completedCount / Math.max(currentPath.totalCount, 1)) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentPath.completedCount} / {currentPath.totalCount} lessons
          </Text>
        </View>
      )}

      {/* Challenge Progress Bar */}
      {activeLevel === 'challenge' && challengeStories.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressBarChallenge]}>
            <View
              style={[
                styles.progressFill,
                styles.progressFillChallenge,
                { width: `${(challengeCompletedCount / challengeStories.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {challengeCompletedCount} / {challengeStories.length} days completed
          </Text>
        </View>
      )}

      {/* Lesson List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl {...refreshControlProps} />}
      >
        {/* Welcome Banner (first-time users) - only on curriculum tabs */}
        {activeLevel !== 'challenge' && <WelcomeBanner />}

        {/* Daily Goal Progress - only on curriculum tabs */}
        {activeLevel !== 'challenge' && <DailyGoalWidget />}

        {/* Word of the Day - only on curriculum tabs */}
        {activeLevel !== 'challenge' && <WordOfTheDay />}

        {/* Challenge Header */}
        {activeLevel === 'challenge' && (
          <View style={styles.challengeHeader}>
            <View style={styles.challengeHeaderIcon}>
              <Sparkles size={24} color="#a855f7" />
            </View>
            <Text style={styles.challengeTitle}>30-Day Reading Challenge</Text>
            <Text style={styles.challengeSubtitle}>
              Build your reading habit with daily Macedonian stories
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={24} color="#ff7878" style={{ marginBottom: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                haptic.light();
                loadData();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry loading curriculum"
            >
              <Text style={styles.retryButtonText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : activeLevel === 'challenge' ? (
          // Challenge Stories
          challengeStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={[styles.challengeCard, story.completed && styles.challengeCardCompleted]}
              onPress={() => handleChallengeStoryPress(story.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.dayBadge, story.completed && styles.dayBadgeCompleted]}>
                <Text style={[styles.dayBadgeText, story.completed && styles.dayBadgeTextCompleted]}>
                  Day {story.day}
                </Text>
              </View>
              <View style={styles.challengeCardContent}>
                <Text style={styles.challengeCardTitle}>{story.title_mk}</Text>
                <Text style={styles.challengeCardSubtitle}>{story.title_en}</Text>
                <View style={styles.challengeCardMeta}>
                  <View style={styles.challengeMetaItem}>
                    <Clock size={12} color="rgba(247,248,251,0.5)" />
                    <Text style={styles.challengeMetaText}>{story.estimatedMinutes} min</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                    <Text style={[styles.difficultyText, { color: '#22c55e' }]}>{story.difficulty}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color="rgba(247,248,251,0.4)" />
            </TouchableOpacity>
          ))
        ) : (
          // Curriculum Lessons
          currentPath?.nodes.map((node) => (
            <LessonCard
              key={node.id}
              node={node}
              onPress={() => handleLessonPress(node.id)}
            />
          ))
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
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    minWidth: 80,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(246,216,59,0.1)',
    borderColor: '#f6d83b',
  },
  tabChallenge: {
    borderColor: 'rgba(168,85,247,0.3)',
    flexDirection: 'column',
    gap: 2,
  },
  tabChallengeActive: {
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderColor: '#a855f7',
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(247,248,251,0.6)',
  },
  tabTitleActive: {
    color: '#f6d83b',
  },
  tabTitleChallenge: {
    fontSize: 14,
    color: 'rgba(168,85,247,0.7)',
  },
  tabTitleChallengeActive: {
    color: '#a855f7',
  },
  tabSubtitle: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    marginTop: 2,
  },
  tabSubtitleActive: {
    color: 'rgba(246,216,59,0.8)',
  },
  tabSubtitleChallenge: {
    color: 'rgba(168,85,247,0.5)',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#222536',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarChallenge: {
    backgroundColor: 'rgba(168,85,247,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 3,
  },
  progressFillChallenge: {
    backgroundColor: '#a855f7',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,120,120,0.1)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,120,120,0.3)',
  },
  errorText: {
    color: '#ff7878',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(255,120,120,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ff7878',
    fontWeight: '600',
    fontSize: 14,
  },
  // Challenge styles
  challengeHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  challengeHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168,85,247,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7f8fb',
    textAlign: 'center',
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    padding: 16,
    marginBottom: 12,
  },
  challengeCardCompleted: {
    borderColor: 'rgba(34,197,94,0.3)',
    backgroundColor: 'rgba(34,197,94,0.05)',
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dayBadgeCompleted: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a855f7',
  },
  dayBadgeTextCompleted: {
    color: '#22c55e',
  },
  challengeCardContent: {
    flex: 1,
  },
  challengeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 2,
  },
  challengeCardSubtitle: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 8,
  },
  challengeCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeMetaText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
