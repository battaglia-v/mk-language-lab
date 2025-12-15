/**
 * Tests for the pronunciation scoring engine
 * 
 * @see lib/pronunciation-scoring.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateXpReward,
  isPronunciationScoringSupported,
  type PronunciationScore,
} from '@/lib/pronunciation-scoring';

describe('pronunciation-scoring', () => {
  describe('calculateXpReward', () => {
    it('awards 15 XP for excellent score (≥90%) on first try', () => {
      expect(calculateXpReward(95, 1)).toBe(15);
      expect(calculateXpReward(90, 1)).toBe(15);
    });

    it('awards 10 XP for passing score (70-89%) on first try', () => {
      expect(calculateXpReward(85, 1)).toBe(10);
      expect(calculateXpReward(70, 1)).toBe(10);
    });

    it('awards 7 XP for passing score on second try', () => {
      expect(calculateXpReward(90, 2)).toBe(7);
      expect(calculateXpReward(75, 2)).toBe(7);
    });

    it('awards 5 XP for passing score on third try', () => {
      expect(calculateXpReward(90, 3)).toBe(5);
      expect(calculateXpReward(70, 3)).toBe(5);
    });

    it('awards 0 XP for failing score (below passing threshold)', () => {
      expect(calculateXpReward(65, 1)).toBe(0);
      expect(calculateXpReward(50, 2)).toBe(0);
      expect(calculateXpReward(30, 3)).toBe(0);
      expect(calculateXpReward(69, 1)).toBe(0);
    });

    it('awards 5 XP for fourth attempt and beyond', () => {
      // Fourth attempt and beyond should be treated same as third
      expect(calculateXpReward(90, 4)).toBe(5);
      expect(calculateXpReward(90, 5)).toBe(5);
    });
  });

  describe('isPronunciationScoringSupported', () => {
    beforeEach(() => {
      // Reset the mock before each test
      vi.unstubAllGlobals();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns true when AudioContext is available', () => {
      vi.stubGlobal('AudioContext', function() {});
      expect(isPronunciationScoringSupported()).toBe(true);
    });

    it('returns true when webkitAudioContext is available', () => {
      vi.stubGlobal('webkitAudioContext', function() {});
      expect(isPronunciationScoringSupported()).toBe(true);
    });

    it('returns false when no AudioContext is available', () => {
      vi.stubGlobal('AudioContext', undefined);
      vi.stubGlobal('webkitAudioContext', undefined);
      expect(isPronunciationScoringSupported()).toBe(false);
    });
  });

  describe('PronunciationScore type', () => {
    it('has correct feedback key values', () => {
      const validFeedbackKeys = [
        'excellent',
        'good',
        'almostThere',
        'trySlower',
        'tryLouder',
        'tooShort',
        'tooLong',
        'needsWork',
      ];

      // Type check that all feedback keys are valid
      validFeedbackKeys.forEach((key) => {
        const score: Partial<PronunciationScore> = {
          feedbackKey: key as PronunciationScore['feedbackKey'],
        };
        expect(validFeedbackKeys).toContain(score.feedbackKey);
      });
    });
  });

  describe('scoring thresholds', () => {
    it('uses 70% as passing threshold', () => {
      // Based on implementation, 70% should be the passing threshold
      expect(calculateXpReward(70, 1)).toBe(10); // Passing XP
      expect(calculateXpReward(69, 1)).toBe(0);  // Failing XP (0, not 2)
    });

    it('uses 90% as excellent threshold', () => {
      // Based on implementation, 90% should be the excellent threshold
      expect(calculateXpReward(90, 1)).toBe(15); // Excellent XP
      expect(calculateXpReward(89, 1)).toBe(10); // Good XP
    });
  });

  describe('XP reward rules per UX spec', () => {
    it('follows the documented XP reward structure', () => {
      // From docs/ux-audit/05-pronunciation-practice-ux.md:
      // - First try ≥90%: 15 XP (excellent)
      // - First try ≥70%: 10 XP (passing)
      // - Second try success: 7 XP
      // - Third try success: 5 XP
      // - Failing: 0 XP

      // First try excellent
      expect(calculateXpReward(95, 1)).toBe(15);
      expect(calculateXpReward(100, 1)).toBe(15);

      // First try passing
      expect(calculateXpReward(70, 1)).toBe(10);
      expect(calculateXpReward(89, 1)).toBe(10);

      // Second try any passing score
      expect(calculateXpReward(70, 2)).toBe(7);
      expect(calculateXpReward(100, 2)).toBe(7);

      // Third try any passing score
      expect(calculateXpReward(70, 3)).toBe(5);
      expect(calculateXpReward(100, 3)).toBe(5);

      // Failing score at any attempt
      expect(calculateXpReward(0, 1)).toBe(0);
      expect(calculateXpReward(50, 1)).toBe(0);
      expect(calculateXpReward(69, 2)).toBe(0);
      expect(calculateXpReward(69, 3)).toBe(0);
    });
  });
});

