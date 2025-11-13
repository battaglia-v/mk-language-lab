import type { PracticeDirection, PracticeDrillMode, PracticeItem } from './types';
import { normalizeAnswer } from './normalize';
import { ALL_CATEGORIES, SESSION_TARGET } from './constants';
import { CLOZE_TOKEN } from './cloze';

export function getPracticeCategories(prompts: PracticeItem[]): string[] {
  const unique = new Set<string>();
  prompts.forEach((item) => {
    if (item.category) {
      unique.add(item.category);
    }
  });
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

type PracticePromptFilter = {
  prompts: PracticeItem[];
  category?: string;
  practiceMode: PracticeDrillMode;
  direction: PracticeDirection;
  clozeToken?: string;
};

export function getPracticePromptsForSession({
  prompts,
  category = ALL_CATEGORIES,
  practiceMode,
  direction,
  clozeToken = CLOZE_TOKEN,
}: PracticePromptFilter): PracticeItem[] {
  let list = prompts;
  if (category !== ALL_CATEGORIES) {
    list = list.filter((item) => item.category === category);
  }
  if (practiceMode === 'cloze') {
    list = list.filter((item) => {
      const context = direction === 'enToMk' ? item.contextMk : item.contextEn;
      return Boolean(context?.sentence?.includes(clozeToken));
    });
  }
  return list;
}

export type PracticeEvaluationResult = {
  expectedAnswer: string;
  normalizedExpected: string;
  normalizedInput: string;
  isCorrect: boolean;
  matchedAlternate: boolean;
};

export function getExpectedAnswer(item: PracticeItem | undefined, direction: PracticeDirection): string {
  if (!item) return '';
  return direction === 'mkToEn' ? item.english ?? '' : item.macedonian ?? '';
}

export function evaluatePracticeAnswer(
  answer: string,
  item: PracticeItem | undefined,
  direction: PracticeDirection
): PracticeEvaluationResult | null {
  const trimmed = answer.trim();
  if (!item || !trimmed) return null;
  const expectedAnswer = getExpectedAnswer(item, direction);
  const normalizedExpected = normalizeAnswer(expectedAnswer);
  const alternates =
    direction === 'mkToEn'
      ? item.englishAlternates?.map(normalizeAnswer) ?? []
      : item.macedonianAlternates?.map(normalizeAnswer) ?? [];
  const normalizedInput = normalizeAnswer(trimmed);
  const isCorrect = normalizedInput === normalizedExpected || alternates.includes(normalizedInput);
  return {
    expectedAnswer,
    normalizedExpected,
    normalizedInput,
    isCorrect,
    matchedAlternate: alternates.includes(normalizedInput),
  };
}

export function calculateAccuracy(correctCount: number, totalAttempts: number): number {
  if (totalAttempts <= 0) return 0;
  return Math.round((correctCount / totalAttempts) * 100);
}

export function calculateSessionProgress(correctCount: number, target: number = SESSION_TARGET): number {
  if (target <= 0) return 0;
  const progress = Math.round((correctCount / target) * 100);
  return Math.min(100, Math.max(0, progress));
}

export function selectNextPracticeIndex(
  currentIndex: number,
  total: number,
  randomFn: () => number = Math.random
): number {
  if (total <= 1) {
    return Math.max(0, Math.min(currentIndex, total - 1));
  }
  let nextIndex = currentIndex;
  const maxAttempts = total * 2;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = Math.floor(randomFn() * total);
    if (candidate !== currentIndex) {
      nextIndex = candidate;
      break;
    }
  }
  return nextIndex;
}
