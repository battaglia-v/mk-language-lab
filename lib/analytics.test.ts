import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, AnalyticsEvents } from './analytics';

// Mock @vercel/analytics
vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('analytics', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalAnalyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = originalAnalyticsEnabled;
    consoleSpy.mockRestore();
  });

  describe('trackEvent', () => {
    it('logs events in development mode without tracking', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = undefined;

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.WORD_OF_DAY_VIEWED, { partOfSpeech: 'noun' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics - Dev Mode]',
        'word_of_day_viewed',
        { partOfSpeech: 'noun' }
      );
      expect(track).not.toHaveBeenCalled();
    });

    it('tracks events in development mode when explicitly enabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.WORD_OF_DAY_VIEWED, { partOfSpeech: 'noun' });

      expect(track).toHaveBeenCalledWith('word_of_day_viewed', { partOfSpeech: 'noun' });
    });

    it('tracks events in production mode', async () => {
      process.env.NODE_ENV = 'production';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
        mode: 'mkToEn',
        category: 'greetings',
        correctCount: 5,
        totalAttempts: 7,
        accuracy: 71,
      });

      expect(track).toHaveBeenCalledWith('practice_completed', {
        mode: 'mkToEn',
        category: 'greetings',
        correctCount: 5,
        totalAttempts: 7,
        accuracy: 71,
      });
    });

    it('tracks events without properties', async () => {
      process.env.NODE_ENV = 'production';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.PRACTICE_STARTED);

      expect(track).toHaveBeenCalledWith('practice_started', undefined);
    });

    it('handles errors gracefully without breaking the app', async () => {
      process.env.NODE_ENV = 'production';

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { track } = await import('@vercel/analytics');

      // Make track throw an error
      vi.mocked(track).mockImplementationOnce(() => {
        throw new Error('Analytics service unavailable');
      });

      // Should not throw
      expect(() => {
        trackEvent(AnalyticsEvents.TRANSLATION_REQUESTED);
      }).not.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        '[Analytics Error]',
        expect.any(Error)
      );

      errorSpy.mockRestore();
    });

    it('tracks translation events correctly', async () => {
      process.env.NODE_ENV = 'production';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.TRANSLATION_SUCCESS, {
        sourceLang: 'en',
        targetLang: 'mk',
      });

      expect(track).toHaveBeenCalledWith('translation_success', {
        sourceLang: 'en',
        targetLang: 'mk',
      });
    });

    it('tracks practice answer events', async () => {
      process.env.NODE_ENV = 'production';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.PRACTICE_ANSWER_CORRECT, {
        mode: 'enToMk',
        category: 'technology',
      });

      expect(track).toHaveBeenCalledWith('practice_answer_correct', {
        mode: 'enToMk',
        category: 'technology',
      });

      trackEvent(AnalyticsEvents.PRACTICE_ANSWER_INCORRECT, {
        mode: 'mkToEn',
        category: 'all',
      });

      expect(track).toHaveBeenCalledWith('practice_answer_incorrect', {
        mode: 'mkToEn',
        category: 'all',
      });
    });

    it('tracks news events', async () => {
      process.env.NODE_ENV = 'production';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.NEWS_ARTICLE_CLICKED, {
        articleId: '123',
        source: 'mk-news',
      });

      expect(track).toHaveBeenCalledWith('news_article_clicked', {
        articleId: '123',
        source: 'mk-news',
      });
    });

    it('tracks modal open event', async () => {
      process.env.NODE_ENV = 'production';

      const { track } = await import('@vercel/analytics');

      trackEvent(AnalyticsEvents.PRACTICE_MODAL_OPENED, {
        mode: 'mkToEn',
        category: 'all',
      });

      expect(track).toHaveBeenCalledWith('practice_modal_opened', {
        mode: 'mkToEn',
        category: 'all',
      });
    });
  });

  describe('AnalyticsEvents', () => {
    it('exports all expected event names', () => {
      expect(AnalyticsEvents.WORD_OF_DAY_VIEWED).toBe('word_of_day_viewed');
      expect(AnalyticsEvents.WORD_OF_DAY_LOADED).toBe('word_of_day_loaded');
      expect(AnalyticsEvents.PRACTICE_STARTED).toBe('practice_started');
      expect(AnalyticsEvents.PRACTICE_COMPLETED).toBe('practice_completed');
      expect(AnalyticsEvents.PRACTICE_ANSWER_CORRECT).toBe('practice_answer_correct');
      expect(AnalyticsEvents.PRACTICE_ANSWER_INCORRECT).toBe('practice_answer_incorrect');
      expect(AnalyticsEvents.PRACTICE_MODAL_OPENED).toBe('practice_modal_opened');
      expect(AnalyticsEvents.TRANSLATION_REQUESTED).toBe('translation_requested');
      expect(AnalyticsEvents.TRANSLATION_SUCCESS).toBe('translation_success');
      expect(AnalyticsEvents.TRANSLATION_FAILED).toBe('translation_failed');
      expect(AnalyticsEvents.TRANSLATION_COPIED).toBe('translation_copied');
      expect(AnalyticsEvents.NEWS_ARTICLE_CLICKED).toBe('news_article_clicked');
      expect(AnalyticsEvents.NEWS_VIDEO_CLICKED).toBe('news_video_clicked');
      expect(AnalyticsEvents.NEWS_FILTER_CHANGED).toBe('news_filter_changed');
      expect(AnalyticsEvents.SIGNIN_INITIATED).toBe('signin_initiated');
      expect(AnalyticsEvents.SIGNIN_SUCCESS).toBe('signin_success');
      expect(AnalyticsEvents.SIGNIN_FAILED).toBe('signin_failed');
    });
  });
});
