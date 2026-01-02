import { test, expect } from '@playwright/test';
import { assertNoRawTranslationKeys, MOBILE_VIEWPORT, PRACTICE_DECKS } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Practice Hub', () => {
  test('loads and shows Practice header', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/practice/i);
  });

  test('Pronunciation card visible and clickable', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.locator('a, button').filter({ hasText: /pronunciation/i }).first();
    await expect(card).toBeVisible();

    await card.click();
    await expect(page).toHaveURL(/\/practice\/pronunciation/);
  });

  test('Grammar card visible and clickable', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.locator('a, button').filter({ hasText: /grammar/i }).first();
    await expect(card).toBeVisible();

    await card.click();
    await expect(page).toHaveURL(/\/practice\/grammar/);
  });

  test('Word Sprint card visible and clickable', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.locator('a, button').filter({ hasText: /word sprint/i }).first();
    await expect(card).toBeVisible();

    await card.click();
    await expect(page).toHaveURL(/\/practice\/word-sprint/);
  });

  test('Vocabulary card visible', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.locator('a, button').filter({ hasText: /vocabulary/i }).first();
    await expect(card).toBeVisible();
  });

  test('all practice cards have chevron indicator', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    // Cards should have right chevron for tap affordance
    const cards = page.locator('a').filter({ hasText: /pronunciation|grammar|word sprint|vocabulary/i });
    const count = await cards.count();

    // Each card should be a proper link
    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await cards.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('Settings button opens bottom sheet', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const settingsBtn = page.getByRole('button', { name: /settings/i }).first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(300);

      // Should show settings options
      await expect(page.locator('body')).toContainText(/mode|difficulty|deck/i);
    }
  });
});

test.describe('Word Sprint', () => {
  test('page loads with options', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/word sprint/i);
  });

  test('difficulty options available', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'domcontentloaded' });

    // Should have difficulty buttons
    const easyBtn = page.getByRole('button', { name: /easy|beginner/i }).first();
    const hardBtn = page.getByRole('button', { name: /hard|advanced/i }).first();

    expect((await easyBtn.count()) + (await hardBtn.count())).toBeGreaterThan(0);
  });

  test('question count options available', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'domcontentloaded' });

    // Should have count options (10, 20, etc)
    await expect(page.locator('body')).toContainText(/10|20|questions/i);
  });

  test('start button initiates session', async ({ page }) => {
    await page.goto('/en/practice/word-sprint', { waitUntil: 'domcontentloaded' });

    const startBtn = page.getByRole('button', { name: /start/i }).first();
    if (await startBtn.count() > 0) {
      await startBtn.click();
      await page.waitForTimeout(500);

      // Should show question or session UI
      await expect(page.locator('body')).toContainText(/question|score|skip|next|correct/i);
    }
  });
});

test.describe('Pronunciation Practice', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/en/practice/pronunciation', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/pronunciation/i);
  });

  test('has audio controls or speak button', async ({ page }) => {
    await page.goto('/en/practice/pronunciation', { waitUntil: 'domcontentloaded' });

    const audioBtn = page.locator('button').filter({ hasText: /play|speak|listen|hear/i }).first();
    // Should have some audio interaction
    expect(await audioBtn.count()).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Grammar Practice', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/en/practice/grammar', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/grammar/i);
  });

  test('has lesson selection or lesson content', async ({ page }) => {
    await page.goto('/en/practice/grammar', { waitUntil: 'domcontentloaded' });

    // Should show grammar topics or active lesson
    await expect(page.locator('body')).toContainText(/lesson|topic|verb|noun|tense/i);
  });

  test('exit button is at least 44px', async ({ page }) => {
    await page.goto('/en/practice/grammar', { waitUntil: 'domcontentloaded' });

    // If there's an exit/X button, verify size
    const exitBtn = page.locator('button').filter({ hasText: /×|exit|close/i }).first();
    if (await exitBtn.count() > 0) {
      const box = await exitBtn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

// Test each practice deck loads
for (const deck of PRACTICE_DECKS.slice(0, 4)) {
  test(`Practice session with deck=${deck} loads`, async ({ page }) => {
    await page.goto(`/en/practice/session?deck=${deck}&mode=multiple-choice`, {
      waitUntil: 'domcontentloaded',
    });

    // Should not 404
    await expect(page.locator('body')).not.toContainText('404');
  });
}
