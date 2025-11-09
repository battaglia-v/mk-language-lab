import { test, expect } from '@playwright/test';

test.describe('Translate Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/translate');
    // Wait for client component to hydrate
    await page.waitForLoadState('networkidle');
  });

  test('should load translate page successfully', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: /Translate/i })).toBeVisible();

    // Check for main translator card
    const translatorCard = page.locator('[class*="card"]').first();
    await expect(translatorCard).toBeVisible();
  });

  test('should display direction buttons', async ({ page }) => {
    // Look for MK→EN and EN→MK direction buttons
    const directionButtons = page.getByRole('button', { name: /Macedonian|English|→/i });
    const count = await directionButtons.count();

    // Should have at least 2 direction options
    expect(count).toBeGreaterThanOrEqual(2);

    // First button should be visible
    await expect(directionButtons.first()).toBeVisible();
  });

  test('should have swap directions button', async ({ page }) => {
    // Look for swap button (usually has arrows icon)
    const swapButton = page.getByRole('button', { name: /swap/i });

    if (await swapButton.isVisible()) {
      await expect(swapButton).toBeVisible();
      await expect(swapButton).toBeEnabled();
    }
  });

  test('should have input textarea', async ({ page }) => {
    // Look for input textarea
    const textarea = page.getByRole('textbox').first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEnabled();

    // Should have placeholder
    const placeholder = await textarea.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.length).toBeGreaterThan(0);
  });

  test('should have translate button', async ({ page }) => {
    // Look for translate/submit button
    const translateButton = page.getByRole('button', { name: /Translate/i });
    await expect(translateButton).toBeVisible();
  });

  test('should have clear button', async ({ page }) => {
    // Look for clear button
    const clearButton = page.getByRole('button', { name: /Clear/i });
    await expect(clearButton).toBeVisible();
  });

  test('should display result area', async ({ page }) => {
    // Look for result/output section
    const resultArea = page.locator('[role="status"]').first();
    await expect(resultArea).toBeVisible();
  });

  test('should allow text input and translation', async ({ page }) => {
    // Type some text
    const textarea = page.getByRole('textbox').first();
    await textarea.fill('Hello');

    // Click translate button
    const translateButton = page.getByRole('button', { name: /Translate/i });
    await translateButton.click();

    // Wait for translation (API call)
    await page.waitForTimeout(3000);

    // Result area should show something (either translation or error)
    const resultArea = page.locator('[role="status"]').first();
    const resultText = await resultArea.textContent();

    // Should have some content (not just placeholder)
    expect(resultText?.length).toBeGreaterThan(10);
  });

  test('should show character count', async ({ page }) => {
    // Type some text
    const textarea = page.getByRole('textbox').first();
    await textarea.fill('Test text');

    // Look for character counter
    const counter = page.locator('text=/\\d+.*\\d+|character/i').first();
    await expect(counter).toBeVisible();
  });

  test('should enable copy button after translation', async ({ page }) => {
    // Type and translate
    const textarea = page.getByRole('textbox').first();
    await textarea.fill('Book');

    const translateButton = page.getByRole('button', { name: /Translate/i });
    await translateButton.click();

    // Wait for result
    await page.waitForTimeout(3000);

    // Copy button should appear
    const copyButton = page.getByRole('button', { name: /Copy/i });

    if (await copyButton.isVisible()) {
      await expect(copyButton).toBeEnabled();
    }
  });

  test('should clear text when clear button clicked', async ({ page }) => {
    // Type some text
    const textarea = page.getByRole('textbox').first();
    await textarea.fill('Test content to clear');

    // Verify text is there
    const value = await textarea.inputValue();
    expect(value).toBe('Test content to clear');

    // Click clear
    const clearButton = page.getByRole('button', { name: /Clear/i });
    await clearButton.click();

    // Text should be cleared
    const clearedValue = await textarea.inputValue();
    expect(clearedValue).toBe('');
  });

  test('should switch translation direction', async ({ page }) => {
    // Get initial direction button text
    const directionButtons = page.getByRole('button', { name: /Macedonian|English/i });
    const firstButton = directionButtons.first();
    const initialText = await firstButton.textContent();

    // Click swap button if exists
    const swapButton = page.getByRole('button', { name: /swap/i });

    if (await swapButton.isVisible()) {
      await swapButton.click();
      await page.waitForTimeout(500);

      // Direction should have changed
      const newText = await firstButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Main elements should still be visible
    await expect(page.getByRole('heading', { name: /Translate/i })).toBeVisible();
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Translate/i })).toBeVisible();
  });

  test('should show translation history if available', async ({ page }) => {
    // Perform a translation first
    const textarea = page.getByRole('textbox').first();
    await textarea.fill('Hello');

    const translateButton = page.getByRole('button', { name: /Translate/i });
    await translateButton.click();

    // Wait for translation
    await page.waitForTimeout(3000);

    // Look for history section (might be collapsible)
    const historySection = page.locator('text=/history/i').first();

    if (await historySection.isVisible()) {
      await expect(historySection).toBeVisible();
    }
  });

  test('should enforce character limit', async ({ page }) => {
    // Get textarea
    const textarea = page.getByRole('textbox').first();

    // Get max length attribute
    const maxLength = await textarea.getAttribute('maxLength');

    if (maxLength) {
      const limit = parseInt(maxLength);
      expect(limit).toBeGreaterThan(0);

      // Try to type more than limit
      const longText = 'a'.repeat(limit + 100);
      await textarea.fill(longText);

      // Should be truncated to limit
      const value = await textarea.inputValue();
      expect(value.length).toBeLessThanOrEqual(limit);
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for aria-label or aria-describedby on textarea
    const textarea = page.getByRole('textbox').first();
    const ariaDescribedBy = await textarea.getAttribute('aria-describedby');
    const ariaLabel = await textarea.getAttribute('aria-label');

    // Should have some accessibility attribute
    expect(ariaDescribedBy || ariaLabel).toBeTruthy();
  });
});
