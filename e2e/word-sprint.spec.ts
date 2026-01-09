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

    // Should see difficulty picker with title and subtitle
    await expect(page.getByRole('heading', { name: /Word Sprint/i })).toBeVisible();
    await expect(page.getByText('Pick your challenge.')).toBeVisible();

    // Difficulty buttons should be visible (using data-testid for reliability)
    await expect(page.getByTestId('word-sprint-picker-difficulty-easy')).toBeVisible();
    await expect(page.getByTestId('word-sprint-picker-difficulty-medium')).toBeVisible();
    await expect(page.getByTestId('word-sprint-picker-difficulty-hard')).toBeVisible();
  });

  test('should start Easy session with multiple choice', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'networkidle' });

    // Select Easy difficulty and start (Easy is default selected, click Start)
    await page.getByTestId('word-sprint-picker-start').click();

    // Should see question with 2 choices for easy mode (Two choices)
    await expect(page.getByText(/A\./)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/B\./)).toBeVisible();

    // Progress indicator should show
    await expect(page.getByText(/1\/10/)).toBeVisible();
  });

  test('should show feedback after answering', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'networkidle' });
    await page.getByTestId('word-sprint-picker-start').click();

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
    await page.getByTestId('word-sprint-picker-start').click();

    // Answer 10 questions (click first option each time)
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('text=/A\\./', { timeout: 10000 });
      await page.locator('button').filter({ hasText: /^A\./ }).click();

      // Wait for feedback and continue if incorrect
      const continueBtn = page.getByRole('button', { name: 'Continue' });
      if (await continueBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await continueBtn.click();
      } else {
        // Auto-advance on correct, wait a bit
        await page.waitForTimeout(1000);
      }
    }

    // Should see session complete screen
    await expect(page.getByText('Session Complete')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/\+\d+ XP/)).toBeVisible();
    // Look for any of the post-session buttons
    const hasMoreButton = await page.getByRole('button', { name: /\+5 More|More Questions/i }).isVisible().catch(() => false);
    const hasTryMediumButton = await page.getByRole('button', { name: /Try Medium|Next Difficulty/i }).isVisible().catch(() => false);
    expect(hasMoreButton || hasTryMediumButton).toBeTruthy();
  });
});
