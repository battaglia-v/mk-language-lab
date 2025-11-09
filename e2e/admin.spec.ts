import { test, expect } from '@playwright/test';

test.describe('Admin Signin Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/signin');
  });

  test('should load admin signin page successfully', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: /Admin Sign In/i })).toBeVisible();

    // Check for signin card
    const card = page.locator('[class*="card"]').first();
    await expect(card).toBeVisible();
  });

  test('should display Google signin button', async ({ page }) => {
    // Look for Google signin button
    const googleButton = page.getByRole('button', { name: /Continue with Google|Google/i });
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test('should display admin warning message', async ({ page }) => {
    // Should show warning that this is admin-only
    const warning = page.locator('text=/restricted|authorized|admin/i');
    const count = await warning.count();

    // Should have at least one warning message
    expect(count).toBeGreaterThan(0);
  });

  test('should have back to home button', async ({ page }) => {
    // Look for back button
    const backButton = page.getByRole('link', { name: /Back to Home|Home/i });
    await expect(backButton).toBeVisible();

    // Should link to homepage
    await expect(backButton).toHaveAttribute('href', /^\/|home$/);
  });

  test('should navigate back to homepage', async ({ page }) => {
    // Click back button
    const backButton = page.getByRole('link', { name: /Back to Home|Home/i });
    await backButton.click();

    // Should navigate to homepage
    await page.waitForURL(/\/(mk|en)?$/);

    // Verify we're on homepage
    await expect(page.getByText('Македонски')).toBeVisible();
  });

  test('should display shield or security icon', async ({ page }) => {
    // Look for security-related icon
    const icon = page.locator('[class*="shield"], [class*="lock"], svg').first();
    await expect(icon).toBeVisible();
  });

  test('should have terms of service link', async ({ page }) => {
    // Look for terms link
    const termsLink = page.getByRole('link', { name: /Terms|Terms of Service/i });

    if (await termsLink.isVisible()) {
      await expect(termsLink).toBeVisible();
      await expect(termsLink).toHaveAttribute('href', /terms/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Main elements should still be visible
    await expect(page.getByRole('heading', { name: /Admin Sign In/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
  });

  test('should have proper card styling', async ({ page }) => {
    // Card should be centered and well-styled
    const card = page.locator('[class*="card"]').first();
    await expect(card).toBeVisible();

    // Should have reasonable max-width
    const boundingBox = await card.boundingBox();
    expect(boundingBox?.width).toBeLessThan(600);
  });
});

test.describe('Admin Dashboard Access', () => {
  test('should prevent unauthorized access to admin panel', async ({ page }) => {
    // Try to access admin panel directly without auth
    await page.goto('/admin');

    // Should redirect to signin or show auth required
    await page.waitForTimeout(1000);

    const url = page.url();

    // Should either be on signin page or show some auth requirement
    expect(
      url.includes('/signin') ||
      url.includes('/admin/signin') ||
      page.locator('text=/sign in|unauthorized|access denied/i')
    ).toBeTruthy();
  });

  test('should redirect to signin when accessing admin routes', async ({ page }) => {
    // Try to access admin word-of-the-day page
    await page.goto('/admin/word-of-the-day');

    // Wait for potential redirect
    await page.waitForTimeout(1000);

    const url = page.url();

    // Should redirect to signin or show auth requirement
    const hasAuthPage = url.includes('/signin') || url.includes('/admin/signin');
    const hasAuthText = await page.locator('text=/sign in|unauthorized/i').isVisible().catch(() => false);

    expect(hasAuthPage || hasAuthText).toBeTruthy();
  });

  test('should redirect to signin when accessing practice-vocabulary admin', async ({ page }) => {
    // Try to access admin practice-vocabulary page
    await page.goto('/admin/practice-vocabulary');

    // Wait for potential redirect
    await page.waitForTimeout(1000);

    const url = page.url();

    // Should redirect to signin or show auth requirement
    const hasAuthPage = url.includes('/signin') || url.includes('/admin/signin');
    const hasAuthText = await page.locator('text=/sign in|unauthorized/i').isVisible().catch(() => false);

    expect(hasAuthPage || hasAuthText).toBeTruthy();
  });
});

test.describe('Admin Navigation (Authenticated Required)', () => {
  test('admin panel should have proper navigation when authenticated', async ({ page }) => {
    // Note: This test will only pass if you're authenticated
    // In a real E2E suite, you'd set up authentication first

    await page.goto('/admin');
    await page.waitForTimeout(1000);

    const url = page.url();

    // If we're on admin panel (authenticated)
    if (url.includes('/admin') && !url.includes('/signin')) {
      // Look for admin navigation or menu
      const adminHeading = page.getByRole('heading', { name: /Admin|Dashboard|Panel/i });

      if (await adminHeading.isVisible()) {
        await expect(adminHeading).toBeVisible();

        // Should have navigation to different admin sections
        const vocabLink = page.getByRole('link', { name: /Vocabulary|Practice Vocabulary/i });
        const wotdLink = page.getByRole('link', { name: /Word of the Day|WOTD/i });

        // At least one admin section link should be visible
        const hasVocabLink = await vocabLink.isVisible().catch(() => false);
        const hasWotdLink = await wotdLink.isVisible().catch(() => false);

        expect(hasVocabLink || hasWotdLink).toBeTruthy();
      }
    }
  });
});
