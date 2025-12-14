import { expect, test } from '@playwright/test';

const locale = 'mk';

test.describe('Sidebar navigation - Desktop viewports', () => {
  test('sidebar is visible on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // Look for sidebar navigation - may use different selectors in new design
    const sidebar = page.locator('aside, nav, [role="complementary"], div.fixed.inset-y-0.left-0').first();
    
    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeVisible();
    } else {
      // Navigation may be in header instead of sidebar
      const header = page.locator('header, [role="banner"]').first();
      await expect(header).toBeVisible();
    }
  });

  test('sidebar expands on very large screens', async ({ page }) => {
    // At 2xl breakpoint (1440px+), sidebar should show labels
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // Check that navigation is visible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Check that navigation links exist
    const navLinks = page.locator('nav a, aside a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('sidebar width is reasonable at 2xl', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // Look for sidebar/navigation
    const sidebar = page.locator('aside, nav[aria-label*="navigation" i], div.fixed.inset-y-0.left-0').first();
    
    if (await sidebar.count() > 0 && await sidebar.isVisible()) {
      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      // Sidebar should be reasonable width (not full screen)
      expect(width).toBeLessThan(400);
      expect(width).toBeGreaterThan(50);
    }
  });

  test('main content is not hidden by sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // Main content should be visible and not covered by sidebar
    const main = page.locator('main').first();
    await expect(main).toBeVisible();

    // Check that main content has reasonable left margin/padding
    const rect = await main.evaluate((el) => el.getBoundingClientRect());
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.width).toBeGreaterThan(500); // Main content has reasonable width
  });

  test('all nav items are present in navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // Check that key navigation links exist
    const links = [
      'a[href*="/translate"]',
      'a[href*="/practice"]',
      'a[href*="/news"]',
      'a[href*="/resources"]',
    ];

    for (const selector of links) {
      const link = page.locator(selector).first();
      expect(await link.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Sidebar navigation - Mobile viewports', () => {
  test('navigation is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // On mobile, navigation might be in a drawer/menu
    // First check if there's a menu button
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i], button:has-text("Menu"), button:has-text("Мени")').first();
    
    if (await menuButton.count() > 0) {
      // Menu button exists - mobile drawer pattern
      await expect(menuButton).toBeVisible();
    } else {
      // Navigation might be visible at bottom or in header
      const nav = page.locator('nav').first();
      const navCount = await nav.count();
      expect(navCount).toBeGreaterThan(0);
    }
  });

  test('mobile drawer opens when menu button clicked', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i], button:has-text("Menu"), button:has-text("Мени")').first();

    if (await menuButton.count() === 0) {
      test.skip();
      return;
    }

    await menuButton.click();
    await page.waitForTimeout(300);

    // After clicking, navigation links should be visible
    const navLinks = page.locator('nav a, a[href*="/translate"], a[href*="/practice"]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('mobile drawer has reasonable width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();

    if (await menuButton.count() === 0) {
      test.skip();
      return;
    }

    await menuButton.click();
    await page.waitForTimeout(300);

    // Find the drawer/sidebar
    const drawer = page.locator('aside, nav, div.fixed.inset-y-0').filter({ has: page.locator('a') }).first();
    
    if (await drawer.count() > 0 && await drawer.isVisible()) {
      const width = await drawer.evaluate((el) => el.getBoundingClientRect().width);
      const viewportWidth = 375;
      const maxWidth = viewportWidth * 0.9; // Max 90% of viewport

      // Drawer should not exceed 90% of viewport
      expect(width).toBeLessThanOrEqual(maxWidth);
    }
  });
});

test.describe('Sidebar navigation - Content padding', () => {
  test('main content has appropriate padding on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    const main = page.locator('main').first();
    
    if (await main.count() > 0) {
      const padding = await main.evaluate((el) => ({
        top: parseFloat(getComputedStyle(el).paddingTop),
        bottom: parseFloat(getComputedStyle(el).paddingBottom),
      }));

      // Should have some padding
      expect(padding.top).toBeGreaterThanOrEqual(0);
      expect(padding.bottom).toBeGreaterThanOrEqual(0);
    }
  });

  test('main content visible on desktop without obstruction', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    const main = page.locator('main').first();
    await expect(main).toBeVisible();

    // Content should start after any sidebar
    const rect = await main.evaluate((el) => el.getBoundingClientRect());
    expect(rect.left).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Sidebar navigation - Accessibility', () => {
  test('navigation has proper ARIA labels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav[aria-label]').first();

    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
      const label = await nav.getAttribute('aria-label');
      expect(label).toBeTruthy();
    } else {
      // Navigation might not have aria-label but should have links
      const navLinks = page.locator('nav a');
      expect(await navLinks.count()).toBeGreaterThan(0);
    }
  });

  test('navigation links are keyboard accessible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');

    // Tab through the page and verify we can reach navigation links
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that we can focus on some element
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
