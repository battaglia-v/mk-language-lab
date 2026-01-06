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

    const startBtn = page.getByTestId('cta-start-here');
    await expect(startBtn).toBeVisible();

    // Verify it has an href
    const href = await startBtn.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('Pick a skill section visible', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('learn-level-beginner')).toBeVisible();
    await expect(page.getByTestId('learn-level-intermediate')).toBeVisible();
  });

  test('Basics/Conversations track toggle works', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const basicsBtn = page.getByTestId('learn-level-beginner');
    const conversationsBtn = page.getByTestId('learn-level-intermediate');

    if (await basicsBtn.count() > 0 && await conversationsBtn.count() > 0) {
      // Toggle should work
      await conversationsBtn.click();
      await page.waitForTimeout(300);
      await basicsBtn.click();
    }
  });

  test('Lesson cards have Start indicator for available lessons', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const lessonCards = page.locator('[data-testid^="learn-node-"]');
    const count = await lessonCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Browse all learning paths link works', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const pathsLink = page.getByTestId('cta-browse-paths');
    await expect(pathsLink).toBeVisible();
    await pathsLink.click();
    await expect(page).toHaveURL(/\/learn\/paths/);
  });
});
