/**
 * Analytics Event Types
 * 
 * Type-safe event tracking for MK Language Lab.
 * These events are used for understanding user behavior,
 * improving the learning experience, and A/B testing.
 * 
 * @see docs/architecture.md for analytics implementation details
 */

// =============================================================================
// CORE EVENT TYPES
// =============================================================================

/**
 * Base event properties included with every tracked event
 */
export interface BaseEventProperties {
  /** User ID (null for anonymous users) */
  userId?: string | null;
  /** Anonymous session ID for tracking across pages */
  sessionId?: string;
  /** Current screen/page name */
  screenName?: string;
  /** Device type: 'desktop' | 'mobile' | 'tablet' */
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  /** User's locale preference */
  locale?: 'en' | 'mk';
  /** Timestamp of the event */
  timestamp?: number;
}

// =============================================================================
// SESSION & NAVIGATION EVENTS
// =============================================================================

export interface SessionStartEvent {
  eventName: 'session_start';
  eventData: {
    isReturningUser: boolean;
    daysSinceLastSession?: number;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
}

export interface SessionEndEvent {
  eventName: 'session_end';
  eventData: {
    durationSeconds: number;
    pagesViewed: number;
    xpEarned: number;
  };
}

export interface PageViewEvent {
  eventName: 'page_view';
  eventData: {
    pagePath: string;
    pageTitle: string;
    previousPage?: string;
  };
}

// =============================================================================
// LEARNING EVENTS
// =============================================================================

export interface LessonStartEvent {
  eventName: 'lesson_start';
  eventData: {
    lessonId: string;
    lessonType: 'vocabulary' | 'grammar' | 'pronunciation' | 'reading' | 'listening';
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    deckId?: string;
    isReview: boolean;
  };
}

export interface LessonCompleteEvent {
  eventName: 'lesson_complete';
  eventData: {
    lessonId: string;
    lessonType: string;
    durationSeconds: number;
    xpEarned: number;
    accuracy: number; // 0-100
    cardsCompleted: number;
    mistakeCount: number;
    perfectSession: boolean;
  };
}

export interface LessonAbandonEvent {
  eventName: 'lesson_abandon';
  eventData: {
    lessonId: string;
    lessonType: string;
    durationSeconds: number;
    progressPercent: number; // 0-100
    lastQuestionIndex: number;
    abandonReason?: 'closed_app' | 'navigation' | 'error' | 'unknown';
  };
}

export interface QuestionAnswerEvent {
  eventName: 'question_answer';
  eventData: {
    lessonId: string;
    questionId: string;
    questionType: 'multiple_choice' | 'text_input' | 'audio' | 'matching' | 'fill_blank';
    isCorrect: boolean;
    responseTimeMs: number;
    attemptNumber: number;
    usedHint: boolean;
  };
}

// =============================================================================
// PRACTICE EVENTS
// =============================================================================

export interface PracticeSessionStartEvent {
  eventName: 'practice_session_start';
  eventData: {
    practiceType: 'flashcard' | 'quick_practice' | 'review' | 'custom_deck';
    deckId?: string;
    category?: string;
    difficulty: 'casual' | 'focus' | 'blitz';
    targetQuestions: number;
  };
}

export interface PracticeSessionCompleteEvent {
  eventName: 'practice_session_complete';
  eventData: {
    practiceType: string;
    durationSeconds: number;
    questionsAnswered: number;
    correctAnswers: number;
    xpEarned: number;
    streakLength: number; // Consecutive correct answers
    bonusesEarned: string[];
  };
}

export interface FlashcardReviewEvent {
  eventName: 'flashcard_review';
  eventData: {
    cardId: string;
    deckId: string;
    rating: 1 | 2 | 3 | 4 | 5; // SRS rating
    responseTimeMs: number;
    previousMastery: number;
    newMastery: number;
  };
}

// =============================================================================
// READER EVENTS
// =============================================================================

export interface ReaderOpenEvent {
  eventName: 'reader_open';
  eventData: {
    textId: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    category: string;
    wordCount: number;
    isNewText: boolean;
  };
}

export interface ReaderSentenceViewEvent {
  eventName: 'reader_sentence_view';
  eventData: {
    textId: string;
    sentenceIndex: number;
    timeOnSentenceMs: number;
    showedTranslation: boolean;
    playedAudio: boolean;
    savedWord: boolean;
  };
}

export interface ReaderWordTapEvent {
  eventName: 'reader_word_tap';
  eventData: {
    textId: string;
    wordId: string;
    word: string;
    translation: string;
    partOfSpeech?: string;
    addedToDeck: boolean;
    playedAudio: boolean;
  };
}

export interface ReaderCompleteEvent {
  eventName: 'reader_complete';
  eventData: {
    textId: string;
    level: string;
    totalTimeSeconds: number;
    sentencesRead: number;
    wordsSaved: number;
    audioPlaysCount: number;
    translationsViewed: number;
    xpEarned: number;
    comprehensionScore?: number; // If quiz completed
  };
}

// =============================================================================
// NEWS EVENTS
// =============================================================================

export interface NewsPageViewEvent {
  eventName: 'news_page_view';
  eventData: {
    source: 'all' | 'time-mk' | 'meta-mk';
    articleCount: number;
    hasVideoFilter: boolean;
    searchQuery?: string;
  };
}

export interface NewsArticleClickEvent {
  eventName: 'news_article_click';
  eventData: {
    articleId: string;
    source: string;
    title: string;
    hasVideo: boolean;
    categories: string[];
    position: number;
  };
}

export interface NewsFilterChangeEvent {
  eventName: 'news_filter_change';
  eventData: {
    filterType: 'source' | 'video' | 'search';
    previousValue: string;
    newValue: string;
  };
}

// =============================================================================
// TRANSLATOR EVENTS
// =============================================================================

export interface TranslationRequestEvent {
  eventName: 'translation_request';
  eventData: {
    direction: 'mk_to_en' | 'en_to_mk';
    sourceLength: number;
    translationType: 'text' | 'voice' | 'paste';
    savedTranslation: boolean;
  };
}

export interface TranslationSaveEvent {
  eventName: 'translation_save';
  eventData: {
    direction: string;
    wordCount: number;
    sourceText: string;
    category?: string;
  };
}

// =============================================================================
// GAMIFICATION EVENTS
// =============================================================================

export interface StreakUpdateEvent {
  eventName: 'streak_update';
  eventData: {
    previousStreak: number;
    newStreak: number;
    action: 'extended' | 'protected' | 'lost' | 'recovered';
    usedFreeze: boolean;
    streakMilestone?: number; // 7, 30, 100, 365
  };
}

export interface XpEarnedEvent {
  eventName: 'xp_earned';
  eventData: {
    amount: number;
    source: 'lesson' | 'practice' | 'reader' | 'quest' | 'bonus' | 'achievement';
    sourceId?: string;
    bonusMultiplier?: number;
    dailyGoalProgress: number; // 0-100
    dailyGoalReached: boolean;
  };
}

export interface DailyGoalCompleteEvent {
  eventName: 'daily_goal_complete';
  eventData: {
    xpEarned: number;
    xpGoal: number;
    timeToCompleteMinutes: number;
    activitiesCount: number;
    streakLength: number;
  };
}

export interface QuestCompleteEvent {
  eventName: 'quest_complete';
  eventData: {
    questId: string;
    questType: 'daily' | 'weekly' | 'special';
    rewardType: 'xp' | 'currency' | 'streak_freeze' | 'badge';
    rewardAmount: number;
  };
}

export interface BadgeEarnedEvent {
  eventName: 'badge_earned';
  eventData: {
    badgeId: string;
    badgeType: string;
    badgeTier?: 'bronze' | 'silver' | 'gold';
    triggeredBy: string; // What action triggered the badge
  };
}

export interface LeaguePromotionEvent {
  eventName: 'league_promotion';
  eventData: {
    previousLeague: string;
    newLeague: string;
    weeklyXp: number;
    finalRank: number;
  };
}

// =============================================================================
// UI INTERACTION EVENTS
// =============================================================================

export interface ButtonClickEvent {
  eventName: 'button_click';
  eventData: {
    buttonId: string;
    buttonLabel: string;
    location: string;
    context?: string;
  };
}

export interface ModalOpenEvent {
  eventName: 'modal_open';
  eventData: {
    modalId: string;
    modalType: string;
    trigger: 'user_action' | 'system' | 'achievement';
  };
}

export interface FeatureDiscoveryEvent {
  eventName: 'feature_discovery';
  eventData: {
    featureName: string;
    discoveryType: 'tooltip' | 'onboarding' | 'natural' | 'notification';
    isFirstTime: boolean;
  };
}

export interface SettingsChangeEvent {
  eventName: 'settings_change';
  eventData: {
    settingName: string;
    previousValue: string | boolean | number;
    newValue: string | boolean | number;
  };
}

// =============================================================================
// ERROR & PERFORMANCE EVENTS
// =============================================================================

export interface ErrorEvent {
  eventName: 'error';
  eventData: {
    errorType: 'api' | 'ui' | 'validation' | 'network' | 'unknown';
    errorMessage: string;
    errorCode?: string;
    stackTrace?: string;
    recoverable: boolean;
    userAction?: string;
  };
}

export interface PerformanceEvent {
  eventName: 'performance';
  eventData: {
    metricName: 'page_load' | 'api_response' | 'audio_load' | 'render_time';
    durationMs: number;
    resourceUrl?: string;
    success: boolean;
  };
}

// =============================================================================
// A/B TEST EVENTS
// =============================================================================

export interface ExperimentExposureEvent {
  eventName: 'experiment_exposure';
  eventData: {
    experimentId: string;
    experimentName: string;
    variantId: string;
    variantName: string;
  };
}

export interface ExperimentConversionEvent {
  eventName: 'experiment_conversion';
  eventData: {
    experimentId: string;
    variantId: string;
    conversionType: string;
    conversionValue?: number;
  };
}

// =============================================================================
// UNION TYPE FOR ALL EVENTS
// =============================================================================

export type AnalyticsEvent =
  | SessionStartEvent
  | SessionEndEvent
  | PageViewEvent
  | LessonStartEvent
  | LessonCompleteEvent
  | LessonAbandonEvent
  | QuestionAnswerEvent
  | PracticeSessionStartEvent
  | PracticeSessionCompleteEvent
  | FlashcardReviewEvent
  | ReaderOpenEvent
  | ReaderSentenceViewEvent
  | ReaderWordTapEvent
  | ReaderCompleteEvent
  | NewsPageViewEvent
  | NewsArticleClickEvent
  | NewsFilterChangeEvent
  | TranslationRequestEvent
  | TranslationSaveEvent
  | StreakUpdateEvent
  | XpEarnedEvent
  | DailyGoalCompleteEvent
  | QuestCompleteEvent
  | BadgeEarnedEvent
  | LeaguePromotionEvent
  | ButtonClickEvent
  | ModalOpenEvent
  | FeatureDiscoveryEvent
  | SettingsChangeEvent
  | ErrorEvent
  | PerformanceEvent
  | ExperimentExposureEvent
  | ExperimentConversionEvent;

/**
 * Type-safe event tracking function signature
 */
export type TrackEvent = <T extends AnalyticsEvent>(
  event: T & BaseEventProperties
) => void;

/**
 * Helper to create strongly-typed events
 */
export function createEvent<T extends AnalyticsEvent>(
  event: T,
  baseProps?: Partial<BaseEventProperties>
): T & BaseEventProperties {
  return {
    ...event,
    timestamp: Date.now(),
    ...baseProps,
  };
}

// =============================================================================
// EVENT NAME CONSTANTS
// =============================================================================

export const EVENT_NAMES = {
  // Session
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  PAGE_VIEW: 'page_view',
  
  // Learning
  LESSON_START: 'lesson_start',
  LESSON_COMPLETE: 'lesson_complete',
  LESSON_ABANDON: 'lesson_abandon',
  QUESTION_ANSWER: 'question_answer',
  
  // Practice
  PRACTICE_SESSION_START: 'practice_session_start',
  PRACTICE_SESSION_COMPLETE: 'practice_session_complete',
  FLASHCARD_REVIEW: 'flashcard_review',
  
  // Reader
  READER_OPEN: 'reader_open',
  READER_SENTENCE_VIEW: 'reader_sentence_view',
  READER_WORD_TAP: 'reader_word_tap',
  READER_COMPLETE: 'reader_complete',
  
  // News
  NEWS_PAGE_VIEW: 'news_page_view',
  NEWS_ARTICLE_CLICK: 'news_article_click',
  NEWS_FILTER_CHANGE: 'news_filter_change',
  
  // Translator
  TRANSLATION_REQUEST: 'translation_request',
  TRANSLATION_SAVE: 'translation_save',
  
  // Gamification
  STREAK_UPDATE: 'streak_update',
  XP_EARNED: 'xp_earned',
  DAILY_GOAL_COMPLETE: 'daily_goal_complete',
  QUEST_COMPLETE: 'quest_complete',
  BADGE_EARNED: 'badge_earned',
  LEAGUE_PROMOTION: 'league_promotion',
  
  // UI
  BUTTON_CLICK: 'button_click',
  MODAL_OPEN: 'modal_open',
  FEATURE_DISCOVERY: 'feature_discovery',
  SETTINGS_CHANGE: 'settings_change',
  
  // Errors
  ERROR: 'error',
  PERFORMANCE: 'performance',
  
  // A/B Tests
  EXPERIMENT_EXPOSURE: 'experiment_exposure',
  EXPERIMENT_CONVERSION: 'experiment_conversion',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
