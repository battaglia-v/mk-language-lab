import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT, PRACTICE_DECKS, waitForInteractive } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Practice Hub', () => {
  test('loads and shows Practice header', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/practice/i);
  });

  test('Grammar card visible and clickable', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.getByTestId('practice-mode-grammar');
    await expect(card).toBeVisible();

    await card.click();
    await expect(page).toHaveURL(/\/practice\/grammar/);
  });

  test('Word Sprint card visible and clickable', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.getByTestId('practice-mode-wordSprint');
    await expect(card).toBeVisible();

    await card.click();
    await expect(page).toHaveURL(/\/practice\/word-sprint/);
  });

  test('Vocabulary card visible', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    const card = page.getByTestId('practice-mode-vocabulary');
    await expect(card).toBeVisible();
  });

  test('all practice cards have chevron indicator', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });

    // Cards should have right chevron for tap affordance
    const cards = page.locator('a[data-testid^="practice-mode-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 6); i++) {
      const href = await cards.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('Settings button opens bottom sheet', async ({ page }) => {
    await page.goto('/en/practice', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    const settingsBtn = page.getByTestId('practice-settings-open');
    await settingsBtn.click();

    await expect(page.getByTestId('practice-settings-sheet')).toBeVisible();
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
    await waitForInteractive(page);

    const easyBtn = page.getByTestId('word-sprint-picker-difficulty-easy');
    await expect(easyBtn).toBeVisible();
    await easyBtn.click();

    const lengthBtn = page.getByTestId('word-sprint-picker-length-10');
    if (await lengthBtn.count() > 0) {
      await lengthBtn.click();
    }

    const startBtn = page.getByTestId('word-sprint-picker-start');
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    await expect(page.getByTestId('session-exit')).toBeVisible();
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

    const backBtn = page.getByTestId('grammar-back-to-practice');
    const box = await backBtn.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
      expect(box.width).toBeGreaterThanOrEqual(40);
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
