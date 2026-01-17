import { NextResponse } from 'next/server';
import grammarLessons from '@/data/grammar-lessons.json';

// Grammar lesson types matching the JSON structure
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

type GrammarResponse = {
  lessons: GrammarLesson[];
  meta: {
    total: number;
    byTier: { A1: number; A2: number; B1: number };
  };
};

/**
 * GET /api/mobile/grammar
 *
 * Returns grammar lessons data for mobile app.
 * Data is static, so caching is enabled.
 *
 * Response:
 * {
 *   lessons: GrammarLesson[],
 *   meta: { total, byTier: { A1, A2, B1 } }
 * }
 */
export async function GET() {
  const lessons = grammarLessons as GrammarLesson[];

  // Calculate tier breakdown
  const byTier = lessons.reduce(
    (acc, lesson) => {
      const tier = lesson.difficulty_level || 'A1';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    { A1: 0, A2: 0, B1: 0 } as { A1: number; A2: number; B1: number }
  );

  const response: GrammarResponse = {
    lessons,
    meta: {
      total: lessons.length,
      byTier,
    },
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
