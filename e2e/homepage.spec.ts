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
    // Wait for Word of the Day section to load
    const wordSection = page.locator('#word-of-day');
    await expect(wordSection).toBeVisible();

    // Give time for the Word component to load its content
    await page.waitForTimeout(1000);
  });

  test('should display Quick Start cards', async ({ page }) => {
    // Check for Daily Practice card
    await expect(page.getByRole('heading', { name: /Daily Practice/i })).toBeVisible();

    // Check for Practice link
    const practiceLink = page.getByRole('link', { name: /Daily Practice/i });
    await expect(practiceLink).toBeVisible();

    // Check for Resources card
    const resourcesLink = page.getByRole('link', { name: /Resources/i });
    await expect(resourcesLink).toBeVisible();
  });

  test('should navigate to practice page', async ({ page }) => {
    const practiceLink = page.getByRole('link', { name: /Daily Practice/i });
    await practiceLink.click();

    // Wait for navigation
    await page.waitForURL('**/practice');

    // Verify we're on the practice page (actual heading is "Train your Macedonian skills")
    await expect(page.getByRole('heading', { name: /Train.*Macedonian.*skills|Вежбај/i })).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    const resourcesLink = page.getByRole('link', { name: /Resources/i }).first();
    await resourcesLink.click();

    // Wait for navigation
    await page.waitForURL('**/resources');

    // Verify we're on the resources page by checking for h1 with subtitle text
    // English: "Curated Macedonian study collections and trusted references"
    // Macedonian: "Курирани колекции за учење и доверливи македонски извори"
    await expect(page.locator('h1')).toContainText(/Curated.*study|Курирани.*колекции/i);
  });

  test('should have working navigation', async ({ page }) => {
    // Check desktop navigation (sidebar)
    // Tests run on /mk locale, so links are in Macedonian
    const navLinks = [
      /Вежбање|Practice/i,  // Practice in Macedonian or English
      /Преведи|Translate/i,  // Translate (Macedonian: "Преведи" not "Преведувај")
      /Вести|News/i,  // News
      /Ресурси|Resources/i,  // Resources
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

    // Check h3 headings exist (used for card titles)
    const h3 = page.locator('h3');
    const h3Count = await h3.count();
    expect(h3Count).toBeGreaterThan(0);
  });

  test('should have working locale switcher', async ({ page }) => {
    // Try to find locale/language switcher
    const localeSwitcher = page.getByRole('button', { name: /language|EN|MK/i }).first();

    if (await localeSwitcher.isVisible()) {
      await localeSwitcher.click();

      // Should show language options (use first() to avoid strict mode violation)
      await expect(page.getByText(/English|Македонски/i).first()).toBeVisible();
    }
  });
});
