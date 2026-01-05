import { test, expect, MOBILE_VIEWPORT, expectUrlChangeOrDialog, getElementState, ALL_ROUTES } from '../mobile-audit/_helpers';

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

test.describe('@slow Dead Click Scanner', () => {
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
          const ariaPressed = await el.getAttribute('aria-pressed');
          const ariaSelected = await el.getAttribute('aria-selected');
          const dataState = await el.getAttribute('data-state');
          const dataActive = await el.getAttribute('data-active');

          // Skip certain elements
          if (!label || label.length < 2) continue;
          if (/cookie|privacy|analytics/i.test(label)) continue;
          if (disabled || ariaDisabled === 'true') continue;
          if (ariaPressed === 'true' || ariaSelected === 'true' || dataState === 'active' || dataActive === 'true') {
            continue;
          }
          if (tagName === 'a' && href && href !== '#') continue; // Links with href are fine

          // For buttons without href, test if they do something
          if (tagName === 'button' || (tagName === 'a' && (!href || href === '#'))) {
            const before = page.url();

            // Trial click first
            const beforeState = await getElementState(el);
            await el.click({ trial: true }).catch(() => null);

            // Actual click
            await el.click({ timeout: 1000 }).catch(() => null);

            try {
              await expectUrlChangeOrDialog(page, before, { element: el, beforeState, timeout: 4500 });
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

test.describe('@slow Critical Button Validation', () => {
  test('Home - Start Learning is not dead', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const btn = page.getByTestId('home-start-learning');
    await expect(btn).toBeVisible();

    const href = await btn.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('/learn');
  });

  test('Learn - Start today\'s lesson is not dead', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const btn = page.getByTestId('learn-start-todays-lesson');
    await expect(btn).toBeVisible();

    const href = await btn.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('Practice - Word Sprint card is not dead', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.getByTestId('practice-mode-wordSprint');
    await expect(card).toBeVisible();

    const href = await card.getAttribute('href');
    expect(href).toContain('/word-sprint');
  });

  test('Reader - sample cards are not dead', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    const cards = page.getByTestId('reader-sample-cafe-conversation-cta');
    await expect(cards).toBeVisible();

    const href = await cards.getAttribute('href');
    expect(href).toContain('/reader/samples/');
  });

  test('Translate - translate button triggers action', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    // Fill input first
    const input = page.getByTestId('translate-input');
    await input.click();
    await input.fill('');
    await input.type('Hello', { delay: 20 });
    await expect(input).toHaveValue('Hello');

    const submitSticky = page.getByTestId('translate-submit-sticky');
    const submitMobile = page.getByTestId('translate-submit-mobile');
    const submitDesktop = page.getByTestId('translate-submit-desktop');
    let submit = submitSticky;
    if (await submitSticky.isVisible()) {
      submit = submitSticky;
    } else if (await submitMobile.isVisible()) {
      submit = submitMobile;
    } else {
      submit = submitDesktop;
    }
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();

    // Click should not be dead
    await submit.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Should show some result
    const text = await page.locator('body').innerText();
    expect(text.toLowerCase()).toMatch(/здраво|translation|result|output/i);
  });
});
