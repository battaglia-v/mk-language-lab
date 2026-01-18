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
import { router, useFocusEffect } from 'expo-router';
import { BookOpen, Zap, Library, ChevronRight, Bookmark, GraduationCap, Settings2, Clock } from 'lucide-react-native';
import { fetchPracticeItems, PracticeItem } from '../../lib/practice';
import { getGrammarStats } from '../../lib/grammar';
import { readSavedPhrases, mapSavedPhrasesToPracticeItems, type SavedPhraseRecord } from '../../lib/saved-phrases';
import { getMistakesCount } from '../../lib/practice-mistakes';
import { getSRSStats, type SRSStats } from '../../lib/srs';
import { PracticeModeSheet, type PracticeMode, type DifficultyFilter } from '../../components/practice/PracticeModeSheet';
import { ResumeBanner } from '../../components/practice/ResumeBanner';

type PracticeModeType = {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  deck: 'lesson-review' | 'curated';
  variant: 'primary' | 'default' | 'accent';
  requiresAuth?: boolean;
};

const PRACTICE_MODES: PracticeModeType[] = [
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
  const [grammarStats, setGrammarStats] = useState<{ completed: number; total: number } | null>(null);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhraseRecord[]>([]);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [srsStats, setSrsStats] = useState<SRSStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModeSheet, setShowModeSheet] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<'lesson-review' | 'curated'>('curated');

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

      // Load grammar stats
      try {
        const stats = await getGrammarStats();
        setGrammarStats({ completed: stats.completed, total: stats.total });
      } catch {
        setGrammarStats(null);
      }

      // Load saved phrases
      try {
        const phrases = await readSavedPhrases();
        setSavedPhrases(phrases);
      } catch {
        setSavedPhrases([]);
      }

      // Load SRS stats
      try {
        const stats = await getSRSStats();
        setSrsStats(stats);
      } catch {
        setSrsStats(null);
      }

      // Load mistakes count
      try {
        const count = await getMistakesCount();
        setMistakesCount(count);
      } catch {
        setMistakesCount(0);
      }
    } catch (err) {
      console.error('Failed to load practice counts:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Reload saved phrases when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      readSavedPhrases().then(setSavedPhrases).catch(() => setSavedPhrases([]));
    }, [])
  );

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCounts();
  };

  const handleModePress = (mode: PracticeModeType) => {
    // Word Sprint has its own screen
    if (mode.id === 'word-sprint') {
      router.push('/practice/word-sprint');
      return;
    }
    
    setSelectedDeck(mode.deck);
    setShowModeSheet(true);
  };

  const handleStartPractice = (mode: PracticeMode, difficulty: DifficultyFilter, count: number) => {
    router.push(`/practice/session?deck=${selectedDeck}&mode=${mode}&count=${count}`);
  };

  const getVariantStyles = (variant: PracticeModeType['variant']) => {
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

  const getCardCount = (mode: PracticeModeType): number | null => {
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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Practice</Text>
              <Text style={styles.subtitle}>Strengthen your vocabulary with practice sessions</Text>
            </View>
            {mistakesCount > 0 && (
              <TouchableOpacity
                style={styles.mistakesBadge}
                onPress={() => router.push('/practice/session?deck=mistakes&mode=multipleChoice')}
              >
                <Text style={styles.mistakesBadgeText}>{mistakesCount} to review</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Resume Practice Session Banner */}
        <ResumeBanner onAction={loadCounts} />

        {/* SRS Due Cards Indicator */}
        {srsStats && srsStats.dueToday > 0 && (
          <TouchableOpacity
            style={styles.srsBanner}
            onPress={() => router.push('/practice/session?deck=curated&mode=multipleChoice&priority=due')}
          >
            <View style={styles.srsIconContainer}>
              <Clock color="#f6d83b" size={20} />
            </View>
            <View style={styles.srsTextContainer}>
              <Text style={styles.srsTitle}>
                {srsStats.dueToday} card{srsStats.dueToday !== 1 ? 's' : ''} due for review
              </Text>
              <Text style={styles.srsSubtitle}>
                {srsStats.mastered} mastered • {srsStats.learning} learning
              </Text>
            </View>
            <ChevronRight color="rgba(247,248,251,0.5)" size={20} />
          </TouchableOpacity>
        )}

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

        {/* Grammar Practice Section */}
        <View style={styles.grammarSection}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Grammar Practice</Text>
          </View>
          <TouchableOpacity
            style={styles.grammarCard}
            onPress={() => router.push('/grammar')}
            activeOpacity={0.7}
          >
            <View style={styles.grammarIconContainer}>
              <GraduationCap size={24} color="#8b5cf6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Grammar Exercises</Text>
              <Text style={styles.cardDescription}>
                Practice grammar rules with structured exercises
              </Text>
              {grammarStats && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {grammarStats.completed}/{grammarStats.total} completed
                  </Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color="rgba(247,248,251,0.4)" />
          </TouchableOpacity>
        </View>

        {/* My Saved Words Section */}
        <View style={styles.savedSection}>
          <View style={styles.savedHeader}>
            <Bookmark size={20} color="#ec4899" />
            <Text style={styles.savedTitle}>My Saved Words</Text>
            {savedPhrases.length > 0 && (
              <View style={styles.savedCountBadge}>
                <Text style={styles.savedCountText}>{savedPhrases.length}</Text>
              </View>
            )}
          </View>
          
          {savedPhrases.length === 0 ? (
            <View style={styles.savedEmpty}>
              <Text style={styles.savedEmptyText}>
                Save words while reading or translating to practice them here
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.savedCard}
              onPress={() => router.push('/practice/session?deck=saved-phrases&mode=multipleChoice')}
              activeOpacity={0.7}
            >
              <View style={styles.savedIconContainer}>
                <Bookmark size={24} color="#ec4899" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Practice Saved Words</Text>
                <Text style={styles.cardDescription}>
                  Review your saved translations
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{savedPhrases.length} phrases</Text>
                </View>
              </View>
              <ChevronRight size={20} color="rgba(247,248,251,0.4)" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Practice Mode Selection Sheet */}
      <PracticeModeSheet
        visible={showModeSheet}
        onClose={() => setShowModeSheet(false)}
        onStart={handleStartPractice}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mistakesBadge: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  mistakesBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
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
  grammarSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  grammarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderColor: 'rgba(139,92,246,0.3)',
    minHeight: 88,
  },
  grammarIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,92,246,0.15)',
    marginRight: 14,
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
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(236,72,153,0.08)',
    borderColor: 'rgba(236,72,153,0.3)',
    minHeight: 88,
  },
  savedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236,72,153,0.15)',
    marginRight: 14,
  },
  savedCountBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(236,72,153,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savedCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ec4899',
  },
  srsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246,216,59,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  srsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  srsTextContainer: {
    flex: 1,
  },
  srsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 2,
  },
  srsSubtitle: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
});
