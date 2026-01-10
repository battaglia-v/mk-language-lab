import { test, expect, waitForInteractive, assertNoRawTranslationKeys } from './_helpers';

test.describe('Stage 4 gate - critical journeys', () => {
  test('home loads with primary CTA and translations', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await expect(page.getByTestId('cta-start-here')).toBeVisible();
    await expect(page.locator('[data-testid="nav-learn"]:visible')).toBeVisible();
    await assertNoRawTranslationKeys(page);
  });

  test('bottom nav navigates core tabs', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await page.locator('[data-testid="nav-translate"]:visible').click();
    await expect(page).toHaveURL(/\/translate/);

    await page.locator('[data-testid="nav-practice"]:visible').click();
    await expect(page).toHaveURL(/\/practice/);

    await page.locator('[data-testid="nav-reader"]:visible').click();
    await expect(page).toHaveURL(/\/reader/);

    await page.locator('[data-testid="nav-resources"]:visible').click();
    await expect(page).toHaveURL(/\/resources/);

    await page.locator('[data-testid="nav-learn"]:visible').click();
    await expect(page).toHaveURL(/\/learn/);
  });

  test('learn level toggle switches between A1 and A2', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await expect(page.getByText('A1 Foundations')).toBeVisible();

    await page.getByTestId('learn-level-intermediate').click();
    await expect(page.getByText('A2 Momentum')).toBeVisible();

    await page.getByTestId('learn-level-beginner').click();
    await expect(page.getByText('A1 Foundations')).toBeVisible();
  });

  test('learn level tabs switch content', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    // Click intermediate level
    await page.getByTestId('learn-level-intermediate').click();
    await expect(page.getByText('A2 Momentum')).toBeVisible();

    // Click challenge level
    await page.getByTestId('learn-level-challenge').click();
    await expect(page.getByText('30-Day')).toBeVisible();
  });

  test('word sprint starts and exits', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await page.getByTestId('word-sprint-picker-start').click();
    await expect(page.getByTestId('session-exit')).toBeVisible();

    await page.getByTestId('session-exit').click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('reader sample opens and word sheet toggles', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await page.getByTestId('reader-sample-cafe-conversation-cta').click();
    await waitForInteractive(page);

    await page.getByTestId('reader-tappable-word').first().click();
    await expect(page.getByTestId('reader-word-sheet')).toBeVisible();
    await expect(page.getByTestId('reader-word-sheet-save')).toBeVisible();

    await page.getByTestId('reader-word-sheet-close').click();
    await expect(page.getByTestId('reader-word-sheet')).toBeHidden();
  });

  test('translate smoke', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    const input = page.getByTestId('translate-input');
    await input.click();
    await input.fill('');
    await input.type('Hello', { delay: 20 });
    await expect(input).toHaveValue('Hello');

    const submitSticky = page.getByTestId('translate-submit-sticky');
    const submitMobile = page.getByTestId('translate-submit-mobile');
    if (await submitSticky.isVisible()) {
      await expect(submitSticky).toBeEnabled();
      await submitSticky.click();
    } else if (await submitMobile.isVisible()) {
      await expect(submitMobile).toBeEnabled();
      await submitMobile.click();
    } else {
      const submitDesktop = page.getByTestId('translate-submit-desktop');
      await expect(submitDesktop).toBeEnabled();
      await submitDesktop.click();
    }

    await expect(page.locator('body')).toContainText(/здраво|поздрав|translation|result/i);
  });
});
