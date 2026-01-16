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
import { LessonCard } from '../../components/LessonCard';
import { fetchCurriculum, CurriculumPaths, LessonPath } from '../../lib/curriculum';

type Level = 'a1' | 'a2' | 'b1';

const LEVEL_LABELS: Record<Level, { title: string; subtitle: string }> = {
  a1: { title: 'A1', subtitle: 'Beginner' },
  a2: { title: 'A2', subtitle: 'Elementary' },
  b1: { title: 'B1', subtitle: 'Intermediate' },
};

export default function LearnScreen() {
  const [curriculum, setCurriculum] = useState<CurriculumPaths | null>(null);
  const [activeLevel, setActiveLevel] = useState<Level>('a1');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurriculum = useCallback(async () => {
    try {
      const data = await fetchCurriculum();
      setCurriculum(data);
      setError(null);
    } catch (err) {
      setError('Failed to load curriculum');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCurriculum();
  };

  const handleLessonPress = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  const currentPath: LessonPath | null = curriculum ? curriculum[activeLevel] : null;

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
    <SafeAreaView style={styles.container}>
      {/* Level Tabs */}
      <View style={styles.tabsContainer}>
        {(['a1', 'a2', 'b1'] as Level[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.tab, activeLevel === level && styles.tabActive]}
            onPress={() => setActiveLevel(level)}
          >
            <Text style={[styles.tabTitle, activeLevel === level && styles.tabTitleActive]}>
              {LEVEL_LABELS[level].title}
            </Text>
            <Text style={[styles.tabSubtitle, activeLevel === level && styles.tabSubtitleActive]}>
              {LEVEL_LABELS[level].subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Bar */}
      {currentPath && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentPath.completedCount / currentPath.totalCount) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentPath.completedCount} / {currentPath.totalCount} lessons
          </Text>
        </View>
      )}

      {/* Lesson List */}
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
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : currentPath?.nodes.map((node) => (
          <LessonCard
            key={node.id}
            node={node}
            onPress={() => handleLessonPress(node.id)}
          />
        ))}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(246,216,59,0.1)',
    borderColor: '#f6d83b',
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(247,248,251,0.6)',
  },
  tabTitleActive: {
    color: '#f6d83b',
  },
  tabSubtitle: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
    marginTop: 2,
  },
  tabSubtitleActive: {
    color: 'rgba(246,216,59,0.8)',
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
  progressFill: {
    height: '100%',
    backgroundColor: '#f6d83b',
    borderRadius: 3,
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
  },
  errorContainer: {
    backgroundColor: 'rgba(255,120,120,0.2)',
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    color: '#ff7878',
    textAlign: 'center',
  },
});
