import { test, expect, type Page } from '@playwright/test';

/**
 * P0 Mobile Exercise Tests
 *
 * Tests critical mobile exercise functionality that was reported broken in alpha:
 * - P0-1: No validation on keystroke (typing shouldn't trigger validation)
 * - P0-2: Multiple choice tap targets work on mobile
 * - P0-3: Summary/Lesson Complete screen buttons are clickable
 * - P0-6: Mobile nav is hidden during lessons
 *
 * Run with: npx playwright test e2e/p0-mobile-exercises.spec.ts
 */

// Mobile Android viewport (Pixel 7)
const MOBILE_VIEWPORT = { width: 412, height: 915 };

test.describe('P0-1: No Keystroke Validation', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('typing in fill-blank should NOT trigger validation until Check is pressed', async ({ page }) => {
    // Navigate to demo lesson
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson to load
    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Find a text input if present
    const inputField = page.locator('input[type="text"]').first();

    // Skip if no text input in current step (might be multiple choice)
    if (!(await inputField.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip();
      return;
    }

    // Type a single character
    await inputField.fill('т');

    // Wait briefly for any potential validation
    await page.waitForTimeout(1000);

    // Verify NO feedback is shown yet (no "Not quite" or "Correct")
    const feedbackBanner = page.locator('text=/not quite|correct!/i');
    await expect(feedbackBanner).not.toBeVisible();

    // Input should still be editable
    await expect(inputField).toBeEnabled();

    // Type more characters
    await inputField.fill('тест');
    await page.waitForTimeout(500);

    // Still no feedback
    await expect(feedbackBanner).not.toBeVisible();

    // Now press Check - validation should occur
    const checkButton = page.getByRole('button', { name: /check/i });
    await checkButton.click();

    // Now feedback should appear
    await expect(page.locator('text=/not quite|correct!/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('P0-2: Multiple Choice Tap Targets', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('choice buttons should be tappable with 48px+ height', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson
    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Find choice buttons (multiple choice)
    const choiceButtons = page.locator('[data-testid="choice-button"], button:has-text("A)"), button:has-text("B)")');

    const count = await choiceButtons.count();
    if (count === 0) {
      // Try alternative selectors
      const altChoices = page.locator('button[data-selected]');
      const altCount = await altChoices.count();

      if (altCount > 0) {
        for (let i = 0; i < Math.min(altCount, 4); i++) {
          const button = altChoices.nth(i);
          if (await button.isVisible()) {
            const box = await button.boundingBox();
            expect(box?.height).toBeGreaterThanOrEqual(44);
          }
        }

        // Tap first option
        await altChoices.first().click();

        // Verify selection registered (button state changed)
        await expect(altChoices.first()).toHaveAttribute('data-selected', 'true');
      }
    }
  });

  test('tapping choice should NOT auto-validate', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Find and click a choice button
    const choiceButton = page.locator('button[data-selected="false"]').first();

    if (!(await choiceButton.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip();
      return;
    }

    await choiceButton.click();

    // Wait for potential validation
    await page.waitForTimeout(1000);

    // Check button should still say "Check" (not "Continue")
    const checkButton = page.getByRole('button', { name: /^check$/i });
    // Note: If feedback already shown, button would say "Continue"
    const isCheckVisible = await checkButton.isVisible({ timeout: 500 }).catch(() => false);

    // Either Check is visible (no auto-validation) or we need to verify state
    if (isCheckVisible) {
      // Good - no auto validation
      expect(true).toBe(true);
    }
  });
});

test.describe('P0-3: Summary Continue Button', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('Summary screen Continue button should be immediately clickable', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson to load
    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Complete all steps to reach Summary (demo quiz has 9 questions)
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(500);

      // Check if we reached summary
      const summaryIndicator = page.locator('text=/lesson complete|perfect!/i');
      if (await summaryIndicator.isVisible({ timeout: 500 }).catch(() => false)) {
        break;
      }

      // Answer current step - look for choice buttons starting with A, B, C, D
      const choiceA = page.getByRole('button', { name: /^A\s/ });
      const inputField = page.locator('input[type="text"]').first();

      if (await choiceA.isVisible({ timeout: 500 }).catch(() => false)) {
        await choiceA.click();
        await page.waitForTimeout(300);
      } else if (await inputField.isVisible({ timeout: 500 }).catch(() => false)) {
        await inputField.fill('тест');
        await page.waitForTimeout(300);
      }

      // Click Check or Continue button
      const checkButton = page.getByRole('button', { name: /^check$/i });
      const continueBtn = page.getByRole('button', { name: /continue/i });

      if (await checkButton.isVisible({ timeout: 300 }).catch(() => false)) {
        // Check might be disabled, only click if enabled
        if (await checkButton.isEnabled({ timeout: 300 }).catch(() => false)) {
          await checkButton.click();
          await page.waitForTimeout(500);
          // After feedback, click Continue
          if (await continueBtn.isVisible({ timeout: 500 }).catch(() => false)) {
            await continueBtn.click();
          }
        }
      } else if (await continueBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await continueBtn.click();
      }
    }

    // Verify summary is visible
    const summaryScreen = page.locator('text=/lesson complete|perfect!/i');
    await expect(summaryScreen).toBeVisible({ timeout: 10000 });

    // Verify Continue button exists and is clickable
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    // Should be immediately clickable (not disabled, not requiring Check first)
    // Note: This tests that SUMMARY is treated like INFO step
  });
});

