/**
 * Unified Validator for LessonRunner
 *
 * Wraps unicode-normalize.ts functionality with a clean API for LessonRunner.
 * Provides flexible answer comparison and Macedonian-specific feedback hints.
 */

import {
  answersMatch,
  matchesAnyAnswer,
  analyzeAnswer,
  getFeedbackMessage,
  AnswerAnalysis,
} from '../unicode-normalize';

// Re-export types for convenience
export type { AnswerAnalysis } from '../unicode-normalize';

/**
 * Options for validation behavior
 */
export interface ValidationOptions {
  /** Use case-sensitive matching (default: false) */
  caseSensitive?: boolean;
  /** Use strict diacritic matching (default: false for flexible matching) */
  strict?: boolean;
}

/**
 * Result of unified validation
 */
export interface UnifiedValidationResult {
  /** Whether the answer is correct */
  isCorrect: boolean;
  /** Detailed analysis of the answer (when incorrect) */
  analysis?: AnswerAnalysis;
  /** Localized feedback hint for the UI */
  feedbackHint?: string;
}

/**
 * Validate a text answer against a correct answer
 *
 * Uses Unicode normalization for flexible comparison and provides
 * Macedonian-specific feedback hints when incorrect.
 *
 * @param userAnswer - The answer provided by the user
 * @param correctAnswer - The expected correct answer
 * @param options - Validation options
 * @returns Validation result with correctness, analysis, and feedback hint
 */
export function validateTextAnswer(
  userAnswer: string,
  correctAnswer: string,
  options: ValidationOptions = {}
): UnifiedValidationResult {
  const { strict = false } = options;

  // Use answersMatch for flexible Unicode-normalized comparison
  const isCorrect = answersMatch(userAnswer, correctAnswer, strict);

  if (isCorrect) {
    return { isCorrect: true };
  }

  // Analyze the incorrect answer for feedback
  const analysis = analyzeAnswer(userAnswer, correctAnswer);

  // Generate localized feedback hint
  const feedbackHint = analysis.mistakeType
    ? getFeedbackMessage(analysis.mistakeType, 'en')
    : undefined;

  return {
    isCorrect: false,
    analysis,
    feedbackHint,
  };
}

/**
 * Validate a text answer against a correct answer and alternatives
 *
 * Checks the primary correct answer first, then alternatives.
 * Uses Unicode normalization for flexible comparison.
 *
 * @param userAnswer - The answer provided by the user
 * @param correctAnswer - The primary correct answer
 * @param alternatives - Array of acceptable alternative answers
 * @param options - Validation options
 * @returns Validation result with correctness, analysis, and feedback hint
 */
export function validateWithAlternatives(
  userAnswer: string,
  correctAnswer: string,
  alternatives: string[],
  options: ValidationOptions = {}
): UnifiedValidationResult {
  const { strict = false } = options;

  // First check the primary correct answer
  if (answersMatch(userAnswer, correctAnswer, strict)) {
    return { isCorrect: true };
  }

  // Check alternatives
  if (alternatives.length > 0 && matchesAnyAnswer(userAnswer, alternatives, strict)) {
    return { isCorrect: true };
  }

  // Analyze against the primary correct answer for feedback
  const analysis = analyzeAnswer(userAnswer, correctAnswer);

  // Generate localized feedback hint
  const feedbackHint = analysis.mistakeType
    ? getFeedbackMessage(analysis.mistakeType, 'en')
    : undefined;

  return {
    isCorrect: false,
    analysis,
    feedbackHint,
  };
}

/**
 * Generate a localized feedback message based on answer analysis
 *
 * @param analysis - The answer analysis from analyzeAnswer
 * @param locale - The locale for the message ('en' or 'mk')
 * @returns Localized feedback message
 */
export function generateFeedbackMessage(
  analysis: AnswerAnalysis,
  locale: 'en' | 'mk' = 'en'
): string {
  if (!analysis.mistakeType) {
    return locale === 'en' ? 'Not quite right.' : 'Ne sosema tocno.';
  }

  return getFeedbackMessage(analysis.mistakeType, locale);
}
