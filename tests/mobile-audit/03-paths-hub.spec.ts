import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT, LEARNING_PATH_IDS } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Learning Paths Hub', () => {
  test('loads and shows Learning Paths header', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/learning paths/i);
  });

  test('A1 Foundations path card visible', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('path-card-a1')).toBeVisible();
  });

  test('A2 Momentum path card visible', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('path-card-a2')).toBeVisible();
  });

  test('path cards are clickable', async ({ page }) => {
    await page.goto('/en/learn/paths', { waitUntil: 'domcontentloaded' });

    const a1Start = page.getByTestId('paths-start-a1');
    const a2Start = page.getByTestId('paths-start-a2');
    await expect(a1Start).toBeVisible();
    await expect(a2Start).toBeVisible();

    const href = await a1Start.getAttribute('href');
    expect(href).toContain('/learn/paths/');
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

      const nodes = page.locator('[data-testid^="path-node-"]');
      const count = await nodes.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`${pathId} path has back navigation`, async ({ page }) => {
      await page.goto(`/en/learn/paths/${pathId}`, { waitUntil: 'domcontentloaded' });

      await expect(page.getByTestId('path-detail-back')).toBeVisible();
    });
  });
}
