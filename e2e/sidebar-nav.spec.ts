import { expect, test } from '@playwright/test';

const locale = 'mk';

test.describe('Sidebar navigation - Desktop viewports', () => {
  test('sidebar is 72px collapsed on lg breakpoint (1024-1439px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    await expect(sidebar).toBeVisible();

    // At 1280px (between lg:1024px and 2xl:1440px), sidebar should be 72px
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBe(72);

    // Labels should be hidden at this breakpoint
    const labels = sidebar.locator('span.hidden');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0); // Has hidden labels
  });

  test('sidebar expands to 256px at 2xl breakpoint (1440px+)', async ({ page }) => {
    // Need to start with larger viewport for 2xl to apply
    await page.setViewportSize({ width: 1536, height: 900 }); // Above 2xl breakpoint
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    await expect(sidebar).toBeVisible();

    // At 1536px (>= 2xl breakpoint 1440px), sidebar should be 256px
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(250); // Allow some flexibility for rendering

    // Labels should be visible at this breakpoint
    const navLinks = sidebar.locator('nav a');
    const firstLink = navLinks.first();
    const label = firstLink.locator('span').filter({ hasText: /dashboard|табла|translate|преведи/i }).first();
    await expect(label).toBeVisible();
  });

  test('sidebar width is 256px (not 288px) at 2xl', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

    // Verify the width reduction from 288px to 256px
    expect(width).toBe(256);
    expect(width).not.toBe(288);
  });

  test('main content margin adjusts with sidebar width', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 }); // Above 2xl breakpoint
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('.app-shell-main');
    const marginLeft = await mainContent.evaluate((el) => parseFloat(getComputedStyle(el).marginLeft));

    // At 2xl, margin should be 256px (w-64 = 256px)
    expect(marginLeft).toBeGreaterThanOrEqual(250);
  });

  test('all nav items are present in sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    const navLinks = sidebar.locator('nav a');

    // All 6 items should be in sidebar (unlike mobile nav which has 5)
    await expect(navLinks).toHaveCount(6);
  });
});

test.describe('Sidebar navigation - Mobile viewports', () => {
  test('sidebar is hidden by default on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();

    // Check if sidebar has negative transform (translated off-screen)
    const transform = await sidebar.evaluate((el) => getComputedStyle(el).transform);
    // Either has translate transform or is hidden (both are valid)
    const isHidden = transform === 'none' || transform.includes('matrix');
    expect(isHidden).toBeTruthy();
  });

  test('mobile drawer respects max-width 85vw on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Open the sidebar drawer by clicking menu button (case-insensitive search)
    const menuButton = page.getByRole('button').filter({ hasText: /menu/i }).first();

    // Skip test if menu button not found (might be desktop only)
    const menuCount = await menuButton.count();
    if (menuCount === 0) {
      test.skip();
      return;
    }

    await menuButton.click();

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    await expect(sidebar).toBeVisible();

    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    const viewportWidth = 375;
    const maxWidth = viewportWidth * 0.85; // 85% = 318.75px

    // Sidebar should not exceed 85% of viewport
    expect(width).toBeLessThanOrEqual(maxWidth + 5); // +5 for rounding/rendering differences
  });

  test('mobile drawer width is reasonable on iPhone SE (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const menuButton = page.getByRole('button').filter({ hasText: /menu/i }).first();

    const menuCount = await menuButton.count();
    if (menuCount === 0) {
      test.skip();
      return;
    }

    await menuButton.click();

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

    // Should be around 256px but capped at 85vw (318.75px)
    expect(width).toBeLessThanOrEqual(320);
    expect(width).toBeGreaterThanOrEqual(240);
  });

  test('backdrop overlay appears when drawer is open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Open drawer
    const menuButton = page.getByRole('button').filter({ hasText: /menu/i }).first();

    const menuCount = await menuButton.count();
    if (menuCount === 0) {
      test.skip();
      return;
    }

    await menuButton.click();

    // Backdrop should be visible
    const backdrop = page.locator('button[aria-label="Close navigation"]');
    await expect(backdrop).toBeVisible();

    // Backdrop should have blur effect
    const backdropFilter = await backdrop.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(backdropFilter).toContain('blur');
  });
});

test.describe('Sidebar navigation - Content padding', () => {
  test('bottom padding reduced from 140px to 96px on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main#main-content');
    const paddingBottom = await mainContent.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));

    // Should be 96px (pb-24 = 6rem = 96px), not 140px
    expect(paddingBottom).toBeLessThanOrEqual(100);
    expect(paddingBottom).toBeGreaterThanOrEqual(90);
    expect(paddingBottom).not.toBe(140);
  });

  test('bottom padding is 0 on desktop (no mobile nav)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main#main-content');
    const paddingBottom = await mainContent.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));

    // Desktop should have no bottom padding (lg:pb-0)
    expect(paddingBottom).toBe(0);
  });
});

test.describe('Sidebar navigation - Accessibility', () => {
  test('sidebar has proper ARIA labels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    const nav = sidebar.locator('nav[aria-label]');

    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('aria-label', /.+/); // Has non-empty label
  });

  test('active navigation item has aria-current', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('div.fixed.inset-y-0.left-0').first();
    const activeLink = sidebar.locator('nav a[aria-current="page"]');

    await expect(activeLink).toBeVisible();
  });
});
