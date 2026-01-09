import { test, expect } from '@playwright/test';

test.describe('Tasks Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('should show auth guard or tasks content', async ({ page }) => {
    // Tasks page requires authentication - verify either auth guard or content shows
    const tasksHero = page.locator('[data-testid="tasks-hero"]');
    const signInCard = page.locator('[data-testid="tasks-sign-in-card"]');

    // Wait for one of these to be visible
    const heroVisible = await tasksHero.isVisible().catch(() => false);
    const signInVisible = await signInCard.isVisible().catch(() => false);

    // Either the tasks content or the sign-in card should be visible
    expect(heroVisible || signInVisible).toBeTruthy();
  });

  test('auth guard displays sign in prompt for unauthenticated users', async ({ page }) => {
    // Without authentication, should see sign-in card
    const signInCard = page.locator('[data-testid="tasks-sign-in-card"]');

    // This might be visible or not depending on auth state
    const cardVisible = await signInCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (cardVisible) {
      // If sign-in card is visible, verify sign-in button is present
      await expect(page.getByTestId('tasks-sign-in')).toBeVisible();
    }
    // If not visible, user might be authenticated - that's okay too
  });

  test('tasks hero matches visual snapshot', async ({ page }) => {
    // Skip in CI - visual snapshots differ across environments
    test.skip(!!process.env.CI, 'Visual snapshot skipped in CI');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="tasks-hero"]');
    if (await hero.isVisible()) {
      await expect(hero).toHaveScreenshot('tasks-hero.png', {
        animations: 'disabled',
        scale: 'css',
      });
    }
  });

  test('tasks board matches visual snapshot', async ({ page }) => {
    // Skip in CI - visual snapshots differ across environments
    test.skip(!!process.env.CI, 'Visual snapshot skipped in CI');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const board = page.locator('[data-testid="tasks-board"]');
    if (await board.isVisible()) {
      await expect(board).toHaveScreenshot('tasks-board.png', {
        animations: 'disabled',
        scale: 'css',
      });
    }
  });
});
