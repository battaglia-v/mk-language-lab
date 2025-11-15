import { test, expect } from '@playwright/test';

const mockColumns = [
  { id: 'todo', title: 'Да се направи', tasks: [] },
  { id: 'in-progress', title: 'Во тек', tasks: [] },
  { id: 'done', title: 'Завршено', tasks: [] },
];

test.describe('Tasks Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/tasks');
    await page.evaluate(() => localStorage.clear());
  });

  test('should render tasks hero and board', async ({ page }) => {
    await expect(page.locator('[data-testid="tasks-hero"]')).toBeVisible();
    await expect(page.locator('[data-testid="tasks-board"]')).toBeVisible();
  });

  test('tasks hero matches visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="tasks-hero"]');
    await expect(hero).toHaveScreenshot('tasks-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });

  test('tasks board matches visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const board = page.locator('[data-testid="tasks-board"]');
    await expect(board).toHaveScreenshot('tasks-board.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });
});
