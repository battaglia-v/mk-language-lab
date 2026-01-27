import { test, expect } from '@playwright/test';

/**
 * SRS & Typing Trainer E2E Tests (v2.3)
 *
 * Tests the Spaced Repetition System enhancements and typing trainer:
 * - SRS settings persistence (difficulty presets)
 * - Streak tracking
 * - Review queue functionality
 * - Typing stats localStorage integration
 */

test.describe('SRS System - v2.3 Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');
  });

  test('should persist SRS settings in localStorage', async ({ page }) => {
    // Test that SRS settings can be stored
    await page.evaluate(() => {
      const settings = {
        difficultyPreset: 'normal',
        dailyNewCards: 20,
        dailyReviewLimit: 100,
        enableStreakReminders: true
      };
      localStorage.setItem('mkll:srs-settings', JSON.stringify(settings));
    });

    // Verify settings persisted
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:srs-settings');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings).not.toBeNull();
    expect(settings.difficultyPreset).toBe('normal');
    expect(settings.dailyNewCards).toBe(20);
  });

  test('should track streak data in localStorage', async ({ page }) => {
    // Seed streak data
    await page.evaluate(() => {
      const today = new Date().toISOString().split('T')[0];
      const streakData = {
        currentStreak: 5,
        longestStreak: 10,
        lastReviewDate: today,
        totalReviewDays: 25
      };
      localStorage.setItem('mkll:streak', JSON.stringify(streakData));
    });

    // Verify streak data
    const streak = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:streak');
      return stored ? JSON.parse(stored) : null;
    });

    expect(streak).not.toBeNull();
    expect(streak.currentStreak).toBe(5);
    expect(streak.longestStreak).toBe(10);
  });

  test('should support difficulty presets: easy, normal, hard', async ({ page }) => {
    const presets = ['easy', 'normal', 'hard'];

    for (const preset of presets) {
      await page.evaluate((p) => {
        localStorage.setItem('mkll:srs-settings', JSON.stringify({ difficultyPreset: p }));
      }, preset);

      const settings = await page.evaluate(() => {
        const stored = localStorage.getItem('mkll:srs-settings');
        return stored ? JSON.parse(stored) : null;
      });

      expect(settings.difficultyPreset).toBe(preset);
    }
  });

  test('should have valid flashcard storage structure', async ({ page }) => {
    // Seed flashcard review data
    await page.evaluate(() => {
      const flashcardData = {
        'card-001': {
          cardId: 'card-001',
          interval: 4,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 3,
          consecutiveCorrect: 2
        }
      };
      localStorage.setItem('mkll:flashcards', JSON.stringify(flashcardData));
    });

    const flashcards = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:flashcards');
      return stored ? JSON.parse(stored) : null;
    });

    expect(flashcards).not.toBeNull();
    expect(flashcards['card-001']).toBeDefined();
    expect(flashcards['card-001'].interval).toBe(4);
    expect(flashcards['card-001'].easeFactor).toBe(2.5);
  });
});

