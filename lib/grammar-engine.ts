/**
 * Grammar Exercise Types and Interfaces
 *
 * Supports four exercise types:
 * 1. fill-blank: Fill in the missing word(s)
 * 2. multiple-choice: Choose the correct answer
 * 3. sentence-builder: Arrange words into correct order
 * 4. error-correction: Find and fix the mistake
 */

import {
  matchesAnyAnswer,
  answersMatch,
  analyzeAnswer,
  type AnswerAnalysis,
} from './unicode-normalize';

/** Base exercise interface */
interface BaseExercise {
  id: string;
  type: ExerciseType;
  /** Macedonian instruction */
  instructionMk: string;
  /** English instruction */
  instructionEn: string;
  /** XP reward for correct answer */
  xp: number;
  /** Hint shown after first wrong attempt */
  hintMk?: string;
  hintEn?: string;
  /** Grammar rule explanation shown after completion */
  explanationMk?: string;
  explanationEn?: string;
}

export type ExerciseType = 'fill-blank' | 'multiple-choice' | 'sentence-builder' | 'error-correction';

/** Fill-in-the-blank exercise */
export interface FillBlankExercise extends BaseExercise {
  type: 'fill-blank';
  /** Sentence with ___ for the blank */
  sentenceMk: string;
  /** English translation of the full sentence */
  translationEn: string;
  /** Correct answer(s) - array allows alternatives */
  correctAnswers: string[];
  /** Optional word bank (if provided, user picks from list) */
  wordBank?: string[];
}

/** Multiple choice exercise */
export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  /** Question or sentence */
  questionMk: string;
  questionEn?: string;
  /** Answer options */
  options: string[];
  /** Index of correct option (0-based) */
  correctIndex: number;
}

/** Sentence builder - arrange words */
export interface SentenceBuilderExercise extends BaseExercise {
  type: 'sentence-builder';
  /** Target sentence (used for validation) */
  targetSentenceMk: string;
  /** English translation */
  translationEn: string;
  /** Words to arrange (shuffled) */
  words: string[];
  /** Alternative correct orderings (if grammar allows flexibility) */
  alternativeOrders?: string[][];
}

/** Error correction exercise */
export interface ErrorCorrectionExercise extends BaseExercise {
  type: 'error-correction';
  /** Sentence with an error */
  sentenceWithErrorMk: string;
  /** English translation of corrected sentence */
  translationEn: string;
  /** The wrong word/phrase */
  errorWord: string;
  /** The correct word/phrase */
  correctedWord: string;
  /** Position of error (word index, 0-based) */
  errorPosition: number;
}

export type GrammarExercise = 
  | FillBlankExercise 
  | MultipleChoiceExercise 
  | SentenceBuilderExercise 
  | ErrorCorrectionExercise;

/** Grammar lesson containing multiple exercises */
export interface GrammarLesson {
  id: string;
  /** Lesson title */
  titleMk: string;
  titleEn: string;
  /** Brief description */
  descriptionMk: string;
  descriptionEn: string;
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Grammar topic tags */
  tags: string[];
  /** Total XP for completing all exercises */
  totalXp: number;
  /** Exercises in order */
  exercises: GrammarExercise[];
  /** Grammar notes to show before exercises */
  grammarNote?: {
    titleMk: string;
    titleEn: string;
    contentMk: string;
    contentEn: string;
    examplesMk: string[];
    examplesEn: string[];
  };
}

/** Result of a single exercise attempt */
export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  attempts: number;
  timeSpentMs: number;
  userAnswer: string | string[];
  skipped: boolean;
}

/** Result of completing a lesson */
export interface LessonResult {
  lessonId: string;
  totalExercises: number;
  correctExercises: number;
  skippedExercises: number;
  totalXpEarned: number;
  totalTimeMs: number;
  exerciseResults: ExerciseResult[];
  completedAt: Date;
}

/**
 * Validates user answer against exercise using Unicode-aware comparison
 */
export function validateAnswer(
  exercise: GrammarExercise,
  userAnswer: string | string[]
): boolean {
  switch (exercise.type) {
    case 'fill-blank': {
      const answer = typeof userAnswer === 'string' ? userAnswer.trim() : '';
      // Use Unicode-normalized matching for fill-in-blank
      return matchesAnyAnswer(answer, exercise.correctAnswers);
    }

    case 'multiple-choice': {
      const selectedIndex = typeof userAnswer === 'string' ? parseInt(userAnswer, 10) : -1;
      return selectedIndex === exercise.correctIndex;
    }

    case 'sentence-builder': {
      const words = Array.isArray(userAnswer) ? userAnswer : [];
      const targetWords = exercise.targetSentenceMk.split(' ');

      // Check main target with Unicode normalization
      if (
        words.length === targetWords.length &&
        words.every((w, i) => answersMatch(w, targetWords[i]))
      ) {
        return true;
      }

      // Check alternatives
      if (exercise.alternativeOrders) {
        return exercise.alternativeOrders.some(
          (alt) =>
            words.length === alt.length &&
            words.every((w, i) => answersMatch(w, alt[i]))
        );
      }

      return false;
    }

    case 'error-correction': {
      const answer = typeof userAnswer === 'string' ? userAnswer.trim() : '';
      // Use Unicode-normalized matching for error correction
      return answersMatch(answer, exercise.correctedWord);
    }

    default:
      return false;
  }
}

/**
 * Validates answer and returns detailed analysis with feedback hints
 */
export function validateAnswerWithFeedback(
  exercise: GrammarExercise,
  userAnswer: string | string[]
): { isCorrect: boolean; analysis?: AnswerAnalysis } {
  const isCorrect = validateAnswer(exercise, userAnswer);

  if (isCorrect) {
    return { isCorrect: true };
  }

  // Provide detailed feedback for incorrect answers
  if (exercise.type === 'fill-blank' && typeof userAnswer === 'string') {
    // Analyze against the first correct answer for feedback
    const analysis = analyzeAnswer(userAnswer.trim(), exercise.correctAnswers[0]);
    return { isCorrect: false, analysis };
  }

  if (exercise.type === 'error-correction' && typeof userAnswer === 'string') {
    const analysis = analyzeAnswer(userAnswer.trim(), exercise.correctedWord);
    return { isCorrect: false, analysis };
  }

  return { isCorrect: false };
}

/**
 * Calculates XP earned based on attempts
 */
export function calculateXP(baseXP: number, attempts: number): number {
  if (attempts === 1) return baseXP;
  if (attempts === 2) return Math.floor(baseXP * 0.7);
  if (attempts === 3) return Math.floor(baseXP * 0.5);
  return Math.floor(baseXP * 0.25); // 4+ attempts
}

/**
 * Shuffles an array (for sentence builder words)
 */
export function shuffleWords<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
