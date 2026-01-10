/**
 * Recommendation Engine
 * 
 * Generates personalized activity suggestions based on user progress,
 * learning patterns, and engagement history.
 */

import type { Recommendation } from '@/components/dashboard/RecommendationCard';

interface UserProgress {
  /** Current streak days */
  streakDays: number;
  /** Whether user practiced today */
  practicedToday: boolean;
  /** XP earned today */
  todayXP: number;
  /** Daily XP goal */
  dailyGoalXP: number;
  /** Last practice timestamp */
  lastPracticeAt?: Date;
  /** Has active lesson in progress */
  hasActiveLesson: boolean;
  /** Active lesson details */
  activeLesson?: {
    id: string;
    title: string;
    progressPercent: number;
    estimatedMinutesRemaining: number;
  };
  /** Words due for review (spaced repetition) */
  wordsForReview: number;
  /** Weak words (low accuracy) */
  weakWordCount: number;
  /** Average accuracy in last 7 days */
  weeklyAccuracy: number;
  /** Topics practiced in last 7 days */
  recentTopics: string[];
  /** Available topics not yet started */
  newTopicsAvailable: string[];
  /** Grammar lessons completed */
  grammarLessonsCompleted: number;
  /** Pronunciation sessions completed */
  pronunciationSessionsCompleted: number;
}

interface RecommendationConfig {
  locale: 'en' | 'mk';
  /** Max recommendations to generate */
  maxRecommendations?: number;
}

const TRANSLATIONS = {
  en: {
    continueLessonTitle: 'Continue Your Lesson',
    continueLessonDesc: (title: string, percent: number) => 
      `Resume "${title}" - ${percent}% complete`,
    
    reviewWordsTitle: 'Review Weak Words',
    reviewWordsDesc: (count: number) => 
      `${count} words need practice to strengthen your memory`,
    
    pronunciationTitle: 'Pronunciation Practice',
    pronunciationDesc: 'Perfect your Macedonian accent with audio exercises',
    
    grammarTitle: 'Grammar Drill',
    grammarDesc: 'Build strong foundations with interactive exercises',
    
    challengeTitle: 'Daily Challenge',
    challengeDesc: 'Complete today\'s challenge for bonus XP',
    
    streakTitle: 'Protect Your Streak!',
    streakDesc: (days: number) => 
      `Practice now to keep your ${days}-day streak alive!`,
    
    newTopicTitle: 'Explore New Topic',
    newTopicDesc: (topic: string) => 
      `Start learning: ${topic}`,
      
    finishGoalTitle: 'Complete Daily Goal',
    finishGoalDesc: (xpNeeded: number) => 
      `Just ${xpNeeded} XP to reach your daily goal!`,
  },
  mk: {
    continueLessonTitle: 'Продолжи со лекцијата',
    continueLessonDesc: (title: string, percent: number) => 
      `Продолжи „${title}" - ${percent}% завршено`,
    
    reviewWordsTitle: 'Повтори слаби зборови',
    reviewWordsDesc: (count: number) => 
      `${count} зборови треба повторување за зајакнување на меморијата`,
    
    pronunciationTitle: 'Вежба за изговор',
    pronunciationDesc: 'Усоврши го македонскиот акцент со аудио вежби',
    
    grammarTitle: 'Граматичка вежба',
    grammarDesc: 'Изгради силни основи со интерактивни вежби',
    
    challengeTitle: 'Дневен предизвик',
    challengeDesc: 'Заврши го денешниот предизвик за бонус XP',
    
    streakTitle: 'Зачувај ја низата!',
    streakDesc: (days: number) => 
      `Вежбај сега за да ја задржиш низата од ${days} дена!`,
    
    newTopicTitle: 'Истражи нова тема',
    newTopicDesc: (topic: string) => 
      `Започни да учиш: ${topic}`,
      
    finishGoalTitle: 'Заврши ја дневната цел',
    finishGoalDesc: (xpNeeded: number) => 
      `Уште само ${xpNeeded} XP до твојата дневна цел!`,
  },
};

/**
 * Generates personalized recommendations based on user progress
 */
