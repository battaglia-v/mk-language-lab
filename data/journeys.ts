import type { PracticeCardId } from '@/data/practice';

export const JOURNEY_IDS = ['family', 'travel', 'culture'] as const;
export type JourneyId = (typeof JOURNEY_IDS)[number];

export type JourneyPracticeRecommendation = {
  cardId: PracticeCardId;
  reasonKey: string;
};

export type JourneyDefinition = {
  id: JourneyId;
  slug: string;
  path: string;
  practiceRecommendations: JourneyPracticeRecommendation[];
};

const definitions: Record<JourneyId, JourneyDefinition> = {
  family: {
    id: 'family',
    slug: 'family',
    path: '/journey/family',
    practiceRecommendations: [
      { cardId: 'quick-phrases', reasonKey: 'goals.family.practice.phrases' },
      { cardId: 'tutor', reasonKey: 'goals.family.practice.tutor' },
    ],
  },
  travel: {
    id: 'travel',
    slug: 'travel',
    path: '/journey/travel',
    practiceRecommendations: [
      { cardId: 'tasks', reasonKey: 'goals.travel.practice.tasks' },
      { cardId: 'tutor', reasonKey: 'goals.travel.practice.tutor' },
    ],
  },
  culture: {
    id: 'culture',
    slug: 'culture',
    path: '/journey/culture',
    practiceRecommendations: [
      { cardId: 'translate', reasonKey: 'goals.culture.practice.translate' },
      { cardId: 'pronunciation', reasonKey: 'goals.culture.practice.pronunciation' },
    ],
  },
};

export const JOURNEY_DEFINITIONS = definitions;

export function isJourneyId(value: unknown): value is JourneyId {
  if (typeof value !== 'string') {
    return false;
  }

  return JOURNEY_IDS.includes(value as JourneyId);
}

export function getJourneyDefinition(goal: string | null | undefined): JourneyDefinition | undefined {
  if (!goal) {
    return undefined;
  }

  return isJourneyId(goal) ? definitions[goal] : undefined;
}

export function getPrimaryJourneyPracticeCard(journeyId: JourneyId): PracticeCardId | null {
  const first = definitions[journeyId]?.practiceRecommendations[0];

  return first ? first.cardId : null;
}
