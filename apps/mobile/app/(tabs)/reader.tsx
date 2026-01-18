import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, Clock, FileText, ChevronRight, Share2 } from 'lucide-react-native';
import { fetchStories, ReaderStory } from '../../lib/reader';
import { ReaderScreenSkeleton } from '../../components/ui/Skeleton';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { shareStory } from '../../lib/share';

type DifficultyLevel = 'all' | 'A1' | 'A2' | 'B1';

const LEVELS: { id: DifficultyLevel; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  A2: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  B1: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
};

export default function ReaderScreen() {
  const [stories, setStories] = useState<ReaderStory[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async (level?: DifficultyLevel) => {
    const levelToFetch = level ?? selectedLevel;
    try {
      setError(null);
      const data = await fetchStories(levelToFetch === 'all' ? undefined : levelToFetch);
      setStories(data);
    } catch (err) {
      console.error('Failed to load stories:', err);
      setError('Failed to load stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevel]);

  useEffect(() => {
    loadStories(selectedLevel);
  }, [selectedLevel, loadStories]);

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: () => loadStories(),
  });

  const handleLevelChange = (level: DifficultyLevel) => {
    if (level !== selectedLevel) {
      setSelectedLevel(level);
      setIsLoading(true);
    }
  };

  const handleStoryPress = (story: ReaderStory) => {
    router.push(`/reader/${story.id}`);
  };

  const renderStoryCard = ({ item }: { item: ReaderStory }) => {
    const difficultyStyle = DIFFICULTY_COLORS[item.difficulty] ?? DIFFICULTY_COLORS.A1;

    return (
      <TouchableOpacity
        style={styles.storyCard}
        onPress={() => handleStoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.storyContent}>
          {/* Title */}
          <Text style={styles.storyTitle}>{item.title_mk}</Text>
          <Text style={styles.storySubtitle}>{item.title_en}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            {/* Difficulty badge */}
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyStyle.bg, borderColor: difficultyStyle.border },
              ]}
            >
              <Text style={[styles.difficultyText, { color: difficultyStyle.text }]}>
                {item.difficulty}
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.metaItem}>
              <Clock size={14} color="rgba(247,248,251,0.5)" />
              <Text style={styles.metaText}>{item.estimatedMinutes} min</Text>
            </View>

            {/* Word count */}
            <View style={styles.metaItem}>
              <FileText size={14} color="rgba(247,248,251,0.5)" />
              <Text style={styles.metaText}>{item.wordCount} words</Text>
            </View>
          </View>
        </View>

        <ChevronRight size={20} color="rgba(247,248,251,0.4)" />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Reader</Text>
        <Text style={styles.subtitle}>Practice reading with graded stories</Text>
      </View>

      {/* Level filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.filterChip,
              selectedLevel === level.id && styles.filterChipActive,
            ]}
            onPress={() => handleLevelChange(level.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedLevel === level.id && styles.filterChipTextActive,
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <BookOpen size={48} color="rgba(247,248,251,0.3)" />
      <Text style={styles.emptyTitle}>No stories found</Text>
      <Text style={styles.emptyText}>
        {selectedLevel !== 'all'
          ? `No ${selectedLevel} level stories available`
          : 'Stories will appear here'}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={stories}
        renderItem={renderStoryCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f6d83b" />
            </View>
          ) : error ? (
            renderError()
          ) : (
            renderEmpty()
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#f6d83b"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
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
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0b0b12',
    borderWidth: 1,
    borderColor: '#222536',
  },
  filterChipActive: {
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderColor: 'rgba(246,216,59,0.4)',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.6)',
  },
  filterChipTextActive: {
    color: '#f6d83b',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    marginBottom: 12,
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 2,
  },
  storySubtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.4)',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f6d83b',
  },
});
