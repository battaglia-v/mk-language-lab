import { PrismaClient } from '@prisma/client';

export type GateRoute = {
  id: string;
  label: string;
  path: string;
};

const LOCALE = process.env.RELEASE_GATE_LOCALE ?? 'en';

export const MAJOR_ROUTE_IDS = [
  'home',
  'learn',
  'pathsHub',
  'alphabetLesson',
  'lesson',
  'practice',
  'reader',
  'translate',
  'upgrade',
  'profile',
  'settings',
] as const;

const TOPIC_DECK_IDS = [
  'numbers-time-v1',
  'cyrillic-alphabet-v1',
] as const;

const LEARNING_PATH_IDS = ['a1', 'a2', '30day', 'topics'] as const;

const READER_SAMPLE_IDS = [
  'cafe-conversation',
  'day01-maliot-princ',
  'day-in-skopje',
] as const;

function r(path: string) {
  return `/${LOCALE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function resolveGateRoutes(): Promise<GateRoute[]> {
  const routes: GateRoute[] = [
    { id: 'home', label: 'Home', path: r('') },
    { id: 'dashboard', label: 'Dashboard (legacy)', path: r('/dashboard') },
    { id: 'learn', label: 'Learn', path: r('/learn') },
    { id: 'pathsHub', label: 'Paths', path: r('/learn/paths') },
    { id: 'alphabetLesson', label: 'Alphabet lesson', path: r('/learn/lessons/alphabet') },
    { id: 'practice', label: 'Practice', path: r('/practice') },
    { id: 'translate', label: 'Translate', path: r('/translate') },
    { id: 'reader', label: 'Reader', path: r('/reader') },
    { id: 'news', label: 'News', path: r('/news') },
    { id: 'resources', label: 'Resources', path: r('/resources') },
    { id: 'discover', label: 'Discover', path: r('/discover') },
    { id: 'dailyLessons', label: 'Daily lessons', path: r('/daily-lessons') },
    { id: 'notifications', label: 'Notifications', path: r('/notifications') },
    { id: 'tasks', label: 'Tasks', path: r('/tasks') },
    { id: 'profile', label: 'Profile', path: r('/profile') },
    { id: 'settings', label: 'Settings', path: r('/settings') },
    { id: 'help', label: 'Help', path: r('/help') },
    { id: 'about', label: 'About', path: r('/about') },
    { id: 'feedback', label: 'Feedback', path: r('/feedback') },
    { id: 'terms', label: 'Terms', path: r('/terms') },
    { id: 'privacy', label: 'Privacy', path: r('/privacy') },
    { id: 'upgrade', label: 'Upgrade', path: r('/upgrade') },
    { id: 'more', label: 'More', path: r('/more') },
    { id: 'onboarding', label: 'Onboarding', path: r('/onboarding') },
    { id: 'localizedSignIn', label: 'Sign in (localized)', path: r('/sign-in') },
    { id: 'authSignIn', label: 'Sign in', path: '/auth/signin' },
    { id: 'authSignUp', label: 'Sign up', path: '/auth/signup' },
    { id: 'authError', label: 'Auth error', path: '/auth/error' },
    { id: 'authSignOut', label: 'Sign out', path: '/auth/signout' },
    { id: 'offline', label: 'Offline', path: '/offline' },
  ];

  for (const id of LEARNING_PATH_IDS) {
    routes.push({
      id: `path-${id}`,
      label: `Path: ${id.toUpperCase()}`,
      path: r(`/learn/paths/${id}`),
    });
  }

  routes.push({ id: 'practiceCloze', label: 'Practice: Cloze', path: r('/practice/cloze') });
  routes.push({ id: 'practiceFillBlanks', label: 'Practice: Fill blanks', path: r('/practice/fill-blanks') });
  routes.push({ id: 'practiceWordGaps', label: 'Practice: Word gaps', path: r('/practice/word-gaps') });
  routes.push({ id: 'practiceWordSprint', label: 'Practice: Word sprint', path: r('/practice/word-sprint') });
  routes.push({ id: 'practicePronunciation', label: 'Practice: Pronunciation', path: r('/practice/pronunciation') });
  routes.push({ id: 'practiceGrammar', label: 'Practice: Grammar', path: r('/practice/grammar') });
  routes.push({ id: 'practiceDecks', label: 'Practice: Decks', path: r('/practice/decks') });
  routes.push({ id: 'practiceSession', label: 'Practice: Session', path: r('/practice/session') });
  routes.push({ id: 'practiceResults', label: 'Practice: Results', path: r('/practice/results') });

  for (const deckId of TOPIC_DECK_IDS) {
    routes.push({
      id: `practice-session-topic-${deckId}`,
      label: `Practice session topic deck: ${deckId}`,
      path: r(`/practice/session?deck=${encodeURIComponent(deckId)}&difficulty=all`),
    });
  }

  for (const sampleId of READER_SAMPLE_IDS) {
    routes.push({
      id: `reader-sample-${sampleId}`,
      label: `Reader sample: ${sampleId}`,
      path: r(`/reader/samples/${sampleId}`),
    });
    routes.push({
      id: `reader-sample-${sampleId}-v2`,
      label: `Reader sample v2: ${sampleId}`,
      path: r(`/reader/samples/${sampleId}/v2`),
    });
  }

  routes.push({ id: 'readerReview', label: 'Reader review', path: r('/reader/review') });
  routes.push({ id: 'readerAnalyze', label: 'Reader analyze', path: r('/reader/analyze') });

  if (shouldResolveLessonFromDb()) {
    const lessonId = await resolveAnyCurriculumLessonId().catch(() => null);
    if (lessonId) {
      routes.push({
        id: 'lesson',
        label: `Lesson: ${lessonId}`,
        path: r(`/lesson/${lessonId}`),
      });
    }
  }

  return routes;
}

function shouldResolveLessonFromDb(): boolean {
  if (process.env.RELEASE_GATE_RESOLVE_LESSON_FROM_DB === 'false') return false;

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  let hostname = 'localhost';
  try {
    hostname = new URL(baseURL).hostname;
  } catch {
    hostname = 'localhost';
  }
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function resolveAnyCurriculumLessonId(): Promise<string> {
  const prisma = new PrismaClient();
  try {
    const lesson = await prisma.curriculumLesson.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!lesson?.id) {
      throw new Error('No curriculum lessons found');
    }
    return lesson.id;
  } finally {
    await prisma.$disconnect();
  }
}
