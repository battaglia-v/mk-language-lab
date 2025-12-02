import { devices, expect, test } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

const locale = 'mk';

// Updated: Profile removed from mobile nav (accessible via UserMenu in header)
const bottomNavDestinations = [
  { path: '/dashboard', name: /Dashboard|Табла/i },
  { path: '/translate', name: /Translate|Преведи/i },
  { path: '/practice', name: /Practice|Вежбање/i },
  { path: '/news', name: /News|Вести/i },
  { path: '/resources', name: /Resources|Ресурси/i },
];

test.describe('Mobile tab navigation', () => {
  test('displays exactly 5 navigation items (Profile removed)', async ({ page }) => {
    await page.goto(`/${locale}/dashboard`);
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
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    const practiceButton = nav.getByRole('link', { name: /Practice|Вежбање/i });

    await expect(practiceButton).toBeVisible();

    // Verify button size (64x64px = h-16 w-16)
    const box = await practiceButton.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(60); // Allow for slight rendering differences
    expect(box?.height).toBeGreaterThanOrEqual(60);

    // Verify gradient background is applied
    const bgColor = await practiceButton.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgColor).toContain('gradient');

    // Verify label text is visible (not just sr-only)
    const labelText = practiceButton.locator('span:not(.sr-only)');
    await expect(labelText).toBeVisible();
  });

  test('verifies touch target sizes meet 44px minimum', async ({ page }) => {
    await page.goto(`/${locale}/dashboard`);
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
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();

    // Verify paddingBottom includes safe-area-inset calculation
    const paddingBottom = await nav.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    expect(paddingBottom).toBeGreaterThan(10);
  });

  test('Profile is NOT in mobile bottom nav', async ({ page }) => {
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();

    // Verify Profile link does not exist in bottom nav
    const profileLink = nav.getByRole('link', { name: /Profile|Профил/i });
    await expect(profileLink).not.toBeVisible();
  });
});
