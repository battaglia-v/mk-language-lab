/**
 * Exercise Adapter
 *
 * Converts existing grammar exercise types to LessonRunner step format.
 * Enables gradual migration of existing lessons to the new LessonRunner system.
 */

import type { Step, MultipleChoiceStep, FillBlankStep } from '../types';
import type { GrammarExercise, GrammarLesson } from '@/lib/grammar-engine';

/**
 * Convert a single grammar exercise to a LessonRunner step
 */
export function exerciseToStep(exercise: GrammarExercise, locale: 'en' | 'mk' = 'en'): Step {
  const instruction = locale === 'en' ? exercise.instructionEn : exercise.instructionMk;
  const explanation = locale === 'en' ? exercise.explanationEn : exercise.explanationMk;

  switch (exercise.type) {
    case 'multiple-choice': {
      const step: MultipleChoiceStep = {
        id: exercise.id,
        type: 'MULTIPLE_CHOICE',
        prompt: exercise.questionMk,
        choices: exercise.options,
        correctIndex: exercise.correctIndex,
        explanation,
      };
      return step;
    }

    case 'fill-blank': {
      const step: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: exercise.sentenceMk,
        correctAnswer: exercise.correctAnswers[0],
        acceptableAnswers: exercise.correctAnswers.slice(1),
        explanation,
        caseSensitive: false,
        placeholder: 'Type your answer...',
      };
      return step;
    }

    case 'sentence-builder':
    case 'error-correction':
      // TODO: These require custom step types or can be converted to fill-blank
      // For now, convert to fill-blank as a fallback
      const fallbackStep: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: instruction,
        correctAnswer: exercise.type === 'sentence-builder'
          ? (exercise as any).targetSentenceMk
          : (exercise as any).correctedWord,
        explanation,
        caseSensitive: false,
      };
      return fallbackStep;

    default:
      throw new Error(`Unknown exercise type: ${(exercise as any).type}`);
  }
}

/**
 * Convert a full grammar lesson to LessonRunner steps
 */
export function lessonToSteps(
  lesson: GrammarLesson,
  locale: 'en' | 'mk' = 'en'
): Step[] {
  return lesson.exercises.map((exercise) => exerciseToStep(exercise, locale));
}

/**
 * Create a difficulty mapping
 */
export function mapDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): 'beginner' | 'intermediate' | 'advanced' {
  return difficulty; // Direct mapping
}

/**
 * Calculate total XP for a lesson using the new XP system
 * This allows comparison with the old XP system
 */
export function calculateLessonXPFromExercises(
  exercises: GrammarExercise[]
): number {
  // New system: 10 XP per exercise
  const baseXP = exercises.length * 10;

  // Add perfect bonus if all exercises completed
  const perfectBonus = 10;

  return baseXP + perfectBonus;
}

/**
 * Map old Exercise type from Prisma to Step type
 * (For database-stored exercises)
 */
export function prismaExerciseToStep(exercise: {
  id: string;
  type: string;
  question: string;
  options: string; // JSON string
  correctAnswer: string;
  explanation?: string | null;
}): Step {
  switch (exercise.type) {
    case 'multiple_choice': {
      const options: string[] = JSON.parse(exercise.options);
      const correctIndex = options.indexOf(exercise.correctAnswer);

      const step: MultipleChoiceStep = {
        id: exercise.id,
        type: 'MULTIPLE_CHOICE',
        prompt: exercise.question,
        choices: options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: exercise.explanation || undefined,
      };
      return step;
    }

    case 'fill_blank': {
      const step: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: exercise.question,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation || undefined,
        caseSensitive: false,
      };
      return step;
    }

    case 'translation': {
      // Treat translation as fill-blank
      const step: FillBlankStep = {
        id: exercise.id,
        type: 'FILL_BLANK',
        prompt: exercise.question,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation || undefined,
        caseSensitive: false,
      };
      return step;
    }

    default:
      throw new Error(`Unknown Prisma exercise type: ${exercise.type}`);
  }
}

/**
 * Batch convert Prisma exercises to steps
 */
export function prismaExercisesToSteps(exercises: Array<{
  id: string;
  type: string;
  question: string;
  options: string;
  correctAnswer: string;
  explanation?: string | null;
}>): Step[] {
  return exercises.map(prismaExerciseToStep);
}
