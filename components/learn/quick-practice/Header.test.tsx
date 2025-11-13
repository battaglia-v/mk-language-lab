import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickPracticeHeader } from './Header';

vi.mock('@mk/ui', () => ({
  WebProgressRing: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="progress-ring">
      {label}:{value}
    </div>
  ),
  WebStatPill: ({ label, value }: { label: string; value: string }) => (
    <div data-testid={`stat-pill-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      {label}:{value}
    </div>
  ),
}));

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
    Zap: Icon,
  };
});

const baseProps = {
  title: 'Daily Drills',
  summarySubtitle: 'Stay sharp with rapid-fire prompts.',
  isModalVariant: false,
  isInputFocused: false,
  streak: 7,
  hearts: 4,
  level: 'intermediate' as const,
  xp: 240,
  sessionProgress: 60,
  progressValueLabel: '3/5',
  progressLabel: 'Quick Practice',
  accuracyBadgeLabel: 'Great Accuracy',
  accuracyValueLabel: 'Accuracy: 80%',
  accuracyAccent: 'gold' as const,
  categoryValue: 'Greetings',
  categoryLabelText: 'Category',
  inlineProgressLabel: 'Progress: 3/5 ⚡ 80%',
};

describe('QuickPracticeHeader', () => {
  it('renders summary text, stats, and progress visualizations', () => {
    render(<QuickPracticeHeader {...baseProps} onToggleSettings={vi.fn()} />);

    expect(screen.getByText('Daily Drills')).toBeInTheDocument();
    expect(screen.getByText('Stay sharp with rapid-fire prompts.')).toBeInTheDocument();
    expect(screen.getByText('Progress: 3/5 ⚡ 80%')).toBeInTheDocument();
    expect(screen.getByTestId('progress-ring')).toHaveTextContent('Quick Practice:3/5');
    expect(screen.getByTestId('stat-pill-great-accuracy')).toHaveTextContent('Great Accuracy:Accuracy: 80%');
    expect(screen.getByTestId('stat-pill-category')).toHaveTextContent('Category:Greetings');
  });

  it('invokes onToggleSettings when the mobile settings button is pressed', async () => {
    const user = userEvent.setup();
    const toggleSpy = vi.fn();

    render(<QuickPracticeHeader {...baseProps} onToggleSettings={toggleSpy} />);

    await user.click(screen.getByRole('button', { name: 'Toggle settings' }));
    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });

  it('hides desktop stats while the input is focused', () => {
    render(<QuickPracticeHeader {...baseProps} isInputFocused onToggleSettings={vi.fn()} />);

    expect(screen.queryByTestId('progress-ring')).not.toBeInTheDocument();
    expect(screen.queryByTestId('stat-pill-great-accuracy')).not.toBeInTheDocument();
  });
});
