/**
 * Exercise Validation Utilities
 *
 * Runtime validation for exercise steps to ensure prompts and required
 * fields are present. Provides graceful error handling when content is malformed.
 */

import type { Step } from './types';

export interface ValidationError {
  stepId: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate a single step has all required fields
 */
export function validateStep(step: Step): ValidationResult {
  const errors: ValidationError[] = [];

  const stepId = step.id || 'unknown';

  // All steps must have id and type
  if (!step.id) {
    errors.push({ stepId, field: 'id', message: 'Step ID is required' });
  }

  if (!step.type) {
    errors.push({ stepId, field: 'type', message: 'Step type is required' });
    return { isValid: false, errors }; // Can't validate further without type
  }

  // Type-specific validation
  switch (step.type) {
    case 'INFO': {
      const hasContent = Boolean(
        step.title?.trim()
          || step.body?.trim()
          || step.bullets?.length
          || step.examples?.length
          || step.vocabulary?.length
      );
      if (!hasContent) {
        errors.push({ stepId, field: 'content', message: 'Info step needs a title or content' });
      }
      break;
    }
    case 'MULTIPLE_CHOICE':
      if (!step.prompt?.trim()) {
        errors.push({ stepId, field: 'prompt', message: 'Prompt is required for multiple choice' });
      }
      if (!step.choices?.length) {
        errors.push({ stepId, field: 'choices', message: 'At least one choice is required' });
      }
      if (step.correctIndex === undefined || step.correctIndex < 0) {
        errors.push({ stepId, field: 'correctIndex', message: 'Correct answer index is required' });
      }
      break;

    case 'FILL_BLANK':
      if (!step.prompt?.trim()) {
        errors.push({ stepId, field: 'prompt', message: 'Prompt is required for fill-in-blank' });
      }
      if (!step.correctAnswer?.trim()) {
        errors.push({ stepId, field: 'correctAnswer', message: 'Correct answer is required' });
      }
      break;

    case 'TAP_WORDS':
      if (!step.passage?.trim()) {
        errors.push({ stepId, field: 'passage', message: 'Passage text is required' });
      }
      if (!step.words?.length) {
        errors.push({ stepId, field: 'words', message: 'At least one word definition is required' });
      }
      break;

    case 'PRONOUNCE':
      if (!step.text?.trim()) {
        errors.push({ stepId, field: 'text', message: 'Text to pronounce is required' });
      }
      // audioUrl is optional - TTS fallback is available when missing
      break;

    case 'SUMMARY':
      // Summary steps have minimal requirements - mostly computed fields
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all steps in a lesson
 */
export function validateLesson(steps: Step[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!steps?.length) {
    errors.push({ stepId: 'lesson', field: 'steps', message: 'Lesson must have at least one step' });
    return { isValid: false, errors };
  }

  for (const step of steps) {
    const result = validateStep(step);
    errors.push(...result.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get a fallback prompt for a step type when the prompt is missing
 */
export function getFallbackPrompt(stepType: Step['type']): string {
  switch (stepType) {
    case 'INFO':
      return 'Review the lesson notes';
    case 'MULTIPLE_CHOICE':
      return 'Select the correct answer';
    case 'FILL_BLANK':
      return 'Type your answer';
    case 'TAP_WORDS':
      return 'Tap words to see translations';
    case 'PRONOUNCE':
      return 'Practice your pronunciation';
    case 'SUMMARY':
      return 'Lesson complete!';
    default:
      return 'Complete this exercise';
  }
}

/**
 * Get default instructions for a step type
 */
export function getDefaultInstructions(stepType: Step['type']): string {
  switch (stepType) {
    case 'INFO':
      return 'Review the notes, then continue.';
    case 'MULTIPLE_CHOICE':
      return 'Choose the correct answer from the options below.';
    case 'FILL_BLANK':
      return 'Type the missing word or phrase.';
    case 'TAP_WORDS':
      return 'Tap on words to see their translations.';
    case 'PRONOUNCE':
      return 'Listen to the pronunciation, then record yourself saying it.';
    case 'SUMMARY':
      return 'Great work! Review your results.';
    default:
      return 'Complete this exercise.';
  }
}
