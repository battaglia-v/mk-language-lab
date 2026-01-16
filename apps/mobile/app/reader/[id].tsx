import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import {
  fetchStoryDetail,
  ReaderStoryDetail,
  VocabularyItem,
  lookupVocabulary,
  translateWord,
} from '../../lib/reader';
import { TappableText } from '../../components/reader/TappableText';
import { WordPopup } from '../../components/reader/WordPopup';

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  A2: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  B1: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
};

export type WordInfo = {
  mk: string;
  en: string;
  pos?: string;
  isLoading?: boolean;
};

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [story, setStory] = useState<ReaderStoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadStory = async () => {
      if (!id) return;

      try {
        setError(null);
        const data = await fetchStoryDetail(id);
        setStory(data);
      } catch (err) {
        console.error('Failed to load story:', err);
        setError('Failed to load story. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStory();
  }, [id]);

  const handleWordPress = useCallback(
    async (word: string) => {
      if (!story) return;

      // Check vocabulary first
      const vocabMatch = lookupVocabulary(word, story.vocabulary);
      if (vocabMatch) {
        setSelectedWord({
          mk: vocabMatch.mk,
          en: vocabMatch.en,
          pos: vocabMatch.pos,
        });
        return;
      }

      // Show loading state while fetching translation
      setSelectedWord({
        mk: word,
        en: 'Translating...',
        isLoading: true,
      });

      // Fetch translation from API
      const translation = await translateWord(word);
      setSelectedWord({
        mk: word,
        en: translation ?? 'Translation not available',
        isLoading: false,
      });
    },
    [story]
  );

  const handleClosePopup = () => {
    setSelectedWord(null);
  };

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollPercentage = contentOffset.y / (contentSize.height - layoutMeasurement.height);

      // Mark complete when scrolled past 95%
      if (scrollPercentage > 0.95 && !isComplete) {
        setIsComplete(true);
      }
    },
    [isComplete]
  );

  const handleMarkComplete = () => {
    setIsComplete(true);
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

  if (error || !story) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#f7f8fb" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error ?? 'Story not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyStyle = DIFFICULTY_COLORS[story.difficulty] ?? DIFFICULTY_COLORS.A1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {story.title_mk}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Difficulty badge */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyStyle.bg, borderColor: difficultyStyle.border },
            ]}
          >
            <Text style={[styles.difficultyText, { color: difficultyStyle.text }]}>
              {story.difficulty}
            </Text>
          </View>

          {/* Completion indicator */}
          {isComplete && <CheckCircle2 size={20} color="#22c55e" style={{ marginLeft: 8 }} />}
        </View>
      </View>

      {/* Story content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        {/* English title */}
        <Text style={styles.englishTitle}>{story.title_en}</Text>

        {/* Text blocks */}
        {story.text_blocks_mk.map((block, index) => (
          <TappableText
            key={index}
            text={block.value}
            vocabulary={story.vocabulary}
            onWordPress={handleWordPress}
          />
        ))}

        {/* End of story */}
        <View style={styles.endSection}>
          {!isComplete ? (
            <TouchableOpacity style={styles.markCompleteButton} onPress={handleMarkComplete}>
              <CheckCircle2 size={20} color="#f6d83b" />
              <Text style={styles.markCompleteText}>Mark Complete</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <CheckCircle2 size={20} color="#22c55e" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Word popup */}
      <WordPopup
        visible={!!selectedWord}
        word={selectedWord}
        onClose={handleClosePopup}
        storyId={story.id}
      />
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  englishTitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    marginBottom: 24,
  },
  endSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.4)',
    gap: 8,
  },
  markCompleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f6d83b',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
});
