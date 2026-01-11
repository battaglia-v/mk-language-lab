'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Sparkles,
  Dumbbell,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Target,
  Home,
  List,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useVocabulary } from '@/components/practice/useVocabulary';
import { useToast } from '@/components/ui/use-toast';

// Import new enhanced components
import { DialogueViewer } from './DialogueViewer';
import { EnhancedVocabularyCard } from './EnhancedVocabularyCard';
import { ConjugationTable } from './ConjugationTable';
import GrammarSection from './GrammarSection';
import ExerciseSection from './ExerciseSection';

// ============================================================================
// Vocabulary Filtering
// ============================================================================

// Common country names to exclude from vocabulary
const COUNTRY_NAMES = new Set([
  'македонија', 'германија', 'франција', 'италија', 'шпанија',
  'англија', 'русија', 'кина', 'јапонија', 'америка', 'австралија',
  'бразил', 'мексико', 'канада', 'ирска', 'грција', 'турција',
  'србија', 'хрватска', 'бугарија', 'албанија', 'словенија',
]);

// Common Macedonian names to exclude from vocabulary
const COMMON_NAMES = new Set([
  'ана', 'марко', 'петар', 'ива', 'маја', 'сара', 'лука', 'ема',
  'влатко', 'андреј', 'весна', 'марија', 'ивана', 'ѓорѓи', 'новак', 'томислав',
]);

/**
 * Filter vocabulary items to remove proper nouns (names, countries)
 * that aren't useful as learnable vocabulary
 */
function filterVocabularyForDisplay(items: VocabularyItem[]): VocabularyItem[] {
  return items.filter(item => {
    const mkLower = (item.macedonianText?.trim() || '').toLowerCase();
    const enLower = (item.englishText?.trim() || '').toLowerCase();

    // Skip items with partOfSpeech === "proper noun"
    if (item.partOfSpeech?.toLowerCase() === 'proper noun') return false;

    // Skip items where englishText contains "(name)"
    if (enLower.includes('(name)')) return false;

    // Skip common Macedonian names
    if (COMMON_NAMES.has(mkLower)) return false;

    // Skip country names
    if (COUNTRY_NAMES.has(mkLower)) return false;

    return true;
  });
}

// ============================================================================
// Types
// ============================================================================

interface DialogueLine {
  id: string;
  speaker?: string;
  textMk: string;
  textEn: string;
  transliteration?: string;
  hasBlanks: boolean;
  blanksData?: Array<{
    position: number;
    answer: string;
    hint?: string;
  }>;
}

interface Dialogue {
  id: string;
  title?: string;
  lines: DialogueLine[];
}

interface VocabularyItem {
  id: string;
  macedonianText: string;
  englishText: string;
  transliteration?: string | null;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  gender?: string | null;
  category?: string | null;
  exampleSentenceMk?: string | null;
  exampleSentenceEn?: string | null;
  imageUrl?: string | null;
  isCore?: boolean;
}

interface GrammarNote {
  id: string;
  title: string;
  explanation: string;
  examples: string;
  category?: string | null;
  relatedVerb?: string | null;
  conjugationTable?: {
    verb: string;
    verbEn?: string;
    tense?: string;
    rows: Array<{
      person: string;
      pronoun: string;
      conjugation: string;
      transliteration?: string;
    }>;
  };
}

interface Exercise {
  id: string;
  type: string;
  question: string;
  options: string;
  correctAnswer: string;
  explanation: string | null;
}

interface LessonData {
  id: string;
  title: string;
  summary?: string | null;
  estimatedMinutes?: number;
  difficultyLevel?: string;
  dialogues?: Dialogue[];
  vocabularyItems: VocabularyItem[];
  grammarNotes: GrammarNote[];
  exercises: Exercise[];
  module: { title: string };
}

interface LessonPageContentV2Props {
  lesson: LessonData;
  userProgress: { progress?: number } | null;
  nextLesson: { id: string; title: string } | null;
  userId?: string;
}

