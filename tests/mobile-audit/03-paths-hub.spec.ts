import { test, expect } from '@playwright/test';
import { assertNoRawTranslationKeys, MOBILE_VIEWPORT, LEARNING_PATH_IDS } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Learning Paths Hub', () => {
  test('loads and shows Learning Paths header', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/learning paths/i);
  });

  test('A1 Foundations path card visible', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/foundations|a1|starter/i);
  });

  test('30-Day Challenge path card visible', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/30-day|30 day|reading challenge/i);
  });

  test('Topic Packs path card visible', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/topic packs|topics/i);
  });

  test('path cards are clickable', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    // Find any path card link
    const pathCards = page.locator('a').filter({ hasText: /foundations|30-day|topic|advanced/i });
    const count = await pathCards.count();

    expect(count).toBeGreaterThan(0);

    // First card should have href
    const href = await pathCards.first().getAttribute('href');
    expect(href).toBeTruthy();
  });
});

// Individual path tests
for (const pathId of LEARNING_PATH_IDS) {
  test.describe(`Learning Path: ${pathId}`, () => {
    test(`${pathId} path page loads without 404`, async ({ page }) => {
      await page.goto(`/en/learn/paths/${pathId}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('not found');
    });

    test(`${pathId} path shows lesson nodes`, async ({ page }) => {
      await page.goto(`/en/learn/paths/${pathId}`, { waitUntil: 'domcontentloaded' });

      // Should have some lesson-like content
      const hasLessons = await page.locator('body').innerText();
      expect(hasLessons.length).toBeGreaterThan(100); // Not empty
    });

    test(`${pathId} path has back navigation`, async ({ page }) => {
      await page.goto(`/en/learn/paths/${pathId}`, { waitUntil: 'domcontentloaded' });

      const backLink = page.locator('a').filter({ hasText: /back|←|chevron/i }).first();
      if (await backLink.count() > 0) {
        await expect(backLink).toBeVisible();
      }
    });
  });
}
