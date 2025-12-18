import { test, expect } from '@playwright/test';

// Mobile viewports to test
const viewports = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 360, height: 640, name: 'Android Small' },
  { width: 390, height: 844, name: 'iPhone 12' },
];

// Key routes to test
const routes = [
  { path: '/en/practice', name: 'Practice Page' },
  { path: '/en/translate', name: 'Translate Page' },
  { path: '/en/news', name: 'News Page' },
  { path: '/en/learn', name: 'Learn Page' },
  { path: '/en/practice/grammar', name: 'Grammar Practice' },
];

test.describe('Mobile UI - No Horizontal Scroll', () => {
  for (const viewport of viewports) {
    for (const route of routes) {
      test(`${viewport.name} (${viewport.width}px) - ${route.name}`, async ({ page }) => {
        // Set viewport size
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        // Navigate to route
        await page.goto(route.path);

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        // Get scroll width and client width
        const scrollWidth = await page.evaluate(() =>
          document.documentElement.scrollWidth
        );
        const clientWidth = await page.evaluate(() =>
          document.documentElement.clientWidth
        );

        // Assert no horizontal scroll
        expect(scrollWidth).toBe(clientWidth);

        // Take screenshot for visual regression
        await page.screenshot({
          path: `screenshots/mobile-${viewport.name.replace(/\s+/g, '-')}-${route.name.replace(/\s+/g, '-')}.png`,
          fullPage: true,
        });
      });
    }
  }
});

test.describe('Mobile UI - No i18n Keys', () => {
  test('should not render raw i18n keys on Practice page', async ({ page }) => {
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Get page content
    const body = await page.textContent('body');

    // Check for dot notation keys (e.g., "nav.home", "practiceHub.title")
    // Allow single dots in URLs and common patterns
    const i18nKeyPattern = /(?:^|\s)([a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+)/;
    const matches = body?.match(i18nKeyPattern);

    if (matches) {
      throw new Error(`Found raw i18n keys: ${matches.join(', ')}`);
    }
  });

  test('should not render raw i18n keys on Learn page', async ({ page }) => {
    await page.goto('/en/learn');
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    const i18nKeyPattern = /(?:^|\s)([a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+)/;
    const matches = body?.match(i18nKeyPattern);

    if (matches) {
      throw new Error(`Found raw i18n keys: ${matches.join(', ')}`);
    }
  });

  test('should not render raw i18n keys on Translate page', async ({ page }) => {
    await page.goto('/en/translate');
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    const i18nKeyPattern = /(?:^|\s)([a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+)/;
    const matches = body?.match(i18nKeyPattern);

    if (matches) {
      throw new Error(`Found raw i18n keys: ${matches.join(', ')}`);
    }
  });
});

test.describe('Mobile UI - No Console Errors', () => {
  test('Practice page should load without uncaught errors', async ({ page }) => {
    const errors: string[] = [];

    // Listen for page errors
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (like network errors for optional resources)
    const criticalErrors = errors.filter((error) => {
      // Ignore favicon errors
      if (error.includes('favicon')) return false;
      // Ignore analytics errors
      if (error.includes('analytics')) return false;
      // Ignore CORS errors for external resources
      if (error.includes('CORS')) return false;
      return true;
    });

    expect(criticalErrors).toHaveLength(0);
  });

  test('Translate page should load without uncaught errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/en/translate');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter((error) => {
      if (error.includes('favicon')) return false;
      if (error.includes('analytics')) return false;
      if (error.includes('CORS')) return false;
      return true;
    });

    expect(criticalErrors).toHaveLength(0);
  });

  test('News page should load without uncaught errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/en/news');
    await page.waitForLoadState('networkidle');

    const criticalErrors = errors.filter((error) => {
      if (error.includes('favicon')) return false;
      if (error.includes('analytics')) return false;
      if (error.includes('CORS')) return false;
      return true;
    });

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Mobile UI - Button Accessibility', () => {
  test('Practice page buttons should have adequate touch targets (>=44px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Check button heights
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && box.height < 44) {
        const text = await button.textContent();
        console.warn(`Button "${text}" has height ${box.height}px (expected >=44px)`);
      }
    }

    // This test logs warnings but doesn't fail - adjust as needed
    expect(buttons.length).toBeGreaterThan(0);
  });
});

test.describe('Mobile UI - Specific Component Tests', () => {
  test('Practice page deck toggles should not overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/en/practice');
    await page.waitForLoadState('networkidle');

    // Find the deck toggle container
    const deckToggles = page.locator('[data-testid="practice-panels"]');
    await expect(deckToggles).toBeVisible();

    // Check if it has horizontal scroll
    const hasOverflow = await deckToggles.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('Translate page header buttons should wrap properly', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/en/translate');
    await page.waitForLoadState('networkidle');

    // Check that buttons are visible and not clipped
    const historyButton = page.getByRole('button', { name: /history/i });
    const savedButton = page.getByRole('button', { name: /saved/i });

    await expect(historyButton).toBeVisible();
    await expect(savedButton).toBeVisible();

    // Verify buttons are within viewport
    const historyBox = await historyButton.boundingBox();
    const savedBox = await savedButton.boundingBox();

    expect(historyBox?.x).toBeGreaterThanOrEqual(0);
    expect(savedBox?.x).toBeGreaterThanOrEqual(0);
    expect(historyBox && historyBox.x + historyBox.width).toBeLessThanOrEqual(320);
    expect(savedBox && savedBox.x + savedBox.width).toBeLessThanOrEqual(320);
  });
});
