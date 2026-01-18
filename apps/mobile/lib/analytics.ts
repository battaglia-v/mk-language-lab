/**
 * Analytics event tracking for React Native
 * 
 * Mirrors PWA's analytics tracking
 * Uses console logging in dev, can be extended with providers like Mixpanel/Amplitude
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see packages/analytics (shared package)
 */

import { AnalyticsEvents, type AnalyticsEvent } from '@mk/analytics';

// Re-export events for easy access
export { AnalyticsEvents };
export type { AnalyticsEvent };

// Event queue for offline tracking
let eventQueue: Array<{ event: string; properties?: Record<string, unknown>; timestamp: number }> = [];

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  const eventData = {
    event,
    properties: {
      ...properties,
      platform: 'mobile',
      timestamp: new Date().toISOString(),
    },
    timestamp: Date.now(),
  };

  // Log in development
  if (__DEV__) {
    console.log('[Analytics]', event, properties);
  }

  // Queue for later sync (could be sent to analytics provider)
  eventQueue.push(eventData);

  // Keep queue manageable
  if (eventQueue.length > 100) {
    eventQueue = eventQueue.slice(-50);
  }
}

/**
 * Track practice session start
 */
export function trackPracticeStarted(properties: {
  deckType: string;
  mode: string;
  difficulty?: string;
  cardCount?: number;
}): void {
  trackEvent(AnalyticsEvents.PRACTICE_STARTED, properties);
}

/**
 * Track practice session completion
 */
export function trackPracticeCompleted(properties: {
  deckType: string;
  mode: string;
  correct: number;
  total: number;
  accuracy: number;
  durationMs: number;
  xpEarned: number;
}): void {
  trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, properties);
}

/**
 * Track correct answer
 */
export function trackCorrectAnswer(properties: {
  cardId?: string;
  mode: string;
  responseTimeMs?: number;
}): void {
  trackEvent(AnalyticsEvents.PRACTICE_ANSWER_CORRECT, properties);
}

/**
 * Track incorrect answer
 */
export function trackIncorrectAnswer(properties: {
  cardId?: string;
  mode: string;
  userAnswer?: string;
  correctAnswer?: string;
}): void {
  trackEvent(AnalyticsEvents.PRACTICE_ANSWER_INCORRECT, properties);
}

/**
 * Track translation request
 */
export function trackTranslationRequested(properties: {
  direction: string;
  textLength: number;
}): void {
  trackEvent(AnalyticsEvents.TRANSLATION_REQUESTED, properties);
}

/**
 * Track translation success
 */
export function trackTranslationSuccess(properties: {
  direction: string;
  sourceLength: number;
  targetLength: number;
}): void {
  trackEvent(AnalyticsEvents.TRANSLATION_SUCCESS, properties);
}

/**
 * Track translation failure
 */
export function trackTranslationFailed(properties: {
  direction: string;
  error: string;
}): void {
  trackEvent(AnalyticsEvents.TRANSLATION_FAILED, properties);
}

/**
 * Track translation copied
 */
export function trackTranslationCopied(properties: {
  direction: string;
}): void {
  trackEvent(AnalyticsEvents.TRANSLATION_COPIED, properties);
}

/**
 * Track sign-in initiated
 */
export function trackSignInInitiated(properties: {
  method: 'credentials' | 'google' | 'facebook';
}): void {
  trackEvent(AnalyticsEvents.SIGNIN_INITIATED, properties);
}

/**
 * Track sign-in success
 */
export function trackSignInSuccess(properties: {
  method: 'credentials' | 'google' | 'facebook';
}): void {
  trackEvent(AnalyticsEvents.SIGNIN_SUCCESS, properties);
}

/**
 * Track sign-in failure
 */
export function trackSignInFailed(properties: {
  method: 'credentials' | 'google' | 'facebook';
  error: string;
}): void {
  trackEvent(AnalyticsEvents.SIGNIN_FAILED, properties);
}

/**
 * Get queued events (for debugging or batch sending)
 */
export function getEventQueue(): typeof eventQueue {
  return [...eventQueue];
}

/**
 * Clear event queue
 */
export function clearEventQueue(): void {
  eventQueue = [];
}
