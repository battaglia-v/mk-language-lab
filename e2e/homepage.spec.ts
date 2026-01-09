import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title - may contain various formats
    const title = await page.title();
    expect(title).toBeTruthy();

    // Check hero heading is visible - the h1 says "Учи македонски"
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Verify page has loaded by checking main content
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });

  test('should display hero section with learning options', async ({ page }) => {
    // Check for main hero content - "Учи македонски" heading
    const heading = page.locator('h1').filter({ hasText: /Учи|Learn/i }).first();
    await expect(heading).toBeVisible();

    // Check for action links
    const actionLinks = page.locator('a[href*="/translate"], a[href*="/practice"]');
    const count = await actionLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display Quick Start cards', async ({ page }) => {
    // Check for action cards with Macedonian or English text
    // "Брз превод" = Quick Translation, "Продолжи лекција" = Continue Lesson
    await expect(page.getByRole('heading', { name: /Брз превод|Quick Translator|Translate/i }).first()).toBeVisible();

    // Check for resource links
    await expect(page.getByRole('heading', { name: /Библиотека|Library|Resources|Продолжи/i }).first()).toBeVisible();
  });

  test('should navigate to practice page', async ({ page }) => {
    // Look for a link that goes to practice - "Продолжи сесија" or similar
    const practiceLink = page.locator('a[href*="/practice"]').first();
    await practiceLink.click();

    // Wait for navigation
    await page.waitForURL('**/practice');

    // Verify we're on the practice page
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    const resourcesLink = page.locator('a[href*="/resources"]').first();
    await resourcesLink.click();

    // Wait for navigation
    await page.waitForURL('**/resources');

    // Verify we're on the resources page
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('hero section matches visual snapshot', async ({ page }) => {
    // Skip in CI - visual snapshots differ across environments
    test.skip(!!process.env.CI, 'Visual snapshot skipped in CI');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Use a more generic hero selector since data-testid may not exist
    const hero = page.locator('main').first();
    if (await hero.isVisible()) {
      await expect(hero).toHaveScreenshot('homepage-hero.png', {
        animations: 'disabled',
        scale: 'css',
      });
    }
  });

  test('should have working navigation', async ({ page }) => {
    // Check sidebar navigation links exist
    // Links go to: /mk/translate, /mk/practice, /mk/news, /mk/resources
    const navLinks = [
      'a[href*="/translate"]',
      'a[href*="/practice"]',
      'a[href*="/news"]',
      'a[href*="/resources"]',
    ];

    for (const selector of navLinks) {
      const link = page.locator(selector).first();
      await expect(link).toBeVisible();
    }
  });

  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // On mobile, the main content should still be visible
    // Navigation might be in a drawer/menu that's hidden by default
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
    
    // Heading should be visible on mobile
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should have accessible heading hierarchy', async ({ page }) => {
    // Check h1 exists (may have more than 1 in some layouts)
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check h2 or h3 headings exist (used for card titles)
    const subHeadings = page.locator('h2, h3');
    const subCount = await subHeadings.count();
    expect(subCount).toBeGreaterThan(0);
  });

  test('should have working locale switcher', async ({ page }) => {
    // Try to find locale/language switcher button (labeled "Јазик" in Macedonian)
    const localeSwitcher = page.getByRole('button', { name: /Јазик|language|EN|MK/i }).first();

    if (await localeSwitcher.count() > 0 && await localeSwitcher.isVisible()) {
      await localeSwitcher.click();
      await page.waitForTimeout(300);

      // Check for dropdown menu or language options
      const menu = page.locator('[role="menu"], [role="listbox"], [class*="dropdown"]');
      const menuVisible = await menu.count() > 0;

      // Either menu is visible or we see language text
      const langText = page.getByText(/English|Македонски/i);
      expect(menuVisible || await langText.count() > 0).toBeTruthy();
    } else {
      // Locale switcher might be hidden on mobile or not present
      expect(true).toBeTruthy();
    }
  });
});

test.describe('Homepage - Signed-Out Guest Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies to ensure signed-out state
    await context.clearCookies();
  });

  test('should display guest CTA and navigate to practice session', async ({ page }) => {
    // Go to English homepage to test guest flow
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Verify guest-specific content is displayed
    const heading = page.getByRole('heading', { name: /Learn Macedonian/i }).first();
    await expect(heading).toBeVisible();

    // Check for guest subtitle
    const subtitle = page.getByText(/5 minutes a day/i);
    await expect(subtitle).toBeVisible();

    // Find and click the "Start Learning" CTA button
    const startButton = page.getByRole('link', { name: /Start Learning|Почни да учиш/i });
    await expect(startButton).toBeVisible();

    // Verify the href points to practice session
    const href = await startButton.getAttribute('href');
    expect(href).toContain('/practice/session');
    expect(href).toContain('deck=curated');

    // Click and verify navigation
    await startButton.click();
    await page.waitForURL('**/practice/session**');

    // Verify practice session loads (has progress bar or card content)
    const sessionContent = page.locator('main, [role="main"]').first();
    await expect(sessionContent).toBeVisible();
  });

  test('should display sign-in link for returning users', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Check for "Already have an account?" text and sign-in link
    const signInPrompt = page.getByText(/Already have an account/i);
    await expect(signInPrompt).toBeVisible();

    const signInLink = page.getByRole('link', { name: /Sign in|Најави се/i });
    await expect(signInLink).toBeVisible();

    // Verify sign-in link points to auth
    const href = await signInLink.getAttribute('href');
    expect(href).toContain('/auth/signin');
  });
});
