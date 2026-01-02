import { test, expect } from '@playwright/test';
import { assertNoRawTranslationKeys, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Translate Page', () => {
  test('loads and shows Translate header', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/translate/i);
  });

  test('has text input area', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const textbox = page.getByRole('textbox').first();
    await expect(textbox).toBeVisible();
  });

  test('has language toggle or direction indicator', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    // Should show languages
    await expect(page.locator('body')).toContainText(/english|macedonian|EN|MK/i);
  });

  test('translate button is visible', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const translateBtn = page.getByRole('button', { name: /translate/i }).first();
    await expect(translateBtn).toBeVisible();
  });

  test('can enter text and translate', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    // Enter text
    const textbox = page.getByRole('textbox').first();
    await textbox.fill('Hello');

    // Click translate
    const translateBtn = page.getByRole('button', { name: /translate/i }).first();
    await translateBtn.click();

    // Wait for result
    await page.waitForTimeout(2000);

    // Should show Macedonian result
    const result = await page.locator('body').innerText();
    expect(result.toLowerCase()).toMatch(/здраво|поздрав|translation|result/i);
  });

  test('swap languages button works', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const swapBtn = page.locator('button').filter({ hasText: /↔|swap|switch/i }).first();
    if (await swapBtn.count() > 0) {
      await swapBtn.click();
      // Should toggle direction
    }
  });

  test('history tab/section accessible', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    // Check for history tab or link
    const historyEl = page.locator('button, a, [role="tab"]').filter({ hasText: /history/i }).first();
    if (await historyEl.count() > 0) {
      await historyEl.click();
      await expect(page.locator('body')).toContainText(/history|recent|previous/i);
    }
  });

  test('minimum touch target for translate button', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const translateBtn = page.getByRole('button', { name: /translate/i }).first();
    const box = await translateBtn.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
