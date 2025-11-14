import { test, expect } from '@playwright/test';

test.describe('Learn Subroutes - Visual Regression', () => {
  test('learn grammar page matches visual snapshot', async ({ page }) => {
    await page.goto('/mk/learn/grammar');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="grammar-hero"]');
    await expect(hero).toHaveScreenshot('learn-grammar-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });

  test('learn vocabulary page matches visual snapshot', async ({ page }) => {
    await page.goto('/mk/learn/vocabulary');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="vocabulary-hero"]');
    await expect(hero).toHaveScreenshot('learn-vocabulary-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });

  test('learn phrases page matches visual snapshot', async ({ page }) => {
    await page.goto('/mk/learn/phrases');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="phrases-hero"]');
    await expect(hero).toHaveScreenshot('learn-phrases-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });

  test('learn pronunciation page matches visual snapshot', async ({ page }) => {
    await page.goto('/mk/learn/pronunciation');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="pronunciation-hero"]');
    await expect(hero).toHaveScreenshot('learn-pronunciation-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });
});

test.describe('Learn Subroutes - Basic Functionality', () => {
  test('grammar page loads successfully', async ({ page }) => {
    await page.goto('/mk/learn/grammar');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: /Grammar|Граматика/i });
    await expect(heading).toBeVisible();
  });

  test('vocabulary page loads successfully', async ({ page }) => {
    await page.goto('/mk/learn/vocabulary');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: /Vocabulary|Речник/i });
    await expect(heading).toBeVisible();
  });

  test('phrases page loads successfully', async ({ page }) => {
    await page.goto('/mk/learn/phrases');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: /Phrases|Фрази/i });
    await expect(heading).toBeVisible();
  });

  test('pronunciation page loads successfully', async ({ page }) => {
    await page.goto('/mk/learn/pronunciation');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').filter({ hasText: /Pronunciation|Изговор/i });
    await expect(heading).toBeVisible();
  });
});
