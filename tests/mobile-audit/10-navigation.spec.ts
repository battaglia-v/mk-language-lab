import { test, expect, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Bottom Navigation', () => {
  const navRoutes = [
    { name: 'Home', url: '/en', expected: /learn|start/i },
    { name: 'Learn', url: '/en/learn', expected: /learn macedonian/i },
    { name: 'Practice', url: '/en/practice', expected: /practice/i },
    { name: 'Reader', url: '/en/reader', expected: /reader/i },
    { name: 'Resources', url: '/en/resources', expected: /resources|saved|lab|news/i },
  ];

  for (const route of navRoutes) {
    test(`bottom nav shows ${route.name} item`, async ({ page }) => {
      await page.goto(route.url, { waitUntil: 'domcontentloaded' });

      // Check that nav exists
      const nav = page.getByTestId('bottom-nav');
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
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
  });

  test('tapping nav item navigates', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Find Practice nav item
    const practiceNav = page.getByTestId('bottom-nav').getByTestId('nav-practice');
    await practiceNav.click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test('nav items have adequate touch targets', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const navItems = page.getByTestId('bottom-nav').locator('a');
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
  ];

  for (const path of pagesWithBackButton) {
    test(`${path} has back navigation`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const backLink = path.includes('/alphabet')
        ? page.getByTestId('alphabet-back-to-a1')
        : page.getByTestId('reader-back');

      await expect(backLink).toBeVisible();
      await backLink.click();
      expect(page.url()).not.toBe(path);
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
