import type { PracticeCardId } from '@/data/practice';

export const JOURNEY_IDS = ['family', 'travel', 'culture'] as const;
export type JourneyId = (typeof JOURNEY_IDS)[number];

export type JourneyPracticeRecommendation = {
  cardId: PracticeCardId;
  reasonKey: string;
  label: string;
  reason: string;
};

export type JourneyDefinition = {
  id: JourneyId;
  slug: string;
  path: string;
  title: string;
  summary: string;
  focusAreas: string[];
  tutorSupport: string;
  practiceRecommendations: JourneyPracticeRecommendation[];
};

export type JourneyProgressContext = {
  stepsThisWeek: number;
  totalSessions: number;
  lastSessionIso: string | null;
};

const definitions: Record<JourneyId, JourneyDefinition> = {
  family: {
    id: 'family',
    slug: 'family',
    path: '/journey/family',
    title: 'Family conversations',
    summary:
      'Reconnect with relatives using warm greetings, everyday stories, and supportive replies that sound natural in Macedonian.',
    focusAreas: [
      'Craft authentic greetings and follow-up questions to keep the conversation flowing',
      'Respond to personal stories with empathy and shared experiences',
      'Switch smoothly between informal and respectful tones depending on the speaker',
    ],
    tutorSupport:
      'Provide sample conversations, key family-themed vocabulary, and tone tips that sound warm yet respectful. Highlight ways to ask about relatives, health, and family news.',
    practiceRecommendations: [
      {
        cardId: 'translate',
        label: 'Phrase refresh',
        reasonKey: 'goals.family.practice.phrases',
        reason: 'Review introductions and warm check-ins before your next conversation.',
      },
      {
        cardId: 'tutor',
        label: 'Tutor check-in',
        reasonKey: 'goals.family.practice.tutor',
        reason: 'Ask the tutor to role-play family calls and coach your tone.',
      },
    ],
  },
  travel: {
    id: 'travel',
    slug: 'travel',
    path: '/journey/travel',
    title: 'Travel prep',
    summary:
      'Feel prepared for transit, lodging, and dining in Macedonia with confident phrases and cultural cues.',
    focusAreas: [
      'Use must-know verbs and nouns for transport and directions',
      'Ask key questions for hotels, rentals, and reservations',
      'Handle cafés, markets, and polite interactions confidently',
    ],
    tutorSupport:
      'Prioritize survival phrases, transport logistics, and etiquette. Give sample dialogues for tickets, lodging, and ordering food, plus cultural do’s and don’ts.',
    practiceRecommendations: [
      {
        cardId: 'tasks',
        label: 'Task sprints',
        reasonKey: 'goals.travel.practice.tasks',
        reason: 'Run a transport drill set to lock in must-know travel vocabulary.',
      },
      {
        cardId: 'tutor',
        label: 'Tutor check-in',
        reasonKey: 'goals.travel.practice.tutor',
        reason: 'Have the tutor simulate booking and check-in chats before you go.',
      },
    ],
  },
  culture: {
    id: 'culture',
    slug: 'culture',
    path: '/journey/culture',
    title: 'Cultural fluency',
    summary:
      'Pair Macedonian media, history, and reflection so language learning deepens your cultural perspective.',
    focusAreas: [
      'Explore headlines to collect grammar-in-context insights',
      'Shadow podcasts to mirror pronunciation and rhythm',
      'Write bilingual reflections to reinforce new expressions',
    ],
    tutorSupport:
      'Blend language coaching with cultural context. Reference articles, music, or history, and invite reflective prompts that connect the content to the learner’s life.',
    practiceRecommendations: [
      {
        cardId: 'translate',
        label: 'Quick translator',
        reasonKey: 'goals.culture.practice.translate',
        reason: 'Translate current headlines to spot grammar and collect phrases.',
      },
      {
        cardId: 'tutor',
        label: 'Culture Discussion',
        reasonKey: 'goals.culture.practice.tutor',
        reason: 'Discuss customs and historical events with your AI tutor.',
      },
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

export function buildJourneyTutorPrompt(journeyId: JourneyId, progress?: JourneyProgressContext): string {
  const journey = definitions[journeyId];

  const lines: string[] = [
    `Journey name: ${journey.title}`,
    `Summary: ${journey.summary}`,
    'Focus areas:',
    ...journey.focusAreas.map((focus) => `- ${focus}`),
    'Suggested practice:',
    ...journey.practiceRecommendations.map((rec) => `- ${rec.label}: ${rec.reason}`),
    `Tutor guidance: ${journey.tutorSupport}`,
  ];

  if (progress) {
    lines.push(
      '',
      'Learner progress signals:',
      `- Steps logged this week: ${progress.stepsThisWeek}`,
      `- Total sessions logged: ${progress.totalSessions}`,
      `- Last session recorded (ISO): ${progress.lastSessionIso ?? 'Not recorded'}`
    );
  }

  return lines.join('\n');
}
