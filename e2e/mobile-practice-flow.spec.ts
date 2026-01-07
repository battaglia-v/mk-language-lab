import { expect, test } from '@playwright/test';

/**
 * Mobile Practice Flow E2E Tests
 *
 * Tests the full practice loop on mobile viewports:
 * - Practice hub navigation
 * - Cloze mode
 * - Results screen
 */

// Test on iPhone-like viewport using chromium (not webkit)
test.use({
  browserName: 'chromium',
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

const locale = 'en';

test.describe('Mobile Practice Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies for clean state
    await page.context().clearCookies();
  });

  test('Practice hub loads and shows practice modes', async ({ page }) => {
    await page.goto(`/${locale}/practice`, { waitUntil: 'networkidle' });

    // Dismiss any tooltip overlay that might be showing
    const dismissBtn = page.getByRole('button', { name: /Dismiss/i });
    if (await dismissBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dismissBtn.click();
    }

    // Should show practice title (mobile shows "Train your Macedonian skills")
    await expect(page.getByRole('heading', { name: /Train your Macedonian skills/i })).toBeVisible();

    // Should show available practice modes (pronunciation is hidden in beta)
    // Should show cloze mode card (link containing "cloze" in URL)
    const clozeLink = page.locator('a[href*="cloze"]');
    await expect(clozeLink).toBeVisible();
  });

  test('Cloze mode page loads', async ({ page }) => {
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    // Should show progress counter (e.g., "1/10")
    await expect(page.getByText(/\d+\/\d+/)).toBeVisible();

    // Should show 4 answer choices
    const choices = page.locator('button').filter({ hasText: /^[A-D]\./ });
    await expect(choices).toHaveCount(4);

    // Each choice should have minimum touch target
    for (let i = 0; i < 4; i++) {
      const box = await choices.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(48);
    }
  });

  test('Cloze mode handles answer selection', async ({ page }) => {
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    // Wait for choices to load
    await page.waitForSelector('button:has-text("A.")');

    // Find and click an answer
    const firstChoice = page.locator('button').filter({ hasText: /^A\./ }).first();
    await firstChoice.click();

    // Should show feedback div (either correct or incorrect)
    const feedback = page.locator('div[class*="emerald"], div[class*="amber"]').first();
    await expect(feedback).toBeVisible({ timeout: 3000 });
  });

  test('Cloze session shows progress header with close button', async ({ page }) => {
    await page.goto(`/${locale}/practice/cloze`, { waitUntil: 'networkidle' });

    // Should show X/Y counter
    const counter = page.getByText(/\d+\/\d+/);
    await expect(counter).toBeVisible();

    // Should have close button (X icon)
    const closeButton = page.locator('header button').first();
    await expect(closeButton).toBeVisible();

    // Touch target should be adequate
    const box = await closeButton.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(40);
  });

  test('Practice results page displays stats correctly', async ({ page }) => {
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
    await expect(page.getByText(/\+3/)).toBeVisible();

    // Should show accuracy percentage
    await expect(page.getByText('60%')).toBeVisible();

    // Should have navigation link
    const navLinks = page.getByRole('link');
    expect(await navLinks.count()).toBeGreaterThan(0);
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

  // Note: The close button behavior varies based on session state (confirmation dialogs, etc.)
  // Core navigation tests above cover the key user flows
});
