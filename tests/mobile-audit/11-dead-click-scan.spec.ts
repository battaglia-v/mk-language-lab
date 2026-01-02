import { test, expect } from '@playwright/test';
import { MOBILE_VIEWPORT, expectUrlChangeOrDialog, ALL_ROUTES } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

/**
 * Dead Click Scanner
 *
 * Tests top visible buttons/links on each route to ensure they do something
 * (navigate, open dialog, or trigger state change).
 */

const ROUTES_TO_SCAN = [
  ALL_ROUTES.home,
  ALL_ROUTES.learn,
  ALL_ROUTES.pathsHub,
  ALL_ROUTES.practice,
  ALL_ROUTES.reader,
  ALL_ROUTES.translate,
  ALL_ROUTES.more,
  ALL_ROUTES.settings,
  ALL_ROUTES.lessonAlphabet,
];

test.describe('Dead Click Scanner', () => {
  for (const route of ROUTES_TO_SCAN) {
    test(`scan buttons/links on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500); // Let hydration complete

      // Get visible clickable elements
      const candidates = page.locator('button:visible, a:visible, [role="button"]:visible');
      const count = await candidates.count();
      const maxToTest = Math.min(count, 8); // Limit to avoid timeout

      const deadClicks: string[] = [];

      for (let i = 0; i < maxToTest; i++) {
        const el = candidates.nth(i);

        try {
          const label = (await el.innerText().catch(() => '')).trim();
          const tagName = await el.evaluate((node) => node.tagName.toLowerCase());
          const href = await el.getAttribute('href');
          const disabled = await el.getAttribute('disabled');
          const ariaDisabled = await el.getAttribute('aria-disabled');

          // Skip certain elements
          if (!label || label.length < 2) continue;
          if (/cookie|privacy|analytics/i.test(label)) continue;
          if (disabled || ariaDisabled === 'true') continue;
          if (tagName === 'a' && href && href !== '#') continue; // Links with href are fine

          // For buttons without href, test if they do something
          if (tagName === 'button' || (tagName === 'a' && (!href || href === '#'))) {
            const before = page.url();

            // Trial click first
            await el.click({ trial: true }).catch(() => null);

            // Actual click
            await el.click({ timeout: 1000 }).catch(() => null);

            try {
              await expectUrlChangeOrDialog(page, before);
            } catch {
              // Dead click detected
              deadClicks.push(`"${label}" at ${route}`);
            }

            // Reset if navigated
            if (page.url() !== route) {
              await page.goto(route, { waitUntil: 'domcontentloaded' });
              await page.waitForTimeout(300);
            }
          }
        } catch {
          // Element may have become stale, skip
          continue;
        }
      }

      // Report dead clicks
      if (deadClicks.length > 0) {
        console.warn(`Dead clicks found on ${route}:`, deadClicks);
      }

      // Allow up to 2 dead clicks (some may be expected, like language toggles)
      expect(deadClicks.length, `Dead clicks: ${deadClicks.join(', ')}`).toBeLessThanOrEqual(2);
    });
  }
});

test.describe('Critical Button Validation', () => {
  test('Home - Start Learning is not dead', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const btn = page.getByRole('link', { name: /start learning/i }).first();
    await expect(btn).toBeVisible();

    const href = await btn.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('/learn');
  });

  test('Learn - Start today\'s lesson is not dead', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const btn = page.getByRole('link', { name: /start today/i }).first();
    await expect(btn).toBeVisible();

    const href = await btn.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('Practice - Word Sprint card is not dead', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.locator('a').filter({ hasText: /word sprint/i }).first();
    await expect(card).toBeVisible();

    const href = await card.getAttribute('href');
    expect(href).toContain('/word-sprint');
  });

  test('Reader - sample cards are not dead', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    const cards = page.locator('a').filter({ hasText: /cafe|day|challenge/i }).first();
    await expect(cards).toBeVisible();

    const href = await cards.getAttribute('href');
    expect(href).toContain('/reader/samples/');
  });

  test('Translate - translate button triggers action', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    // Fill input first
    const input = page.getByRole('textbox').first();
    await input.fill('Hello');

    const btn = page.getByRole('button', { name: /translate/i }).first();
    await expect(btn).toBeVisible();
    await expect(btn).not.toBeDisabled();

    // Click should not be dead
    await btn.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Should show some result
    const text = await page.locator('body').innerText();
    expect(text.toLowerCase()).toMatch(/здраво|translation|result|output/i);
  });
});
