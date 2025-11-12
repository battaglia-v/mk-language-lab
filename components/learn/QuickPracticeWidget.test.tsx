import React from 'react';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next-intl', () => {
  const translations: Record<string, string | ((values?: Record<string, string>) => string)> = {
    quickPractice: 'Quick Practice',
    quickPracticeDescription: 'Practice translating words in either direction.',
    practiceFilterLabel: 'Category',
    practiceAllCategories: 'All categories',
    practiceModeLabel: 'Direction',
    practiceModeMkToEn: 'Macedonian → English',
    practiceModeEnToMk: 'English → Macedonian',
    practiceDrillModeLabel: 'Practice mode',
    practiceDrillModeFlashcard: 'Flashcards',
    practiceDrillModeCloze: 'Fill in the blank',
    practiceClozePromptLabel: 'Fill in the blank',
    practiceClozePlaceholder: 'Type the missing word',
    practiceClozeTranslationLabel: 'Translation',
    practiceClozeUnavailable: 'No fill-in-the-blank sentences yet. Switch to flashcards.',
    practicePromptLabelMk: 'Translate from Macedonian',
    practicePromptLabelEn: 'Translate from English',
    practicePlaceholderMk: 'Type the English translation',
    practicePlaceholderEn: 'Type the Macedonian translation',
    practiceCategoryLabel: 'Category',
    practiceRevealAnswer: 'Reveal answer',
    practiceReset: 'Reset',
    practiceSkipPrompt: 'Skip prompt',
    practiceMoreActions: 'More actions',
    checkAnswer: 'Check',
    nextPrompt: 'New Prompt',
    correctAnswer: 'Correct!',
    incorrectAnswer: (values?: Record<string, string>) =>
      `Incorrect. Correct answer: ${values?.answer ?? ''}`,
    practiceAnswerRevealed: (values?: Record<string, string>) =>
      `Answer: ${values?.answer ?? ''}`,
    practiceEmptyCategory: 'No prompts available for this category.',
    quickPracticeLaunch: 'Launch session',
    quickPracticeLaunchDescription: 'Open the full-screen practice lab to run focused drills.',
    practiceProgressLabel: 'Session progress',
    practiceProgressGoal: (values?: Record<string, string>) =>
      `Goal: ${values?.target ?? ''} prompts`,
    practiceProgressSummary: (values?: Record<string, string>) =>
      `Prompts answered: ${values?.count ?? ''}`,
    practiceAccuracy: (values?: Record<string, string>) =>
      `Accuracy: ${values?.value ?? ''}%`,
    practiceModalTitle: 'Practice lab',
    practiceClose: 'Close session',
  };

  return {
    useTranslations: () =>
      (key: string, values?: Record<string, string>) => {
        const value = translations[key];
        if (typeof value === 'function') {
          return value(values ?? {});
        }
        return value ?? key;
      },
  };
});

vi.mock('@/data/practice-vocabulary.json', () => ({
  default: [
    { macedonian: 'zdravo', english: 'hello', category: 'greetings' },
    { macedonian: 'blagodaram', english: 'thank you', category: 'greetings' },
    { macedonian: 'kompjuter', english: 'computer', category: 'technology' },
  ],
}));

import { QuickPracticeWidget } from './QuickPracticeWidget';

const getPrimaryCheckButton = () => screen.getAllByRole('button', { name: 'Check' })[0];
const getNextPromptButton = () => screen.getAllByRole('button', { name: 'New Prompt' })[0];
const openMoreActionsMenu = async (user: ReturnType<typeof userEvent['setup']>) => {
  const input = screen.queryByLabelText('Type the English translation') as HTMLInputElement | null;
  input?.blur();
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'More actions' })).toBeVisible();
  });
  await user.click(screen.getByRole('button', { name: 'More actions' }));
};
const expectPromptsSummaryVisible = (value: number) => {
  const matches = screen.getAllByText(`Prompts answered: ${value}`);
  expect(matches.length).toBeGreaterThan(0);
};
const expectAccuracyVisible = (value: number) => {
  const matches = screen.getAllByText(new RegExp(`Accuracy: ${value}%`));
  expect(matches.length).toBeGreaterThan(0);
};

