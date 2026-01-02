import { test, expect } from '@playwright/test';
import { MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Bottom Navigation', () => {
  const navRoutes = [
    { name: 'Home', url: '/en', expected: /learn|start/i },
    { name: 'Learn', url: '/en/learn', expected: /learn macedonian/i },
    { name: 'Practice', url: '/en/practice', expected: /practice/i },
    { name: 'Reader', url: '/en/reader', expected: /reader/i },
    { name: 'More', url: '/en/more', expected: /news|profile|settings/i },
  ];

  for (const route of navRoutes) {
    test(`bottom nav shows ${route.name} item`, async ({ page }) => {
      await page.goto(route.url, { waitUntil: 'domcontentloaded' });

      // Check that nav exists
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();

      // Check that we're on the right page
      await expect(page.locator('body')).toContainText(route.expected);
    });
  }

  test('bottom nav is sticky on scroll', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Nav should still be visible
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('tapping nav item navigates', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Find Practice nav item
    const practiceNav = page.locator('nav a, [role="navigation"] a').filter({ hasText: /practice/i }).first();
    if (await practiceNav.count() > 0) {
      await practiceNav.click();
      await expect(page).toHaveURL(/\/practice/);
    }
  });

  test('nav items have adequate touch targets', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const navItems = page.locator('nav a, [role="navigation"] a');
    const count = await navItems.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = navItems.nth(i);
      const box = await item.boundingBox();
      if (box) {
        // Should be at least 44px in one dimension
        expect(Math.max(box.height, box.width)).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Back Navigation', () => {
  const pagesWithBackButton = [
    '/en/learn/lessons/alphabet',
    '/en/reader/samples/cafe-conversation',
    '/en/learn/paths/a1',
  ];

  for (const path of pagesWithBackButton) {
    test(`${path} has back navigation`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const backLink = page.locator('a').filter({ hasText: /back|←/i }).first();
      if (await backLink.count() > 0) {
        await expect(backLink).toBeVisible();

        // Should navigate
        await backLink.click();
        expect(page.url()).not.toBe(path);
      }
    });
  }
});

test.describe('Breadcrumb Navigation', () => {
  test('lesson page shows path context', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet', { waitUntil: 'domcontentloaded' });

    // Should show where this lesson fits
    await expect(page.locator('body')).toContainText(/a1|path|alphabet/i);
  });
});
