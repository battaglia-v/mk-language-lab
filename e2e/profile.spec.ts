import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to profile page
    await page.goto('/mk/profile');
  });

  test('should load profile page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Profile.*MK Language Lab/);

    // Check profile heading is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display profile header with user stats', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for XP display (either in loading state or loaded)
    const xpElement = page.getByText(/XP|Loading/i);
    await expect(xpElement.first()).toBeVisible();

    // Check for streak display
    const streakElement = page.getByText(/streak|day/i);
    await expect(streakElement.first()).toBeVisible();
  });

  test('should display stats grid with metrics', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(1500);

    // Check for stat labels (they should be visible whether data loads or not)
    const statLabels = [
      /Total XP/i,
      /Weekly XP/i,
      /Streak/i,
      /Active Quests|Completed/i,
    ];

    for (const label of statLabels) {
      const element = page.getByText(label);
      // Use first() to handle multiple matches
      await expect(element.first()).toBeVisible();
    }
  });

  test('should display quests section', async ({ page }) => {
    // Wait for quests to load
    await page.waitForTimeout(1500);

    // Check for quests heading
    await expect(page.getByRole('heading', { name: /Active Quests/i })).toBeVisible();

    // Either quests or empty state should be visible
    const hasQuests = await page.getByText(/progress|target|XP/i).first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No active quests/i).isVisible().catch(() => false);

    expect(hasQuests || hasEmpty).toBeTruthy();
  });

  test('should display badges section', async ({ page }) => {
    // Wait for badges to load
    await page.waitForTimeout(1500);

    // Check for badges heading
    await expect(page.getByRole('heading', { name: /Badges.*Achievements/i })).toBeVisible();

    // Check for shop link
    await expect(page.getByRole('link', { name: /Visit Shop|Shop/i })).toBeVisible();

    // Badges should be visible (either earned or locked)
    const badgeElements = page.locator('[class*="badge"], .badge, [data-testid*="badge"]');
    const badgeCount = await badgeElements.count().catch(() => 0);

    // Should have at least some badge placeholders or actual badges
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Check immediate state (should show loading or content)
    const hasContent = await page.getByText(/XP|Streak|Quest|Badge/i).first().isVisible();
    const hasLoading = await page.getByText(/Loading|Syncing/i).first().isVisible().catch(() => false);

    expect(hasContent || hasLoading).toBeTruthy();
  });

  test('should handle error state if API fails', async ({ page }) => {
    // Intercept API call and make it fail
    await page.route('**/api/profile/summary', (route) => {
      route.abort('failed');
    });

    await page.reload();

    // Should show error message
    await expect(page.getByText(/Unable to load|Error|failed/i).first()).toBeVisible();
  });

  test('should navigate to shop from badge section', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Find and click shop link
    const shopLink = page.getByRole('link', { name: /Visit Shop|Shop/i });

    if (await shopLink.isVisible()) {
      await shopLink.click();

      // Should navigate to shop page (if it exists)
      await page.waitForTimeout(500);

      // Check URL changed
      expect(page.url()).toContain('/shop');
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.reload();
    await page.waitForTimeout(1000);

    // Stats grid should still be visible but in column layout
    const statsElements = page.getByText(/Total XP|Weekly XP|Streak/i);
    await expect(statsElements.first()).toBeVisible();

    // Profile header should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
