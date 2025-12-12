/**
 * XP Award Service Tests
 *
 * Tests for experience point calculations and level progression
 */

import { describe, it, expect } from 'vitest';
import { getLevelInfo, LEVELS, XP_AWARDS } from '@/lib/gamification/xp';

describe('XP System', () => {
  describe('XP_AWARDS', () => {
    it('should have correct XP values for core actions', () => {
      expect(XP_AWARDS.LESSON_COMPLETE).toBe(10);
      expect(XP_AWARDS.PRACTICE_SESSION).toBe(5);
      expect(XP_AWARDS.QUIZ_PERFECT).toBe(15);
    });

    it('should have correct XP values for streak achievements', () => {
      expect(XP_AWARDS.STREAK_7_DAY).toBe(20);
      expect(XP_AWARDS.STREAK_30_DAY).toBe(50);
      expect(XP_AWARDS.STREAK_100_DAY).toBe(100);
    });

    it('should have correct XP values for daily goals', () => {
      expect(XP_AWARDS.DAILY_GOAL_COMPLETE).toBe(10);
      expect(XP_AWARDS.DAILY_GOAL_EXCEEDED_2X).toBe(20);
    });
  });

  describe('LEVELS', () => {
    it('should have 5 levels defined', () => {
      expect(LEVELS).toHaveLength(5);
    });

    it('should start at Beginner level with 0 XP', () => {
      expect(LEVELS[0].name).toBe('Beginner');
      expect(LEVELS[0].minXP).toBe(0);
    });

    it('should end at Fluent level with Infinity maxXP', () => {
      const lastLevel = LEVELS[LEVELS.length - 1];
      expect(lastLevel.name).toBe('Fluent');
      expect(lastLevel.maxXP).toBe(Infinity);
    });

    it('should have contiguous XP thresholds', () => {
      for (let i = 0; i < LEVELS.length - 1; i++) {
        expect(LEVELS[i].maxXP).toBe(LEVELS[i + 1].minXP);
      }
    });
  });

  describe('getLevelInfo', () => {
    it('should return level 1 (Beginner) for 0 XP', () => {
      const info = getLevelInfo(0);
      expect(info.level).toBe(1);
      expect(info.name).toBe('Beginner');
      expect(info.currentXP).toBe(0);
      expect(info.progress).toBe(0);
      expect(info.isMaxLevel).toBe(false);
    });

    it('should calculate correct progress within a level', () => {
      const info = getLevelInfo(50);
      expect(info.level).toBe(1);
      expect(info.name).toBe('Beginner');
      expect(info.currentXP).toBe(50);
      expect(info.xpForNextLevel).toBe(100); // 100 - 0
      expect(info.progress).toBe(50);
    });

    it('should correctly identify level 2 (Elementary)', () => {
      const info = getLevelInfo(100);
      expect(info.level).toBe(2);
      expect(info.name).toBe('Elementary');
      expect(info.currentXP).toBe(0); // Just started level 2
    });

    it('should correctly identify level 3 (Intermediate)', () => {
      const info = getLevelInfo(400);
      expect(info.level).toBe(3);
      expect(info.name).toBe('Intermediate');
      expect(info.currentXP).toBe(100); // 400 - 300
      expect(info.xpForNextLevel).toBe(400); // 700 - 300
    });

    it('should correctly identify level 4 (Advanced)', () => {
      const info = getLevelInfo(1000);
      expect(info.level).toBe(4);
      expect(info.name).toBe('Advanced');
      expect(info.currentXP).toBe(300); // 1000 - 700
    });

    it('should correctly identify max level (Fluent)', () => {
      const info = getLevelInfo(1500);
      expect(info.level).toBe(5);
      expect(info.name).toBe('Fluent');
      expect(info.isMaxLevel).toBe(true);
      expect(info.progress).toBe(100);
    });

    it('should handle very high XP values at max level', () => {
      const info = getLevelInfo(10000);
      expect(info.level).toBe(5);
      expect(info.name).toBe('Fluent');
      expect(info.isMaxLevel).toBe(true);
      expect(info.totalXP).toBe(10000);
    });

    it('should calculate progress correctly at level boundaries', () => {
      // Just before level up
      const beforeLevelUp = getLevelInfo(99);
      expect(beforeLevelUp.level).toBe(1);
      expect(beforeLevelUp.progress).toBe(99);

      // Just after level up
      const afterLevelUp = getLevelInfo(100);
      expect(afterLevelUp.level).toBe(2);
      expect(afterLevelUp.currentXP).toBe(0);
    });

    it('should return totalXP in the response', () => {
      const info = getLevelInfo(500);
      expect(info.totalXP).toBe(500);
    });
  });
});
