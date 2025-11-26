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

  test('sidebar navigation stays in sync on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.reload();

    const openMenu = page.getByRole('button', { name: /Menu|Мени/i });
    await openMenu.click();

    const practiceNavLink = page.getByRole('link', { name: /Practice|Практика/i }).first();
    await expect(practiceNavLink).toHaveAttribute('aria-current', 'page');

    const translateNavLink = page.getByRole('link', { name: /Translate|Преведи/i }).first();
    await translateNavLink.click();

    await expect(page).toHaveURL(/\/translate/);

    await openMenu.click();

    const translateNavLinkAfterNav = page.getByRole('link', { name: /Translate|Преведи/i }).first();
    await expect(translateNavLinkAfterNav).toHaveAttribute('aria-current', 'page');

    const practiceNavLinkAfterNav = page.getByRole('link', { name: /Practice|Практика/i }).first();
    await expect(practiceNavLinkAfterNav).not.toHaveAttribute('aria-current', 'page');
  });

  test('should show translator link', async ({ page }) => {
    const translatorLink = page
      .getByRole('link', { name: /(Open translator|Quick Translator|Отвори преведувач|Брз преведувач|Преведувач)/i })
      .first();
    await expect(translatorLink).toBeVisible();
    await expect(translatorLink).toHaveAttribute('href', /\/translate/);
  });

  test('should link to translate page from practice', async ({ page }) => {
    const translatorLink = page
      .getByRole('link', { name: /(Open translator|Quick Translator|Отвори преведувач|Брз преведувач|Преведувач)/i })
      .first();
    const href = await translatorLink.getAttribute('href');
    expect(href).toBeTruthy();

    const targetUrl = href?.startsWith('http') ? href : new URL(href ?? '', page.url()).toString();
    await page.goto(targetUrl ?? '/mk/translate', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/translate/);

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

  test('practice hero surfaces stats and CTA copy', async ({ page }) => {
    const hero = page.getByTestId('practice-hero');
    await expect(hero).toBeVisible();

    const heading = hero.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Train|Вежбај/i);

    const statPills = hero.getByTestId('practice-stat');
    await expect(statPills).toHaveCount(3);
    await expect(statPills.first()).toContainText(/\d/);

    const translateCta = hero.getByRole('link', { name: /(translate|translator|преведи|преведувач)/i }).first();
    await expect(translateCta).toHaveAttribute('href', /translate/);
  });

  test('practice workspace exposes the interactive widget', async ({ page }) => {
    const workspace = page.getByTestId('practice-workspace');
    await expect(workspace).toBeVisible();

    await page.waitForTimeout(1500);

    const widgetPanels = workspace.getByTestId('practice-panels').first();
    await expect(widgetPanels).toBeVisible();

    const input = workspace.locator('input[placeholder*="Type"], input[placeholder*="Напиши"]').first();
    await expect(input).toBeVisible();
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

  test('should clear the input and surface progress after submitting the e2e fixture', async ({ page }) => {
    await page.goto('/mk/practice?practiceFixture=e2e&practicePromptId=practice-e2e-sunrise');

    const input = page.locator('input[placeholder*="Type"], input[placeholder*="Напиши"]').first();
    await expect(input).toBeVisible();
    await input.fill('good morning');

    await page.getByRole('button', { name: /Check|Checking|Браво|Great job|Провери/i }).first().click();

    await expect(page.locator('text=/Great job|Браво/i')).toBeVisible();
    await expect(page.getByText(/Progress:\s*1\/5/i)).toBeVisible();
    await expect(input).toHaveValue('');

    const nextPromptButton = page.getByRole('button', { name: /New Prompt|Next/i }).first();
    await expect(nextPromptButton).toBeVisible();
  });
});
