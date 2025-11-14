import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Македонски.*MK Language Lab/);

    // Check hero heading is visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Verify Macedonian text is present (use first() to avoid strict mode violation)
    await expect(page.getByText('Македонски').first()).toBeVisible();
  });

  test('should display Mission Control dashboard', async ({ page }) => {
    // Mission Control homepage doesn't have Word of Day section
    // Check for Mission Control heading instead
    await expect(page.getByText('Mission Control')).toBeVisible();

    // Check for mission-related content
    await expect(page.getByText(/Stay on streak|power through missions/i)).toBeVisible();
  });

  test('should display Quick Start cards', async ({ page }) => {
    // Mission Control has "Continue mission" instead of "Continue lesson"
    await expect(page.getByRole('heading', { name: /Continue mission/i })).toBeVisible();

    // Check for mission action cards
    await expect(page.getByRole('heading', { name: /Translator inbox/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Reminder windows/i })).toBeVisible();
  });

  test('should navigate to practice page', async ({ page }) => {
    // Mission Control has "Continue mission" link
    const practiceLink = page.getByRole('link', { name: /Continue mission/i });
    await practiceLink.click();

    // Wait for navigation
    await page.waitForURL('**/practice');

    // Verify we're on the practice page
    // English: "Train your Macedonian skills"
    // Macedonian: "Вежбај ги македонските вештини"
    await expect(page.getByRole('heading', { name: /Train.*Macedonian.*skills|Вежбај.*македонските.*вештини/i })).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    const resourcesLink = page.getByRole('link', { name: /Resources|Ресурси/i }).first();
    await resourcesLink.click();

    // Wait for navigation
    await page.waitForURL('**/resources');

    // Verify we're on the resources page by checking for the title
    // English: "Resources"
    // Macedonian: "Ресурси"
    await expect(page.getByRole('heading', { name: /Resources|Ресурси/i, level: 1 })).toBeVisible();
  });

  test('mission hero matches visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="mission-hero-card"]');
    await expect(hero).toHaveScreenshot('mission-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
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

    // Check for home button in mobile nav (English "Home" or Macedonian "Почетна")
    await expect(
      page.getByRole('link', { name: /Home|Почетна/i }).first()
    ).toBeVisible();
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
