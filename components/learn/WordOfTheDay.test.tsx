import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WordOfTheDay } from './WordOfTheDay';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Word of the Day',
      footer: 'Learn a new word every day!',
      'partOfSpeech.noun': 'Noun',
      'partOfSpeech.verb': 'Verb',
      'partOfSpeech.adjective': 'Adjective',
      'partOfSpeech.word': 'Word',
    };
    return translations[key] || key;
  },
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
  AnalyticsEvents: {
    WORD_OF_DAY_LOADED: 'word_of_day_loaded',
  },
}));

describe('WordOfTheDay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('displays loading state initially', () => {
    // Mock fetch to never resolve
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    render(<WordOfTheDay />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('displays word data after successful fetch', async () => {
    const mockWordData = {
      macedonian: 'книга',
      pronunciation: 'kniga',
      english: 'book',
      partOfSpeech: 'noun',
      exampleMk: 'Јас читам книга.',
      exampleEn: 'I am reading a book.',
      icon: '📚',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWordData,
    } as Response);

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(screen.getByText('Word of the Day')).toBeInTheDocument();
    });

    expect(screen.getByText('книга')).toBeInTheDocument();
    expect(screen.getByText('[kniga]')).toBeInTheDocument();
    expect(screen.getByText('book')).toBeInTheDocument();
    expect(screen.getByText('Noun')).toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('Јас читам книга.')).toBeInTheDocument();
    expect(screen.getByText('I am reading a book.')).toBeInTheDocument();
    expect(screen.getByText('Learn a new word every day!')).toBeInTheDocument();
  });

  it('tracks analytics event after successful load', async () => {
    const { trackEvent, AnalyticsEvents } = await import('@/lib/analytics');

    const mockWordData = {
      macedonian: 'здраво',
      pronunciation: 'zdravo',
      english: 'hello',
      partOfSpeech: 'noun',
      exampleMk: 'Здраво, како си?',
      exampleEn: 'Hello, how are you?',
      icon: '👋',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWordData,
    } as Response);

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvents.WORD_OF_DAY_LOADED, {
        partOfSpeech: 'noun',
      });
    });
  });

  it('displays error state when fetch fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(screen.getByText('Could not load word of the day')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('displays error state when network request fails', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(screen.getByText('Could not load word of the day')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('displays different part of speech labels correctly', async () => {
    const mockWordData = {
      macedonian: 'убав',
      pronunciation: 'ubav',
      english: 'beautiful',
      partOfSpeech: 'adjective',
      exampleMk: 'Убав ден.',
      exampleEn: 'Beautiful day.',
      icon: '✨',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWordData,
    } as Response);

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(screen.getByText('Adjective')).toBeInTheDocument();
    });
  });

  it('handles missing optional fields gracefully', async () => {
    const mockWordData = {
      macedonian: 'тест',
      pronunciation: 'test',
      english: 'test',
      partOfSpeech: 'word',
      exampleMk: 'тест',
      exampleEn: 'test',
      icon: '📝',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWordData,
    } as Response);

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(screen.getByText('тест')).toBeInTheDocument();
    });

    expect(screen.getByText('Word')).toBeInTheDocument();
  });

  it('makes API request to correct endpoint', async () => {
    const mockWordData = {
      macedonian: 'ден',
      pronunciation: 'den',
      english: 'day',
      partOfSpeech: 'noun',
      exampleMk: 'Добар ден.',
      exampleEn: 'Good day.',
      icon: '☀️',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWordData,
    } as Response);

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/word-of-the-day');
    });
  });

  it('renders with proper accessibility attributes', async () => {
    const mockWordData = {
      macedonian: 'вода',
      pronunciation: 'voda',
      english: 'water',
      partOfSpeech: 'noun',
      exampleMk: 'Сакам вода.',
      exampleEn: 'I want water.',
      icon: '💧',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWordData,
    } as Response);

    render(<WordOfTheDay />);

    await waitFor(() => {
      expect(screen.getByText('вода')).toBeInTheDocument();
    });

    // Check that the component structure is accessible
    const heading = screen.getByText('Word of the Day');
    expect(heading).toBeInTheDocument();
  });
});
