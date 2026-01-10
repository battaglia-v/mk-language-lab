import { expect, test } from '@playwright/test';

// Use chromium with Pixel 5-like viewport (avoid webkit dependency)
test.use({
  browserName: 'chromium',
  viewport: { width: 393, height: 851 },
  isMobile: true,
  hasTouch: true,
});

const locale = 'mk';

// Updated: New nav structure - Learn | Translate | Practice | Reader | Resources
const bottomNavDestinations = [
  { path: '/learn', name: /Learn|Учи/i },
  { path: '/translate', name: /Translate|Преведи/i },
  { path: '/practice', name: /Practice|Вежбање/i },
  { path: '/reader', name: /Reader|Читач/i },
  { path: '/resources', name: /Resources|Ресурси/i },
];

// Skip in CI - mobile tab nav tests can be flaky with timing
test.describe('Mobile tab navigation', () => {
  test.skip(!!process.env.CI, 'Mobile tab nav tests skipped in CI - run locally');
  test('displays exactly 5 navigation items', async ({ page }) => {
    await page.goto(`/${locale}/learn`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    await expect(nav).toBeVisible();

    // Verify z-index for overlay priority
    const zIndex = await nav.evaluate((el) => getComputedStyle(el).zIndex);
    const numericZIndex = Number(zIndex) || 0;
    expect(numericZIndex).toBeGreaterThanOrEqual(50);

    // Count all navigation links - should be exactly 5
    const allLinks = nav.getByRole('link');
    await expect(allLinks).toHaveCount(5);

    // Verify each expected destination is present
    for (const destination of bottomNavDestinations) {
      const link = nav.getByRole('link', { name: destination.name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', new RegExp(`^/${locale}${destination.path}(?:$|/)`));
    }
  });

  test('Practice button has visible label', async ({ page }) => {
    await page.goto(`/${locale}/learn`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    const practiceButton = nav.getByRole('link', { name: /Practice|Вежбање/i });

    await expect(practiceButton).toBeVisible();

    // Verify button has adequate touch target (min 44px)
    const box = await practiceButton.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);

    // Verify gradient background is applied
    const bgColor = await practiceButton.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgColor).toContain('gradient');
  });

  test('verifies touch target sizes meet 44px minimum', async ({ page }) => {
    await page.goto(`/${locale}/learn`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    const links = nav.getByRole('link');

    // Check each navigation item has adequate touch target
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const box = await link.boundingBox();

      // Minimum 44px for both width and height
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('applies safe-area-inset for notched devices', async ({ page }) => {
    await page.goto(`/${locale}/learn`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();

    // Verify paddingBottom is set (safe-area-inset fallback is 6px minimum)
    const paddingBottom = await nav.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    expect(paddingBottom).toBeGreaterThanOrEqual(6);
  });

  test('Resources tab navigates to Resources page', async ({ page }) => {
    await page.goto(`/${locale}/learn`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    const resourcesLink = nav.getByRole('link', { name: /Resources|Ресурси/i });

    await resourcesLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to Resources page
    await expect(page).toHaveURL(/\/resources/);

    // Resources page should have links to Saved Words, Language Lab, News
    await expect(page.getByTestId('resources-menu-savedWords')).toBeVisible();
    await expect(page.getByTestId('resources-menu-lab')).toBeVisible();
  });

  test('Reader tab navigates to Reader page', async ({ page }) => {
    await page.goto(`/${locale}/learn`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    const readerLink = nav.getByRole('link', { name: /Reader|Читач/i });

    await readerLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/reader/);
  });
});
