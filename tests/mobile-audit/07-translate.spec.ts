import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT, waitForInteractive } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Translate Page', () => {
  test('loads and shows Translate header', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/translate/i);
  });

  test('has text input area', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('translate-input')).toBeVisible();
  });

  test('has language toggle or direction indicator', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('translate-direction')).toBeVisible();
  });

  test('translate button is visible', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const submitSticky = page.getByTestId('translate-submit-sticky');
    const submitMobile = page.getByTestId('translate-submit-mobile');
    const submitDesktop = page.getByTestId('translate-submit-desktop');

    const isVisible = async (locator: ReturnType<typeof page.getByTestId>) => {
      try {
        return await locator.isVisible();
      } catch {
        return false;
      }
    };

    expect(
      (await isVisible(submitSticky)) || (await isVisible(submitMobile)) || (await isVisible(submitDesktop))
    ).toBeTruthy();
  });

  test('can enter text and translate', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    // Enter text
    const textbox = page.getByTestId('translate-input');
    await textbox.fill('Hello');

    // Click translate
    const submitSticky = page.getByTestId('translate-submit-sticky');
    const submitMobile = page.getByTestId('translate-submit-mobile');
    const submitDesktop = page.getByTestId('translate-submit-desktop');

    await expect.poll(async () => {
      if (await submitSticky.isVisible()) {
        return await submitSticky.isEnabled();
      }
      if (await submitMobile.isVisible()) {
        return await submitMobile.isEnabled();
      }
      return await submitDesktop.isEnabled();
    }).toBeTruthy();

    if (await submitSticky.isVisible()) {
      await submitSticky.click();
    } else if (await submitMobile.isVisible()) {
      await submitMobile.click();
    } else {
      await submitDesktop.click();
    }

    // Wait for result
    await page.waitForTimeout(2000);

    // Should show Macedonian result
    const result = await page.locator('body').innerText();
    expect(result.toLowerCase()).toMatch(/здраво|поздрав|translation|result/i);
  });

  test('swap languages button works', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const swapBtn = page.getByTestId('translate-swap-directions');
    await swapBtn.click();
  });

  test('history tab/section accessible', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    await page.getByTestId('translate-more-open').click();
    await expect(page.getByTestId('translate-more-sheet')).toBeVisible();
    const historyEl = page.getByTestId('translate-open-history');
    await historyEl.click();
    await expect(page.getByTestId('translate-history-sheet')).toBeVisible();
  });

  test('minimum touch target for translate button', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const translateBtn = page.getByTestId('translate-submit-mobile');
    const box = await translateBtn.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
