import { describe, expect, it, vi } from 'vitest';
import {
  getPracticeCategories,
  getPracticePromptsForSession,
  evaluatePracticeAnswer,
  calculateAccuracy,
  calculateSessionProgress,
  selectNextPracticeIndex,
  getExpectedAnswer,
} from '../session';
import { SESSION_TARGET } from '../constants';
import type { PracticeDirection, PracticeItem } from '../types';

const mkPrompt = (overrides: Partial<PracticeItem> = {}): PracticeItem => ({
  id: overrides.id ?? '1',
  macedonian: overrides.macedonian ?? 'Здраво',
  english: overrides.english ?? 'Hello',
  englishAlternates: overrides.englishAlternates,
  macedonianAlternates: overrides.macedonianAlternates,
  category: overrides.category,
  contextEn: overrides.contextEn,
  contextMk: overrides.contextMk,
});

const prompt = mkPrompt({
  english: 'Hello',
  englishAlternates: ['Hi'],
  macedonian: 'Здраво',
});

describe('getPracticeCategories', () => {
  it('returns sorted unique categories', () => {
    const categories = getPracticeCategories([
      mkPrompt({ category: 'travel' }),
      mkPrompt({ category: 'basics' }),
      mkPrompt({ category: 'travel' }),
    ]);
    expect(categories).toEqual(['basics', 'travel']);
  });
});

describe('getPracticePromptsForSession', () => {
  const prompts = [
    mkPrompt({ id: '1', category: 'basics' }),
    mkPrompt({ id: '2', category: 'travel', contextEn: { sentence: 'I say {{blank}}', translation: '' } }),
  ];

  it('filters by category', () => {
    const result = getPracticePromptsForSession({
      prompts,
      category: 'basics',
      practiceMode: 'flashcard',
      direction: 'mkToEn',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('filters cloze prompts based on direction context', () => {
    const result = getPracticePromptsForSession({
      prompts,
      category: 'travel',
      practiceMode: 'cloze',
      direction: 'mkToEn',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });
});

describe('evaluatePracticeAnswer', () => {
  it.each<{
    label: string;
    answer: string;
    direction: PracticeDirection;
    expected: boolean;
  }>([
    { label: 'matches exact value', answer: 'hello', direction: 'mkToEn', expected: true },
    { label: 'matches alternate', answer: 'hi', direction: 'mkToEn', expected: true },
    { label: 'fails mismatched', answer: 'ciao', direction: 'mkToEn', expected: false },
  ])('$label', ({ answer, direction, expected }) => {
    const result = evaluatePracticeAnswer(answer, prompt, direction);
    expect(result?.isCorrect).toBe(expected);
  });

  it('returns null when prompt missing or empty answer', () => {
    expect(evaluatePracticeAnswer('', undefined, 'mkToEn')).toBeNull();
  });
});

describe('calculate helpers', () => {
  it('calculates accuracy', () => {
    expect(calculateAccuracy(3, 5)).toBe(60);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('calculates session progress and clamps to 100', () => {
    expect(calculateSessionProgress(2, SESSION_TARGET)).toBe(Math.round((2 / SESSION_TARGET) * 100));
    expect(calculateSessionProgress(999, 5)).toBe(100);
  });
});

describe('selectNextPracticeIndex', () => {
  it('picks a different index when possible', () => {
    const mockRandom = vi.fn()
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.6);
    const result = selectNextPracticeIndex(0, 3, mockRandom);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(3);
    expect(result).not.toBe(0);
  });

  it('returns current index when total <= 1', () => {
    expect(selectNextPracticeIndex(0, 1)).toBe(0);
  });
});

describe('getExpectedAnswer', () => {
  it('returns the correct field for direction', () => {
    expect(getExpectedAnswer(prompt, 'mkToEn')).toBe('Hello');
    expect(getExpectedAnswer(prompt, 'enToMk')).toBe('Здраво');
  });
});
