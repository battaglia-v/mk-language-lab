import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickPracticePrompt } from './Prompt';

describe('QuickPracticePrompt', () => {
  const baseProps = {
    label: 'Translate from Macedonian',
    content: 'здраво',
    categoryLabel: 'Category: Greetings',
    isClozeMode: false,
    clozeTranslationLabel: 'Translation',
    isInputFocused: false,
    isModalVariant: false,
    audioLabel: 'Audio prompt',
    progressValueLabel: '1/5',
    hearts: 3,
    accuracyShortLabel: '80%',
  };

  it('renders the prompt label, content, and category', () => {
    render(<QuickPracticePrompt {...baseProps} />);

    expect(screen.getByText('Translate from Macedonian')).toBeInTheDocument();
    expect(screen.getByText('здраво')).toBeInTheDocument();
    expect(screen.getByText('Category: Greetings')).toBeInTheDocument();
  });

  it('shows the translation helper when cloze mode is active', () => {
    render(
      <QuickPracticePrompt
        {...baseProps}
        isClozeMode
        clozeTranslation="hello there"
      />
    );

    const translationLine = screen.getByText(/Translation:/).parentElement;
    expect(translationLine).toHaveTextContent('Translation: hello there');
  });
});
