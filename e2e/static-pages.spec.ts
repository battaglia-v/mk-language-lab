import { test, expect } from '@playwright/test';

const pages = [
  { path: '/mk/about', heroSelector: '[data-testid="about-hero"]', snapshot: 'about-hero.png' },
  { path: '/mk/privacy', heroSelector: '[data-testid="privacy-hero"]', snapshot: 'privacy-hero.png' },
];

test.describe('Static Pages', () => {
  for (const pageDef of pages) {
    test(`${pageDef.path} renders hero`, async ({ page }) => {
      await page.goto(pageDef.path);
      const hero = page.locator(pageDef.heroSelector);
      await expect(hero).toBeVisible();
    });

    test(`${pageDef.path} hero snapshot`, async ({ page }) => {
      await page.goto(pageDef.path);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);
      const hero = page.locator(pageDef.heroSelector);
      await expect(hero).toHaveScreenshot(pageDef.snapshot, {
        animations: 'disabled',
        scale: 'css',
      });
    });
  }
});
