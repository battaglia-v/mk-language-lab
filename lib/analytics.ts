import { track } from '@vercel/analytics';

/**
 * Privacy-friendly analytics utility for the Macedonian Learning App
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
