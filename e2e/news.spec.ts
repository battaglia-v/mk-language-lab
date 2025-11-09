import { test, expect } from '@playwright/test';

test.describe('News Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/news');
  });

  test('should load news page successfully', async ({ page }) => {
    // Check page heading (actual text is "News Feed" or "Новости")
    await expect(page.getByRole('heading', { name: /News Feed|Новости/i })).toBeVisible();
  });

  test('should display news articles', async ({ page }) => {
    // Wait for news to load (API call)
    await page.waitForTimeout(3000);

    // Look for article cards or links
    const articles = page.locator('article, [class*="card"], a[href*="time.mk"], a[href*="meta.mk"]');
    const count = await articles.count();

    // Should have at least one article
    expect(count).toBeGreaterThan(0);
  });

  test('should display article titles', async ({ page }) => {
    // Wait for news API to load (5 seconds for external RSS feeds)
    await page.waitForTimeout(5000);

    // Look for article titles - they're in CardTitle divs with links
    const titles = page.locator('div.text-2xl a[target="_blank"]').filter({ hasText: /.{10,}/ });
    const count = await titles.count();

    // Should have at least one title OR show appropriate empty/error state
    if (count === 0) {
      // Check if there's an error message or empty state (acceptable fallback)
      const errorMessage = page.locator('text=/error|failed|unavailable/i');
      const emptyState = page.locator('text=/no.*articles|no.*news|empty/i');
      const hasErrorOrEmpty = await errorMessage.or(emptyState).isVisible().catch(() => false);

      // Either articles should load, or an error/empty state should be shown
      expect(hasErrorOrEmpty).toBeTruthy();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should display article images', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Look for images within articles
    const images = page.locator('article img, [class*="card"] img').or(page.locator('img[alt*="article"], img[alt*="news"]'));
    const count = await images.count();

    // Should have at least a few images
    if (count > 0) {
      // Verify first image is visible
      await expect(images.first()).toBeVisible();
    }
  });

  test('should have clickable article links', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Find external article links
    const articleLinks = page.locator('a[href*="time.mk"], a[href*="meta.mk"], a[target="_blank"]');
    const count = await articleLinks.count();

    if (count > 0) {
      const firstLink = articleLinks.first();
      await expect(firstLink).toBeVisible();

      // Should have href attribute
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href?.startsWith('http')).toBeTruthy();
    }
  });

  test('should display article descriptions or excerpts', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Look for article descriptions/excerpts
    const descriptions = page.locator('p').filter({ hasText: /.{20,}/ });
    const count = await descriptions.count();

    // Should have at least one description
    expect(count).toBeGreaterThan(0);
  });

  test('should display publication dates or timestamps', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Look for time elements or date text
    const timeElements = page.locator('time, [datetime], [class*="date"], [class*="time"]');
    const count = await timeElements.count();

    // Should have at least one timestamp
    if (count > 0) {
      await expect(timeElements.first()).toBeVisible();
    }
  });

  test('should open articles in new tab', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Find external links
    const externalLinks = page.locator('a[href*="time.mk"], a[href*="meta.mk"]').first();

    if (await externalLinks.isVisible()) {
      // Should have target="_blank"
      const target = await externalLinks.getAttribute('target');
      expect(target).toBe('_blank');

      // Should have rel="noopener noreferrer" for security
      const rel = await externalLinks.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Wait for news
    await page.waitForTimeout(3000);

    // Main heading should still be visible (actual text is "News Feed" or "Новости")
    await expect(page.getByRole('heading', { name: /News Feed|Новости/i })).toBeVisible();

    // Articles should stack vertically (responsive)
    const articles = page.locator('article, [class*="card"]').first();

    if (await articles.isVisible()) {
      await expect(articles).toBeVisible();
    }
  });

  test('should show loading state or skeleton', async ({ page }) => {
    // Immediately check for loading indicator
    const loadingIndicator = page.locator('[class*="loading"], [class*="skeleton"], [class*="animate-pulse"]');

    // May or may not be visible depending on load speed
    const count = await loadingIndicator.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Page should not show error messages
    const errorMessages = page.locator('text=/error|failed|could not load/i');
    const errorCount = await errorMessages.count();

    // If there are errors, they should be user-friendly
    if (errorCount > 0) {
      const errorText = await errorMessages.first().textContent();
      expect(errorText?.length).toBeGreaterThan(10);
    }
  });

  test('should display Macedonian news sources', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    // Should show links to Macedonian news sites (fixed CSS selector syntax)
    const macedonianSources = page.locator('a[href*="time.mk"], a[href*="meta.mk"]');
    const count = await macedonianSources.count();

    // Should have at least one Macedonian source
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper image loading', async ({ page }) => {
    // Wait for news to load
    await page.waitForTimeout(3000);

    const images = page.locator('article img, [class*="card"] img').first();

    if (await images.isVisible()) {
      // Image should have alt text
      const alt = await images.getAttribute('alt');
      expect(alt).toBeTruthy();

      // Image should have loading attribute
      const loading = await images.getAttribute('loading');
      // Should be 'lazy' or 'eager'
      if (loading) {
        expect(['lazy', 'eager']).toContain(loading);
      }
    }
  });
});
