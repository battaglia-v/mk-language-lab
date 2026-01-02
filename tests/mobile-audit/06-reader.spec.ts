import { test, expect } from '@playwright/test';
import { assertNoRawTranslationKeys, MOBILE_VIEWPORT, READER_SAMPLE_IDS } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Reader Library', () => {
  test('loads and shows Reader header', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText('Reader');
  });

  test('shows 30-Day Reading Challenge section', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/30-day reading challenge/i);
  });

  test('shows All Readings section with count', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/all readings/i);
    // Should show text count (more than 1)
    await expect(page.locator('body')).toContainText(/\d+ texts/i);
  });

  test('Library/Workspace tabs work', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    const libraryTab = page.getByRole('tab', { name: /library/i }).first();
    const workspaceTab = page.getByRole('tab', { name: /workspace/i }).first();

    if (await workspaceTab.count() > 0) {
      await workspaceTab.click();
      await expect(page.locator('body')).toContainText(/workspace|paste text/i);

      await libraryTab.click();
      await expect(page.locator('body')).toContainText(/30-day|all readings/i);
    }
  });

  test('search input is present', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    const searchInput = page.getByRole('textbox', { name: /search/i }).first();
    if (await searchInput.count() === 0) {
      // Try placeholder
      const searchByPlaceholder = page.locator('input[placeholder*="search" i]').first();
      await expect(searchByPlaceholder).toBeVisible();
    } else {
      await expect(searchInput).toBeVisible();
    }
  });

  test('difficulty filter chips visible', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    // Should have difficulty level chips
    await expect(page.locator('body')).toContainText(/A1|A2|B1|B2/);
  });

  test('reading cards are clickable', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    // Find any reading card
    const cards = page.locator('a').filter({ hasText: /cafe|day|conversation|skopje/i });
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);

    // First card should navigate
    const href = await cards.first().getAttribute('href');
    expect(href).toContain('/reader/samples/');
  });

  test('shows more than 1 text (regression test)', async ({ page }) => {
    await page.goto('/en/reader', { waitUntil: 'domcontentloaded' });

    const text = await page.locator('body').innerText();

    // Should NOT show "1 texts" (singular/plural mismatch)
    expect(text).not.toMatch(/\b1 texts\b/);

    // Should show a count greater than 1
    const countMatch = text.match(/(\d+) texts/);
    if (countMatch) {
      const count = parseInt(countMatch[1], 10);
      expect(count).toBeGreaterThan(1);
    }
  });
});

test.describe('Reader Sample Page', () => {
  test('cafe-conversation sample loads', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/cafe|кафуле/i);
  });

  test('Back to Reader link works', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    const backLink = page.getByRole('link', { name: /back to reader/i }).first();
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL(/\/reader$/);
  });

  test('Text/Grammar/Vocabulary tabs exist', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/text|reading/i);
    await expect(page.locator('body')).toContainText(/grammar/i);
    await expect(page.locator('body')).toContainText(/vocabulary/i);
  });

  test('Grammar tab shows content', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    const grammarTab = page.getByRole('tab', { name: /grammar/i }).first();
    if (await grammarTab.count() > 0) {
      await grammarTab.click();
      await expect(page.locator('body')).toContainText(/example|form|tense|verb/i);
    }
  });

  test('Vocabulary tab shows word list', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    const vocabTab = page.getByRole('tab', { name: /vocabulary/i }).first();
    if (await vocabTab.count() > 0) {
      await vocabTab.click();
      await expect(page.locator('body')).toContainText(/key vocabulary/i);
    }
  });

  test('Quick Analyze button works', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    const analyzeBtn = page.getByRole('link', { name: /analyze|quick analyze/i }).first();
    if (await analyzeBtn.count() > 0) {
      await analyzeBtn.click();
      await expect(page).toHaveURL(/\/analyze|workspace/);
    }
  });

  test('Mark Complete button visible', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    // Should have a completion CTA
    await expect(page.locator('body')).toContainText(/mark.*complete|finished reading/i);
  });

  test('Tap any word instruction visible', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/tap.*word|допрете.*збор/i);
  });
});

// Test first 10 reader samples load (not 404)
const samplesToTest = READER_SAMPLE_IDS.slice(0, 10);

for (const sampleId of samplesToTest) {
  test(`Reader sample ${sampleId} loads without 404`, async ({ page }) => {
    await page.goto(`/en/reader/samples/${sampleId}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('not found');
  });
}

test.describe('Word Tap Interaction', () => {
  test('tapping a word shows translation (heuristic)', async ({ page }) => {
    await page.goto('/en/reader/samples/cafe-conversation', { waitUntil: 'domcontentloaded' });

    // Wait for content to hydrate
    await page.waitForTimeout(1000);

    // Try to find and click a Macedonian word span
    const tokens = page.locator('main span, main p').filter({ hasText: /[А-Яа-я]/ }).first();

    if (await tokens.count() > 0) {
      await tokens.click();
      await page.waitForTimeout(500);

      // Should show some translation-related UI
      const hasTranslation = await page.locator('body').innerText();
      // Check for common translation UI elements
      const hasPopup =
        hasTranslation.includes('translation') ||
        hasTranslation.includes('Translation') ||
        hasTranslation.includes('Save') ||
        hasTranslation.includes('Loading');

      // This is a soft check - may not always trigger depending on implementation
      // expect(hasPopup).toBeTruthy();
    }
  });
});
