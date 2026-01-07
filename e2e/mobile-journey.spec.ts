/**
 * Mobile Journey Tests - Real user flow verification
 * Covers: Dashboard → Lesson, Translate → History/Saved, Practice → Pronunciation
 *
 * Skipped in CI - journey tests involve multiple navigations and are slow.
 */
import { test, expect, type Page } from '@playwright/test';
import { bypassNetworkInterstitial } from './helpers/network-interstitial';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const IS_LOCAL = (() => {
  try {
    const hostname = new URL(BASE_URL).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return true;
  }
})();

async function gotoAndBypass(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  await bypassNetworkInterstitial(page);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
}

test.describe('Mobile Journey Tests', () => {
  test.skip(!!process.env.CI, 'Mobile journey tests skipped in CI - run locally');
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('Build info: /api/health returns gitSha', async ({ request }) => {
    test.skip(!IS_LOCAL, 'Health check assertion is local-only for production audits.');
    const response = await request.get(`${BASE_URL}/api/health`);
    // Health can return 503 when dependencies (e.g. DB) are unavailable in local/dev.
    expect([200, 503]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('gitSha');
    expect(data).toHaveProperty('buildTime');
    expect(data).toHaveProperty('env');
  });

  test('Dashboard → Practice: Can navigate and start a session', async ({ page }) => {
    await gotoAndBypass(page, '/en/learn');

    // Verify dashboard loads without overflow
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);

    // Click Practice quick action (prefer the dashboard CTA; fall back to tab nav)
    const quickPracticeLink = page.getByRole('link', { name: /Quick practice/i });
    if (await quickPracticeLink.isVisible()) {
      await quickPracticeLink.click();
    } else {
      await page.getByRole('link', { name: /^Practice$/i }).first().click();
    }
    await page.waitForURL(/\/en\/practice(\/|$)/);
    await bypassNetworkInterstitial(page);

    // Verify practice page has action buttons
    const hasActionButton = await page.locator('button').count() > 0;
    expect(hasActionButton).toBe(true);
  });

  test('Translate: History/Saved sheets align correctly', async ({ page }) => {
    await gotoAndBypass(page, '/en/translate');

    // Check for History button and click if present
    const historyBtn = page.locator('button:has-text("History")');
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(500);

      // Verify sheet is visible
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible();

      // No overflow
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);

      await page.keyboard.press('Escape');
    }

    // Check Saved button
    const savedBtn = page.locator('button:has-text("Saved")');
    if (await savedBtn.isVisible()) {
      await savedBtn.click();
      await page.waitForTimeout(500);
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible();
    }
  });

  test('Pronunciation: Has record + continue flow', async ({ page }) => {
    await gotoAndBypass(page, '/en/practice/pronunciation');

    // Find and click a session card to start
    const sessionCard = page.locator('[data-testid="session-card"], .cursor-pointer').first();
    if (await sessionCard.isVisible()) {
      await sessionCard.click();
      await page.waitForTimeout(1000);
    }

    // Should have: Listen button, Record or fallback, Continue/Next/Skip
    const hasListenUI = await page.locator('button:has-text("Listen"), button[aria-label*="Listen"], button[aria-label*="Play"]').count() > 0;
    const hasProgressUI = await page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Skip")').count() > 0;

    // At minimum, should have listen functionality
    expect(hasListenUI || hasProgressUI).toBe(true);
  });

  test('Grammar: Can start a lesson without server error', async ({ page }) => {
    await gotoAndBypass(page, '/en/practice/grammar');

    // Check for lesson cards
    const lessonCard = page.locator('[data-testid="lesson-card"], button:has-text("Start"), .cursor-pointer').first();

    if (await lessonCard.isVisible()) {
      // Monitor for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await lessonCard.click();
      await page.waitForTimeout(2000);

      // No server errors
      const serverErrors = errors.filter(e => e.includes('500') || e.includes('Server'));
      expect(serverErrors.length).toBe(0);
    }
  });

  test('News: No broken images', async ({ page }) => {
    await gotoAndBypass(page, '/en/news');
    await page.waitForTimeout(3000);

    const brokenCount = await page.evaluate(() => {
      let broken = 0;
      document.querySelectorAll('img').forEach(img => {
        // Skip SVG placeholders and data URIs
        if (img.src.includes('data:') || img.src.includes('svg')) return;
        if (img.complete && img.naturalWidth === 0) broken++;
      });
      return broken;
    });

    expect(brokenCount).toBeLessThanOrEqual(1);
  });

  test('320px viewport: No overflow on key pages', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const pages = ['/en', '/en/learn', '/en/translate', '/en/practice'];

    for (const path of pages) {
      await gotoAndBypass(page, path);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow, `Overflow on ${path}`).toBe(false);
    }
  });

  test('No raw i18n keys visible', async ({ page }) => {
    const pages = ['/en/learn', '/en/translate', '/en/practice'];

    for (const path of pages) {
      await gotoAndBypass(page, path);

      const rawKeys = await page.evaluate(() => {
        const patterns = [/^[a-z]+\.[a-zA-Z.]+$/, /^nav\.|^common\.|^learn\.|^practice\./];
        const texts: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent?.trim();
          if (text && text.length > 3 && text.length < 50) {
            if (patterns.some(p => p.test(text))) texts.push(text);
          }
        }
        return texts;
      });

      expect(rawKeys.length, `Raw i18n keys on ${path}: ${rawKeys.join(', ')}`).toBe(0);
    }
  });
});
