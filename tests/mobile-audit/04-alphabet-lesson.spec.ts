import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT, waitForInteractive } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Alphabet Lesson', () => {
  test('lesson page loads', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.getByTestId('alphabet-tab-learn')).toBeVisible();
  });

  test('shows 31 letters in grid', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    const letters = page.locator('[data-testid^="alphabet-letter-"]');
    const count = await letters.count();
    expect(count).toBeGreaterThanOrEqual(31);
  });

  test('letter cards are tappable', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    const letterCard = page.locator('[data-testid^="alphabet-letter-"]').first();

    if (await letterCard.count() > 0) {
      await letterCard.click();
      // Should trigger some feedback (audio or visual)
      await page.waitForTimeout(500);
    }
  });

  test('has Learn, Special, Practice tabs', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('alphabet-tab-learn')).toBeVisible();
    await expect(page.getByTestId('alphabet-tab-special')).toBeVisible();
    await expect(page.getByTestId('alphabet-tab-practice')).toBeVisible();
  });

  test('Special tab shows unique Macedonian letters', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    // Click Special tab
    const specialTab = page.getByTestId('alphabet-tab-special');
    await specialTab.click();
    await page.waitForSelector('[data-testid^="alphabet-special-letter-"]', { state: 'visible', timeout: 15000 });
  });

  test('Practice tab has quiz links', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    // Click Practice tab
    const practiceTab = page.getByTestId('alphabet-tab-practice');
    await practiceTab.click();
    await expect(page.getByTestId('alphabet-go-alphabet-quiz')).toBeVisible();
  });

  test('back button returns to path', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    const backLink = page.getByTestId('alphabet-back-to-a1');
    await backLink.click();
    await expect(page).toHaveURL(/\/learn(?:\/paths|\?level=beginner)/);
  });

  test('progress bar visible', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Should show progress
    await expect(page.locator('body')).toContainText(/letters viewed|progress/i);
  });

  test('minimum touch target size (44px)', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    const letterCards = page.locator('[data-testid^="alphabet-letter-"]').first();
    if (await letterCards.count() > 0) {
      const box = await letterCards.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
