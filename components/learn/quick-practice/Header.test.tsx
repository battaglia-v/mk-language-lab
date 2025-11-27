import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickPracticeHeader } from './Header';

vi.mock('lucide-react', () => {
  const Icon = ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="icon">{children}</span>
  );
  return {
    __esModule: true,
    Flame: Icon,
    Heart: Icon,
    MoreVertical: Icon,
    Shield: Icon,
    Sparkles: Icon,
    Zap: Icon,
  };
});

const baseProps = {
  title: 'Daily Drills',
  summarySubtitle: 'Stay sharp with rapid-fire prompts.',
  isModalVariant: false,
  isInputFocused: false,
  isMobileViewport: false,
  streak: 7,
  hearts: 4,
  level: 'intermediate' as const,
  xp: 240,
  accuracyBadgeLabel: 'Great Accuracy',
  accuracyValueLabel: 'Accuracy: 80%',
  categoryValue: 'Greetings',
  categoryLabelText: 'Category',
  difficultyName: 'Casual',
  difficultyLabelText: 'Difficulty',
  inlineProgressLabel: 'Progress: 3/5 ⚡ 80%',
  progressValueLabel: '3/5',
  heartsValueLabel: '4/5',
  accuracyShortLabel: '80%',
};

describe('QuickPracticeHeader', () => {
  it('renders summary text, HUD stats, and category info', () => {
    render(<QuickPracticeHeader {...baseProps} />);

    expect(screen.getByText('Daily Drills')).toBeInTheDocument();
    expect(screen.getByText('Stay sharp with rapid-fire prompts.')).toBeInTheDocument();
    expect(screen.getByTestId('practice-hud')).toHaveAttribute('data-collapsed', 'false');
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Greetings')).toBeInTheDocument();
    expect(screen.getAllByText('Progress: 3/5 ⚡ 80%')[0]).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(screen.getAllByText('80%')[0]).toBeInTheDocument();
  });

  it('collapses the HUD into a pill on mobile focus', () => {
    render(<QuickPracticeHeader {...baseProps} isInputFocused isMobileViewport />);

    expect(screen.getByTestId('practice-hud')).toHaveAttribute('data-collapsed', 'true');
  });
});
