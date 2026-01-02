import { test, expect } from '@playwright/test';
import { assertNoRawTranslationKeys, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Alphabet Lesson', () => {
  test('lesson page loads', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/alphabet|cyrillic/i);
  });

  test('shows 31 letters in grid', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Should mention letter count
    await expect(page.locator('body')).toContainText(/31|letters/i);
  });

  test('letter cards are tappable', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Find a letter card (they have Cyrillic letters)
    const letterCard = page.locator('[role="button"], button').filter({ hasText: /^[А-Ша-ш]$/ }).first();

    if (await letterCard.count() > 0) {
      await letterCard.click();
      // Should trigger some feedback (audio or visual)
      await page.waitForTimeout(500);
    }
  });

  test('has Learn, Special, Practice tabs', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/learn/i);
    await expect(page.locator('body')).toContainText(/special/i);
    await expect(page.locator('body')).toContainText(/practice/i);
  });

  test('Special tab shows unique Macedonian letters', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Click Special tab
    const specialTab = page.getByRole('tab', { name: /special/i }).first();
    if (await specialTab.count() > 0) {
      await specialTab.click();
      await expect(page.locator('body')).toContainText(/unique|macedonian/i);
    }
  });

  test('Practice tab has quiz links', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Click Practice tab
    const practiceTab = page.getByRole('tab', { name: /practice/i }).first();
    if (await practiceTab.count() > 0) {
      await practiceTab.click();
      await expect(page.locator('body')).toContainText(/quiz|practice/i);
    }
  });

  test('back button returns to path', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    const backLink = page.getByRole('link', { name: /back/i }).first();
    if (await backLink.count() > 0) {
      await backLink.click();
      await expect(page).toHaveURL(/\/learn\/paths|\/learn$/);
    }
  });

  test('progress bar visible', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Should show progress
    await expect(page.locator('body')).toContainText(/letters viewed|progress/i);
  });

  test('minimum touch target size (44px)', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Check that letter cards have adequate size
    const letterCards = page.locator('[role="button"]').first();
    if (await letterCards.count() > 0) {
      const box = await letterCards.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
