import { test, expect } from '@playwright/test';

/**
 * Pronunciation Practice - Coming Soon State
 *
 * Pronunciation features are hidden in beta. The page displays a "Coming Soon"
 * message instead of the full practice UI. These tests validate the placeholder state.
 */
test.describe('Pronunciation Practice Page (Coming Soon)', () => {
  test('should show Coming Soon message', async ({ page }) => {
    await page.goto('/en/practice/pronunciation');
    await page.waitForLoadState('networkidle');

    // Should display Coming Soon message
    const comingSoon = page.locator('text=/Coming Soon|Наскоро/i');
    await expect(comingSoon).toBeVisible();
  });

  test('should have back navigation to practice hub', async ({ page }) => {
    await page.goto('/en/practice/pronunciation');
    await page.waitForLoadState('networkidle');

    // Find back link to practice
    const backLink = page.locator('a[href*="/practice"]').filter({ hasText: /Back|Назад|Practice/i }).first();
    await expect(backLink).toBeVisible();

    // Click and verify navigation
    await backLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/practice$/);
  });

  test('should work in Macedonian locale', async ({ page }) => {
    await page.goto('/mk/practice/pronunciation');
    await page.waitForLoadState('networkidle');

    // Should show Coming Soon in Macedonian or heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/practice/pronunciation');
    await page.waitForLoadState('networkidle');

    // Heading should be visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(385);
  });
});
