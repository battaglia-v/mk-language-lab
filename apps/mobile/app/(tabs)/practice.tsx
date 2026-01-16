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
import { router } from 'expo-router';
import { BookOpen, Zap, Library, ChevronRight, Bookmark } from 'lucide-react-native';
import { fetchPracticeItems, PracticeItem } from '../../lib/practice';

type PracticeMode = {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  deck: 'lesson-review' | 'curated';
  variant: 'primary' | 'default' | 'accent';
  requiresAuth?: boolean;
};

const PRACTICE_MODES: PracticeMode[] = [
  {
    id: 'lesson-review',
    title: 'Lesson Review',
    description: 'Practice vocabulary from completed lessons',
    icon: BookOpen,
    deck: 'lesson-review',
    variant: 'primary',
    requiresAuth: true,
  },
  {
    id: 'word-sprint',
    title: 'Word Sprint',
    description: 'Quick flashcard session',
    icon: Zap,
    deck: 'curated',
    variant: 'default',
  },
  {
    id: 'all-vocabulary',
    title: 'All Vocabulary',
    description: 'Full starter vocabulary deck',
    icon: Library,
    deck: 'curated',
    variant: 'accent',
  },
];

export default function PracticeScreen() {
  const [lessonReviewCount, setLessonReviewCount] = useState<number | null>(null);
  const [curatedCount, setCuratedCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      // Load curated count (no auth required)
      const curatedItems = await fetchPracticeItems('curated', 1);
      setCuratedCount(curatedItems.length > 0 ? 200 : 0); // We know curated has ~200 items

      // Try to load lesson review count (requires auth)
      try {
        const lessonItems = await fetchPracticeItems('lesson-review', 1);
        setLessonReviewCount(lessonItems.length > 0 ? lessonItems.length : 0);
      } catch {
        // User not authenticated or no completed lessons
        setLessonReviewCount(0);
      }
    } catch (err) {
      console.error('Failed to load practice counts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCounts();
  };

  const handleModePress = (mode: PracticeMode) => {
    router.push(`/practice/session?deck=${mode.deck}&mode=multipleChoice`);
  };

  const getVariantStyles = (variant: PracticeMode['variant']) => {
    switch (variant) {
      case 'primary':
        return {
          card: styles.cardPrimary,
          icon: styles.iconPrimary,
          iconColor: '#f6d83b',
        };
      case 'accent':
        return {
          card: styles.cardAccent,
          icon: styles.iconAccent,
          iconColor: '#f59e0b',
        };
      default:
        return {
          card: styles.cardDefault,
          icon: styles.iconDefault,
          iconColor: 'rgba(247,248,251,0.6)',
        };
    }
  };

  const getCardCount = (mode: PracticeMode): number | null => {
    if (mode.deck === 'lesson-review') {
      return lessonReviewCount;
    }
    return curatedCount;
  };

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <Text style={styles.subtitle}>Strengthen your vocabulary with practice sessions</Text>
        </View>

        {/* Mode Cards */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f6d83b" />
          </View>
        ) : (
          <View style={styles.modesContainer}>
            {PRACTICE_MODES.map((mode) => {
              const variantStyles = getVariantStyles(mode.variant);
              const Icon = mode.icon;
              const count = getCardCount(mode);
              const isDisabled = mode.deck === 'lesson-review' && count === 0;

              return (
                <TouchableOpacity
                  key={mode.id}
                  style={[styles.card, variantStyles.card, isDisabled && styles.cardDisabled]}
                  onPress={() => !isDisabled && handleModePress(mode)}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  disabled={isDisabled}
                >
                  <View style={[styles.iconContainer, variantStyles.icon]}>
                    <Icon size={24} color={variantStyles.iconColor} />
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, isDisabled && styles.textDisabled]}>
                      {mode.title}
                    </Text>
                    <Text style={[styles.cardDescription, isDisabled && styles.textDisabled]}>
                      {isDisabled
                        ? 'Complete a lesson to unlock'
                        : mode.description}
                    </Text>
                    {count !== null && count > 0 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{count} cards</Text>
                      </View>
                    )}
                  </View>

                  <ChevronRight
                    size={20}
                    color={isDisabled ? 'rgba(247,248,251,0.2)' : 'rgba(247,248,251,0.4)'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* My Saved Words Section (Placeholder) */}
        <View style={styles.savedSection}>
          <View style={styles.savedHeader}>
            <Bookmark size={20} color="#ec4899" />
            <Text style={styles.savedTitle}>My Saved Words</Text>
          </View>
          <View style={styles.savedEmpty}>
            <Text style={styles.savedEmptyText}>
              Save words while reading or translating to practice them here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modesContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 88,
  },
  cardDefault: {
    backgroundColor: '#0b0b12',
    borderColor: '#222536',
  },
  cardPrimary: {
    backgroundColor: 'rgba(246,216,59,0.08)',
    borderColor: 'rgba(246,216,59,0.3)',
  },
  cardAccent: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconDefault: {
    backgroundColor: '#1a1a24',
  },
  iconPrimary: {
    backgroundColor: 'rgba(246,216,59,0.15)',
  },
  iconAccent: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
    lineHeight: 18,
  },
  textDisabled: {
    color: 'rgba(247,248,251,0.4)',
  },
  countBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(247,248,251,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.6)',
    fontWeight: '500',
  },
  savedSection: {
    marginTop: 32,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  savedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  savedEmpty: {
    backgroundColor: '#0b0b12',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#222536',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  savedEmptyText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
