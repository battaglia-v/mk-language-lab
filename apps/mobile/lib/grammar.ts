import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

// Storage key for grammar progress
const PROGRESS_KEY = '@mklanguage/grammar-progress';

// Grammar exercise types matching the API
export type GrammarExercise = {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'error-correction' | 'matching';
  instructionMk: string;
  instructionEn: string;
  questionMk?: string;
  questionEn?: string;
  sentenceMk?: string;
  translationEn?: string;
  sentenceWithErrorMk?: string;
  errorWord?: string;
  correctedWord?: string;
  errorPosition?: number;
  options?: string[];
  correctIndex?: number;
  correctAnswers?: string[];
  xp: number;
  hintMk?: string;
  hintEn?: string;
  explanationMk?: string;
  explanationEn?: string;
};

export type GrammarLesson = {
  id: string;
  title: string;
  titleMk: string;
  titleEn: string;
  descriptionMk: string;
  descriptionEn: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficulty_level: 'A1' | 'A2' | 'B1';
  tags: string[];
  totalXp: number;
  exercises: GrammarExercise[];
  grammar_notes?: string;
  grammarNote?: {
    titleMk: string;
    titleEn: string;
    contentMk: string;
    contentEn: string;
    examplesMk?: string[];
    examplesEn?: string[];
  };
};

export type LessonProgress = {
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt: string;
};

type GrammarResponse = {
  lessons: GrammarLesson[];
  meta: {
    total: number;
    byTier: { A1: number; A2: number; B1: number };
  };
};

// Cached lessons to avoid re-fetching
let cachedLessons: GrammarLesson[] | null = null;

/**
 * Fetch grammar lessons from the mobile API
 */
export async function fetchGrammarLessons(): Promise<GrammarLesson[]> {
  if (cachedLessons) {
    return cachedLessons;
  }

  const response = await apiFetch<GrammarResponse>('/api/mobile/grammar', {
    skipAuth: true,
  });

  cachedLessons = response.lessons;
  return response.lessons;
}

/**
 * Get a single grammar lesson by ID
 */
export async function getGrammarLesson(lessonId: string): Promise<GrammarLesson | null> {
  const lessons = await fetchGrammarLessons();
  return lessons.find((l) => l.id === lessonId) || null;
}

/**
 * Clear the lessons cache (useful after network changes)
 */
export function clearGrammarCache(): void {
  cachedLessons = null;
}

/**
 * Load grammar progress from AsyncStorage
 */
export async function loadGrammarProgress(): Promise<LessonProgress[]> {
  try {
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save lesson progress to AsyncStorage
 */
export async function saveGrammarProgress(
  lessonId: string,
  score: number
): Promise<void> {
  try {
    const existing = await loadGrammarProgress();
    const updated = [
      ...existing.filter((p) => p.lessonId !== lessonId),
      {
        lessonId,
        completed: true,
        score,
        completedAt: new Date().toISOString(),
      },
    ];
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[Grammar] Failed to save progress:', error);
  }
}

/**
 * Get progress for a specific lesson
 */
export async function getLessonProgress(
  lessonId: string
): Promise<LessonProgress | null> {
  const progress = await loadGrammarProgress();
  return progress.find((p) => p.lessonId === lessonId) || null;
}

/**
 * Get overall grammar completion stats
 */
export async function getGrammarStats(): Promise<{
  completed: number;
  total: number;
  percentage: number;
}> {
  const [lessons, progress] = await Promise.all([
    fetchGrammarLessons(),
    loadGrammarProgress(),
  ]);

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const completed = lessons.filter((l) => completedIds.has(l.id)).length;

  return {
    completed,
    total: lessons.length,
    percentage: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
  };
}

/**
 * Get difficulty level from lesson
 */
export function getDifficultyLevel(lesson: GrammarLesson): 'A1' | 'A2' | 'B1' {
  if (lesson.difficulty_level) return lesson.difficulty_level;

  switch (lesson.difficulty) {
    case 'beginner':
      return 'A1';
    case 'intermediate':
      return 'A2';
    default:
      return 'B1';
  }
}
