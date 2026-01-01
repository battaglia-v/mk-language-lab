import { test, expect } from '@playwright/test';

/**
 * i18n Regression Tests
 *
 * These tests ensure that translation keys are properly resolved
 * and not displayed as raw strings on key pages.
 */

test.describe('i18n Regression Tests', () => {
  test('home page should not display raw translation keys', async ({ page }) => {
    await page.goto('/en');

    // Get all text content on the page
    const pageContent = await page.textContent('body');

    // Check that common i18n key patterns are not present
    expect(pageContent).not.toContain('home.guestSubtitle');
    expect(pageContent).not.toContain('home.guestCta');
    expect(pageContent).not.toContain('home.title');
    expect(pageContent).not.toContain('nav.learn');
    expect(pageContent).not.toContain('nav.practice');

    // Verify actual content is present
    expect(pageContent).toContain('Macedonian');
  });

  test('reader page should display 30-Day Reading Challenge section', async ({ page }) => {
    await page.goto('/en/reader');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for the 30-Day Challenge section
    const challengeSection = page.getByText('30-Day Reading Challenge');
    await expect(challengeSection).toBeVisible();

    // Verify "The Little Prince" reference
    const littlePrince = page.getByText(/Little Prince|Малиот Принц/i);
    await expect(littlePrince).toBeVisible();
  });

  test('alphabet lesson should not display raw translation keys', async ({ page }) => {
    await page.goto('/en/learn/lessons/alphabet');

    await page.waitForLoadState('networkidle');

    const pageContent = await page.textContent('body');

    // Check that alphabet i18n keys are not displayed raw
    expect(pageContent).not.toContain('alphabet.lettersViewed');
    expect(pageContent).not.toContain('alphabet.tipTitle');
    expect(pageContent).not.toContain('alphabet.practiceTitle');

    // Verify actual content
    expect(pageContent).toContain('Cyrillic');
    expect(pageContent).toContain('letters viewed');
  });

  test('upgrade page should not display raw translation keys', async ({ page }) => {
    await page.goto('/en/upgrade');

    await page.waitForLoadState('networkidle');

    const pageContent = await page.textContent('body');

    // Check that upgrade i18n keys are not displayed raw
    expect(pageContent).not.toContain('upgrade.title');
    expect(pageContent).not.toContain('upgrade.subtitle');
    expect(pageContent).not.toContain('upgrade.monthlyDesc');

    // Verify actual content
    expect(pageContent).toContain('Upgrade to Pro');
    expect(pageContent).toContain('$4.99');
  });

  test('30-day sample page should load without 404', async ({ page }) => {
    const response = await page.goto('/en/reader/samples/day01-maliot-princ');

    // Should not be a 404
    expect(response?.status()).not.toBe(404);

    // Should contain the sample content
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Day 1');
    expect(pageContent).toContain('Drawing');
  });

  test('learning paths page should display path cards', async ({ page }) => {
    await page.goto('/en/learn/paths');

    await page.waitForLoadState('networkidle');

    // Check for learning path cards
    const a1Path = page.getByText(/A1|Foundations|Beginner/i);
    await expect(a1Path).toBeVisible();
  });
});