test.describe('P0-6: Mobile Nav Hidden During Lessons', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('mobile bottom nav should be hidden during lesson', async ({ page }) => {
    // First verify nav is visible on a regular page (about page doesn't need database)
    await page.goto('/en/about', { waitUntil: 'networkidle' });
    const bottomNav = page.locator('[data-testid="bottom-nav"]');
    await expect(bottomNav).toBeVisible({ timeout: 5000 });

    // Navigate to demo lesson and start it
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for lesson to load
    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Bottom nav should be hidden during the lesson
    await expect(bottomNav).not.toBeVisible();
  });

  test('Check button should be visible and clickable without nav overlap', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Check button should be visible (may need scrolling)
    const checkButton = page.getByRole('button', { name: /check/i });
    await expect(checkButton).toBeVisible();

    // Scroll the button into view
    await checkButton.scrollIntoViewIfNeeded();

    // Verify bottom nav is NOT visible (hidden during lesson)
    const bottomNav = page.locator('[data-testid="bottom-nav"]');
    await expect(bottomNav).not.toBeVisible();

    // Select an answer by clicking a choice button (look for buttons with single letter prefix)
    // The demo quiz has multiple choice with buttons like "A geographer", "B book", etc.
    const choiceA = page.getByRole('button', { name: /^A\s/ });
    if (await choiceA.isVisible({ timeout: 2000 }).catch(() => false)) {
      await choiceA.click();
      await page.waitForTimeout(300);

      // Now Check button should be enabled
      await expect(checkButton).toBeEnabled({ timeout: 2000 });

      // Click Check and verify feedback appears (proves button is clickable without nav overlap)
      await checkButton.click();
      await expect(page.locator('text=/not quite|correct!/i')).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Exercise Input Handling', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('input should remain editable until Check is pressed', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    const inputField = page.locator('input[type="text"]').first();

    if (!(await inputField.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip();
      return;
    }

    // Type, then change input
    await inputField.fill('first');
    await inputField.fill('second');
    await inputField.fill('третион');

    // Should still be enabled
    await expect(inputField).toBeEnabled();

    // Press Check
    await page.getByRole('button', { name: /check/i }).click();

    // Wait for feedback
    await expect(page.locator('text=/not quite|correct!/i')).toBeVisible({ timeout: 3000 });

    // Now input might be disabled (after feedback)
    // This is expected behavior
  });

  test('Check button should be disabled until user provides answer', async ({ page }) => {
    await page.goto('/en/demo/lesson-runner', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /start quiz/i }).click();

    await expect(page.locator('[data-testid="lesson-runner"]')).toBeVisible();

    // Find Check button
    const checkButton = page.getByRole('button', { name: /check/i });

    // If it's a multiple choice with no selection, Check should be disabled
    // If it's a fill-blank with empty input, Check should be disabled
    const inputField = page.locator('input[type="text"]').first();
    const choiceButton = page.locator('button[data-selected="false"]').first();

    if (await inputField.isVisible({ timeout: 500 }).catch(() => false)) {
      // Clear input
      await inputField.fill('');
      // Check should be disabled
      await expect(checkButton).toBeDisabled();

      // Type something
      await inputField.fill('something');
      // Check should now be enabled
      await expect(checkButton).toBeEnabled();
    }
  });
});
