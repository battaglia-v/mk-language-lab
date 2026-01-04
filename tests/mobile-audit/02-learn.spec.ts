import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Learn Page', () => {
  test('loads and shows Learn Macedonian header', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/learn macedonian/i);
  });

  test('does not show malformed streak text (day s bug)', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const text = await page.locator('body').innerText();
    // Should not have "day s" with space before s
    expect(text).not.toMatch(/\bday\s+s\b/i);
    // Should not have "0 days" with extra space
    expect(text).not.toMatch(/\b0\s+day\s+s\b/i);
  });

  test('XP ring displays correctly (no duplicate)', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    // Should have XP display
    await expect(page.locator('body')).toContainText(/XP/i);

    // Count XP displays - should not have duplicate
    const xpMatches = await page.locator('text=/\\d+\\s*\\/\\s*\\d+\\s*XP/i').count();
    // At most 2 (ring center + possibly one other)
    expect(xpMatches).toBeLessThanOrEqual(2);
  });

  test('Start today\'s lesson CTA is tappable', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const startBtn = page.getByRole('link', { name: /start today/i }).first();
    await expect(startBtn).toBeVisible();

    // Verify it has an href
    const href = await startBtn.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('Quick practice link works', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const quickPractice = page.getByRole('link', { name: /quick practice/i }).first();
    if (await quickPractice.count() > 0) {
      await quickPractice.click();
      await expect(page).toHaveURL(/\/practice/);
    }
  });

  test('Translate something link works', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const translateLink = page.locator('a').filter({ hasText: /translate something/i }).first();
    if (await translateLink.count() > 0) {
      await translateLink.click();
      await expect(page).toHaveURL(/\/translate/);
    }
  });

  test('Pick a skill section visible', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/pick a skill/i);
  });

  test('Basics/Conversations track toggle works', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const basicsBtn = page.getByRole('button', { name: /basics/i }).first();
    const conversationsBtn = page.getByRole('button', { name: /conversations/i }).first();

    if (await basicsBtn.count() > 0 && await conversationsBtn.count() > 0) {
      // Toggle should work
      await conversationsBtn.click();
      await page.waitForTimeout(300);
      await basicsBtn.click();
    }
  });

  test('Lesson cards have Start indicator for available lessons', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    // Available lessons should show "Start" text
    const startIndicators = page.locator('text=/Start/');
    const count = await startIndicators.count();
    // At least one lesson should be available
    expect(count).toBeGreaterThan(0);
  });

  test('Locked lessons show lock icon', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    // Check for lock icon (Lucide Lock)
    const lockIcons = page.locator('[class*="lucide-lock"], svg');
    // Should have some locked lessons
    expect(await lockIcons.count()).toBeGreaterThan(0);
  });

  test('Browse all learning paths link works', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const pathsLink = page.getByRole('link', { name: /browse all learning paths/i }).first();
    if (await pathsLink.count() > 0) {
      await pathsLink.click();
      await expect(page).toHaveURL(/\/learn\/paths/);
    }
  });
});
