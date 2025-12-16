/**
 * In-App Review Trigger Logic
 *
 * Manages Google Play In-App Review prompts following best practices:
 * - Never prompt on first session
 * - Trigger after positive moments (successful session completion)
 * - Implement cooldown between prompts
 * - Track session quality to avoid prompting after errors
 *
 * Triggers after 3-5 successful sessions with good performance
 */

// Storage keys
const STORAGE_KEY_SESSIONS = 'mk_completed_sessions';
const STORAGE_KEY_LAST_REVIEW = 'mk_last_review_prompt';
const STORAGE_KEY_REVIEW_GIVEN = 'mk_review_given';

// Configuration
const MIN_SESSIONS_BEFORE_PROMPT = 3;
const MAX_SESSIONS_BEFORE_PROMPT = 5;
const COOLDOWN_DAYS = 30; // Don't ask again for 30 days
const MIN_ACCURACY_THRESHOLD = 70; // Only prompt if accuracy >= 70%

export type SessionData = {
  accuracy: number;
  correctCount: number;
  totalAttempts: number;
  timestamp: number;
  hadErrors: boolean;
};

/**
 * Check if we can use localStorage (client-side only)
 */
function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Get completed sessions from storage
 */
function getCompletedSessions(): SessionData[] {
  if (!canUseStorage()) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save completed sessions to storage
 */
function saveCompletedSessions(sessions: SessionData[]): void {
  if (!canUseStorage()) return;

  try {
    // Keep only last 10 sessions to avoid storage bloat
    const recentSessions = sessions.slice(-10);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(recentSessions));
  } catch {
    // Storage quota exceeded or other error - ignore
  }
}

/**
 * Get timestamp of last review prompt
 */
function getLastReviewPromptTime(): number | null {
  if (!canUseStorage()) return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY_LAST_REVIEW);
    return data ? parseInt(data, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user has already given a review
 */
function hasGivenReview(): boolean {
  if (!canUseStorage()) return false;

  try {
    return localStorage.getItem(STORAGE_KEY_REVIEW_GIVEN) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark that review prompt was shown
 */
function markReviewPromptShown(): void {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(STORAGE_KEY_LAST_REVIEW, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Mark that user has given a review
 */
export function markReviewGiven(): void {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(STORAGE_KEY_REVIEW_GIVEN, 'true');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Record a completed session
 */
export function recordCompletedSession(sessionData: Omit<SessionData, 'timestamp'>): void {
  if (!canUseStorage()) return;

  const sessions = getCompletedSessions();
  sessions.push({
    ...sessionData,
    timestamp: Date.now(),
  });
  saveCompletedSessions(sessions);
}

/**
 * Check if we should show the in-app review prompt
 *
 * Conditions:
 * 1. User hasn't already given a review
 * 2. Enough sessions completed (3-5)
 * 3. Recent session had good performance (>= 70% accuracy)
 * 4. No errors in the recent session
 * 5. Cooldown period has passed since last prompt
 */
export function shouldShowReviewPrompt(currentSessionData: {
  accuracy: number;
  hadErrors: boolean;
}): boolean {
  if (!canUseStorage()) return false;

  // Never prompt if user already gave a review
  if (hasGivenReview()) {
    return false;
  }

  // Don't prompt if current session had errors or poor performance
  if (currentSessionData.hadErrors || currentSessionData.accuracy < MIN_ACCURACY_THRESHOLD) {
    return false;
  }

  // Check cooldown period
  const lastPromptTime = getLastReviewPromptTime();
  if (lastPromptTime) {
    const daysSinceLastPrompt = (Date.now() - lastPromptTime) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPrompt < COOLDOWN_DAYS) {
      return false;
    }
  }

  // Check number of completed sessions
  const sessions = getCompletedSessions();
  const sessionCount = sessions.length;

  // Never prompt on first session
  if (sessionCount < MIN_SESSIONS_BEFORE_PROMPT) {
    return false;
  }

  // Prompt between sessions 3-5
  if (sessionCount <= MAX_SESSIONS_BEFORE_PROMPT) {
    return true;
  }

  // After session 5, prompt with decreasing probability
  // This gives users multiple chances without being annoying
  const promptProbability = Math.max(0.1, 1 / (sessionCount - MAX_SESSIONS_BEFORE_PROMPT + 1));
  return Math.random() < promptProbability;
}

/**
 * Trigger the in-app review flow
 *
 * Note: This is a placeholder for the actual Google Play In-App Review API
 * In a real TWA/Android app, this would call:
 * - Google Play Core Library's ReviewManager
 * - window.Android?.requestReview() if using a WebView bridge
 *
 * For now, we log the intent and mark the prompt as shown
 */
export async function triggerReviewFlow(): Promise<void> {
  markReviewPromptShown();

  // TODO: Integrate with Google Play In-App Review API
  // This requires:
  // 1. TWA setup with Trusted Web Activity
  // 2. Digital Asset Links verification
  // 3. JavaScript bridge to native Android code
  // 4. Google Play Core Library integration

  if (typeof window !== 'undefined') {
    // Check if we have a native bridge (for TWA/WebView)
    // @ts-expect-error - Android interface may not exist
    if (window.Android?.requestReview) {
      // @ts-expect-error - Android interface may not exist
      window.Android.requestReview();
      return;
    }

    // Fallback: Log for development/testing
    console.log('[In-App Review] Review flow triggered - would show Google Play review dialog');

    // In production without TWA, could fallback to directing to Play Store
    // but this is less preferred than the in-app review flow
  }
}

/**
 * Get session statistics for debugging/analytics
 */
export function getSessionStats(): {
  totalSessions: number;
  averageAccuracy: number;
  hasGivenReview: boolean;
  lastPromptTime: number | null;
} {
  const sessions = getCompletedSessions();
  const averageAccuracy = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length
    : 0;

  return {
    totalSessions: sessions.length,
    averageAccuracy: Math.round(averageAccuracy),
    hasGivenReview: hasGivenReview(),
    lastPromptTime: getLastReviewPromptTime(),
  };
}
