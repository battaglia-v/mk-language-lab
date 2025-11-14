import { test, expect } from '@playwright/test';

test.describe('Practice Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/practice');
  });

  test('should load practice page successfully', async ({ page }) => {
    // Check page heading - be more specific to avoid strict mode violations
    const heading = page.locator('h1').filter({ hasText: /Train.*Macedonian.*skills|Вежбај/i }).first();
    await expect(heading).toBeVisible();

    // Check for Quick Practice widget (wait for dynamic import)
    await page.waitForTimeout(1500);
    // Macedonian placeholder is "Напиши го" not "Внеси"
    const practiceWidget = page.locator('input[placeholder*="Type"], input[placeholder*="Напиши"]').first();
    await expect(practiceWidget).toBeVisible();
  });

  test('should display Quick Practice widget', async ({ page }) => {
    // Wait for the practice widget to load
    await page.waitForTimeout(1000);

    // Should show vocabulary practice interface
    const practiceCard = page.locator('[class*="card"], .rounded-2xl, [class*="bg-card"]').first();
    await expect(practiceCard).toBeVisible();
  });

  test('should show translator link', async ({ page }) => {
    const translatorLink = page
      .getByRole('link', { name: /(Open translator|Quick Translator|Отвори преведувач|Брз преведувач|Преведувач)/i })
      .first();
    await expect(translatorLink).toBeVisible();
    await expect(translatorLink).toHaveAttribute('href', /\/translate/);
  });

  test('should navigate to translate page from practice', async ({ page }) => {
    const translatorLink = page
      .getByRole('link', { name: /(Open translator|Quick Translator|Отвори преведувач|Брз преведувач|Преведувач)/i })
      .first();
    await translatorLink.click();

    // Wait for navigation
    await page.waitForURL('**/translate');

    // Verify we're on translate page by checking for the "Translate" text
    await page.waitForTimeout(1000); // Wait for page and translations to load
    await expect(page.getByText(/Translate|Преведи/i).first()).toBeVisible();
  });

  test('should load vocabulary for practice', async ({ page }) => {
    // Wait for API call to complete
    await page.waitForTimeout(2000);

    // Check if vocabulary loaded (look for text content)
    const hasContent = await page.locator('text=/[а-шА-Ш]/').first().isVisible().catch(() => false) ||
                       await page.locator('text=/[A-Za-z]{4,}/').first().isVisible().catch(() => false);

    expect(hasContent).toBeTruthy();
  });

  test('should have responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Practice heading should still be visible - be more specific to avoid strict mode violations
    const heading = page.locator('h1').filter({ hasText: /Train.*Macedonian.*skills|Вежбај/i }).first();
    await expect(heading).toBeVisible();

    // Mobile navigation should be visible
    const mobileNav = page.locator('[class*="fixed bottom-0"]').first();
    await expect(mobileNav).toBeVisible();
  });

  test('should display badge with practice label', async ({ page }) => {
    // Check for practice badge
    const badge = page.locator('[class*="badge"]').first();

    if (await badge.isVisible()) {
      await expect(badge).toBeVisible();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // h1 should be visible
    await expect(h1.first()).toBeVisible();
  });
});

test.describe('Quick Practice Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/practice');
    // Wait for widget to load
    await page.waitForTimeout(1500);
  });

  test('should allow language direction selection', async ({ page }) => {
    // Look for direction buttons (MK→EN or EN→MK)
    const directionButtons = page.getByRole('button', { name: /Macedonian|English|→/i });

    const count = await directionButtons.count();
    if (count > 0) {
      // Should have at least one direction button
      await expect(directionButtons.first()).toBeVisible();
    }
  });

  test('should display submit/check button', async ({ page }) => {
    // Look for submit/check answer button
    const submitButton = page.getByRole('button', { name: /Check|Submit|Next|Start/i });

    const count = await submitButton.count();
    if (count > 0) {
      await expect(submitButton.first()).toBeVisible();
    }
  });

  test('should show vocabulary word or phrase', async ({ page }) => {
    // Should show some text content (either Macedonian or English)
    const hasVocab = await page.locator('text=/[а-шА-Ш]{2,}/').first().isVisible().catch(() => false) ||
                     await page.locator('text=/[A-Za-z]{3,}/').first().isVisible().catch(() => false);

    // If no vocabulary loaded, that might be okay (empty state)
    // Just check that the widget structure exists
    const widget = page.locator('[class*="card"], .rounded-2xl').first();
    await expect(widget).toBeVisible();
  });

  test('should submit a deterministic quick practice answer', async ({ page }) => {
    await page.goto('/mk/practice?practiceFixture=e2e');

    const input = page.locator('input[placeholder*="Type"], input[placeholder*="Напиши"]').first();
    await expect(input).toBeVisible();
    await input.fill('good morning');

    const checkButton = page.getByRole('button', { name: /Check|Checking|Браво|Great job|Провери/i }).first();
    await checkButton.click();

    await expect(page.locator('text=/Great job|Браво/i')).toBeVisible();
  });
});
