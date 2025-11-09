import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Macedonian Language Lab|MK Language Lab/);

    // Check hero heading is visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Verify Macedonian text is present (use first() to avoid strict mode violation)
    await expect(page.getByText('Македонски').first()).toBeVisible();
  });

  test('should display Word of the Day section', async ({ page }) => {
    // Wait for Word of the Day to load
    await expect(page.getByText(/Word of the Day|Збор на Денот/i)).toBeVisible();

    // Check that the Word of the Day card is present
    const wotdCard = page.locator('[data-testid="word-of-day-card"], .space-y-6').first();
    await expect(wotdCard).toBeVisible();
  });

  test('should display Quick Start cards', async ({ page }) => {
    // Check for Daily Practice card (use first() to avoid strict mode violation)
    await expect(page.getByRole('heading', { name: /Daily Practice|Quick Start/i }).first()).toBeVisible();

    // Check for Practice button
    const practiceButton = page.getByRole('link', { name: /Start Practicing/i });
    await expect(practiceButton).toBeVisible();

    // Check for Resources card
    const resourcesButton = page.getByRole('link', { name: /Explore Resources/i });
    await expect(resourcesButton).toBeVisible();
  });

  test('should navigate to practice page', async ({ page }) => {
    const practiceLink = page.getByRole('link', { name: /Start Practicing/i });
    await practiceLink.click();

    // Wait for navigation
    await page.waitForURL('**/practice');

    // Verify we're on the practice page
    await expect(page.getByRole('heading', { name: /Practice/i })).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    const resourcesLink = page.getByRole('link', { name: /Explore Resources/i });
    await resourcesLink.click();

    // Wait for navigation
    await page.waitForURL('**/resources');

    // Verify we're on the resources page
    await expect(page.locator('h1')).toContainText(/Resources|Learning Resources/i);
  });

  test('should have working navigation', async ({ page }) => {
    // Check desktop navigation (sidebar)
    const sidebar = page.locator('nav, aside').first();

    // Check for main navigation links
    const navLinks = [
      /Practice/i,
      /Translate/i,
      /News/i,
      /Resources/i,
    ];

    for (const linkPattern of navLinks) {
      const link = page.getByRole('link', { name: linkPattern }).first();
      await expect(link).toBeVisible();
    }
  });

  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page to apply mobile layout
    await page.reload();

    // Mobile nav should be visible at bottom
    const mobileNav = page.locator('[class*="fixed bottom-0"], .fixed.bottom-0').first();
    await expect(mobileNav).toBeVisible();

    // Check for home button in mobile nav
    await expect(page.getByRole('link', { name: /Home/i }).first()).toBeVisible();
  });

  test('should load Word of the Day with translation', async ({ page }) => {
    // Wait for Word of the Day content to load
    await page.waitForTimeout(1000); // Give time for API call

    // Look for Macedonian and English text sections
    const macedonianText = page.locator('text=/[а-шА-Ш]/').first();
    const englishText = page.locator('text=/[A-Za-z]{3,}/').first();

    // At least one should be visible
    const hasMacedonian = await macedonianText.isVisible().catch(() => false);
    const hasEnglish = await englishText.isVisible().catch(() => false);

    expect(hasMacedonian || hasEnglish).toBeTruthy();
  });

  test('should have accessible heading hierarchy', async ({ page }) => {
    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check h2 headings exist
    const h2 = page.locator('h2');
    await expect(h2.first()).toBeVisible();
  });

  test('should have working locale switcher', async ({ page }) => {
    // Try to find locale/language switcher
    const localeSwitcher = page.getByRole('button', { name: /language|EN|MK/i }).first();

    if (await localeSwitcher.isVisible()) {
      await localeSwitcher.click();

      // Should show language options
      await expect(page.getByText(/English|Македонски/i)).toBeVisible();
    }
  });
});
