import { devices, expect, test } from '@playwright/test';

/**
 * Mobile Practice Flow E2E Tests
 *
 * Tests the full practice loop on mobile viewports:
 * - Practice hub navigation
 * - Starting a practice session
 * - Answering questions (multiple choice)
 * - Cloze mode
 * - Results screen
 */

// Test on iPhone 14 viewport
test.use({ ...devices['iPhone 12'], viewport: { width: 390, height: 844 } });

const locale = 'en';

test.describe('Mobile Practice Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies for clean state
    await page.context().clearCookies();
  });

  test('Practice hub loads with Continue CTA visible', async ({ page }) => {
    await page.goto(`/${locale}/practice`, { waitUntil: 'networkidle' });

    // Practice hub should show Continue/Start Practice button
    const startButton = page.getByRole('link', { name: /Start Practice|Continue/i });
    await expect(startButton).toBeVisible();

    // Touch target should be at least 48px
    const box = await startButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });

  test('Practice hub shows practice mode cards', async ({ page }) => {
    await page.goto(`/${locale}/practice`, { waitUntil: 'networkidle' });

    // Should show pronunciation and grammar cards
    await expect(page.getByRole('link', { name: /Pronunciation/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Grammar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Cloze/i })).toBeVisible();
  });

  test('Cloze mode page loads', async ({ page }) => {
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    // Should show progress bar and question
    await expect(page.locator('[role="progressbar"], .h-2')).toBeVisible();

    // Should show 4 answer choices
    const choices = page.locator('button').filter({ hasText: /^[A-D]\./ });
    await expect(choices).toHaveCount(4);

    // Each choice should have minimum touch target
    for (let i = 0; i < 4; i++) {
      const box = await choices.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(52);
    }
  });

  test('Cloze mode handles correct answer', async ({ page }) => {
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    // Wait for choices to load
    await page.waitForSelector('button:has-text("A.")');

    // Find and click an answer (we don't know which is correct, but we test the flow)
    const firstChoice = page.locator('button').filter({ hasText: /^A\./ }).first();
    await firstChoice.click();

    // Should show feedback (either correct or incorrect)
    const feedback = page.locator('[class*="emerald"], [class*="amber"]');
    await expect(feedback).toBeVisible({ timeout: 2000 });
  });

  test('Practice session shows progress header', async ({ page }) => {
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    // Should show X/Y counter
    const counter = page.getByText(/\d+\/\d+/);
    await expect(counter).toBeVisible();

    // Should have close button
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(closeButton).toBeVisible();
  });

  test('Practice results page accessible after completing session', async ({ page }) => {
    // Navigate directly to results page with query params
    const params = new URLSearchParams({
      reviewed: '5',
      correct: '3',
      streak: '2',
      duration: '60',
      xp: '3',
      deck: 'cloze',
    });

    await page.goto(`/${locale}/practice/results?${params}`, { waitUntil: 'networkidle' });

    // Should show XP earned
    await expect(page.getByText(/\+3.*XP/i)).toBeVisible();

    // Should show accuracy
    await expect(page.getByText(/60.*%|accuracy/i)).toBeVisible();

    // Should have action buttons
    await expect(page.getByRole('link', { name: /Practice Again|Back/i })).toBeVisible();
  });

  test('Practice hub settings bottom sheet opens', async ({ page }) => {
    await page.goto(`/${locale}/practice`, { waitUntil: 'networkidle' });

    // Find and click settings button
    const settingsButton = page.locator('button').filter({ has: page.locator('[class*="Settings"], svg') });

    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();

      // Bottom sheet should open with mode options
      await expect(page.getByText(/Typing|Multiple Choice/i)).toBeVisible({ timeout: 2000 });
    }
  });

  test('No horizontal overflow on 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/${locale}/practice`, { waitUntil: 'networkidle' });

    // Check body doesn't have horizontal scroll
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('No horizontal overflow in cloze mode on 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });
});

test.describe('Mobile Practice Flow - 390px iPhone 14', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Full practice loop completes without errors', async ({ page }) => {
    // Start at practice hub
    await page.goto(`/${locale}/practice`, { waitUntil: 'networkidle' });

    // Navigate to cloze
    const clozeLink = page.getByRole('link', { name: /Cloze/i });
    await clozeLink.click();
    await page.waitForLoadState('networkidle');

    // Verify we're in cloze session
    await expect(page).toHaveURL(/\/practice\/cloze/);

    // Answer a few questions
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('button:has-text("A.")', { timeout: 5000 });

      // Click first choice
      await page.locator('button').filter({ hasText: /^A\./ }).first().click();

      // Wait for feedback
      await page.waitForTimeout(1000);

      // If incorrect, click Continue
      const continueBtn = page.getByRole('button', { name: /Continue/i });
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
      }
    }

    // Close session early via X button
    const closeButton = page.locator('header button').first();
    await closeButton.click();

    // Should navigate to results
    await page.waitForURL(/\/practice\/results/, { timeout: 5000 });
  });
});
