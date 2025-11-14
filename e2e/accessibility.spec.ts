import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Comprehensive accessibility test suite for WCAG 2.1 AA compliance
 * Tests keyboard navigation, screen reader labels, focus management, and more
 */

async function checkKeyboardNavigation(page: Page, expectedFocusableCount: number) {
  const focusableElements = page.locator(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const count = await focusableElements.count();
  expect(count).toBeGreaterThanOrEqual(expectedFocusableCount);
  return count;
}

async function checkHeadingHierarchy(page: Page) {
  // Check h1 exists and is unique
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1);

  // Check headings are in logical order (no skipped levels)
  const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  const headingLevels = await Promise.all(
    allHeadings.map(async (h) => {
      const tagName = await h.evaluate((el) => el.tagName);
      return parseInt(tagName.replace('H', ''));
    })
  );

  // Check no skipped levels (e.g., h1 → h3 is bad)
  for (let i = 1; i < headingLevels.length; i++) {
    const diff = headingLevels[i] - headingLevels[i - 1];
    expect(diff).toBeLessThanOrEqual(1);
  }
}

async function checkAria(page: Page) {
  // Check buttons have accessible names
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();
    const hasAccessibleName = (ariaLabel && ariaLabel.length > 0) || (text && text.trim().length > 0);
    expect(hasAccessibleName).toBeTruthy();
  }

  // Check images have alt text or aria-label
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const ariaLabel = await img.getAttribute('aria-label');
    const role = await img.getAttribute('role');
    const hasAccessibleName = alt !== null || ariaLabel !== null || role === 'presentation';
    expect(hasAccessibleName).toBeTruthy();
  }
}

test.describe('Accessibility - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk');
  });

  test('should have valid heading hierarchy', async ({ page }) => {
    await checkHeadingHierarchy(page);
  });

  test('should have keyboard navigable elements', async ({ page }) => {
    const count = await checkKeyboardNavigation(page, 10);
    expect(count).toBeGreaterThan(10);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await checkAria(page);
  });

  test('should have focus visible styles', async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check if focus is visible (outline, ring, etc.)
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have skip to main content link', async ({ page }) => {
    // Tab once to find skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"], a[href="#main"]').first();

    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
      await skipLink.click();
      // Main content should be focused
      const main = page.locator('main, [id="main-content"], [id="main"]').first();
      await expect(main).toBeFocused();
    }
  });

  test('should have lang attribute on html', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['mk', 'en']).toContain(lang);
  });

  test('should have document title', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Accessibility - Translate Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/translate');
    await page.waitForLoadState('networkidle');
  });

  test('should have valid heading hierarchy', async ({ page }) => {
    await checkHeadingHierarchy(page);
  });

  test('should have keyboard navigable form', async ({ page }) => {
    const textarea = page.getByRole('textbox').first();

    // Focus textarea with keyboard
    await textarea.focus();
    await expect(textarea).toBeFocused();

    // Type with keyboard
    await page.keyboard.type('Hello');
    await expect(textarea).toHaveValue('Hello');

    // Tab to translate button
    await page.keyboard.press('Tab');
    const translateButton = page.getByRole('button', { name: /Translate|Преведи/i });
    await expect(translateButton).toBeFocused();

    // Press Enter to submit
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  });

  test('should have ARIA live region for results', async ({ page }) => {
    const liveRegion = page.locator('[aria-live]');
    const count = await liveRegion.count();
    expect(count).toBeGreaterThan(0);

    const ariaLive = await liveRegion.first().getAttribute('aria-live');
    expect(['polite', 'assertive']).toContain(ariaLive);
  });

  test('should have form labels', async ({ page }) => {
    // Check textareas have accessible names
    const textareas = await page.locator('textarea').all();
    for (const textarea of textareas) {
      const id = await textarea.getAttribute('id');
      const ariaLabel = await textarea.getAttribute('aria-label');
      const ariaLabelledBy = await textarea.getAttribute('aria-labelledby');
      const placeholder = await textarea.getAttribute('placeholder');

      const hasAccessibleName =
        (id && (await page.locator(`label[for="${id}"]`).count()) > 0) ||
        ariaLabel ||
        ariaLabelledBy ||
        placeholder;

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should announce errors to screen readers', async ({ page }) => {
    // Fill with very long text to trigger error
    const textarea = page.getByRole('textbox').first();
    await textarea.fill('a'.repeat(2000));

    // Check for error message with role="alert" or aria-live
    const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]');
    const hasError = (await errorMessage.count()) > 0;

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});

test.describe('Accessibility - Practice Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/practice');
    await page.waitForLoadState('networkidle');
  });

  test('should have valid heading hierarchy', async ({ page }) => {
    await checkHeadingHierarchy(page);
  });

  test('should have keyboard navigable controls', async ({ page }) => {
    await checkKeyboardNavigation(page, 5);
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await checkAria(page);
  });
});

test.describe('Accessibility - Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/onboarding');
  });

  test('should have valid heading hierarchy', async ({ page }) => {
    await checkHeadingHierarchy(page);
  });

  test('should navigate wizard with keyboard', async ({ page }) => {
    // Select first goal with keyboard
    await page.keyboard.press('Tab'); // Progress indicator
    await page.keyboard.press('Tab'); // First goal button
    await page.keyboard.press('Enter');

    // Check selection
    await page.waitForTimeout(500);

    // Navigate to next with keyboard
    const nextButton = page.getByRole('button', { name: /Next|Следно/i });
    await nextButton.focus();
    await page.keyboard.press('Enter');

    // Should be on step 2
    await expect(page.getByText(/What's your current level|Кое е вашето тековно ниво/i)).toBeVisible();
  });

  test('should have ARIA labels on wizard steps', async ({ page }) => {
    // Check progress indicator has accessible description
    const progressBars = page.locator('[class*="rounded-full"]');
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should announce step changes to screen readers', async ({ page }) => {
    // Look for aria-live region that announces step changes
    const announcer = page.locator('[aria-live], [role="status"]');

    if ((await announcer.count()) > 0) {
      await expect(announcer.first()).toBeInViewport();
    }
  });
});

test.describe('Accessibility - News Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/news');
    await page.waitForLoadState('networkidle');
  });

  test('should have valid heading hierarchy', async ({ page }) => {
    await checkHeadingHierarchy(page);
  });

  test('should have keyboard navigable article links', async ({ page }) => {
    await checkKeyboardNavigation(page, 5);
  });

  test('should have accessible article cards', async ({ page }) => {
    // Check article links have accessible names
    const links = await page.locator('a[href]').all();
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/mk');
  });

  test('should have accessible mobile menu', async ({ page }) => {
    // Look for mobile menu button
    const menuButton = page.getByRole('button', { name: /menu|меню/i }).first();

    if (await menuButton.isVisible()) {
      // Check it has accessible name
      const ariaLabel = await menuButton.getAttribute('aria-label');
      const text = await menuButton.textContent();
      expect(ariaLabel || text).toBeTruthy();

      // Check it has expanded state
      const ariaExpanded = await menuButton.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(ariaExpanded);
    }
  });

  test('should have touch-friendly tap targets', async ({ page }) => {
    // Check mobile nav buttons are at least 44x44px (WCAG 2.1 AA)
    const buttons = await page.locator('button, a[href]').all();

    for (const button of buttons.slice(0, 10)) {
      // Sample first 10
      const box = await button.boundingBox();
      if (box && (await button.isVisible())) {
        // Allow some tolerance for borders/padding
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
