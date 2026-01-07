import { test, expect } from '@playwright/test';

/**
 * Mobile Width Layout Tests
 *
 * Ensures pages follow the mobile-first layout contract:
 * - Mobile (<640px): Full width with only px-4 padding, NO max-width
 * - Tablet+ (>=640px): Constrained with max-width and centered
 *
 * Tests verify visually that there are no unwanted side gutters on mobile.
 * Skipped in CI - visual layout tests are slow and better run locally.
 */
test.describe('Mobile Width Layout', () => {
  test.skip(!!process.env.CI, 'Mobile width tests skipped in CI - run locally');
  test.describe('360x800 viewport (Small Mobile)', () => {
    test.use({ viewport: { width: 360, height: 800 } });

    test('/en/translate should be full width', async ({ page }) => {
      await page.goto('/en/translate');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/mobile-width/translate-360x800.png',
        fullPage: false,
      });

      // Check that main content container is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // With px-4 (16px * 2 = 32px total), content should be ~328px wide (360 - 32)
        // Allow 5px tolerance for borders/margins
        expect(box.width).toBeGreaterThan(320);
        expect(box.width).toBeLessThan(360);
      }
    });

    test('/en/learn should be full width', async ({ page }) => {
      await page.goto('/en/learn');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/mobile-width/learn-360x800.png',
        fullPage: false,
      });

      // Check that main content container is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // Content should fill most of the width with only normal padding
        expect(box.width).toBeGreaterThan(320);
        expect(box.width).toBeLessThan(360);
      }
    });

    test('/en/reader should be full width', async ({ page }) => {
      await page.goto('/en/reader');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/mobile-width/reader-360x800.png',
        fullPage: false,
      });

      // Check that main content container is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThan(320);
        expect(box.width).toBeLessThan(360);
      }
    });
  });

  test.describe('390x844 viewport (iPhone 12/13)', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('/en/translate should be full width', async ({ page }) => {
      await page.goto('/en/translate');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/mobile-width/translate-390x844.png',
        fullPage: false,
      });

      // Check that main content container is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // With px-4 (16px * 2 = 32px total), content should be ~358px wide (390 - 32)
        expect(box.width).toBeGreaterThan(350);
        expect(box.width).toBeLessThan(390);
      }
    });

    test('/en/learn should be full width', async ({ page }) => {
      await page.goto('/en/learn');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/mobile-width/learn-390x844.png',
        fullPage: false,
      });

      // Check that main content container is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThan(350);
        expect(box.width).toBeLessThan(390);
      }
    });

    test('/en/reader should be full width', async ({ page }) => {
      await page.goto('/en/reader');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({
        path: 'e2e/screenshots/mobile-width/reader-390x844.png',
        fullPage: false,
      });

      // Check that main content container is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThan(350);
        expect(box.width).toBeLessThan(390);
      }
    });
  });

  test.describe('640px viewport (sm: breakpoint)', () => {
    test.use({ viewport: { width: 640, height: 800 } });

    test('/en/translate should have max-width applied', async ({ page }) => {
      await page.goto('/en/translate');
      await page.waitForLoadState('networkidle');

      // At sm: breakpoint, max-width should start applying
      // PageContainer with size="md" applies sm:max-w-screen-md (768px)
      // So at 640px viewport, content should be full width (since 640 < 768)
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // Should still be close to full width at this breakpoint
        expect(box.width).toBeGreaterThan(600);
      }
    });
  });

  test.describe('Visual regression check', () => {
    test.use({ viewport: { width: 360, height: 800 } });

    test('No max-width constraint visible on mobile', async ({ page }) => {
      await page.goto('/en/translate');
      await page.waitForLoadState('networkidle');

      // Get the page content container
      const pageContent = page.locator('[class*="PageContainer"]').first();

      if (await pageContent.isVisible()) {
        // Check computed style doesn't have restrictive max-width
        const maxWidth = await pageContent.evaluate((el) => {
          return window.getComputedStyle(el).maxWidth;
        });

        // On mobile, max-width should be 'none' or a very large value
        // NOT something like '768px' or '48rem'
        expect(maxWidth).not.toMatch(/^\d+(px|rem|em)$/);
      }
    });
  });
});
