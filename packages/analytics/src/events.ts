export const AnalyticsEvents = {
  WORD_OF_DAY_VIEWED: 'word_of_day_viewed',
  WORD_OF_DAY_LOADED: 'word_of_day_loaded',
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
  TRANSLATION_REQUESTED: 'translation_requested',
  TRANSLATION_SUCCESS: 'translation_success',
  TRANSLATION_FAILED: 'translation_failed',
  TRANSLATION_COPIED: 'translation_copied',
  NEWS_ARTICLE_CLICKED: 'news_article_clicked',
  NEWS_VIDEO_CLICKED: 'news_video_clicked',
  NEWS_FILTER_CHANGED: 'news_filter_changed',
  SIGNIN_INITIATED: 'signin_initiated',
  SIGNIN_SUCCESS: 'signin_success',
  SIGNIN_FAILED: 'signin_failed',
  
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

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
