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
};

const translate: QuickPracticeControlsProps['translate'] = (key, values) => {
  const value = translations[key];
  if (typeof value === 'function') {
    return value(values);
  }
  return value ?? key;
};

type ControlsOverrides = Partial<Omit<QuickPracticeControlsProps, 'children'>> & {
  children?: React.ReactNode;
};

const setupControls = (overrides?: ControlsOverrides) => {
  const setCategorySpy = vi.fn();
  const onSubmitSpy = overrides?.onSubmit ?? vi.fn();
  const onNextPromptSpy = overrides?.onNextPrompt ?? vi.fn();

  function Wrapper() {
    const [category, setCategory] = useState('greetings');
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const categoryButtonRef = useRef<HTMLButtonElement | null>(null);
    const categoryMenuRef = useRef<HTMLDivElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    const resolvedCategory = overrides?.category ?? category;
    const resolvedMenuOpen = overrides?.isCategoryMenuOpen ?? isCategoryMenuOpen;
    const resolvedActionMenuOpen = overrides?.isActionMenuOpen ?? isActionMenuOpen;

    const props: QuickPracticeControlsProps = {
      children: overrides?.children ?? <div data-testid="prompt-slot">Prompt slot</div>,
      isModalVariant: overrides?.isModalVariant ?? false,
      isInputFocused: overrides?.isInputFocused ?? false,
      setIsInputFocused: overrides?.setIsInputFocused ?? vi.fn(),
      showSettings: overrides?.showSettings ?? true,
      categories: overrides?.categories ?? ['greetings', 'technology'],
      category: resolvedCategory,
      setCategory:
        overrides?.setCategory ??
        ((value) => {
          const next = typeof value === 'function' ? value(resolvedCategory) : value;
          setCategory(next);
          setCategorySpy(next);
        }),
      categoryButtonRef,
      categoryMenuRef,
      isCategoryMenuOpen: resolvedMenuOpen,
      setIsCategoryMenuOpen:
        overrides?.setIsCategoryMenuOpen ??
        ((value) => {
          const next = typeof value === 'function' ? value(resolvedMenuOpen) : value;
          setIsCategoryMenuOpen(next);
        }),
      direction: overrides?.direction ?? 'mkToEn',
      setDirection: overrides?.setDirection ?? vi.fn(),
      practiceMode: overrides?.practiceMode ?? 'flashcard',
      setPracticeMode: overrides?.setPracticeMode ?? vi.fn(),
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
  it('allows selecting a different category from the combobox', async () => {
    const { user, setCategorySpy } = setupControls();

    const categoryCombobox = screen.getByRole('combobox', { name: 'Category' });
    await user.click(categoryCombobox);
    await user.click(screen.getByRole('option', { name: 'Technology' }));

    expect(setCategorySpy).toHaveBeenCalledWith('technology');
    expect(categoryCombobox).toHaveTextContent('Technology');
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