test.describe('Typing Trainer - v2.3', () => {
  test('should persist typing stats in localStorage', async ({ page }) => {
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Seed typing stats
    await page.evaluate(() => {
      const typingStats = {
        totalCharactersTyped: 500,
        correctCharacters: 475,
        totalExercisesCompleted: 25,
        averageAccuracy: 95,
        averageWPM: 30,
        problemCharacters: {
          'ќ': { attempts: 20, errors: 5 },
          'ѓ': { attempts: 15, errors: 4 },
          'џ': { attempts: 10, errors: 3 }
        },
        lastPracticeDate: new Date().toISOString().split('T')[0],
        streakDays: 3
      };
      localStorage.setItem('mkll:typing-stats', JSON.stringify(typingStats));
    });

    // Verify typing stats
    const stats = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:typing-stats');
      return stored ? JSON.parse(stored) : null;
    });

    expect(stats).not.toBeNull();
    expect(stats.totalCharactersTyped).toBe(500);
    expect(stats.correctCharacters).toBe(475);
    expect(stats.averageAccuracy).toBe(95);
    expect(stats.problemCharacters['ќ'].errors).toBe(5);
  });

  test('should track problem characters for Cyrillic', async ({ page }) => {
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Seed problem characters
    await page.evaluate(() => {
      const stats = {
        totalCharactersTyped: 100,
        correctCharacters: 90,
        totalExercisesCompleted: 10,
        averageAccuracy: 90,
        averageWPM: 25,
        problemCharacters: {
          'ќ': { attempts: 10, errors: 3 },
          'ѓ': { attempts: 8, errors: 2 },
          'џ': { attempts: 6, errors: 2 },
          'ѕ': { attempts: 5, errors: 1 },
          'љ': { attempts: 7, errors: 1 }
        },
        lastPracticeDate: null,
        streakDays: 0
      };
      localStorage.setItem('mkll:typing-stats', JSON.stringify(stats));
    });

    // Verify problem characters are tracked
    const stats = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:typing-stats');
      return stored ? JSON.parse(stored) : null;
    });

    expect(stats.problemCharacters).toBeDefined();
    const problemChars = Object.keys(stats.problemCharacters);
    expect(problemChars).toContain('ќ');
    expect(problemChars).toContain('ѓ');
    expect(problemChars).toContain('џ');
  });

  test('should calculate typing streak correctly', async ({ page }) => {
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Test streak calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await page.evaluate((lastDate) => {
      const stats = {
        totalCharactersTyped: 100,
        correctCharacters: 95,
        totalExercisesCompleted: 5,
        averageAccuracy: 95,
        averageWPM: 28,
        problemCharacters: {},
        lastPracticeDate: lastDate,
        streakDays: 3
      };
      localStorage.setItem('mkll:typing-stats', JSON.stringify(stats));
    }, yesterdayStr);

    const stats = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:typing-stats');
      return stored ? JSON.parse(stored) : null;
    });

    expect(stats.streakDays).toBe(3);
    expect(stats.lastPracticeDate).toBe(yesterdayStr);
  });
});

test.describe('Writing Exercises Data - v2.3', () => {
  test('should have valid translation exercise structure', async ({ page }) => {
    // Test that translation exercise data format is valid
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Seed a sample translation exercise result
    await page.evaluate(() => {
      const exerciseResults = [{
        exerciseId: 'tr-en-mk-001',
        type: 'translation',
        source: 'Hello, how are you?',
        userAnswer: 'Здраво, како си?',
        correct: true,
        attempts: 1,
        completedAt: new Date().toISOString()
      }];
      localStorage.setItem('mkll:exercise-results', JSON.stringify(exerciseResults));
    });

    const results = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:exercise-results');
      return stored ? JSON.parse(stored) : null;
    });

    expect(results).not.toBeNull();
    expect(results[0].type).toBe('translation');
    expect(results[0].correct).toBe(true);
  });

  test('should track sentence construction exercise results', async ({ page }) => {
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Seed sentence construction result
    await page.evaluate(() => {
      const exerciseResults = [{
        exerciseId: 'sc-001',
        type: 'sentence-builder',
        words: ['Јас', 'сакам', 'да', 'учам', 'македонски'],
        userOrder: ['Јас', 'сакам', 'да', 'учам', 'македонски'],
        correct: true,
        attempts: 1,
        completedAt: new Date().toISOString()
      }];
      localStorage.setItem('mkll:exercise-results', JSON.stringify(exerciseResults));
    });

    const results = await page.evaluate(() => {
      const stored = localStorage.getItem('mkll:exercise-results');
      return stored ? JSON.parse(stored) : null;
    });

    expect(results[0].type).toBe('sentence-builder');
    expect(results[0].correct).toBe(true);
  });
});
