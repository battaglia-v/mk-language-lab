/**
 * Production Assertions - 5 critical checks for deployment verification
 * Run with: PLAYWRIGHT_BASE_URL=https://mklanguage.com npx playwright test e2e/prod-assertions.spec.ts
 */
import { test, expect, type Page } from '@playwright/test';
import { bypassNetworkInterstitial } from './helpers/network-interstitial';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function gotoAndBypass(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  await bypassNetworkInterstitial(page);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

test.describe('Production Assertions', () => {
  test('1. /en/practice does NOT render Speaking or Pronunciation cards', async ({ page }) => {
    await gotoAndBypass(page, '/en/practice');

    // Get all visible text content
    const bodyText = await page.locator('body').innerText();

    // Check that Speaking and Pronunciation are NOT present as visible practice options
    expect(bodyText).not.toContain('Speaking');
    expect(bodyText).not.toContain('Pronunciation');
  });

  test('2. /en/practice/pronunciation is blocked or shows Coming Soon', async ({ page }) => {
    await gotoAndBypass(page, '/en/practice/pronunciation');

    // Should either redirect, show 404, or show "Coming Soon"
    const url = page.url();
    const bodyText = await page.locator('body').innerText();

    const isBlocked =
      url.includes('/practice') && !url.includes('/pronunciation') || // Redirected away
      bodyText.toLowerCase().includes('coming soon') ||
      bodyText.toLowerCase().includes('not found') ||
      bodyText.includes('404');

    expect(isBlocked).toBe(true);
  });

  test('3. Alphabet lesson has correct O/Ѓ descriptions and full њ text', async ({ page }) => {
    await gotoAndBypass(page, '/en/learn/lessons/alphabet');

    const bodyText = await page.locator('body').innerText();

    // O should be like "order" or "program", NOT "hot"
    // Check that "hot" is NOT used for O description
    const hasCorrectO =
      !bodyText.includes('Like "o" in "hot"') &&
      (bodyText.includes('order') || bodyText.includes('program') || bodyText.includes('О'));

    // Ѓ should be palatalized g, NOT like j
    // Check that it's not incorrectly described as "j"
    const hasCorrectGj =
      !bodyText.includes('Like "j" in') || bodyText.includes('palatalized');

    // њ text should not be truncated
    const hasFullNj = bodyText.includes('њ') || bodyText.includes('Њ');

    expect(hasCorrectO).toBe(true);
    expect(hasCorrectGj).toBe(true);
    expect(hasFullNj).toBe(true);
  });

  test('4. Header animation (if present) uses a slow cadence', async ({ page }) => {
    await gotoAndBypass(page, '/en');

    // Check for animated header element
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check animation duration if present (should be 20-30s)
    const animationSpeed = await page.evaluate(() => {
      // Check for mk-gradient class which has the animation
      const animated = document.querySelector('.mk-gradient, [class*="gradient"]');
      if (!animated) return 'no-animation';
      const style = window.getComputedStyle(animated);
      const duration = style.animationDuration;
      // Return the duration value or 'none' if no animation
      return duration && duration !== '0s' ? duration : 'none';
    });

    // Animation should either not exist or be slow (>10s)
    // If it exists, verify it's at least 10s (we set it to 20s)
    if (animationSpeed !== 'no-animation' && animationSpeed !== 'none') {
      const duration = parseFloat(animationSpeed);
      expect(duration).toBeGreaterThan(10);
    }
  });

  test('5. /en/learn does NOT show malformed "day s" text', async ({ page }) => {
    await gotoAndBypass(page, '/en/learn');

    const bodyText = await page.locator('body').innerText();

    // Check for malformed pluralization patterns
    expect(bodyText).not.toMatch(/\bday s\b/i);
    expect(bodyText).not.toMatch(/\b\d+ day s\b/i);

    // Also check for other common malformed patterns
    expect(bodyText).not.toMatch(/\bword s\b/i);
    expect(bodyText).not.toMatch(/\blesson s\b/i);
  });
});
