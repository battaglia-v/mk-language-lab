import { expect, Page, Locator } from '@playwright/test';

/**
 * Shared test utilities for E2E tests
 * These helpers ensure consistent, resilient test patterns across all test files.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Selector patterns to exclude development-only elements from tests.
 * This prevents Next.js Dev Tools, React DevTools, and similar elements
 * from interfering with accessibility and functionality tests.
 */
export const DEV_TOOLS_EXCLUSIONS = [
  '[class*="__next"]',
  '[data-nextjs]',
  '[aria-label*="Dev Tools"]',
  '[aria-label*="Next.js"]',
  'button:has-text("Open Next.js")',
];

export const EXCLUDE_DEV_TOOLS_SELECTOR = DEV_TOOLS_EXCLUSIONS.map(s => `:not(${s})`).join('');

// =============================================================================
// WAITING UTILITIES
// =============================================================================

/**
 * Wait for page to be fully loaded and hydrated.
 * Use this instead of arbitrary waitForTimeout calls.
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  // Wait for React hydration to complete
  await page.waitForFunction(() => {
    return document.readyState === 'complete' && 
           !document.querySelector('[class*="loading"]') &&
           !document.querySelector('[class*="skeleton"]');
  }, { timeout: 10000 }).catch(() => {
    // Continue even if hydration check times out
  });
}

/**
 * Wait for a specific API response before proceeding.
 */
export async function waitForApi(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: 15000 }
  ).catch(() => {
    // Continue even if API doesn't respond
  });
}

// =============================================================================
// ACCESSIBILITY HELPERS
// =============================================================================

/**
 * Get all visible, non-dev-tools buttons on the page.
 */
export function getAppButtons(page: Page): Locator {
  return page.locator('button')
    .filter({ hasNot: page.locator('[aria-label*="Next.js"], [aria-label*="Dev Tools"]') })
    .filter({ has: page.locator(':visible') });
}

/**
 * Get all focusable elements excluding dev tools.
 */
export function getFocusableElements(page: Page): Locator {
  return page.locator([
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')).filter({
    hasNot: page.locator('[aria-label*="Next.js"], [aria-label*="Dev Tools"], [class*="__next"]')
  });
}

/**
 * Check that page has at least the expected number of focusable elements.
 */
export async function assertMinFocusableCount(page: Page, minCount: number): Promise<number> {
  const elements = getFocusableElements(page);
  const count = await elements.count();
  expect(count, `Expected at least ${minCount} focusable elements, found ${count}`).toBeGreaterThanOrEqual(minCount);
  return count;
}

/**
 * Check heading hierarchy with tolerance for common patterns.
 * Allows skipping 1 level (e.g., h1 → h3) which is common in component libraries.
 */
export async function assertHeadingHierarchy(page: Page, options: { 
  allowSkip?: number;
  requireSingleH1?: boolean;
} = {}): Promise<void> {
  const { allowSkip = 2, requireSingleH1 = false } = options;
  
  const h1Count = await page.locator('h1').count();
  if (requireSingleH1) {
    expect(h1Count, 'Page should have exactly one h1').toBe(1);
  } else {
    expect(h1Count, 'Page should have at least one h1').toBeGreaterThanOrEqual(1);
  }

  const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  const headingLevels = await Promise.all(
    allHeadings.map(async (h) => {
      const tagName = await h.evaluate((el) => el.tagName);
      return parseInt(tagName.replace('H', ''));
    })
  );

  for (let i = 1; i < headingLevels.length; i++) {
    const diff = headingLevels[i] - headingLevels[i - 1];
    expect(
      diff,
      `Heading hierarchy issue: h${headingLevels[i-1]} → h${headingLevels[i]} (max allowed skip: ${allowSkip - 1})`
    ).toBeLessThanOrEqual(allowSkip);
  }
}

/**
 * Assert all visible buttons have accessible names.
 */
export async function assertButtonsAccessible(page: Page): Promise<void> {
  const buttons = await getAppButtons(page).all();
  
  for (const button of buttons) {
    if (!(await button.isVisible())) continue;
    
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();
    const title = await button.getAttribute('title');
    
    const hasAccessibleName = 
      (ariaLabel && ariaLabel.trim().length > 0) || 
      (text && text.trim().length > 0) ||
      (title && title.trim().length > 0);
    
    expect(
      hasAccessibleName,
      `Button missing accessible name: ${await button.evaluate(el => el.outerHTML.slice(0, 100))}`
    ).toBeTruthy();
  }
}

/**
 * Assert all visible images have alt text or are decorative.
 */
export async function assertImagesAccessible(page: Page): Promise<void> {
  const images = await page.locator('img').all();
  
  for (const img of images) {
    if (!(await img.isVisible())) continue;
    
    const alt = await img.getAttribute('alt');
    const ariaLabel = await img.getAttribute('aria-label');
    const role = await img.getAttribute('role');
    const ariaHidden = await img.getAttribute('aria-hidden');
    
    const hasAccessibleName = 
      alt !== null || 
      ariaLabel !== null || 
      role === 'presentation' ||
      ariaHidden === 'true';
    
    expect(
      hasAccessibleName,
      `Image missing alt text: ${await img.getAttribute('src')?.then(s => s?.slice(0, 50))}`
    ).toBeTruthy();
  }
}

// =============================================================================
// NAVIGATION HELPERS
// =============================================================================

/**
 * Navigate to a page and wait for it to be ready.
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageReady(page);
}

/**
 * Click a link and wait for navigation to complete.
 */
export async function clickAndNavigate(link: Locator, expectedUrl: string | RegExp): Promise<void> {
  const page = link.page();
  await Promise.all([
    page.waitForURL(expectedUrl),
    link.click(),
  ]);
  await waitForPageReady(page);
}

// =============================================================================
// FORM HELPERS
// =============================================================================

/**
 * Fill a form field and verify the value was set.
 */
export async function fillField(field: Locator, value: string): Promise<void> {
  await field.fill(value);
  await expect(field).toHaveValue(value);
}

/**
 * Submit a form by pressing Enter or clicking the submit button.
 */
export async function submitForm(page: Page, submitSelector?: string): Promise<void> {
  if (submitSelector) {
    await page.locator(submitSelector).click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForLoadState('networkidle');
}

// =============================================================================
// MOBILE HELPERS
// =============================================================================

/**
 * Set viewport to mobile size and reload page.
 */
export async function setMobileViewport(page: Page, width = 375, height = 667): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.reload();
  await waitForPageReady(page);
}

/**
 * Set viewport to tablet size and reload page.
 */
export async function setTabletViewport(page: Page, width = 768, height = 1024): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.reload();
  await waitForPageReady(page);
}

/**
 * Set viewport to desktop size and reload page.
 */
export async function setDesktopViewport(page: Page, width = 1280, height = 720): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.reload();
  await waitForPageReady(page);
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Assert an element exists and is visible.
 */
export async function assertVisible(locator: Locator, message?: string): Promise<void> {
  await expect(locator, message).toBeVisible();
}

/**
 * Assert an element has specific text (partial match).
 */
export async function assertHasText(locator: Locator, text: string | RegExp, message?: string): Promise<void> {
  await expect(locator, message).toContainText(text);
}

/**
 * Soft assertion that logs but doesn't fail the test.
 */
export async function softAssertVisible(locator: Locator): Promise<boolean> {
  try {
    await expect(locator).toBeVisible({ timeout: 2000 });
    return true;
  } catch {
    console.warn(`Soft assertion failed: element not visible`);
    return false;
  }
}
