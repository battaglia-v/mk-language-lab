import { test, expect } from '@playwright/test';

const mockProfileResponse = {
  name: 'Mission Commander',
  level: 'Level 12 • Linguist',
  xp: { total: 42000, weekly: 1600 },
  streakDays: 21,
  quests: { active: 2, completedThisWeek: 4 },
  badges: [
    {
      id: 'streak',
      label: 'Heatseeker',
      description: 'Keep your fire streak blazing.',
      earnedAt: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 'rookie',
      label: 'Daily Dialer',
      description: 'Practice every day',
      earnedAt: null,
    },
  ],
};

const mockQuestsResponse = {
  quests: [
    {
      id: 'quest-1',
      type: 'daily',
      title: 'Daily Warmup',
      description: 'Complete 3 quick practice drills',
      category: 'practice',
      target: 3,
      targetUnit: 'drills',
      progress: 2,
      status: 'active',
      xpReward: 150,
      currencyReward: 10,
      difficultyLevel: 'easy',
    },
  ],
};

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/profile/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProfileResponse),
      });
    });
    await page.route('**/api/quests', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestsResponse),
      });
    });
    await page.goto('/mk/profile');
  });

  test('should render overview, stats, quests, and badges sections', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-quests"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-badges"]')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    await page.route('**/api/profile/summary', (route) => route.abort('failed'));
    await page.reload();
    await expect(page.getByText(/Неможеме да го вчитаме профилот|Unable to load/i)).toBeVisible();
  });

  test('profile hero matches visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    const hero = page.locator('[data-testid="profile-overview"]');
    await expect(hero).toHaveScreenshot('profile-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });

  test('profile dashboard matches visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    const dashboard = page.locator('[data-testid="profile-dashboard"]');
    await expect(dashboard).toHaveScreenshot('profile-dashboard.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });
});
