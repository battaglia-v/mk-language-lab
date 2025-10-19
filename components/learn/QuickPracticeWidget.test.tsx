import React from 'react';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    practicePromptLabelMk: 'Translate from Macedonian',
    practicePromptLabelEn: 'Translate from English',
    practicePlaceholderMk: 'Type the English translation',
    practicePlaceholderEn: 'Type the Macedonian translation',
    practiceCategoryLabel: 'Category',
    practiceRevealAnswer: 'Reveal answer',
    practiceReset: 'Reset',
    checkAnswer: 'Check Answer',
    nextPrompt: 'Show another word',
    correctAnswer: 'Correct!',
    incorrectAnswer: (values?: Record<string, string>) =>
      `Incorrect. Correct answer: ${values?.answer ?? ''}`,
    practiceAnswerRevealed: (values?: Record<string, string>) =>
      `Answer: ${values?.answer ?? ''}`,
    practiceEmptyCategory: 'No prompts available for this category.',
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

  expect(screen.getByText('Quick Practice')).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'Check Answer' }));

    expect(screen.getByText('Correct!')).toBeInTheDocument();
  expect(screen.queryByText(/Answer:/i)).not.toBeInTheDocument();
  });

  it('shows the expected translation after an incorrect answer', async () => {
    const user = userEvent.setup();
    render(<QuickPracticeWidget />);

    const input = screen.getByLabelText('Type the English translation');
    await user.type(input, 'goodbye');

    await user.click(screen.getByRole('button', { name: 'Check Answer' }));

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
});
