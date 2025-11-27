import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuickPracticeSession } from './useQuickPracticeSession';

const trackEventMock = vi.fn();
const updateProgressMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/analytics', () => ({
  AnalyticsEvents: {
    PRACTICE_ANSWER_CORRECT: 'practice_answer_correct',
    PRACTICE_ANSWER_INCORRECT: 'practice_answer_incorrect',
    PRACTICE_CLOZE_ANSWER_CORRECT: 'cloze_answer_correct',
    PRACTICE_CLOZE_ANSWER_INCORRECT: 'cloze_answer_incorrect',
    PRACTICE_COMPLETED: 'practice_completed',
    PRACTICE_GAME_OVER: 'practice_game_over',
    PRACTICE_SESSION_NEW: 'practice_session_new',
    PRACTICE_SESSION_CONTINUE: 'practice_session_continue',
  },
  trackEvent: (event: string, payload?: Record<string, unknown>) => {
    trackEventMock(event, payload);
  },
}));

vi.mock('@/hooks/useGameProgress', () => ({
  useGameProgress: () => ({
    streak: 3,
    xp: 120,
    level: 'beginner' as const,
    updateProgress: updateProgressMock,
  }),
}));

const SAMPLE_PROMPTS = [
  {
    id: 'prompt-1',
    macedonian: 'здраво',
    english: 'hello',
    category: 'greetings',
  },
  {
    id: 'prompt-2',
    macedonian: 'град',
    english: 'city',
    category: 'travel',
  },
];

const randomSpy = vi.spyOn(Math, 'random');

beforeEach(() => {
  randomSpy.mockReturnValue(0);
  trackEventMock.mockClear();
  updateProgressMock.mockClear();
});

afterEach(() => {
  randomSpy.mockReset();
});

afterAll(() => {
  randomSpy.mockRestore();
});

describe('useQuickPracticeSession', () => {
  it('marks correct answers and updates progress metrics', async () => {
    const { result } = renderHook(() =>
      useQuickPracticeSession({
        prompts: SAMPLE_PROMPTS,
      })
    );

    act(() => {
      result.current.setAnswer('hello');
    });

    await act(async () => {
      await result.current.handleCheck();
    });

    expect(result.current.feedback).toBe('correct');
    expect(result.current.correctCount).toBe(1);
    expect(result.current.totalAttempts).toBe(1);
    expect(result.current.accuracy).toBe(100);
    expect(result.current.sessionProgress).toBeGreaterThan(0);
    expect(trackEventMock).toHaveBeenCalledWith('practice_answer_correct', expect.any(Object));
  });

  it('reveals the expected answer and decrements hearts on incorrect attempts', async () => {
    const { result } = renderHook(() =>
      useQuickPracticeSession({
        prompts: SAMPLE_PROMPTS,
      })
    );

    act(() => {
      result.current.setAnswer('goodbye');
    });

    await act(async () => {
      await result.current.handleCheck();
    });

    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.revealedAnswer).toBe('hello');
    expect(result.current.hearts).toBeLessThan(5);
    expect(trackEventMock).toHaveBeenCalledWith('practice_answer_incorrect', expect.any(Object));
  });

  it('resets the session state when handleReset is called', async () => {
    const { result } = renderHook(() =>
      useQuickPracticeSession({
        prompts: SAMPLE_PROMPTS,
      })
    );

    act(() => {
      result.current.setAnswer('hello');
    });
    await act(async () => {
      await result.current.handleCheck();
    });

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.correctCount).toBe(0);
    expect(result.current.totalAttempts).toBe(0);
    expect(result.current.feedback).toBeNull();
    expect(result.current.revealedAnswer).toBe('');
  });

  it('clears prompts when switching to a category with no entries', async () => {
    const { result } = renderHook(() =>
      useQuickPracticeSession({
        prompts: SAMPLE_PROMPTS,
      })
    );

    await act(async () => {
      result.current.setCategory('nonexistent');
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(result.current.hasAvailablePrompts).toBe(false);
    expect(result.current.currentItem).toBeUndefined();
  });
});
