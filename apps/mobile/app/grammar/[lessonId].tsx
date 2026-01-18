import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { GrammarExerciseRunner, type LessonResults } from '../../components/grammar/GrammarExerciseRunner';
import { LessonShell } from '../../components/shell/LessonShell';
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

  // Track exercise progress for LessonShell (must be before conditional returns)
  const [currentExercise, setCurrentExercise] = useState(0);

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

  const totalExercises = lesson.exercises.length;
  const progress = totalExercises > 0 ? ((currentExercise + 1) / totalExercises) * 100 : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LessonShell
        progress={progress}
        current={currentExercise + 1}
        total={totalExercises}
        xp={10}
        onClose={handleExit}
        closeHref="/grammar"
      >
        {/* Lesson Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.lessonTitle}>{lesson.titleEn}</Text>
          <Text style={styles.lessonSubtitle}>
            {lesson.exercises.length} exercises • {lesson.difficulty}
          </Text>
        </View>

        {/* Exercise Runner */}
        <GrammarExerciseRunner
          lesson={lesson}
          onComplete={handleComplete}
          onExit={handleExit}
          onProgressChange={setCurrentExercise}
        />
      </LessonShell>
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
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textTransform: 'capitalize',
  },
});
