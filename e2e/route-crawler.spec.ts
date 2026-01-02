/**
 * Route Crawler E2E Test
 *
 * This test crawls through the app following CTAs and navigation links
 * to detect 404 errors and broken routes.
 *
 * Run with: npx playwright test e2e/route-crawler.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import { bypassNetworkInterstitial } from './helpers/network-interstitial';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const LOCALE = 'en';

async function safeGoto(page: Page, url: string, options?: { timeout?: number }) {
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: options?.timeout,
  });

  const bypassed = await bypassNetworkInterstitial(page);
  if (bypassed) {
    const secondResponse = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: options?.timeout,
    });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    return secondResponse;
  }

  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  return response;
}

// Primary routes that should always be accessible
const PRIMARY_ROUTES = [
  `/${LOCALE}`,
  `/${LOCALE}/learn`,
  `/${LOCALE}/practice`,
  `/${LOCALE}/translate`,
  `/${LOCALE}/reader`,
  `/${LOCALE}/news`,
  `/${LOCALE}/resources`,
  `/${LOCALE}/about`,
  `/${LOCALE}/privacy`,
  `/${LOCALE}/terms`,
  `/${LOCALE}/discover`,
  `/${LOCALE}/daily-lessons`,
  `/${LOCALE}/notifications`,
  `/${LOCALE}/profile`,
];

// CTAs on the dashboard that should work
const DASHBOARD_CTAS = [
  { selector: 'a[href*="/translate"]', name: 'Translate CTA' },
  { selector: 'a[href*="/practice"]', name: 'Practice CTA' },
  { selector: 'a[href*="/news"]', name: 'News CTA' },
  { selector: 'a[href*="/resources"]', name: 'Resources CTA' },
];

test.describe('Route Crawler - 404 Detection', () => {
  test('all primary routes are accessible', async ({ page }) => {
    const errors: Array<{ url: string; status: number | null }> = [];

    for (const route of PRIMARY_ROUTES) {
      const url = `${BASE_URL}${route}`;
      const response = await safeGoto(page, url);

      if (response?.status() === 404) {
        errors.push({ url: route, status: response.status() });
      }

      // Check for error boundary or custom 404 page
      const pageContent = await page.content();
      const has404Content =
        pageContent.includes('404') ||
        pageContent.includes('not found') ||
        pageContent.includes('Page Not Found');

      // Allow 404 content only on explicit 404 pages
      if (has404Content && !route.includes('404')) {
        console.warn(`Warning: Route ${route} may show 404 content`);
      }
    }

    expect(errors, `Found ${errors.length} primary route 404s`).toHaveLength(0);
  });

  test('dashboard CTAs lead to valid pages', async ({ page }) => {
    // Go to learn page (dashboard for authenticated users)
    await safeGoto(page, `${BASE_URL}/${LOCALE}/learn`);

    for (const cta of DASHBOARD_CTAS) {
      const link = await page.$(cta.selector);

      if (link) {
        const href = await link.getAttribute('href');

        if (href) {
          const fullUrl = href.startsWith('http')
            ? href
            : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;

          // Navigate and check
          const response = await safeGoto(page, fullUrl);

          expect(
            response?.status(),
            `${cta.name} link (${href}) should not 404`
          ).not.toBe(404);

          // Go back to dashboard
          await safeGoto(page, `${BASE_URL}/${LOCALE}/learn`);
        }
      }
    }
  });

  test('mobile bottom navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await safeGoto(page, `${BASE_URL}/${LOCALE}`);

    // Find mobile tab nav items
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const hrefs = await nav
      .locator('a[href]')
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute('href')).filter(Boolean)
      );

    const checked = new Set<string>();
    const errors: Array<{ url: string; status: number | null }> = [];

    for (const href of hrefs) {
      if (!href || checked.has(href) || href.startsWith('http')) continue;
      checked.add(href);

      const fullUrl = href.startsWith('/') ? `${BASE_URL}${href}` : `${BASE_URL}/${href}`;
      const response = await safeGoto(page, fullUrl);
      if (response?.status() === 404) {
        errors.push({ url: href, status: response.status() });
      }
    }

    expect(errors, `Found ${errors.length} mobile nav 404s`).toHaveLength(0);
  });

  test('sidebar navigation works on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    await safeGoto(page, `${BASE_URL}/${LOCALE}`);

    // Find sidebar nav items
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const hrefs = await nav
      .locator('a[href]')
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute('href')).filter(Boolean)
      );

    const checked = new Set<string>();
    const errors: Array<{ url: string; status: number | null }> = [];

    for (const href of hrefs.slice(0, 15)) {
      if (!href || checked.has(href) || href.startsWith('http')) continue;
      checked.add(href);

      const fullUrl = href.startsWith('/') ? `${BASE_URL}${href}` : `${BASE_URL}/${href}`;
      const response = await safeGoto(page, fullUrl, { timeout: 15000 });
      if (response?.status() === 404) {
        errors.push({ url: href, status: response.status() });
      }
    }

    expect(errors, `Found ${errors.length} sidebar nav 404s`).toHaveLength(0);
  });
});

test.describe('Route Crawler - Deep Link Validation', () => {
  test('practice page links work', async ({ page }) => {
    await safeGoto(page, `${BASE_URL}/${LOCALE}/practice`);

    // Check for any internal links on the practice page
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLAnchorElement).getAttribute('href')).filter(Boolean)
      );
    const errors: Array<{ url: string; status: number | null }> = [];
    const visitedUrls = new Set<string>();

    for (const href of hrefs.slice(0, 10)) {
      if (!href || visitedUrls.has(href)) continue;
      visitedUrls.add(href);

      const response = await safeGoto(page, `${BASE_URL}${href}`, { timeout: 15000 });
      if (response?.status() === 404) {
        errors.push({ url: href, status: response.status() });
      }

      // Return to practice page
      await safeGoto(page, `${BASE_URL}/${LOCALE}/practice`);
    }

    expect(errors, `Found ${errors.length} practice page 404s`).toHaveLength(0);
  });

  test('news page loads with articles', async ({ page }) => {
    const response = await safeGoto(page, `${BASE_URL}/${LOCALE}/news`, {
      timeout: 20000,
    });

    expect(response?.status(), 'News page should not 404').not.toBe(404);
    await expect(page.getByRole('heading', { name: /news feed/i })).toBeVisible();
    await expect(page.getByPlaceholder('Search headlines or keywords...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('translate page is functional', async ({ page }) => {
    await safeGoto(page, `${BASE_URL}/${LOCALE}/translate`);

    // Check for key elements
    const translateButton = await page.$('button[type="submit"]');
    expect(translateButton).not.toBeNull();

    // Check for textarea
    const textarea = await page.$('textarea');
    expect(textarea).not.toBeNull();
  });
});

test.describe('Route Crawler - Error Boundary Check', () => {
  test('invalid routes show proper 404 page', async ({ page }) => {
    const response = await page.goto(
      `${BASE_URL}/${LOCALE}/this-page-definitely-does-not-exist-${Date.now()}`,
      { waitUntil: 'domcontentloaded' }
    );

    // Should either return 404 or show a custom 404 page
    const status = response?.status();
    const content = await page.content();

    const is404Response = status === 404;
    const has404Content =
      content.includes('404') ||
      content.includes('not found') ||
      content.includes('Not Found');

    expect(
      is404Response || has404Content,
      'Invalid route should show 404'
    ).toBe(true);
  });
});

test.describe('Legacy Route Redirects', () => {
  test('/translator/history redirects to /translate', async ({ page }) => {
    // Navigate to the legacy route
    const response = await page.goto(`${BASE_URL}/${LOCALE}/translator/history`, {
      waitUntil: 'domcontentloaded',
    });

    // Should redirect (301) not 404
    expect(response?.status()).not.toBe(404);

    // Should end up at /translate with sheet=history param
    const url = page.url();
    expect(url).toContain('/translate');
    expect(url).toContain('sheet=history');
  });
});
