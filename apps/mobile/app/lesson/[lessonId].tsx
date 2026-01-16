import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { SectionTabs } from '../../components/lesson/SectionTabs';
import { DialogueSection } from '../../components/lesson/DialogueSection';
import { VocabularySection } from '../../components/lesson/VocabularySection';
import { GrammarSection } from '../../components/lesson/GrammarSection';
import { PracticeSection } from '../../components/lesson/PracticeSection';
import {
  fetchLesson,
  completeLesson,
  Lesson,
  SectionType,
  DialogueLine,
  VocabularyItem,
  GrammarNote,
  PracticeExercise,
} from '../../lib/lesson';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('dialogue');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
    }
  }, [lessonId]);

  const loadLesson = async (id: string) => {
    try {
      const data = await fetchLesson(id);
      setLesson(data);
      // Set first available section as active
      if (data.sections.length > 0) {
        setActiveSection(data.sections[0].type);
      }
    } catch (err) {
      setError('Failed to load lesson');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!lessonId) return;

    setIsCompleting(true);
    try {
      await completeLesson(lessonId, {
        xpEarned: 10,
        correctAnswers: 0,
        totalSteps: 0,
      });
      router.back();
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderSection = () => {
    if (!lesson) return null;
    const section = lesson.sections.find(s => s.type === activeSection);
    if (!section) return null;

    switch (section.type) {
      case 'dialogue':
        return <DialogueSection content={section.content as DialogueLine[]} />;
      case 'vocabulary':
        return <VocabularySection content={section.content as VocabularyItem[]} />;
      case 'grammar':
        return <GrammarSection content={section.content as GrammarNote[]} />;
      case 'practice':
        return <PracticeSection content={section.content as PracticeExercise[]} />;
    }
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

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sectionTypes = lesson.sections.map(s => s.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
          <Text style={styles.headerSubtitle}>{lesson.moduleTitle}</Text>
        </View>
        <TouchableOpacity
          style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={isCompleting}
        >
          <Check size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Section Tabs */}
      {sectionTypes.length > 0 && (
        <SectionTabs
          sections={sectionTypes}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06060b' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#ff7878', fontSize: 16, marginBottom: 16 },
  backLink: { padding: 12 },
  backLinkText: { color: '#f6d83b', fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerContent: { flex: 1, marginHorizontal: 8 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#f7f8fb' },
  headerSubtitle: { fontSize: 12, color: 'rgba(247,248,251,0.6)' },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6d83b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: { opacity: 0.5 },
  content: { flex: 1 },
});
