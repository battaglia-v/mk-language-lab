'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { RecommendationList, type Recommendation } from './RecommendationCard';
import { ROUTES, buildLocalizedRoute } from '@/lib/routes';

interface SmartRecommendationsProps {
  /** Current user's streak days */
  streak?: number;
  /** Today's XP earned */
  todayXP?: number;
  /** Daily XP goal */
  dailyGoalXP?: number;
  /** Total lessons completed */
  totalLessons?: number;
  /** Number of weak words to review */
  weakWordsCount?: number;
  /** Maximum recommendations to display */
  maxDisplay?: number;
  className?: string;
}

/**
 * SmartRecommendations - Generates personalized recommendations based on user progress
 */
export function SmartRecommendations({
  streak = 0,
  todayXP = 0,
  dailyGoalXP = 20,
  totalLessons = 0,
  weakWordsCount = 0,
  maxDisplay = 3,
  className,
}: SmartRecommendationsProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('recommendations');

  // Generate recommendations based on user state
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];

    // High priority: Streak protection (if they haven't met daily goal and it's getting late)
    if (streak > 0 && todayXP < dailyGoalXP) {
      recs.push({
        type: 'streak-protection',
        title: t('streakProtection.title'),
        description: t('streakProtection.description', { streak }),
        estimatedMinutes: 5,
        xpReward: Math.max(dailyGoalXP - todayXP, 10),
        priority: 1,
        metadata: {
          daysUntilStreakLoss: 1,
        },
        href: buildLocalizedRoute(locale, ROUTES.PRACTICE),
      });
    }

    // High priority: Review weak words
    if (weakWordsCount > 0) {
      recs.push({
        type: 'review-weak-words',
        title: t('reviewWords.title'),
        description: t('reviewWords.description', { count: weakWordsCount }),
        estimatedMinutes: Math.ceil(weakWordsCount * 0.5),
        xpReward: weakWordsCount * 2,
        priority: 2,
        metadata: {
          wordCount: weakWordsCount,
        },
        href: buildLocalizedRoute(locale, ROUTES.PRACTICE),
      });
    }

    // Medium priority: Pronunciation practice
    // Hidden for beta - audio not ready
    // recs.push({
    //   type: 'pronunciation-practice',
    //   title: t('pronunciation.title'),
    //   description: t('pronunciation.description'),
    //   estimatedMinutes: 10,
    //   xpReward: 25,
    //   priority: 3,
    //   href: buildLocalizedRoute(locale, ROUTES.PRACTICE_PRONUNCIATION),
    // });

    // Medium priority: Grammar drills
    recs.push({
      type: 'grammar-drill',
      title: t('grammar.title'),
      description: t('grammar.description'),
      estimatedMinutes: 15,
      xpReward: 30,
      priority: 4,
      href: buildLocalizedRoute(locale, ROUTES.PRACTICE_GRAMMAR),
    });

    // Lower priority: Continue lesson (if they've started)
    if (totalLessons > 0) {
      recs.push({
        type: 'continue-lesson',
        title: t('continueLesson.title'),
        description: t('continueLesson.description'),
        estimatedMinutes: 10,
        xpReward: 20,
        priority: 5,
        metadata: {
          lessonId: 'next',
        },
        href: buildLocalizedRoute(locale, ROUTES.DISCOVER),
      });
    }

    // For new users: suggest a new topic
    if (totalLessons === 0) {
      recs.push({
        type: 'new-topic',
        title: t('newTopic.title'),
        description: t('newTopic.description'),
        estimatedMinutes: 15,
        xpReward: 50,
        priority: 2,
        href: buildLocalizedRoute(locale, ROUTES.DISCOVER),
      });
    }

    // Daily challenge (always available)
    recs.push({
      type: 'daily-challenge',
      title: t('dailyChallenge.title'),
      description: t('dailyChallenge.description'),
      estimatedMinutes: 5,
      xpReward: 15,
      priority: 6,
      href: buildLocalizedRoute(locale, ROUTES.PRACTICE),
    });

    return recs;
  }, [streak, todayXP, dailyGoalXP, totalLessons, weakWordsCount, locale, t]);

  const handleAction = useCallback((rec: Recommendation) => {
    router.push(rec.href);
  }, [router]);

  const translationProps = useMemo(() => ({
    continueLesson: t('labels.continueLesson'),
    reviewWords: t('labels.reviewWords'),
    pronunciation: t('labels.pronunciation'),
    grammar: t('labels.grammar'),
    challenge: t('labels.challenge'),
    streakProtection: t('labels.streakProtection'),
    newTopic: t('labels.newTopic'),
    startNow: t('actions.startNow'),
    resume: t('actions.resume'),
    practice: t('actions.practice'),
    minutes: t('units.minutes'),
    xp: t('units.xp'),
    urgent: t('badges.urgent'),
    recommended: t('badges.recommended'),
    wordsToReview: t('units.wordsToReview'),
    sectionTitle: t('sectionTitle'),
    noRecommendations: t('noRecommendations'),
  }), [t]);

  return (
    <RecommendationList
      recommendations={recommendations}
      maxDisplay={maxDisplay}
      onAction={handleAction}
      t={translationProps}
      className={className}
    />
  );
}
