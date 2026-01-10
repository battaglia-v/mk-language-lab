import { test, expect, assertNoRawTranslationKeys, waitForInteractive } from './_helpers';

test.describe('Stage 4 critical mobile audit', () => {
  test('critical routes load without 404s', async ({ page }) => {
    const routes = [
      '/en',
      '/en/learn',
      '/en/learn?level=beginner',
      '/en/learn?level=intermediate',
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

  test('learn page shows A1 and A2 level options', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await expect(page.getByTestId('learn-level-beginner')).toBeVisible();
    await expect(page.getByTestId('learn-level-intermediate')).toBeVisible();
    await assertNoRawTranslationKeys(page);
  });

  test('A1 level shows alphabet lesson path', async ({ page }) => {
    await page.goto('/en/learn?level=beginner', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await expect(page.getByText('A1 Foundations')).toBeVisible();
  });

  test('A2 level shows momentum path', async ({ page }) => {
    await page.goto('/en/learn?level=intermediate', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await expect(page.getByText('A2 Momentum')).toBeVisible();
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
