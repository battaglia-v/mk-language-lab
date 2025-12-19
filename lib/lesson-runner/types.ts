/**
 * Lesson Runner Type Definitions
 *
 * This module defines the type system for the LessonRunner orchestration engine.
 * LessonRunner powers all interactive learning experiences with a unified step-based flow.
 */

// ============================================================================
// Step Types
// ============================================================================

export type StepType =
  | 'MULTIPLE_CHOICE'
  | 'FILL_BLANK'
  | 'TAP_WORDS'
  | 'PRONOUNCE'
  | 'SUMMARY';

// Base step interface that all step types extend
export interface BaseStep {
  id: string;
  type: StepType;
}

// ============================================================================
// Specific Step Types
// ============================================================================

/**
 * Multiple Choice Step
 * User selects one answer from a list of choices
 */
export interface MultipleChoiceStep extends BaseStep {
  type: 'MULTIPLE_CHOICE';
  prompt: string;
  promptAudio?: string; // Optional audio URL for the prompt
  choices: string[];
  correctIndex: number;
  explanation?: string;
  translationHint?: string; // Optional hint shown before checking
}

/**
 * Fill in the Blank Step
 * User types an answer to complete a sentence
 */
export interface FillBlankStep extends BaseStep {
  type: 'FILL_BLANK';
  prompt: string;
  promptAudio?: string;
  correctAnswer: string;
  acceptableAnswers?: string[]; // Alternative acceptable answers
  explanation?: string;
  caseSensitive?: boolean;
  placeholder?: string;
}

/**
 * Tap Words Step
 * User taps/clicks words in a passage to see translations
 * Used in reader lessons for vocabulary acquisition
 */
export interface TapWordsStep extends BaseStep {
  type: 'TAP_WORDS';
  passage: string; // The text passage to read
  locale: 'en' | 'mk'; // Source language
  targetLocale: 'en' | 'mk'; // Translation language
  words: Array<{
    index: number;
    word: string;
    translation: string;
    pos?: string; // Part of speech
    note?: string;
  }>;
  minimumTaps?: number; // Minimum words to tap before continuing
  instructions?: string;
}

/**
 * Pronunciation Practice Step
 * User listens to audio and optionally records themselves
 */
export interface PronounceStep extends BaseStep {
  type: 'PRONOUNCE';
  text: string; // Text to pronounce
  audioUrl: string; // Reference audio URL
  locale: 'en' | 'mk';
  allowRecording?: boolean; // Whether user can record (default: true)
  allowSkip?: boolean; // Whether user can skip without recording (default: true)
  instructions?: string;
  phonetic?: string; // Phonetic transcription hint
}

/**
 * Summary/Completion Step
 * Shows lesson results, XP earned, and completion message
 */
export interface SummaryStep extends BaseStep {
  type: 'SUMMARY';
  xpEarned: number;
  totalSteps: number;
  correctAnswers: number;
  streakDays?: number;
  lessonTitle?: string;
  completionMessage?: string;
  nextLessonId?: string; // Optional next lesson to continue to
}

/**
 * Union type of all possible step types
 */
export type Step =
  | MultipleChoiceStep
  | FillBlankStep
  | TapWordsStep
  | PronounceStep
  | SummaryStep;

// ============================================================================
// Runner State Types
// ============================================================================

/**
 * Feedback for a submitted answer
 */
export interface StepFeedback {
  correct: boolean;
  message?: string;
  correctAnswer?: string;
  explanation?: string;
}

/**
 * Answer submitted by user for a step
 */
export type StepAnswer =
  | { type: 'MULTIPLE_CHOICE'; selectedIndex: number }
  | { type: 'FILL_BLANK'; answer: string }
  | { type: 'TAP_WORDS'; tappedWords: string[]; savedWords?: string[] }
  | { type: 'PRONOUNCE'; recordingBlob?: Blob; skipped: boolean }
  | { type: 'SUMMARY'; acknowledged: boolean };

/**
 * Internal state managed by LessonRunner
 */
export interface LessonRunnerState {
  currentIndex: number;
  answers: Map<string, StepAnswer>;
  feedback: Map<string, StepFeedback>;
  isEvaluating: boolean;
  showFeedback: boolean;
  startTime: number;
  completedAt?: number;
}

/**
 * Results returned when lesson is completed
 */
export interface LessonResults {
  lessonId?: string;
  totalSteps: number;
  correctAnswers: number;
  totalTime: number; // milliseconds
  xpEarned: number;
  completedAt: number;
  answers: Array<{
    stepId: string;
    stepType: StepType;
    answer: StepAnswer;
    correct: boolean;
  }>;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for individual step components
 */
export interface StepComponentProps<T extends Step = Step> {
  step: T;
  onAnswer: (answer: StepAnswer) => void;
  feedback?: StepFeedback;
  disabled?: boolean;
}

/**
 * Props for the main LessonRunner component
 */
export interface LessonRunnerProps {
  steps: Step[];
  onComplete: (results: LessonResults) => void;
  lessonId?: string; // For progress tracking
  lessonTitle?: string; // Displayed in header
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onExit?: () => void; // Called when user clicks X button
  autoSave?: boolean; // Auto-save progress to API (default: true)
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Options for answer validation
 */
export interface ValidationOptions {
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  acceptPartialMatch?: boolean;
}

/**
 * Result of validating an answer
 */
export interface ValidationResult {
  isCorrect: boolean;
  feedback: StepFeedback;
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

/**
 * Lesson progress saved to backend
 */
export interface LessonProgress {
  lessonId: string;
  userId: string;
  currentStepIndex: number;
  answers: Record<string, StepAnswer>;
  startedAt: number;
  lastUpdatedAt: number;
  completed: boolean;
  completedAt?: number;
}

/**
 * Options for saving progress
 */
export interface SaveProgressOptions {
  debounceMs?: number; // Debounce time for auto-save
  persistLocally?: boolean; // Also save to localStorage
}
