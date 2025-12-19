import { test, expect } from '@playwright/test';

/**
 * E2E Tests for LessonRunner
 *
 * Tests the complete lesson flow with progress tracking, feedback, and completion.
 * Covers both quiz (day18) and grammar lesson demos.
 */

test.describe('LessonRunner - Day 18 Quiz', () => {
  test('should complete quiz flow with progress tracking', async ({ page }) => {
    // Navigate to demo page
    await page.goto('/en/demo/lesson-runner');

    // Verify demo page loaded
    await expect(page.locator('h1')).toContainText('LessonRunner Demo');

    // Click Start Quiz button
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson to load
    await expect(page.locator('text=Day 18')).toBeVisible();

    // Verify progress bar is visible
    const progressBar = page.locator('[role="progressbar"], .h-2');
    await expect(progressBar.first()).toBeVisible();

    // Answer first question (multiple choice)
    // Find the first choice button and click it
    const firstChoice = page.locator('button[data-selected="false"]').first();
    await firstChoice.click();

    // Click Check button
    await page.getByRole('button', { name: /check/i }).click();

    // Wait for feedback to appear
    await expect(page.locator('text=/correct|not quite/i')).toBeVisible({ timeout: 3000 });

    // Click Continue button
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify we moved to next question (progress should update)
    await expect(page.locator('text=/2\\//')).toBeVisible({ timeout: 2000 });
  });

  test('should show completion screen with XP', async ({ page }) => {
    // Navigate and start quiz
    await page.goto('/en/demo/lesson-runner');
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Quick completion: answer all questions
    // This is a simplified version - in real test, loop through all questions
    for (let i = 0; i < 8; i++) {
      // Wait for question to load
      await page.waitForTimeout(500);

      // Try to find and click a choice button or input
      const choiceButton = page.locator('button[data-selected="false"]').first();
      const inputField = page.locator('input[type="text"]').first();

      if (await choiceButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await choiceButton.click();
      } else if (await inputField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await inputField.fill('test');
      }

      // Click Check
      const checkButton = page.getByRole('button', { name: /check/i });
      if (await checkButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await checkButton.click();
        await page.waitForTimeout(500);
      }

      // Click Continue or Finish
      const continueButton = page.getByRole('button', { name: /continue|finish/i });
      if (await continueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await continueButton.click();
      }
    }

    // Verify completion screen appears
    await expect(page.locator('text=/lesson complete|perfect/i')).toBeVisible({ timeout: 5000 });

    // Verify XP is displayed
    await expect(page.locator('text=/xp earned/i')).toBeVisible();
    await expect(page.locator('text=/accuracy/i')).toBeVisible();
  });

  test('should allow exit from lesson', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner');
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson to load
    await expect(page.locator('text=Day 18')).toBeVisible();

    // Click exit button (X button in top right)
    const exitButton = page.locator('button[aria-label="Exit lesson"]');
    await exitButton.click();

    // Verify we're back on the demo page
    await expect(page.locator('h1')).toContainText('LessonRunner Demo');
  });
});

test.describe('LessonRunner - Grammar Lesson', () => {
  test('should complete grammar lesson with adapter', async ({ page }) => {
    // Navigate to grammar demo
    await page.goto('/en/demo/grammar-lesson');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Grammar Lesson Demo');

    // Start lesson
    await page.getByRole('button', { name: /start lesson/i }).click();

    // Wait for lesson to load
    await expect(page.locator('text=/present tense/i')).toBeVisible();

    // Answer first question
    const firstChoice = page.locator('button[data-selected="false"]').first();
    await firstChoice.click();

    // Check answer
    await page.getByRole('button', { name: /check/i }).click();

    // Wait for feedback
    await expect(page.locator('text=/correct|not quite/i')).toBeVisible({ timeout: 3000 });

    // Continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Verify progress
    await expect(page.locator('text=/2\\//')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('LessonRunner - Mobile UI', () => {
  test('should have no horizontal scroll on 320px viewport', async ({ page, viewport }) => {
    // Skip if not mobile viewport
    if (!viewport || viewport.width >= 640) {
      test.skip();
    }

    await page.goto('/en/demo/lesson-runner');
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson
    await page.waitForTimeout(1000);

    // Check for horizontal scroll
    const scrollWidth = await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
    );
    const viewportWidth = viewport?.width || 0;

    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should have touch targets >= 44px', async ({ page, viewport }) => {
    // Skip if not mobile
    if (!viewport || viewport.width >= 640) {
      test.skip();
    }

    await page.goto('/en/demo/lesson-runner');
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson
    await page.waitForTimeout(1000);

    // Check button height
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
        const box = await button.boundingBox();
        if (box && box.height > 0) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should display sticky bottom bar above navigation', async ({ page, viewport }) => {
    // Skip if not mobile
    if (!viewport || viewport.width >= 640) {
      test.skip();
    }

    await page.goto('/en/demo/lesson-runner');
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson
    await page.waitForTimeout(1000);

    // Check if Check button is visible (sticky bottom bar)
    const checkButton = page.getByRole('button', { name: /check/i });
    await expect(checkButton).toBeVisible();

    // Verify it's at bottom (approximately)
    const box = await checkButton.boundingBox();
    const viewportHeight = viewport?.height || 0;

    if (box) {
      // Button should be in bottom 200px of viewport
      expect(box.y).toBeGreaterThan(viewportHeight - 200);
    }
  });
});
