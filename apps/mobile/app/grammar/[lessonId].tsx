import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GrammarExerciseRunner, type LessonResults } from '../../components/grammar/GrammarExerciseRunner';
import {
  getGrammarLesson,
  saveGrammarProgress,
  type GrammarLesson,
} from '../../lib/grammar';

export default function GrammarLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
    }
  }, [lessonId]);

  const loadLesson = async (id: string) => {
    try {
      const data = await getGrammarLesson(id);
      if (data) {
        setLesson(data);
      } else {
        setError('Lesson not found');
      }
    } catch (err) {
      console.error('[Grammar] Failed to load lesson:', err);
      setError('Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (results: LessonResults) => {
    if (!lessonId) return;

    // Save progress to AsyncStorage
    await saveGrammarProgress(lessonId, results.accuracy);
  };

  const handleExit = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f6d83b" />
            <Text style={styles.loadingText}>Loading lesson...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !lesson) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
            <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
              <Text style={styles.backLinkText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleExit} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#f7f8fb" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {lesson.titleEn}
            </Text>
            <Text style={styles.headerSubtitle}>
              {lesson.exercises.length} exercises • {lesson.difficulty}
            </Text>
          </View>
        </View>

        {/* Exercise Runner */}
        <GrammarExerciseRunner
          lesson={lesson}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      </SafeAreaView>
    </>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: '#f6d83b',
    fontSize: 16,
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.6)',
    textTransform: 'capitalize',
  },
});