// Section configuration
interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  hasContent: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * LessonPageContentV2 - Guided step-by-step lesson experience
 * 
 * Replaces the accordion-based layout with a focused, one-section-at-a-time flow.
 * 
 * Features:
 * - Clear progress indicator at top
 * - One section visible at a time (no jumping around)
 * - Smooth transitions between sections
 * - Mobile-first design with floating continue button
 * - Integration with new enhanced components
 */
export default function LessonPageContentV2({
  lesson,
  userProgress,
  nextLesson,
  userId,
}: LessonPageContentV2Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('learn');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [vocabSortMode, setVocabSortMode] = useState<'category' | 'alphabetical' | 'partOfSpeech'>('category');

  // Vocabulary hook for save-to-glossary functionality
  const { vocabulary, saveWord } = useVocabulary();

  // Handler to save a word to the user's review deck
  const handleSaveWord = useCallback(
    async (word: { mk: string; en: string }) => {
      if (!session?.user?.id) {
        addToast({ title: 'Sign in to save words', type: 'error' });
        return;
      }
      try {
        await saveWord({
          wordMk: word.mk,
          wordEn: word.en,
          source: 'manual',
        });
        addToast({ title: 'Word saved to review deck', type: 'success' });
      } catch {
        addToast({ title: 'Failed to save word', type: 'error' });
      }
    },
    [session?.user?.id, saveWord, addToast]
  );

  // Check if a vocabulary item is already in the review deck
  const isWordInReviewDeck = useCallback(
    (mk: string) => {
      return vocabulary.some((w) => w.wordMk === mk);
    },
    [vocabulary]
  );

  // Build sections list based on available content
  const sections = useMemo<Section[]>(() => {
    const sectionList: Section[] = [];

    // Dialogues (new section type)
    if (lesson.dialogues && lesson.dialogues.length > 0) {
      sectionList.push({
        id: 'dialogue',
        title: 'Dialogue',
        icon: <MessageSquare className="h-4 w-4" />,
        hasContent: true,
      });
    }

    // Vocabulary
    if (lesson.vocabularyItems.length > 0) {
      sectionList.push({
        id: 'vocabulary',
        title: 'Vocabulary',
        icon: <BookOpen className="h-4 w-4" />,
        hasContent: true,
      });
    }

    // Grammar
    if (lesson.grammarNotes.length > 0) {
      sectionList.push({
        id: 'grammar',
        title: 'Grammar',
        icon: <GraduationCap className="h-4 w-4" />,
        hasContent: true,
      });
    }

    // Practice/Exercises
    if (lesson.exercises.length > 0) {
      sectionList.push({
        id: 'practice',
        title: 'Practice',
        icon: <Target className="h-4 w-4" />,
        hasContent: true,
      });
    }

    return sectionList;
  }, [lesson]);

  const currentSection = sections[currentSectionIndex];
  const progress = sections.length > 0
    ? ((currentSectionIndex + (completedSections.has(currentSection?.id) ? 1 : 0)) / sections.length) * 100
    : 0;
  const isComplete = completedSections.size === sections.length;
  const isLastSection = currentSectionIndex === sections.length - 1;
  // Track if lesson was previously completed to allow free navigation
  // Also allow free navigation for unauthenticated users (they can't save progress anyway)
  const wasPreviouslyCompleted = userProgress?.progress === 100 || !userId;

  // Load saved progress
  useEffect(() => {
    if (userProgress?.progress === 100) {
      setCompletedSections(new Set(sections.map(s => s.id)));
      setCurrentSectionIndex(sections.length - 1);
    }
  }, [userProgress, sections]);

  // Save progress to API
  const saveProgress = useCallback(async (newProgress: number, status: string) => {
    if (!userId) return;

    try {
      await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          status,
          progress: newProgress,
          timeSpent: Math.floor((Date.now() - startTime) / 60000),
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [userId, lesson.id, startTime]);

  // Handle continuing to next section
  const handleContinue = useCallback(async () => {
    if (isTransitioning || !currentSection) return;

    // Mark current section as complete
    const newCompleted = new Set(completedSections);
    newCompleted.add(currentSection.id);
    setCompletedSections(newCompleted);

    // Calculate new progress
    const newProgress = (newCompleted.size / sections.length) * 100;

    // Save progress
    await saveProgress(newProgress, newProgress === 100 ? 'completed' : 'in_progress');

    // Transition to next section
    if (currentSectionIndex < sections.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setIsTransitioning(false);
        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  }, [isTransitioning, currentSection, completedSections, sections.length, saveProgress, currentSectionIndex]);

  // Handle going back to previous section
  const handleBack = useCallback(() => {
    if (currentSectionIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSectionIndex(currentSectionIndex - 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSectionIndex, isTransitioning]);

  // Handle lesson completion
  const handleCompleteLesson = useCallback(async () => {
    await saveProgress(100, 'completed');

    if (nextLesson) {
      router.push(`/${locale}/lesson/${nextLesson.id}`);
    } else {
      router.push(`/${locale}/learn`);
    }
  }, [saveProgress, nextLesson, router, locale]);

  // Group vocabulary by category/alphabet/part-of-speech with smart limits
  const groupedVocabulary = useMemo(() => {
    // Filter out proper nouns (names, countries) before grouping
    const filteredItems = filterVocabularyForDisplay(lesson.vocabularyItems);
    const coreItems = filteredItems.filter(item => item.isCore !== false);
    const MIN_CORE_ITEMS = 12;
    const displayItems = coreItems.length >= MIN_CORE_ITEMS ? coreItems : filteredItems;

    // Limit vocabulary display for better UX
    const MAX_UNCATEGORIZED = 20;
    const MAX_PER_CATEGORY = 15;

    // Alphabetical sorting mode
    if (vocabSortMode === 'alphabetical') {
      const alphabetGroups: Record<string, VocabularyItem[]> = {};
      displayItems.forEach(item => {
        const firstLetter = item.macedonianText.charAt(0).toUpperCase();
        if (!alphabetGroups[firstLetter]) {
          alphabetGroups[firstLetter] = [];
        }
        if (alphabetGroups[firstLetter].length < MAX_PER_CATEGORY) {
          alphabetGroups[firstLetter].push(item);
        }
      });
      return {
        groups: alphabetGroups,
        uncategorized: [],
        totalCount: filteredItems.length,
        coreCount: coreItems.length,
        sortMode: 'alphabetical' as const,
      };
    }

    // Part of speech sorting mode
    if (vocabSortMode === 'partOfSpeech') {
      const posGroups: Record<string, VocabularyItem[]> = {};
      const noPos: VocabularyItem[] = [];
      displayItems.forEach(item => {
        if (item.partOfSpeech) {
          const pos = item.partOfSpeech.toLowerCase();
          if (!posGroups[pos]) posGroups[pos] = [];
          if (posGroups[pos].length < MAX_PER_CATEGORY) {
            posGroups[pos].push(item);
          }
        } else {
          if (noPos.length < MAX_UNCATEGORIZED) {
            noPos.push(item);
          }
        }
      });
      return {
        groups: posGroups,
        uncategorized: noPos,
        totalCount: filteredItems.length,
        coreCount: coreItems.length,
        sortMode: 'partOfSpeech' as const,
      };
    }

    // Default: category grouping
    const groups: Record<string, VocabularyItem[]> = {};
    const uncategorized: VocabularyItem[] = [];

    displayItems.forEach(item => {
      if (item.category) {
        if (!groups[item.category]) {
          groups[item.category] = [];
        }
        if (groups[item.category].length < MAX_PER_CATEGORY) {
          groups[item.category].push(item);
        }
      } else {
        if (uncategorized.length < MAX_UNCATEGORIZED) {
          uncategorized.push(item);
        }
      }
    });

    // If no categories, fall back to alphabetical grouping
    if (Object.keys(groups).length === 0 && uncategorized.length > 0) {
      const alphabetGroups: Record<string, VocabularyItem[]> = {};
      displayItems.slice(0, 30).forEach(item => {
        const firstLetter = item.macedonianText.charAt(0).toUpperCase();
        if (!alphabetGroups[firstLetter]) {
          alphabetGroups[firstLetter] = [];
        }
        alphabetGroups[firstLetter].push(item);
      });
      return {
        groups: alphabetGroups,
        uncategorized: [],
        totalCount: filteredItems.length,
        coreCount: coreItems.length,
        sortMode: 'alphabetical' as const,
      };
    }

    return {
      groups,
      uncategorized,
      totalCount: filteredItems.length,
      coreCount: coreItems.length,
      sortMode: 'category' as const,
    };
  }, [lesson.vocabularyItems, vocabSortMode]);

  // Render section content
  const renderSectionContent = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'dialogue':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Read & Practice</h3>
              <p className="text-muted-foreground">
                Read through the dialogue. Toggle translation to check your understanding.
              </p>
            </div>

            {lesson.dialogues?.map((dialogue) => (
              <DialogueViewer
                key={dialogue.id}
                dialogue={dialogue}
                mode="view"
                showTranslation={true}
                showTransliteration={true}
              />
            ))}
          </div>
        );

      case 'vocabulary':
        const displayedCount = Object.values(groupedVocabulary.groups).flat().length + groupedVocabulary.uncategorized.length;
        const hasMore = groupedVocabulary.totalCount > displayedCount;

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vocabulary</h3>
                <span className="text-sm text-muted-foreground">
                    {(groupedVocabulary.coreCount || groupedVocabulary.totalCount)} words
                </span>
              </div>
              {/* Sort toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-0.5 w-fit">
                <Button
                  variant={vocabSortMode === 'category' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setVocabSortMode('category')}
                >
                  {t('vocabulary.sortCategory')}
                </Button>
                <Button
                  variant={vocabSortMode === 'alphabetical' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setVocabSortMode('alphabetical')}
                >
                  A-Ш
                </Button>
                <Button
                  variant={vocabSortMode === 'partOfSpeech' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setVocabSortMode('partOfSpeech')}
                >
                  {t('vocabulary.sortPos')}
                </Button>
              </div>
              <p className="text-muted-foreground">
                {groupedVocabulary.sortMode === 'alphabetical'
                  ? 'Key words organized alphabetically. Tap a card to see details.'
                  : groupedVocabulary.sortMode === 'partOfSpeech'
                  ? 'Key words organized by type (noun, verb, etc.). Tap a card to see details.'
                  : 'Learn these key words and phrases. Tap a card to see the example sentence.'}
              </p>
            </div>

            {/* Categorized/Grouped vocabulary */}
            {Object.entries(groupedVocabulary.groups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <span className="h-px flex-1 bg-primary/20" />
                    {category}
                    <span className="h-px flex-1 bg-primary/20" />
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((item, index) => (
                      <div key={item.id} data-testid="lesson-vocabulary-card">
                        <EnhancedVocabularyCard
                          item={item}
                          mode="compact"
                          showTranslation={true}
                          showTransliteration={true}
                          animationDelay={Math.min(index * 30, 300)}
                          onAddToReview={() =>
                            handleSaveWord({ mk: item.macedonianText, en: item.englishText })
                          }
                          isInReviewDeck={isWordInReviewDeck(item.macedonianText)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* Uncategorized vocabulary */}
            {groupedVocabulary.uncategorized.length > 0 && (
              <div className="space-y-3">
                {Object.keys(groupedVocabulary.groups).length > 0 && (
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <span className="h-px flex-1 bg-muted" />
                    Other Words
                    <span className="h-px flex-1 bg-muted" />
                  </h4>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {groupedVocabulary.uncategorized.map((item, index) => (
                    <div key={item.id} data-testid="lesson-vocabulary-card">
                      <EnhancedVocabularyCard
                        item={item}
                        mode="compact"
                        showTranslation={true}
                        showTransliteration={true}
                        animationDelay={Math.min(index * 30, 300)}
                        onAddToReview={() =>
                          handleSaveWord({ mk: item.macedonianText, en: item.englishText })
                        }
                        isInReviewDeck={isWordInReviewDeck(item.macedonianText)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick practice action */}
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('vocabulary.readyToPractice')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('vocabulary.practiceDescription', { count: groupedVocabulary.totalCount })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/${locale}/practice/session?deck=lesson-${lesson.id}&mode=flashcard`)}
                  className="shrink-0"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  {t('vocabulary.practiceNow')}
                </Button>
              </div>
            </Card>

            {/* Show more indicator */}
            {hasMore && (
              <Card className="p-4 bg-muted/30 border-dashed text-center">
                <p className="text-sm text-muted-foreground">
                  + {groupedVocabulary.totalCount - displayedCount} more words available in Practice mode
                </p>
                <Button
                  variant="link"
                  className="mt-1 text-primary"
                  onClick={() => router.push(`/${locale}/practice/session?deck=lesson-${lesson.id}&mode=flashcard`)}
                >
                  <Dumbbell className="h-4 w-4 mr-1" />
                  Practice All Vocabulary
                </Button>
              </Card>
            )}
          </div>
        );

      case 'grammar':
        // Separate notes with conjugation tables from standard notes
        const notesWithTables = lesson.grammarNotes.filter(
          (n): n is GrammarNote & { conjugationTable: NonNullable<GrammarNote['conjugationTable']> } =>
            n.conjugationTable != null
        );
        const standardNotes = lesson.grammarNotes.filter(n => !n.conjugationTable);

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Grammar</h3>
              <p className="text-muted-foreground">
                Identify patterns and rules when reviewing the examples to deepen
                your learning.
              </p>
            </div>

            {/* Render conjugation tables for notes that have them */}
            {notesWithTables.map((note) => (
              <div key={note.id} className="space-y-4">
                <ConjugationTable
                  verb={note.conjugationTable.verb}
                  verbEn={note.conjugationTable.verbEn}
                  tense={note.conjugationTable.tense}
                  rows={note.conjugationTable.rows}
                  showTransliteration={true}
                />
              </div>
            ))}

            {/* Render standard grammar notes (without conjugation tables) */}
            {standardNotes.length > 0 && (
              <GrammarSection notes={standardNotes as never[]} />
            )}
          </div>
        );

      case 'practice':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Practice</h3>
              <p className="text-muted-foreground">
                Test your knowledge with these exercises. Take your time!
              </p>
            </div>

            <ExerciseSection exercises={lesson.exercises as never[]} />
          </div>
        );

      default:
        return null;
    }
  };

  // Completion screen
  if (isComplete && completedSections.has(sections[sections.length - 1]?.id)) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6" data-testid="lesson-completion-screen">
        <Card className="p-8 sm:p-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
              <Sparkles className="h-12 w-12 text-green-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold">
                {t('lessonComplete.title')} 🎉
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('lessonComplete.subtitle')}: <strong>{lesson.title}</strong>
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{lesson.vocabularyItems.length}</p>
                <p className="text-sm text-muted-foreground">{t('lessonComplete.vocabularyLearned', { count: lesson.vocabularyItems.length })}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{lesson.grammarNotes.length}</p>
                <p className="text-sm text-muted-foreground">{t('lessonComplete.grammarCovered', { count: lesson.grammarNotes.length })}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {lesson.vocabularyItems.length > 0 && (
                <Button
                  size="lg"
                  onClick={() => router.push(`/${locale}/practice/session?deck=lesson-review&mode=multiple-choice`)}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Dumbbell className="h-4 w-4" />
                  {t('lessonComplete.practiceNow')}
                </Button>
              )}

              {nextLesson ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCompleteLesson}
                  className="gap-2"
                >
                  {t('lessonComplete.continueNext')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/${locale}/learn`)}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  {t('lessonComplete.backToLessons')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-44 lg:pb-8">
      {/* Fixed Header with Progress */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4">
          {/* Back to Lessons link */}
          <div className="mb-2">
            <Link
              href={`/${locale}/learn`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <List className="h-3.5 w-3.5" />
              <span>All Lessons</span>
            </Link>
          </div>

          {/* Module & Lesson Title */}
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{lesson.module.title}</p>
              <h1 className="text-lg font-bold truncate">{lesson.title}</h1>
            </div>

            {/* Metadata badges */}
            <div className="flex items-center gap-2 ml-4">
              {lesson.estimatedMinutes && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedMinutes}m
                </div>
              )}
              {lesson.difficultyLevel && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span className="capitalize">{lesson.difficultyLevel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" data-testid="lesson-progress-indicator" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Step {currentSectionIndex + 1} of {sections.length}
              </span>
              <span>{currentSection?.title}</span>
            </div>
          </div>

          {/* Section stepper (mobile only - desktop has tabs) */}
          <div className="flex items-center justify-center gap-2 mt-3 lg:hidden" data-testid="lesson-section-stepper">
            {sections.map((section, index) => {
              const isCompleted = completedSections.has(section.id);
              const isCurrent = index === currentSectionIndex;
              const isPast = index < currentSectionIndex;
              // Allow navigation if: lesson was previously completed, or navigating to past/current section, or section is completed
              const canNavigate = true;

              return (
                <div key={section.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (canNavigate) {
                        setCurrentSectionIndex(index);
                      }
                    }}
                    disabled={!canNavigate}
                    data-testid={`lesson-section-tab-${section.id}`}
                    className={cn(
                      'flex items-center justify-center rounded-full transition-all duration-200',
                      // Size: current is larger
                      isCurrent ? 'h-8 w-8' : 'h-6 w-6',
                      // Colors
                      isCompleted && 'bg-green-500 text-white',
                      isCurrent && !isCompleted && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                      isPast && !isCompleted && 'bg-muted text-muted-foreground',
                      !isCurrent && !isCompleted && !isPast && 'bg-muted/50 text-muted-foreground/50',
                      // Interactive - enabled when can navigate
                      canNavigate && 'hover:scale-110 cursor-pointer',
                      !canNavigate && 'cursor-not-allowed'
                    )}
                    aria-label={`${section.title} - ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </button>
                  {/* Connector line */}
                  {index < sections.length - 1 && (
                    <div className={cn(
                      'h-0.5 w-4 rounded-full transition-colors',
                      isCompleted || isPast ? 'bg-green-500/50' : 'bg-muted'
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Section tabs (desktop) */}
          <div className="hidden lg:flex items-center gap-1 mt-4 overflow-x-auto" data-testid="lesson-section-stepper-desktop">
            {sections.map((section, index) => {
              const isCompleted = completedSections.has(section.id);
              const isCurrent = index === currentSectionIndex;
              // Allow navigation if: lesson was previously completed, or navigating to past/current section, or section is completed
              const canNavigate = true;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    if (canNavigate) {
                      setCurrentSectionIndex(index);
                    }
                  }}
                  disabled={!canNavigate}
                  data-testid={`lesson-section-tab-${section.id}-desktop`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted && !isCurrent && 'bg-green-500/10 text-green-600',
                    canNavigate && !isCurrent && !isCompleted && 'hover:bg-muted',
                    !canNavigate && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    section.icon
                  )}
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={cn(
          'p-4 md:p-6 transition-opacity duration-150',
          isTransitioning && 'opacity-50'
        )}
        data-testid="lesson-section-content"
      >
        {renderSectionContent()}
      </div>

      {/* Floating Navigation (mobile) - sits above bottom nav */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 lg:hidden z-30">
        {/* Gradient background for smooth transition */}
        <div className="bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4">
          <div className="px-4">
            <div className="flex gap-3">
              {currentSectionIndex > 0 && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBack}
                  className="h-14 px-4 shrink-0 gap-1"
                  aria-label="Go back to previous section"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm">{tCommon('back')}</span>
                </Button>
              )}

              <Button
                onClick={isLastSection ? handleCompleteLesson : handleContinue}
                size="lg"
                className="flex-1 h-14 text-base font-semibold shadow-xl gap-2"
                data-testid="lesson-continue-btn"
              >
                {isLastSection ? (
                  <>
                    Complete Lesson
                    <CheckCircle className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center justify-between p-4 md:p-6 border-t mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentSectionIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={isLastSection ? handleCompleteLesson : handleContinue}
          className="gap-2"
          data-testid="lesson-continue-btn-desktop"
        >
          {isLastSection ? (
            <>
              Complete Lesson
              <CheckCircle className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
