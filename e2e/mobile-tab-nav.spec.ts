import { devices, expect, test } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

const locale = 'mk';
const destinations = [
  { path: '/dashboard', name: /Dashboard|Табла/i },
  { path: '/translate', name: /Translate|Преведи/i },
  { path: '/practice', name: /Practice|Вежбање/i },
  { path: '/news', name: /News|Вести/i },
  { path: '/resources', name: /Resources|Ресурси/i },
  { path: '/profile', name: /Profile|Профил/i },
];

test.describe('Mobile tab navigation', () => {
  test('navigates across all shell destinations', async ({ page }) => {
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav.fixed[aria-label]').first();
    await expect(nav).toBeVisible();

    const paddingBottom = await nav.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    expect(paddingBottom).toBeGreaterThan(10);

    const zIndex = await nav.evaluate((el) => getComputedStyle(el).zIndex);
    const numericZIndex = Number(zIndex) || 0;
    expect(numericZIndex).toBeGreaterThanOrEqual(50);

    for (const destination of destinations) {
      const link = nav.getByRole('link', { name: destination.name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', new RegExp(`^/${locale}${destination.path}(?:$|/)`));
    }
  });
});
