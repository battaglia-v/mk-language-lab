import { apiFetch } from './api';

export type SectionType = 'dialogue' | 'vocabulary' | 'grammar' | 'practice';

export interface DialogueLine {
  speaker: string;
  text: string;
  translation?: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pos?: string;
  gender?: string;
}

export interface GrammarNote {
  title: string;
  explanation: string;
  examples?: string[];
}

export interface PracticeExercise {
  type: string;
  question: string;
  options?: string[];
  answer: string;
}

export interface LessonSection {
  type: SectionType;
  content: DialogueLine[] | VocabularyItem[] | GrammarNote[] | PracticeExercise[];
}

export interface Lesson {
  id: string;
  title: string;
  summary?: string;
  moduleTitle: string;
  journeyId: string;
  sections: LessonSection[];
}

export async function fetchLesson(lessonId: string): Promise<Lesson> {
  const response = await apiFetch<{ lesson: Lesson }>(`/api/mobile/lesson/${lessonId}`);
  return response.lesson;
}

export async function completeLesson(lessonId: string, data: {
  xpEarned: number;
  correctAnswers: number;
  totalSteps: number;
}): Promise<{ success: boolean; xpEarned: number }> {
  return apiFetch(`/api/mobile/lesson/${lessonId}/complete`, {
    method: 'POST',
    body: data,
  });
}
