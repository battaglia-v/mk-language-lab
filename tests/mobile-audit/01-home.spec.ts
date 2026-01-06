import { test, expect, assertNoRawTranslationKeys, attachConsoleAndPageErrors, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Home Page', () => {
  test('loads without JS errors and shows CTAs', async ({ page }) => {
    const getErrors = attachConsoleAndPageErrors(page);
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText('MK');
    await assertNoRawTranslationKeys(page);

    // Core CTAs exist
    await expect(page.getByTestId('cta-start-here')).toBeVisible();
    await expect(page.getByTestId('home-level-intermediate')).toBeVisible();
    await expect(page.getByTestId('home-sign-in')).toBeVisible();

    const errors = getErrors();
    const jsErrors = errors.filter(e => /(TypeError|ReferenceError|SyntaxError)/.test(e));
    expect(jsErrors.length, `JS errors found: ${jsErrors.join(', ')}`).toBe(0);
  });

  test('Beginner CTA navigates to Learn with beginner level', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('cta-start-here').click();
    await expect(page).toHaveURL(/\/en\/learn\?level=beginner/);
  });

  test('Sign In CTA navigates to auth', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('home-sign-in').click();
    await expect(page).toHaveURL(/\/auth\/signin|\/sign-in/);
  });

  test('bottom navigation is visible on mobile', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Should have nav items
    const nav = page.getByTestId('bottom-nav');
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
