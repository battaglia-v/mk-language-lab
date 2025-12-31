import { test, expect } from '@playwright/test';

test.describe('Word Sprint', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
  });

  test('should display Word Sprint card on practice page', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'networkidle' });
    const wordSprintCard = page.locator('a[href*="/practice/word-sprint"]');
    await expect(wordSprintCard).toBeVisible();
    await expect(wordSprintCard).toContainText(/Word Sprint|Спринт/i);
  });

  test('should show difficulty picker when entering Word Sprint', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'networkidle' });

    // Should see difficulty picker
    await expect(page.getByText('Choose Difficulty')).toBeVisible();
    await expect(page.getByRole('button', { name: /easy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /medium/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /hard/i })).toBeVisible();
  });

  test('should start Easy session with multiple choice', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'networkidle' });

    // Select Easy difficulty
    await page.getByRole('button', { name: /easy/i }).click();

    // Should see question with 4 choices (A, B, C, D)
    await expect(page.getByText(/A\./)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/B\./)).toBeVisible();
    await expect(page.getByText(/C\./)).toBeVisible();
    await expect(page.getByText(/D\./)).toBeVisible();

    // Progress indicator should show
    await expect(page.getByText(/1\/10/)).toBeVisible();
  });

  test('should show feedback after answering', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /easy/i }).click();

    // Wait for question to load
    await page.waitForSelector('text=/A\\./', { timeout: 5000 });

    // Click first answer
    await page.locator('button').filter({ hasText: /^A\./ }).click();

    // Should see feedback (either Correct! or Not quite)
    await expect(page.getByText(/Correct!|Not quite/)).toBeVisible({ timeout: 3000 });
  });

  test('should redirect from /cloze to /word-sprint', async ({ page }) => {
    await page.goto('/en/practice/cloze');
    await expect(page).toHaveURL(/\/practice\/word-sprint/);
  });

  test('should redirect from /word-gaps to /word-sprint', async ({ page }) => {
    await page.goto('/en/practice/word-gaps');
    await expect(page).toHaveURL(/\/practice\/word-sprint/);
  });

  test('should redirect from /fill-blanks to /word-sprint', async ({ page }) => {
    await page.goto('/en/practice/fill-blanks');
    await expect(page).toHaveURL(/\/practice\/word-sprint/);
  });

  test('should complete a full session and see results', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /easy/i }).click();

    // Answer 10 questions (click first option each time)
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('text=/A\\./', { timeout: 5000 });
      await page.locator('button').filter({ hasText: /^A\./ }).click();

      // Wait for feedback and continue if incorrect
      const continueBtn = page.getByRole('button', { name: 'Continue' });
      if (await continueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await continueBtn.click();
      } else {
        // Auto-advance on correct, wait a bit
        await page.waitForTimeout(900);
      }
    }

    // Should see session complete screen
    await expect(page.getByText('Session Complete')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/\+\d+ XP/)).toBeVisible();
    await expect(page.getByRole('button', { name: /\+5 More/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Try Medium/ })).toBeVisible();
  });
});
