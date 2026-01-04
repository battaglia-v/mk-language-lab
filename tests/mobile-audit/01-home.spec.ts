import { test, expect, assertNoRawTranslationKeys, attachConsoleAndPageErrors, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Home Page', () => {
  test('loads without JS errors and shows CTAs', async ({ page }) => {
    const getErrors = attachConsoleAndPageErrors(page);
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText('MK');
    await assertNoRawTranslationKeys(page);

    // Core CTAs exist
    await expect(page.getByRole('link', { name: /start learning/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();

    const errors = getErrors();
    const jsErrors = errors.filter(e => /(TypeError|ReferenceError|SyntaxError)/.test(e));
    expect(jsErrors.length, `JS errors found: ${jsErrors.join(', ')}`).toBe(0);
  });

  test('Start Learning CTA navigates to a practice session', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await page.getByRole('link', { name: /start learning/i }).click();
    await expect(page).toHaveURL(/\/en\/practice\/session\?deck=curated/);
  });

  test('Sign In CTA navigates to auth', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/signin|\/sign-in/);
  });

  test('bottom navigation is visible on mobile', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Should have nav items
    const nav = page.getByRole('navigation', { name: /main navigation|главна навигација/i });
    await expect(nav).toBeVisible();
  });

  test('language toggle accessible', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Look for MK/EN language toggle
    const langToggle = page.locator('button, a').filter({ hasText: /^MK$|^EN$|македонски/i }).first();
    if (await langToggle.count() > 0) {
      await expect(langToggle).toBeVisible();
    }
  });
});
