import { test, expect, assertNoRawTranslationKeys, waitForInteractive } from './_helpers';

test.describe('Stage 4 critical mobile audit', () => {
  test('critical routes load without 404s', async ({ page }) => {
    const routes = [
      '/en',
      '/en/learn',
      '/en/learn/paths',
      '/en/learn/paths/a1',
      '/en/learn/paths/a2',
      '/en/practice/word-sprint',
      '/en/reader/samples/cafe-conversation',
    ];

    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      const status = response?.status() ?? 0;
      expect(status, `${route} returned status ${status}`).toBeGreaterThanOrEqual(200);
      expect(status, `${route} returned status ${status}`).toBeLessThan(400);
    }
  });

  test('home level CTAs show and translations resolve', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await expect(page.getByTestId('cta-start-here')).toBeVisible();
    await expect(page.getByTestId('home-level-intermediate')).toBeVisible();

    await assertNoRawTranslationKeys(page);
  });

  test('beginner CTA navigates to A1 learn path', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('cta-start-here').click();
    await waitForInteractive(page);

    await expect(page.getByTestId('cta-start-here')).toBeVisible();
    await expect(page.getByText('A1 Foundations')).toBeVisible();
  });

  test('intermediate selection shows A2 path', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await page.getByTestId('learn-level-intermediate').click();
    await expect(page.getByText('A2 Momentum')).toBeVisible();
  });

  test('learning paths hub shows A1 and A2 cards', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('cta-browse-paths').click();
    await waitForInteractive(page);

    await expect(page.getByTestId('paths-start-a1')).toBeVisible();
    await expect(page.getByTestId('paths-start-a2')).toBeVisible();
    await assertNoRawTranslationKeys(page);
  });

  test('A1 start here opens alphabet lesson', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('paths-start-a1').click();
    await waitForInteractive(page);

    await expect(page.getByTestId('alphabet-tab-learn')).toBeVisible();
  });

  test('A2 start here opens practice session', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('paths-start-a2').click();
    await waitForInteractive(page);

    await expect(page.getByTestId('session-exit')).toBeVisible();
  });

  test('word sprint starts and exits', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await page.getByTestId('word-sprint-picker-start').click();
    await expect(page.getByTestId('session-exit')).toBeVisible();

    await page.getByTestId('session-exit').click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('reader tap shows word sheet', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    const firstWord = page.getByTestId('reader-tappable-word').first();
    await firstWord.click();

    await expect(page.getByTestId('reader-word-sheet-save')).toBeVisible();
  });
});
