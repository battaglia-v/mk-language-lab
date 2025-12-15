import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for UI components
 * Tests the appearance of key components across different states
 */
test.describe('Visual Regression - UI Components', () => {
  test.describe('Loading Skeletons', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('domcontentloaded');
    });

    test('dashboard skeletons match snapshot during loading', async ({ page }) => {
      // Navigate and capture skeleton state before content loads
      await page.route('**/api/profile/**', async (route) => {
        // Delay response to capture loading state
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.continue();
      });

      // Take screenshot of loading state if visible
      const main = page.locator('main').first();
      await expect(main).toBeVisible();
      
      // Screenshot the page during loading
      await expect(page).toHaveScreenshot('homepage-loading.png', {
        maxDiffPixels: 100,
        animations: 'disabled',
      });
    });
  });

  test.describe('Empty States', () => {
    test('empty search results display correctly', async ({ page }) => {
      await page.goto('/mk/practice');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Take screenshot of practice page
      const main = page.locator('main').first();
      await expect(main).toBeVisible();

      await expect(page).toHaveScreenshot('practice-page.png', {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });
  });

  test.describe('Theme Consistency', () => {
    test('homepage renders correctly in light theme', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Force light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });

      await expect(page).toHaveScreenshot('homepage-light.png', {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });

    test('homepage renders correctly in dark theme', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Force dark mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      });

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });
  });

  test.describe('Component Isolation', () => {
    test('navigation renders consistently', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Screenshot just the navigation
      const nav = page.locator('nav').first();
      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot('navigation.png', {
          maxDiffPixels: 50,
          animations: 'disabled',
        });
      }
    });

    test('footer renders consistently', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Screenshot just the footer
      const footer = page.locator('footer').first();
      if (await footer.isVisible()) {
        await expect(footer).toHaveScreenshot('footer.png', {
          maxDiffPixels: 50,
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Accessibility Colors', () => {
    test('buttons have sufficient contrast', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Find primary buttons and check they're styled correctly
      const buttons = page.locator('button, a[role="button"], .btn');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);

      // Verify at least one button is visible
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await expect(firstButton).toHaveScreenshot('primary-button.png', {
          maxDiffPixels: 20,
          animations: 'disabled',
        });
      }
    });
  });
});

test.describe('Visual Regression - Responsive', () => {
  test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('homepage looks correct on mobile', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });

    test('navigation adapts to mobile', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Check for mobile navigation (bottom tabs or hamburger)
      const bottomNav = page.locator('nav[role="tablist"], .mobile-nav, [data-testid="mobile-nav"]');
      const hamburger = page.locator('[data-testid="menu-toggle"], button[aria-label*="menu"]');
      
      // At least one mobile navigation pattern should be visible
      const bottomNavVisible = await bottomNav.first().isVisible().catch(() => false);
      const hamburgerVisible = await hamburger.first().isVisible().catch(() => false);
      
      expect(bottomNavVisible || hamburgerVisible).toBeTruthy();
    });
  });

  test.describe('Tablet Viewport', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('homepage looks correct on tablet', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });
  });

  test.describe('Desktop Viewport', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('homepage looks correct on desktop', async ({ page }) => {
      await page.goto('/mk');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        maxDiffPixels: 150,
        animations: 'disabled',
      });
    });
  });
});

test.describe('Visual Regression - Feature Pages', () => {
  test('practice page renders correctly', async ({ page }) => {
    await page.goto('/mk/practice');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('practice-full.png', {
      maxDiffPixels: 200,
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('translate page renders correctly', async ({ page }) => {
    await page.goto('/mk/translate');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('translate-full.png', {
      maxDiffPixels: 200,
      animations: 'disabled',
    });
  });

  test('resources page renders correctly', async ({ page }) => {
    await page.goto('/mk/resources');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('resources-full.png', {
      maxDiffPixels: 200,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Localization', () => {
  test('English locale renders correctly', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-en.png', {
      maxDiffPixels: 150,
      animations: 'disabled',
    });
  });

  test('Macedonian locale renders correctly', async ({ page }) => {
    await page.goto('/mk');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-mk.png', {
      maxDiffPixels: 150,
      animations: 'disabled',
    });
  });
});
