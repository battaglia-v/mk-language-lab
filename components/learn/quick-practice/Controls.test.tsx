import React, { useRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickPracticeControls } from './Controls';
import type { QuickPracticeControlsProps } from './Controls';

const translations: Record<string, string | ((values?: Record<string, string>) => string)> = {
  practiceFilterLabel: 'Category',
  practiceAllCategories: 'All categories',
  practiceModeLabel: 'Direction',
  practiceModeMkToEn: 'MK → EN',
  practiceModeEnToMk: 'EN → MK',
  practiceDrillModeLabel: 'Mode',
  practiceDrillModeFlashcard: 'Flashcards',
  practiceDrillModeCloze: 'Cloze',
  practiceDifficultyLabel: 'Intensity',
  practiceDifficultyCasualLabel: 'Casual',
  practiceDifficultyCasualDescription: 'Relaxed',
  practiceSkipPrompt: 'Skip prompt',
  practiceMoreActions: 'More actions',
  practiceRevealAnswer: 'Reveal answer',
  practiceReset: 'Reset session',
  checkAnswer: 'Check',
  practiceCheckingAnswer: 'Checking...',
  correctAnswer: 'Correct!',
  incorrectAnswer: (values?: Record<string, string>) => `Incorrect: ${values?.answer ?? ''}`,
  practiceAnswerRevealed: (values?: Record<string, string>) => `Revealed: ${values?.answer ?? ''}`,
  practiceClozeUnavailable: 'No cloze prompts.',
  practiceEmptyCategory: 'No prompts available.',
  practiceContinueLearning: 'Keep going',
  practiceHint: 'Try switching directions.',
  practiceClose: 'Close',
};

const translate: QuickPracticeControlsProps['translate'] = (key, values) => {
  const value = translations[key];
  if (typeof value === 'function') {
    return value(values);
  }
  return value ?? key;
};

const setupControls = (overrides?: Partial<QuickPracticeControlsProps>) => {
  const setCategorySpy = vi.fn();
  const onSubmitSpy = overrides?.onSubmit ?? vi.fn();
  const onNextPromptSpy = overrides?.onNextPrompt ?? vi.fn();

  function Wrapper() {
    const [category, setCategory] = useState('greetings');
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    const resolvedCategory = overrides?.category ?? category;
    const resolvedActionMenuOpen = overrides?.isActionMenuOpen ?? isActionMenuOpen;
    const [direction, setDirection] = useState<QuickPracticeControlsProps['direction']>('mkToEn');
    const [practiceMode, setPracticeMode] = useState<QuickPracticeControlsProps['practiceMode']>('flashcard');
    const [difficulty, setDifficulty] = useState<QuickPracticeControlsProps['difficulty']>('casual');
    const difficultyOptions = overrides?.difficultyOptions ?? [
      { id: 'casual', label: 'Casual', description: 'Relaxed' },
      { id: 'focus', label: 'Focus', description: 'Faster' },
    ];

    const props: QuickPracticeControlsProps = {
      isModalVariant: overrides?.isModalVariant ?? false,
      isInputFocused: overrides?.isInputFocused ?? false,
      setIsInputFocused: overrides?.setIsInputFocused ?? vi.fn(),
      categories: overrides?.categories ?? ['greetings', 'technology'],
      category: resolvedCategory,
      setCategory:
        overrides?.setCategory ??
        ((value) => {
          const next = typeof value === 'function' ? value(resolvedCategory) : value;
          setCategory(next);
          setCategorySpy(next);
        }),
      direction: overrides?.direction ?? direction,
      setDirection:
        overrides?.setDirection ??
        ((value) => {
          const next = typeof value === 'function' ? value(direction) : value;
          setDirection(next);
        }),
      practiceMode: overrides?.practiceMode ?? practiceMode,
      setPracticeMode:
        overrides?.setPracticeMode ??
        ((value) => {
          const next = typeof value === 'function' ? value(practiceMode) : value;
          setPracticeMode(next);
        }),
      difficulty: overrides?.difficulty ?? difficulty,
      setDifficulty:
        overrides?.setDifficulty ??
        ((value) => {
          const next = typeof value === 'function' ? value(difficulty) : value;
          setDifficulty(next);
        }),
      difficultyOptions,
      difficultyLabelText: overrides?.difficultyLabelText ?? 'Difficulty',
      selectedDifficultyLabel: overrides?.selectedDifficultyLabel ?? 'Casual',
      selectedDifficultyDescription: overrides?.selectedDifficultyDescription ?? 'Relaxed',
      categoryLabelText: overrides?.categoryLabelText ?? 'Category',
      categoryValue: overrides?.categoryValue ?? 'All categories',
      answer: overrides?.answer ?? 'hello',
      setAnswer: overrides?.setAnswer ?? vi.fn(),
      placeholder: overrides?.placeholder ?? 'Type the answer',
      isReady: overrides?.isReady ?? true,
      hasAvailablePrompts: overrides?.hasAvailablePrompts ?? true,
      onNextPrompt: onNextPromptSpy,
      formRef,
      isPrimaryDisabled: overrides?.isPrimaryDisabled ?? false,
      isSubmitting: overrides?.isSubmitting ?? false,
      onSubmit: onSubmitSpy,
      isActionMenuOpen: resolvedActionMenuOpen,
      setIsActionMenuOpen:
        overrides?.setIsActionMenuOpen ??
        ((value) => {
          const next = typeof value === 'function' ? value(resolvedActionMenuOpen) : value;
          setIsActionMenuOpen(next);
        }),
      onRevealAnswer: overrides?.onRevealAnswer ?? vi.fn(),
      onReset: overrides?.onReset ?? vi.fn(),
      feedback: overrides?.feedback ?? null,
      revealedAnswer: overrides?.revealedAnswer ?? '',
      translate: overrides?.translate ?? translate,
      isShaking: overrides?.isShaking ?? false,
      isClozeMode: overrides?.isClozeMode ?? false,
    };

    return <QuickPracticeControls {...props} />;
  }

  return {
    user: userEvent.setup(),
    setCategorySpy,
    onSubmitSpy,
    onNextPromptSpy,
    ...render(<Wrapper />),
  };
};

describe('QuickPracticeControls', () => {
  it('allows selecting a different category from the drawer', async () => {
    const { user, setCategorySpy } = setupControls();

    await user.click(screen.getByRole('button', { name: 'Category filters' }));
    await user.click(screen.getByRole('button', { name: 'Technology' }));

    expect(setCategorySpy).toHaveBeenCalledWith('technology');
  });

  it('only expands one selector panel at a time', async () => {
    const { user } = setupControls();

    const difficultyButton = screen.getByRole('button', { name: /Difficulty:/ });
    const directionButton = screen.getByRole('button', { name: /Direction:/ });

    await user.click(difficultyButton);
    expect(difficultyButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(directionButton);
    expect(directionButton).toHaveAttribute('aria-expanded', 'true');
    expect(difficultyButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('submits answers via the primary check button', async () => {
    const onSubmit = vi.fn();
    const { user } = setupControls({ onSubmit });

    await user.click(screen.getAllByRole('button', { name: 'Check' })[0]);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('invokes the skip handler when tapping the inline skip control', async () => {
    const onNextPrompt = vi.fn();
    const { user } = setupControls({ onNextPrompt });

    await user.click(screen.getByLabelText('Skip prompt'));
    expect(onNextPrompt).toHaveBeenCalledTimes(1);
  });

  it('shows a loading label while submitting', () => {
    setupControls({ isSubmitting: true });

    expect(screen.getAllByRole('button', { name: 'Checking...' }).length).toBeGreaterThan(0);
  });
});