export function generateRecommendations(
  progress: UserProgress,
  config: RecommendationConfig
): Recommendation[] {
  const { locale, maxRecommendations = 5 } = config;
  const t = TRANSLATIONS[locale];
  const recommendations: Recommendation[] = [];

  // Priority 0: Streak protection (highest urgency)
  if (progress.streakDays > 0 && !progress.practicedToday) {
    recommendations.push({
      type: 'streak-protection',
      title: t.streakTitle,
      description: t.streakDesc(progress.streakDays),
      priority: 0,
      xpReward: 10,
      estimatedMinutes: 2,
      href: '/practice',
      metadata: {
        daysUntilStreakLoss: 1,
      },
    });
  }

  // Priority 1: Continue active lesson
  if (progress.hasActiveLesson && progress.activeLesson) {
    recommendations.push({
      type: 'continue-lesson',
      title: t.continueLessonTitle,
      description: t.continueLessonDesc(
        progress.activeLesson.title, 
        progress.activeLesson.progressPercent
      ),
      priority: 1,
      estimatedMinutes: progress.activeLesson.estimatedMinutesRemaining,
      xpReward: 15,
      href: `/learn/lesson/${progress.activeLesson.id}`,
      metadata: {
        lessonId: progress.activeLesson.id,
      },
    });
  }

  // Priority 2: Weak words review
  if (progress.weakWordCount > 0 || progress.wordsForReview > 0) {
    const wordCount = progress.weakWordCount + progress.wordsForReview;
    recommendations.push({
      type: 'review-weak-words',
      title: t.reviewWordsTitle,
      description: t.reviewWordsDesc(wordCount),
      priority: progress.weakWordCount > 5 ? 2 : 4,
      estimatedMinutes: Math.ceil(wordCount / 3),
      xpReward: wordCount * 2,
      href: '/practice?mode=review',
      metadata: {
        wordCount,
        accuracy: progress.weeklyAccuracy,
      },
    });
  }

  // Priority 3: Almost at daily goal
  const xpNeeded = progress.dailyGoalXP - progress.todayXP;
  if (xpNeeded > 0 && xpNeeded <= 20 && progress.todayXP > 0) {
    recommendations.push({
      type: 'daily-challenge',
      title: t.finishGoalTitle,
      description: t.finishGoalDesc(xpNeeded),
      priority: 3,
      estimatedMinutes: 3,
      xpReward: xpNeeded + 5, // Bonus for completion
      href: '/practice',
    });
  }

  // Priority 4: Grammar drills (if low completion)
  if (progress.grammarLessonsCompleted < 4) {
    recommendations.push({
      type: 'grammar-drill',
      title: t.grammarTitle,
      description: t.grammarDesc,
      priority: 5,
      estimatedMinutes: 5,
      xpReward: 20,
      href: '/learn/grammar',
    });
  }

  // Priority 5: New topic exploration
  if (progress.newTopicsAvailable.length > 0) {
    const newTopic = progress.newTopicsAvailable[0];
    recommendations.push({
      type: 'new-topic',
      title: t.newTopicTitle,
      description: t.newTopicDesc(newTopic),
      priority: 7,
      estimatedMinutes: 10,
      xpReward: 25,
      href: `/learn/topic/${encodeURIComponent(newTopic)}`,
      metadata: {
        topicId: newTopic,
      },
    });
  }

  // Sort by priority and limit
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxRecommendations);
}

/**
 * Get the most important recommendation (for hero card display)
 */
export function getTopRecommendation(
  progress: UserProgress,
  locale: 'en' | 'mk'
): Recommendation | null {
  const recommendations = generateRecommendations(progress, { locale, maxRecommendations: 1 });
  return recommendations[0] || null;
}

/**
 * Creates mock progress for development/demo
 */
export function createMockProgress(overrides?: Partial<UserProgress>): UserProgress {
  return {
    streakDays: 12,
    practicedToday: false,
    todayXP: 35,
    dailyGoalXP: 50,
    lastPracticeAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    hasActiveLesson: true,
    activeLesson: {
      id: 'definite-article-basics',
      title: 'Definite Article Basics',
      progressPercent: 60,
      estimatedMinutesRemaining: 4,
    },
    wordsForReview: 8,
    weakWordCount: 3,
    weeklyAccuracy: 78,
    recentTopics: ['greetings', 'numbers', 'family'],
    newTopicsAvailable: ['colors', 'weather', 'shopping'],
    grammarLessonsCompleted: 2,
    pronunciationSessionsCompleted: 1,
    ...overrides,
  };
}

export type { UserProgress, RecommendationConfig };
