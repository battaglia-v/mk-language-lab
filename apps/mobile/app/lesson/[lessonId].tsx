import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Check, AlertCircle, BookOpen, Sparkles, ArrowRight } from 'lucide-react-native';
import { LessonShell } from '../../components/shell/LessonShell';
import { SectionTabs } from '../../components/lesson/SectionTabs';
import { DialogueSection } from '../../components/lesson/DialogueSection';
import { VocabularySection } from '../../components/lesson/VocabularySection';
import { GrammarSection } from '../../components/lesson/GrammarSection';
import { PracticeSection } from '../../components/lesson/PracticeSection';
import { useLevelUp } from '../../components/LevelUpCelebration';
import { haptic } from '../../lib/haptics';
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
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const { showLevelUp } = useLevelUp();

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
      const result = await completeLesson(lessonId, {
        xpEarned: 10,
        correctAnswers: 0,
        totalSteps: 0,
      });
      
      // Trigger success haptic
      haptic.success();
      
      // Set earned XP for celebration
      setEarnedXP(result.xpEarned || 10);
      setShowCompletionCelebration(true);
      
      // Check for level up (API may return levelUp data)
      if (result && (result as any).levelUp) {
        const levelData = (result as any).levelUp;
        showLevelUp({
          newLevel: levelData.newLevel,
          xpEarned: result.xpEarned || 10,
          nextLevelXP: levelData.nextLevelXP,
          previousLevel: levelData.previousLevel,
        });
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      haptic.error();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleContinue = () => {
    haptic.medium();
    router.back();
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

  // Show lesson completion celebration
  if (showCompletionCelebration) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.celebrationContainer}>
          <View style={styles.celebrationIcon}>
            <Sparkles size={48} color="#f6d83b" />
          </View>
          <Text style={styles.celebrationTitle}>Lesson Complete!</Text>
          <Text style={styles.celebrationSubtitle}>
            {lesson?.title || 'Great work!'}
          </Text>
          
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{earnedXP} XP</Text>
          </View>
          
          <View style={styles.celebrationStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lesson?.sections.length || 0}</Text>
              <Text style={styles.statLabel}>Sections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue Learning</Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.errorIconContainer}>
            <AlertCircle size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Something Went Wrong</Text>
          <Text style={styles.errorText}>
            {error || 'We couldn\'t find this lesson. It may have been moved or removed.'}
          </Text>
          <TouchableOpacity 
            style={styles.errorButton} 
            onPress={() => {
              haptic.light();
              router.back();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back to previous screen"
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.errorLink} 
            onPress={() => {
              haptic.light();
              router.replace('/(tabs)/learn');
            }}
            accessibilityRole="link"
            accessibilityLabel="Browse all lessons"
          >
            <Text style={styles.errorLinkText}>Browse all lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handle lessons with no content
  if (lesson.sections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <BookOpen size={48} color="#3b82f6" />
          </View>
          <Text style={styles.emptyTitle}>Coming Soon</Text>
          <Text style={styles.emptyText}>
            This lesson content is still being prepared. Check back soon!
          </Text>
          <TouchableOpacity 
            style={styles.emptyPrimaryButton} 
            onPress={() => {
              haptic.light();
              router.back();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyPrimaryButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.emptySecondaryButton} 
            onPress={() => {
              haptic.light();
              router.replace('/(tabs)/learn');
            }}
          >
            <Text style={styles.emptySecondaryButtonText}>Browse All Lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sectionTypes = lesson.sections.map(s => s.type);
  const currentSectionIndex = sectionTypes.indexOf(activeSection) + 1;
  const totalSections = sectionTypes.length;
  const progress = (currentSectionIndex / totalSections) * 100;

  // Footer with complete button
  const footer = (
    <TouchableOpacity
      style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
      onPress={handleComplete}
      disabled={isCompleting}
    >
      {isCompleting ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <>
          <Check size={20} color="#000" />
          <Text style={styles.completeButtonText}>Complete Lesson</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <LessonShell
      progress={progress}
      current={currentSectionIndex}
      total={totalSections}
      xp={10}
      closeHref="/(tabs)/learn"
      footer={footer}
    >
      {/* Lesson Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonSubtitle}>{lesson.moduleTitle}</Text>
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
    </LessonShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06060b' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 32,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  errorText: { 
    color: 'rgba(247,248,251,0.6)', 
    fontSize: 15, 
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  errorButton: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  errorLink: { padding: 12 },
  errorLinkText: { color: '#f6d83b', fontSize: 14 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(247,248,251,0.6)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyPrimaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  emptyPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySecondaryButton: {
    padding: 12,
  },
  emptySecondaryButtonText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  backLink: { padding: 12 },
  backLinkText: { color: '#f6d83b', fontSize: 16 },
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
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeButtonDisabled: { opacity: 0.5 },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  content: { flex: 1 },
  // Celebration styles
  celebrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  celebrationIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  xpBadge: {
    backgroundColor: 'rgba(246,216,59,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f6d83b',
    marginBottom: 32,
  },
  xpBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f6d83b',
  },
  celebrationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#222536',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 200,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
});
