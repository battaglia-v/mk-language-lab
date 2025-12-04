import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    gameProgress: {
      findUnique: vi.fn(),
    },
    journeyProgress: {
      findMany: vi.fn(),
    },
    exerciseAttempt: {
      findMany: vi.fn(),
    },
    userBadge: {
      findMany: vi.fn(),
    },
    userQuestProgress: {
      findMany: vi.fn(),
    },
    currency: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
}));

import { GET } from '@/app/api/profile/summary/route';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

describe('Profile Summary API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockRejectedValue(new Error('Unauthorized'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('unauthorized');
    });

    it('returns 401 when session has no user ID', async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('unauthorized');
    });
  });

  describe('Successful Profile Load', () => {
    beforeEach(() => {
      // Setup authenticated session
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      } as any);

      // Mock database responses
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      } as any);

      vi.mocked(prisma.gameProgress.findUnique).mockResolvedValue({
        userId: 'user-123',
        xp: 1500,
        level: 'intermediate',
        streak: 7,
        hearts: 5,
        streakUpdatedAt: new Date(),
        lastPracticeDate: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(prisma.journeyProgress.findMany).mockResolvedValue([]);
      vi.mocked(prisma.exerciseAttempt.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userBadge.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userQuestProgress.findMany).mockResolvedValue([]);
      vi.mocked(prisma.currency.upsert).mockResolvedValue({
        userId: 'user-123',
        gems: 100,
        coins: 50,
      } as any);
    });

    it('returns 200 with complete profile data', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('level');
      expect(data).toHaveProperty('xp');
      expect(data).toHaveProperty('streakDays');
      expect(data).toHaveProperty('badges');
    });

    it('includes correct XP values from game progress', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.xp.total).toBe(1500);
      expect(data.streakDays).toBe(7);
    });

    it('calculates level progress correctly', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.xpProgress).toHaveProperty('percentComplete');
      expect(data.xpProgress).toHaveProperty('xpInCurrentLevel');
      expect(data.xpProgress).toHaveProperty('xpForNextLevel');
    });

    it('includes league tier based on streak', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.league).toHaveProperty('tier');
      expect(['bronze', 'silver', 'gold', 'platinum', 'diamond']).toContain(data.league.tier);
    });

    it('returns activity heatmap data', async () => {
      vi.mocked(prisma.exerciseAttempt.findMany).mockResolvedValue([
        {
          attemptedAt: new Date(),
          score: 100,
        },
      ] as any);

      const response = await GET();
      const data = await response.json();

      expect(Array.isArray(data.activityHeatmap)).toBe(true);
    });
  });

  describe('Fallback Behavior', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      } as any);
    });

    it('returns fallback profile when database queries fail', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));
      vi.mocked(prisma.gameProgress.findUnique).mockRejectedValue(new Error('Database error'));
      vi.mocked(prisma.journeyProgress.findMany).mockRejectedValue(new Error('Database error'));
      vi.mocked(prisma.exerciseAttempt.findMany).mockRejectedValue(new Error('Database error'));
      vi.mocked(prisma.userBadge.findMany).mockRejectedValue(new Error('Database error'));
      vi.mocked(prisma.userQuestProgress.findMany).mockRejectedValue(new Error('Database error'));
      vi.mocked(prisma.currency.upsert).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('x-profile-source')).toBe('fallback');
      // Name comes from session when database fails, not from fallback
      expect(data.name).toBe('Test User');
      expect(data.streakDays).toBe(0);
    });

    it('includes completeness header when using fallback', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));

      const response = await GET();

      expect(response.headers.get('x-profile-completeness')).toBe('0%');
    });

    it('includes response time header', async () => {
      const response = await GET();

      expect(response.headers.get('x-response-time')).toMatch(/\d+ms/);
    });
  });

  describe('Partial Data Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      } as any);

      // Only some queries succeed
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
      } as any);

      vi.mocked(prisma.gameProgress.findUnique).mockResolvedValue({
        userId: 'user-123',
        xp: 500,
        streak: 3,
      } as any);

      // These fail
      vi.mocked(prisma.userBadge.findMany).mockRejectedValue(new Error('Badges unavailable'));
      vi.mocked(prisma.exerciseAttempt.findMany).mockRejectedValue(new Error('Attempts unavailable'));
    });

    it('returns partial profile with available data', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Test User');
      expect(data.xp.total).toBe(500);
      expect(data.streakDays).toBe(3);
    });

    it('includes completeness percentage in header', async () => {
      const response = await GET();
      const completeness = response.headers.get('x-profile-completeness');

      expect(completeness).toBeTruthy();
      expect(parseInt(completeness || '0')).toBeLessThan(100);
    });
  });

  describe('Cache Headers', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123', name: 'Test User' } as any);
      vi.mocked(prisma.gameProgress.findUnique).mockResolvedValue({ userId: 'user-123', xp: 100, streak: 1 } as any);
    });

    it('includes Cache-Control header for CDN caching', async () => {
      const response = await GET();
      const cacheControl = response.headers.get('Cache-Control');

      expect(cacheControl).toBeTruthy();
      expect(cacheControl).toContain('s-maxage');
      expect(cacheControl).toContain('stale-while-revalidate');
    });

    it('includes x-profile-source header', async () => {
      const response = await GET();
      const source = response.headers.get('x-profile-source');

      expect(source).toBeTruthy();
      expect(['prisma', 'fallback']).toContain(source);
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      } as any);
    });

    it('completes within reasonable time', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123', name: 'Test User' } as any);
      vi.mocked(prisma.gameProgress.findUnique).mockResolvedValue({ userId: 'user-123', xp: 100, streak: 1 } as any);

      const start = Date.now();
      await GET();
      const duration = Date.now() - start;

      // Should complete in under 5 seconds (even with mocked delays)
      expect(duration).toBeLessThan(5000);
    });

    it('includes response time in header', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123', name: 'Test User' } as any);
      vi.mocked(prisma.gameProgress.findUnique).mockResolvedValue({ userId: 'user-123', xp: 100, streak: 1 } as any);
      vi.mocked(prisma.journeyProgress.findMany).mockResolvedValue([]);
      vi.mocked(prisma.exerciseAttempt.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userBadge.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userQuestProgress.findMany).mockResolvedValue([]);
      vi.mocked(prisma.currency.upsert).mockResolvedValue({ userId: 'user-123', gems: 0, coins: 0 } as any);

      const response = await GET();
      const responseTime = response.headers.get('x-response-time');

      expect(responseTime).toMatch(/^\d+ms$/);
      expect(parseInt(responseTime || '0')).toBeGreaterThanOrEqual(0);
    });
  });
});
