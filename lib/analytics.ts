import { track } from '@vercel/analytics';

/**
 * Privacy-friendly analytics utility for MK Language Lab
 *
 * This utility wraps Vercel Analytics which is:
 * - Privacy-friendly (no cookies)
 * - GDPR compliant
 * - Lightweight (minimal performance impact)
 * - Anonymous (no PII tracked)
 */

// Event names for tracking key user interactions
export const AnalyticsEvents = {
  // Word of the Day events
  WORD_OF_DAY_VIEWED: 'word_of_day_viewed',
  WORD_OF_DAY_LOADED: 'word_of_day_loaded',

  // Quick Practice events
  PRACTICE_STARTED: 'practice_started',
  PRACTICE_COMPLETED: 'practice_completed',
  PRACTICE_ANSWER_CORRECT: 'practice_answer_correct',
  PRACTICE_ANSWER_INCORRECT: 'practice_answer_incorrect',
  PRACTICE_CLOZE_ANSWER_CORRECT: 'cloze_answer_correct',
  PRACTICE_CLOZE_ANSWER_INCORRECT: 'cloze_answer_incorrect',
  PRACTICE_MODAL_OPENED: 'practice_modal_opened',
  PRACTICE_SESSION_NEW: 'practice_session_new',
  PRACTICE_SESSION_CONTINUE: 'practice_session_continue',
  PRACTICE_COMPLETION_MODAL_VIEWED: 'practice_completion_modal_viewed',
  PRACTICE_GAME_OVER: 'practice_game_over',

  // Translation events
  TRANSLATION_REQUESTED: 'translation_requested',
  TRANSLATION_SUCCESS: 'translation_success',
  TRANSLATION_FAILED: 'translation_failed',
  TRANSLATION_COPIED: 'translation_copied',

  // Reader events
  READER_ANALYSIS_REQUESTED: 'reader_analysis_requested',
  READER_ANALYSIS_SUCCESS: 'reader_analysis_success',
  READER_ANALYSIS_FAILED: 'reader_analysis_failed',
  READER_WORD_CLICKED: 'reader_word_clicked',
  READER_REVEAL_TOGGLED: 'reader_reveal_toggled',
  READER_IMPORT_SUCCESS: 'reader_import_success',
  READER_IMPORT_FAILED: 'reader_import_failed',

  // News events
  NEWS_ARTICLE_CLICKED: 'news_article_clicked',
  NEWS_VIDEO_CLICKED: 'news_video_clicked',
  NEWS_FILTER_CHANGED: 'news_filter_changed',

  // Sign-in events
  SIGNIN_INITIATED: 'signin_initiated',
  SIGNIN_SUCCESS: 'signin_success',
  SIGNIN_FAILED: 'signin_failed',

  // Onboarding events
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_GOAL_SELECTED: 'onboarding_goal_selected',
  ONBOARDING_LEVEL_SELECTED: 'onboarding_level_selected',
  ONBOARDING_DAILY_GOAL_SELECTED: 'onboarding_daily_goal_selected',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_FAILED: 'onboarding_failed',

  // Monetization events
  UPGRADE_MODAL_VIEWED: 'upgrade_modal_viewed',
  UPGRADE_MODAL_DISMISSED: 'upgrade_modal_dismissed',
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  PURCHASE_RESTORED: 'purchase_restored',
  PRO_FEATURE_GATED: 'pro_feature_gated',
  PRACTICE_LIMIT_REACHED: 'practice_limit_reached',

  // Review events
  REVIEW_PROMPT_SHOWN: 'review_prompt_shown',
  REVIEW_ACCEPTED: 'review_accepted',
  REVIEW_DECLINED: 'review_declined',

  // Feedback events
  FEEDBACK_FORM_OPENED: 'feedback_form_opened',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  ISSUE_REPORTED: 'issue_reported',

  // Image loading events
  IMAGE_LOAD_SUCCESS: 'image_load_success',
  IMAGE_LOAD_FAILED: 'image_load_failed',
  IMAGE_LOAD_RETRY: 'image_load_retry',
  
  // Phase 1 Learning Effectiveness Events
  EXERCISE_FEEDBACK_SHOWN: 'exercise_feedback_shown',
  EXERCISE_REPEAT_ATTEMPT: 'exercise_repeat_attempt',
  STREAK_FREEZE_USED: 'streak_freeze_used',
  STREAK_FREEZE_AVAILABLE: 'streak_freeze_available',
  SESSION_SUMMARY_REVIEW_CLICK: 'session_summary_review_click',
  CULTURE_TIP_VIEWED: 'culture_tip_viewed',
  REGISTER_BADGE_INTERACTION: 'register_badge_interaction',
  
  // Phase 2 Grammar Performance Events
  GRAMMAR_PERFORMANCE_UPDATED: 'grammar_performance_updated',
  WEAK_TOPICS_VIEWED: 'weak_topics_viewed',
  WEAK_TOPIC_PRACTICE_STARTED: 'weak_topic_practice_started',

  // v2.3 SRS Events
  SRS_REVIEW_STARTED: 'srs_review_started',
  SRS_REVIEW_COMPLETED: 'srs_review_completed',
  SRS_CARD_REVIEWED: 'srs_card_reviewed',
  SRS_DIFFICULTY_CHANGED: 'srs_difficulty_changed',
  SRS_STREAK_MAINTAINED: 'srs_streak_maintained',
  SRS_STREAK_BROKEN: 'srs_streak_broken',
  SRS_SETTINGS_CHANGED: 'srs_settings_changed',

  // v2.3 Typing Trainer Events
  TYPING_SESSION_STARTED: 'typing_session_started',
  TYPING_SESSION_COMPLETED: 'typing_session_completed',
  TYPING_EXERCISE_COMPLETED: 'typing_exercise_completed',
  TYPING_PROBLEM_CHAR_DETECTED: 'typing_problem_char_detected',
  TYPING_MASTERY_LEVEL_CHANGED: 'typing_mastery_level_changed',

  // v2.3 Writing Exercise Events
  WRITING_TRANSLATION_STARTED: 'writing_translation_started',
  WRITING_TRANSLATION_COMPLETED: 'writing_translation_completed',
  WRITING_SENTENCE_BUILDER_STARTED: 'writing_sentence_builder_started',
  WRITING_SENTENCE_BUILDER_COMPLETED: 'writing_sentence_builder_completed',

  // v2.3 Reader Events
  READER_STORY_OPENED: 'reader_story_opened',
  READER_STORY_COMPLETED: 'reader_story_completed',
  READER_PROGRESS_SAVED: 'reader_progress_saved',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

/**
 * Track a custom analytics event
 *
 * @param event - The event name (use AnalyticsEvents constants)
 * @param properties - Optional event properties (no PII!)
 *
 * @example
 * trackEvent(AnalyticsEvents.WORD_OF_DAY_VIEWED, { partOfSpeech: 'noun' });
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) {
  try {
    // Only track in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') {
      console.log('[Analytics - Dev Mode]', event, properties);
      return;
    }

    track(event, properties);
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.error('[Analytics Error]', error);
  }
}

/**
 * Track page view (automatically handled by Vercel Analytics)
 * This is here for reference - Vercel Analytics automatically tracks page views
 */
export function trackPageView() {
  // Vercel Analytics automatically tracks page views
  // No need to manually call this function
}

// ─────────────────────────────────────────────────────────────────────────────
// v2.3 Analytics Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track SRS review session
 */
export function trackSRSReview(properties: {
  cardsReviewed: number;
  correct: number;
  difficulty: 'easy' | 'normal' | 'hard';
  durationMs: number;
}) {
  trackEvent(AnalyticsEvents.SRS_REVIEW_COMPLETED, properties);
}

/**
 * Track SRS streak changes
 */
export function trackSRSStreak(properties: {
  currentStreak: number;
  longestStreak: number;
  maintained: boolean;
}) {
  trackEvent(
    properties.maintained
      ? AnalyticsEvents.SRS_STREAK_MAINTAINED
      : AnalyticsEvents.SRS_STREAK_BROKEN,
    properties
  );
}

/**
 * Track typing exercise completion
 */
export function trackTypingExercise(properties: {
  type: 'letters' | 'words' | 'sentences';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  accuracy: number;
  wpm: number;
  problemChars?: string[];
}) {
  const eventProps: Record<string, string | number | boolean> = {
    type: properties.type,
    difficulty: properties.difficulty,
    accuracy: properties.accuracy,
    wpm: properties.wpm,
  };
  if (properties.problemChars?.length) {
    eventProps.problemChars = properties.problemChars.join(',');
  }
  trackEvent(AnalyticsEvents.TYPING_EXERCISE_COMPLETED, eventProps);
}

/**
 * Track writing exercise completion
 */
export function trackWritingExercise(properties: {
  type: 'translation' | 'sentence-builder' | 'fill-blank';
  direction?: 'en-to-mk' | 'mk-to-en';
  correct: boolean;
  attempts: number;
}) {
  const eventType = properties.type === 'translation'
    ? AnalyticsEvents.WRITING_TRANSLATION_COMPLETED
    : AnalyticsEvents.WRITING_SENTENCE_BUILDER_COMPLETED;
  trackEvent(eventType, properties);
}

/**
 * Track reader story progress
 */
export function trackReaderProgress(properties: {
  storyId: string;
  difficulty: 'A1' | 'A2' | 'B1';
  progress: number;
  completed: boolean;
  timeSpentSeconds: number;
}) {
  trackEvent(
    properties.completed
      ? AnalyticsEvents.READER_STORY_COMPLETED
      : AnalyticsEvents.READER_PROGRESS_SAVED,
    properties
  );
}
