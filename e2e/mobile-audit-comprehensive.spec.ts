/**
 * Comprehensive Mobile Viewport QA Audit
 *
 * Tests mobile viewports for:
 * - Horizontal overflow
 * - Raw i18n keys in UI
 * - Console errors
 * - Network failures (4xx/5xx)
 * - Broken images
 * - Audio availability
 *
 * Outputs screenshots and JSON logs to e2e/screenshots/mobile-audit/
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { bypassNetworkInterstitial } from './helpers/network-interstitial';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const AUDIT_TARGET = (() => {
  try {
    const hostname = new URL(BASE_URL).hostname;
    return hostname === 'localhost' ? 'mobile-audit' : `mobile-audit-${hostname.replace(/\./g, '-')}`;
  } catch {
    return 'mobile-audit';
  }
})();

// Mobile viewports to test - including smallest common viewport (320px)
const VIEWPORTS = [
  { name: 'iPhone5SE', width: 320, height: 568 },  // Smallest supported viewport
  { name: 'SmallAndroid', width: 360, height: 800 },
  { name: 'iPhone13', width: 390, height: 844 },
  { name: 'Pixel7', width: 412, height: 915 },
];

// Routes to audit (critical and high priority)
const ROUTES_TO_AUDIT = [
  { path: '/en', name: 'Home' },
  { path: '/en/learn', name: 'LearnDashboard' },
  { path: '/en/practice', name: 'Practice' },
  { path: '/en/practice/pronunciation', name: 'Pronunciation' },
  { path: '/en/practice/grammar', name: 'Grammar' },
  { path: '/en/translate', name: 'Translate' },
  { path: '/en/reader', name: 'Reader' },
  { path: '/en/news', name: 'News' },
  { path: '/en/resources', name: 'Resources' },
  { path: '/en/discover', name: 'Discover' },
  { path: '/en/daily-lessons', name: 'DailyLessons' },
  { path: '/en/profile', name: 'Profile' },
  { path: '/en/notifications', name: 'Notifications' },
  { path: '/en/about', name: 'About' },
];

// i18n key patterns that should never appear in UI
const I18N_KEY_PATTERNS = [
  /^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+$/,
  /^(common|nav|learn|translate|practice|news|resources)\.[a-zA-Z]+/,
];

interface AuditResult {
  route: string;
  viewport: string;
  timestamp: string;
  interstitialBypassed?: boolean;
  overflow: { hasOverflow: boolean; elements: string[] };
  i18nKeys: string[];
  consoleErrors: string[];
  networkErrors: { url: string; status: number }[];
  brokenImages: string[];
  screenshot: string;
}

const results: AuditResult[] = [];

async function checkOverflow(page: Page): Promise<{ hasOverflow: boolean; elements: string[] }> {
  return page.evaluate(() => {
    const issues: string[] = [];
    const hasHorizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

    if (hasHorizontalOverflow) {
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 2) {
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className?.toString().split(' ')[0] || '';
          issues.push(`${el.tagName.toLowerCase()}${id}.${cls} (overflow: ${Math.round(rect.right - window.innerWidth)}px)`);
        }
      });
    }
    return { hasOverflow: hasHorizontalOverflow, elements: issues.slice(0, 10) };
  });
}

async function checkI18nKeys(page: Page): Promise<string[]> {
  const texts = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts: string[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text && text.length > 3 && text.length < 60) {
        texts.push(text);
      }
    }
    return texts;
  });

  return texts.filter((text) =>
    I18N_KEY_PATTERNS.some((pattern) => pattern.test(text))
  );
}

async function checkBrokenImages(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const broken: string[] = [];
    document.querySelectorAll('img').forEach((img) => {
      // Only flag images that have finished loading but have no intrinsic size.
      // `!img.complete` is often just a slow network and would create noisy false positives.
      if (img.complete && img.naturalWidth === 0) {
        broken.push(img.src.slice(0, 100));
      }
    });
    return broken;
  });
}

test.describe('Comprehensive Mobile Audit', () => {
  const screenshotDir = path.join(process.cwd(), 'e2e/screenshots', AUDIT_TARGET);
  const logsDir = path.join(screenshotDir, 'logs');

  test.beforeAll(async () => {
    fs.mkdirSync(screenshotDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });
  });

  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const route of ROUTES_TO_AUDIT) {
        test(`${route.name}`, async ({ page }) => {
          const consoleErrors: string[] = [];
          const networkErrors: { url: string; status: number }[] = [];
          let interstitialBypassed = false;

          // Capture console errors
          page.on('console', (msg) => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text().slice(0, 200));
            }
          });

          // Capture network errors
          page.on('response', (response) => {
            if (response.status() >= 400) {
              networkErrors.push({ url: response.url().slice(0, 100), status: response.status() });
            }
          });

          // Navigate
          // `networkidle` can be flaky on pages with background polling; use a
          // more reliable navigation signal, then optionally wait for idle.
          await page.goto(`${BASE_URL}${route.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });

          // If the network injects an interstitial warning page (corporate proxy),
          // click through so we audit the actual app rather than the warning.
          interstitialBypassed = await bypassNetworkInterstitial(page);
          if (interstitialBypassed) {
            consoleErrors.length = 0;
            networkErrors.length = 0;
          }

          // Best-effort settle for pages that do reach idle.
          await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

          // Wait for content to settle
          await page.waitForTimeout(1500);

          // Run checks
          const overflow = await checkOverflow(page);
          const i18nKeys = await checkI18nKeys(page);
          const brokenImages = await checkBrokenImages(page);

          // Take screenshot
          const screenshotPath = `${screenshotDir}/${viewport.name}-${route.name}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });

          // Store result
          const result: AuditResult = {
            route: route.path,
            viewport: viewport.name,
            timestamp: new Date().toISOString(),
            interstitialBypassed,
            overflow,
            i18nKeys,
            consoleErrors: consoleErrors.slice(0, 10),
            networkErrors: networkErrors.slice(0, 10),
            brokenImages: brokenImages.slice(0, 10),
            screenshot: `${viewport.name}-${route.name}.png`,
          };
          results.push(result);

          // Write individual log
          fs.writeFileSync(
            `${logsDir}/${viewport.name}-${route.name}.json`,
            JSON.stringify(result, null, 2)
          );

          // Assertions (soft - collect all issues)
          const issues: string[] = [];
          if (overflow.hasOverflow) issues.push(`Overflow: ${overflow.elements.length} elements`);
          if (i18nKeys.length > 0) issues.push(`i18n keys: ${i18nKeys.join(', ')}`);
          if (networkErrors.length > 0) issues.push(`Network errors: ${networkErrors.length}`);

          // Log issues but don't fail (we want to collect all data)
          if (issues.length > 0) {
            console.log(`[${viewport.name}/${route.name}] Issues: ${issues.join('; ')}`);
          }

          // Only fail on critical issues
          expect(i18nKeys.length, `Raw i18n keys found: ${i18nKeys.join(', ')}`).toBeLessThanOrEqual(2);
        });
      }
    });
  }

  test.afterAll(async () => {
    // Write consolidated report
    const reportPath = path.join(screenshotDir, 'audit-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Generate summary
    const summary = {
      totalTests: results.length,
      overflowIssues: results.filter(r => r.overflow.hasOverflow).length,
      i18nIssues: results.filter(r => r.i18nKeys.length > 0).length,
      networkIssues: results.filter(r => r.networkErrors.length > 0).length,
      consoleErrors: results.filter(r => r.consoleErrors.length > 0).length,
      brokenImages: results.filter(r => r.brokenImages.length > 0).length,
    };

    console.log('\n=== Mobile Audit Summary ===');
    console.log(JSON.stringify(summary, null, 2));
  });
});

// Audio availability test
test.describe('Audio Availability', () => {
  test('Word of the Day audio works or falls back to TTS', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/en/learn`, { waitUntil: 'networkidle' });
    await bypassNetworkInterstitial(page);
    await expect(page.getByRole('heading', { name: /learn macedonian/i })).toBeVisible();

    // Look for audio play button in Word of the Day
    const audioButton = page.locator('[aria-label*="Listen"], [aria-label*="Play"], button:has(svg[class*="Volume"])').first();

    if (await audioButton.isVisible()) {
      // Click and verify no "unavailable" text appears
      await audioButton.click();
      await page.waitForTimeout(2000);

      const unavailableText = await page.locator('text=/audio unavailable/i').count();
      expect(unavailableText, 'Should not show "Audio unavailable"').toBe(0);
    }
  });
});

// News images test
test.describe('News Images', () => {
  test('News page loads with images (or proper placeholders)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/en/news`, { waitUntil: 'networkidle', timeout: 20000 });
    await bypassNetworkInterstitial(page);

    await page.waitForTimeout(3000); // Allow images to load

    // Check for news cards
    const newsCards = await page.locator('[data-testid="news-card"], article, .news-item').count();
    expect(newsCards, 'News page should render at least one card').toBeGreaterThan(0);

    // Check images loaded (in-viewport only; offscreen images are often `loading=\"lazy\"`)
    const { inViewCount, brokenInView } = await page.evaluate(() => {
      let inViewCount = 0;
      let brokenInView = 0;

      document.querySelectorAll('img').forEach((img) => {
        // Skip SVG fallbacks (they're valid)
        if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) return;

        const rect = img.getBoundingClientRect();
        const isInViewport = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!isInViewport) return;

        inViewCount++;

        // Only flag images that have finished loading but have no intrinsic size.
        if (img.complete && img.naturalWidth === 0) brokenInView++;
      });

      return { inViewCount, brokenInView };
    });

    console.log(`News page: ${newsCards} cards, ${brokenInView} broken images in view (of ${inViewCount} imgs)`);
    expect(brokenInView, 'Should have minimal broken images in viewport').toBeLessThanOrEqual(3);
  });
});
