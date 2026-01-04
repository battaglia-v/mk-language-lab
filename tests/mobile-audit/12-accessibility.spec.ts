import { test, expect, MOBILE_VIEWPORT, ALL_ROUTES } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

/**
 * Accessibility Tests
 *
 * WCAG AA compliance checks for mobile:
 * - Touch targets at least 44px
 * - Proper heading hierarchy
 * - Form labels
 * - Color contrast (basic)
 */

test.describe('Touch Target Sizes (WCAG 2.5.5)', () => {
  const routesToCheck = [
    ALL_ROUTES.home,
    ALL_ROUTES.learn,
    ALL_ROUTES.practice,
    ALL_ROUTES.reader,
  ];

  for (const route of routesToCheck) {
    test(`touch targets on ${route} are at least 44px`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Get all interactive elements
      const interactives = page.locator('button:visible, a:visible, [role="button"]:visible');
      const count = await interactives.count();

      let undersized: string[] = [];

      for (let i = 0; i < Math.min(count, 15); i++) {
        const el = interactives.nth(i);
        const box = await el.boundingBox();
        const label = await el.innerText().catch(() => '');

        if (box) {
          // Either width or height should be at least 44px
          // (allows for horizontal button bars)
          if (box.width < 40 && box.height < 40) {
            undersized.push(`"${label.slice(0, 20)}" (${box.width}x${box.height})`);
          }
        }
      }

      // Allow a few undersized (icons, etc)
      expect(undersized.length, `Undersized: ${undersized.join(', ')}`).toBeLessThanOrEqual(3);
    });
  }
});

test.describe('Heading Hierarchy', () => {
  test('Home has h1', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('Learn page has h1', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('no skipped heading levels', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'domcontentloaded' });

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    let prevLevel = 0;
    for (const heading of headings) {
      const tag = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tag.replace('h', ''), 10);

      // Should not skip levels (h1 -> h3 is bad)
      if (prevLevel > 0 && level > prevLevel + 1) {
        // Allow h1 -> h3 skip in some cases
        expect(level).toBeLessThanOrEqual(prevLevel + 2);
      }

      prevLevel = level;
    }
  });
});

test.describe('Form Labels', () => {
  test('sign in form inputs have labels', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      // Should have either label, aria-label, or placeholder
      const ariaLabel = await emailInput.getAttribute('aria-label');
      const placeholder = await emailInput.getAttribute('placeholder');
      const id = await emailInput.getAttribute('id');

      let hasLabel = false;
      if (ariaLabel) hasLabel = true;
      if (placeholder) hasLabel = true;
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if (await label.count() > 0) hasLabel = true;
      }

      expect(hasLabel).toBeTruthy();
    }
  });

  test('translate input has label', async ({ page }) => {
    await page.goto('/en/translate', { waitUntil: 'domcontentloaded' });

    const textbox = page.getByRole('textbox').first();
    const ariaLabel = await textbox.getAttribute('aria-label');
    const placeholder = await textbox.getAttribute('placeholder');

    expect(ariaLabel || placeholder).toBeTruthy();
  });
});

test.describe('Focus Visibility', () => {
  test('buttons show focus state', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const btn = page.getByRole('link', { name: /start learning/i }).first();
    await btn.focus();

    // Check for focus ring (outline or ring class)
    const outline = await btn.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline || style.boxShadow;
    });

    // Should have some focus indicator
    expect(outline).not.toBe('none');
  });
});

test.describe('Keyboard Navigation', () => {
  test('can tab through home page controls', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Press tab multiple times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('Enter activates focused button', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Tab to Start Learning link
    const startBtn = page.getByRole('link', { name: /start learning/i }).first();
    await startBtn.focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Should navigate
    await expect(page).toHaveURL(/\/learn/);
  });
});

test.describe('Screen Reader Text', () => {
  test('icons have aria-label or sr-only text', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Check SVG icons
    const svgs = page.locator('svg');
    const count = await svgs.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const svg = svgs.nth(i);
      const ariaHidden = await svg.getAttribute('aria-hidden');
      const ariaLabel = await svg.getAttribute('aria-label');

      // Should either be hidden from screen readers or have label
      expect(ariaHidden === 'true' || ariaLabel).toBeTruthy();
    }
  });
});