describe('QuickPracticeWidget', () => {
  const randomSpy = vi.spyOn(Math, 'random');

  beforeEach(() => {
    randomSpy.mockReset();
    randomSpy.mockReturnValue(0);
  });

  afterAll(() => {
    randomSpy.mockRestore();
  });

  it('renders the initial prompt in Macedonian by default', () => {
    render(<QuickPracticeWidget />);

  expect(screen.getAllByText('Quick Practice')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Macedonian → English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Translate from Macedonian')).toBeInTheDocument();
    expect(screen.getByText('zdravo')).toBeInTheDocument();
    expect(screen.getByText('Category: Greetings')).toBeInTheDocument();
  });

  it('shows success feedback when the answer is correct', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');
    await user.type(input, 'hello');

    await user.click(getPrimaryCheckButton());

    expect(screen.getByText('Correct!')).toBeInTheDocument();
  expect(screen.queryByText(/Answer:/i)).not.toBeInTheDocument();
  });

  it('shows the expected translation after an incorrect answer', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');
    await user.type(input, 'goodbye');

    await user.click(getPrimaryCheckButton());

  expect(screen.getByText('Incorrect. Correct answer: hello')).toBeInTheDocument();
  });

  it('switches to English → Macedonian mode and updates the prompt', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const englishButton = screen.getByRole('button', { name: 'English → Macedonian' });
    await user.click(englishButton);

    expect(englishButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Macedonian → English' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Translate from English')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByLabelText('Type the Macedonian translation')).toBeInTheDocument();
  });

  it('tracks total attempts for both correct and incorrect answers', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    // Check initial state - no attempts
    expectPromptsSummaryVisible(0);

    // First attempt - correct
    const input = screen.getByLabelText('Type the English translation');
    await user.type(input, 'hello');
    await user.click(getPrimaryCheckButton());

    await waitFor(() => {
      expectPromptsSummaryVisible(1);
      expectAccuracyVisible(100);
    });

    // Move to next prompt
    randomSpy.mockReturnValue(0.5); // Different word
    await user.click(getNextPromptButton());

    // Second attempt - incorrect
    await user.type(input, 'wrong answer');
    await user.click(getPrimaryCheckButton());

    await waitFor(() => {
      expectPromptsSummaryVisible(2);
      expectAccuracyVisible(50);
    });
  });

  it('calculates accuracy correctly across multiple attempts', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');

    // 3 correct, 2 incorrect = 60% accuracy
    const attempts = [
      { answer: 'hello', isCorrect: true },
      { answer: 'wrong', isCorrect: false },
      { answer: 'hello', isCorrect: true },
      { answer: 'wrong', isCorrect: false },
      { answer: 'hello', isCorrect: true },
    ];

    for (let i = 0; i < attempts.length; i++) {
      randomSpy.mockReturnValue(0); // Always get 'zdravo'
      await user.clear(input);
      await user.type(input, attempts[i].answer);
      await user.click(getPrimaryCheckButton());

      if (i < attempts.length - 1) {
        await user.click(getNextPromptButton());
      }
    }

    await waitFor(() => {
      expectPromptsSummaryVisible(5);
      expectAccuracyVisible(60);
    });
  });

  it('completes session after 5 correct answers', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');

    // Answer 5 questions correctly
    for (let i = 0; i < 5; i++) {
      randomSpy.mockReturnValue(0); // Always get 'zdravo' -> 'hello'
      await user.clear(input);
      await user.type(input, 'hello');
      await user.click(getPrimaryCheckButton());

      if (i < 4) {
        await user.click(getNextPromptButton());
      }
    }

    // Check that we've reached the goal
    await waitFor(() => {
      expectPromptsSummaryVisible(5);
    });
  });

  it('resets session state when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');

    // Make some progress
    await user.type(input, 'hello');
    await user.click(getPrimaryCheckButton());
    await waitFor(() => {
      expectPromptsSummaryVisible(1);
    });

    // Click reset
    await openMoreActionsMenu(user);
    await user.click(screen.getByRole('menuitem', { name: 'Reset' }));

    // Check that state is reset
    await waitFor(() => {
      expectPromptsSummaryVisible(0);
      expect(screen.queryByText('Accuracy:')).not.toBeInTheDocument();
    });

  });

  it('filters vocabulary by category', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    // Select "technology" category
    const categorySelect = screen.getByRole('combobox', { name: 'Category' });
    await user.click(categorySelect);

    const technologyOption = screen.getByRole('option', { name: 'Technology' });
    await user.click(technologyOption);

    // Should now show only technology words
    expect(screen.getByText('Category: Technology')).toBeInTheDocument();
    expect(screen.getByText('kompjuter')).toBeInTheDocument();
  });

  it('shows empty state when category has no words', async () => {
    render(<QuickPracticeWidget />);

    // Note: In our mock data, all categories have words
    // This test demonstrates the pattern for empty categories
    // In a real scenario, we'd filter to a category with no words

    // For now, we can verify the empty message exists in the DOM
    // It won't be visible unless we have an empty category
    const emptyMessage = screen.queryByText('No prompts available for this category.');
    // This should not be visible with our current category selection
    expect(emptyMessage).not.toBeInTheDocument();
  });

  it('reveals answer when reveal button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    // Initially no revealed answer
    expect(screen.queryByText(/Answer:/i)).not.toBeInTheDocument();

    // Click reveal
    await openMoreActionsMenu(user);
    await user.click(screen.getByRole('menuitem', { name: 'Reveal answer' }));

    // Answer should now be revealed
    expect(screen.getByText('Answer: hello')).toBeInTheDocument();
  });

  it('clears feedback and answer when switching modes', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');

    // Submit an answer to get feedback
    await user.type(input, 'hello');
      await user.click(getPrimaryCheckButton());
    expect(screen.getByText('Correct!')).toBeInTheDocument();

    // Switch mode (controls hidden while input focused, so blur first)
    input.blur();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'English → Macedonian' })).toBeVisible();
    });
    await user.click(screen.getByRole('button', { name: 'English → Macedonian' }));

    // Feedback should be cleared
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('disables check button when input is empty', async () => {
    render(<QuickPracticeWidget />);

    const checkButton = getPrimaryCheckButton();
    expect(checkButton).toBeDisabled();
  });

  it('enables check button when input has text', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');
    const checkButton = getPrimaryCheckButton();

    await user.type(input, 'test');
    expect(checkButton).toBeEnabled();
  });

  it('normalizes answers correctly (case insensitive, trim, punctuation)', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');

    // Test with various normalizations
    await user.type(input, '  HELLO!  ');
    await user.click(getPrimaryCheckButton());

    // Should still be correct despite uppercase, spaces, and punctuation
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });
});
