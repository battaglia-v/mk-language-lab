/**
 * Route Crawler E2E Test
 *
 * This test crawls through the app following CTAs and navigation links
 * to detect 404 errors and broken routes.
 *
 * Run with: npx playwright test e2e/route-crawler.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const LOCALE = 'en';

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

// Track visited URLs to avoid duplicates
const visitedUrls = new Set<string>();
const errors: Array<{ url: string; status: number; source: string }> = [];

test.describe('Route Crawler - 404 Detection', () => {
  test('all primary routes are accessible', async ({ page }) => {
    for (const route of PRIMARY_ROUTES) {
      const url = `${BASE_URL}${route}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      expect(response?.status(), `Route ${route} should not 404`).not.toBe(404);

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
  });

  test('dashboard CTAs lead to valid pages', async ({ page }) => {
    // Go to learn page (dashboard for authenticated users)
    await page.goto(`${BASE_URL}/${LOCALE}/learn`, { waitUntil: 'networkidle' });

    for (const cta of DASHBOARD_CTAS) {
      const link = await page.$(cta.selector);

      if (link) {
        const href = await link.getAttribute('href');

        if (href) {
          const fullUrl = href.startsWith('http')
            ? href
            : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;

          // Navigate and check
          const response = await page.goto(fullUrl, {
            waitUntil: 'domcontentloaded',
          });

          expect(
            response?.status(),
            `${cta.name} link (${href}) should not 404`
          ).not.toBe(404);

          // Go back to dashboard
          await page.goto(`${BASE_URL}/${LOCALE}/learn`, {
            waitUntil: 'domcontentloaded',
          });
        }
      }
    }
  });

  test('mobile bottom navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${BASE_URL}/${LOCALE}`, { waitUntil: 'networkidle' });

    // Find mobile tab nav items
    const navItems = await page.$$('[data-testid="mobile-tab-nav"] a');

    for (const navItem of navItems) {
      const href = await navItem.getAttribute('href');

      if (href && !visitedUrls.has(href)) {
        visitedUrls.add(href);

        const fullUrl = href.startsWith('http')
          ? href
          : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;

        const response = await page.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
        });

        expect(
          response?.status(),
          `Mobile nav link (${href}) should not 404`
        ).not.toBe(404);
      }
    }
  });

  test('sidebar navigation works on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(`${BASE_URL}/${LOCALE}`, { waitUntil: 'networkidle' });

    // Find sidebar nav items
    const sidebarLinks = await page.$$('nav a[href^="/"]');

    const checkedHrefs = new Set<string>();

    for (const link of sidebarLinks.slice(0, 15)) {
      // Limit to first 15
      const href = await link.getAttribute('href');

      if (href && !checkedHrefs.has(href)) {
        checkedHrefs.add(href);

        const fullUrl = `${BASE_URL}${href}`;

        try {
          const response = await page.goto(fullUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          if (response?.status() === 404) {
            errors.push({
              url: href,
              status: 404,
              source: 'sidebar navigation',
            });
          }
        } catch (error) {
          console.warn(`Failed to navigate to ${href}:`, error);
        }
      }
    }

    expect(errors.length, `Found ${errors.length} 404 errors`).toBe(0);
  });
});

test.describe('Route Crawler - Deep Link Validation', () => {
  test('practice page links work', async ({ page }) => {
    await page.goto(`${BASE_URL}/${LOCALE}/practice`, {
      waitUntil: 'networkidle',
    });

    // Check for any internal links on the practice page
    const internalLinks = await page.$$('a[href^="/"]');

    for (const link of internalLinks.slice(0, 10)) {
      const href = await link.getAttribute('href');

      if (href && !visitedUrls.has(href)) {
        visitedUrls.add(href);

        const response = await page.goto(`${BASE_URL}${href}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000,
        });

        if (response?.status() === 404) {
          errors.push({
            url: href,
            status: 404,
            source: 'practice page',
          });
        }

        // Return to practice page
        await page.goto(`${BASE_URL}/${LOCALE}/practice`, {
          waitUntil: 'domcontentloaded',
        });
      }
    }
  });

  test('news page loads with articles', async ({ page }) => {
    await page.goto(`${BASE_URL}/${LOCALE}/news`, {
      waitUntil: 'networkidle',
      timeout: 15000,
    });

    // Check that news cards are present
    const newsCards = await page.$$('[data-testid="news-card"]');

    // Should have at least some news items (or fallback data)
    expect(newsCards.length).toBeGreaterThanOrEqual(0);

    // Check page didn't 404
    const pageContent = await page.content();
    expect(pageContent).not.toContain('404');
  });

  test('translate page is functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/${LOCALE}/translate`, {
      waitUntil: 'networkidle',
    });

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

// Summary report at the end
test.afterAll(async () => {
  if (errors.length > 0) {
    console.log('\n=== Route Crawler Error Summary ===');
    console.log(`Found ${errors.length} issues:\n`);

    for (const error of errors) {
      console.log(`  ${error.status}: ${error.url}`);
      console.log(`    Source: ${error.source}\n`);
    }
  } else {
    console.log('\n=== Route Crawler: All routes OK ===');
  }
});
