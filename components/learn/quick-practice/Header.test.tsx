import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuickPracticeHeader } from './Header';

describe('QuickPracticeHeader', () => {
  const baseProps = {
    title: 'Daily Drills',
    summarySubtitle: 'Stay sharp with rapid-fire prompts.',
    isModalVariant: false,
    isInputFocused: false,
    isMobileViewport: false,
    streak: 12,
    hearts: 4,
    xp: 150,
    difficultyName: 'Medium',
    difficultyLabelText: 'Difficulty',
    inlineProgressLabel: 'Progress: 3/5 ⚡ 80%',
    progressValueLabel: '3/5',
  };

  it('renders title, progress, and hearts', () => {
    render(<QuickPracticeHeader {...baseProps} />);

    expect(screen.getByText('Daily Drills')).toBeInTheDocument();
    expect(screen.getByText('Stay sharp with rapid-fire prompts.')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('shows HUD when not collapsed', () => {
    render(<QuickPracticeHeader {...baseProps} />);

    expect(screen.getByText('12')).toBeInTheDocument(); // streak
    expect(screen.getByText('150 XP')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument(); // difficulty
  });

  it('hides HUD when input is focused on mobile', () => {
    render(<QuickPracticeHeader {...baseProps} isInputFocused isMobileViewport />);

    // HUD should be hidden
    expect(screen.queryByText('150 XP')).not.toBeInTheDocument();

    // But progress and hearts should still be visible
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });
});
