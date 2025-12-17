/**
 * Mobile Journey Tests - Real user flow verification
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe('Mobile Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('Translate: History/Saved sheets work without overflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/translate`, { waitUntil: 'networkidle' });

    // Open History sheet
    const historyBtn = page.locator('button:has-text("History")');
    await historyBtn.click();
    await page.waitForTimeout(500);

    // Verify sheet is visible and no horizontal overflow
    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);

    // Close and open Saved sheet
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const savedBtn = page.locator('button:has-text("Saved")');
    await savedBtn.click();
    await page.waitForTimeout(500);
    await expect(sheet).toBeVisible();
  });

  test('Learn: Dashboard renders on mobile without overflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/learn`, { waitUntil: 'networkidle' });

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);

    // Quick actions should be visible
    await expect(page.locator('text=Translate').first()).toBeVisible();
  });

  test('Pronunciation: Recording UI or fallback is shown', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/practice/pronunciation`, { waitUntil: 'networkidle' });

    // Should see either a record button or a fallback message
    const hasRecordUI = await page.locator('button:has-text("Record"), button[aria-label*="Record"], [data-testid="record-button"]').count() > 0;
    const hasFallback = await page.locator('text=/not supported|TTS|synthesized/i').count() > 0;
    const hasListenUI = await page.locator('button:has-text("Listen"), button[aria-label*="Listen"]').count() > 0;

    expect(hasRecordUI || hasFallback || hasListenUI).toBe(true);
  });

  test('News: Images load or show placeholder', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/news`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check for broken images (naturalWidth === 0)
    const brokenCount = await page.evaluate(() => {
      let broken = 0;
      document.querySelectorAll('img').forEach(img => {
        if (!img.src.includes('data:') && !img.src.includes('placeholder') &&
            img.complete && img.naturalWidth === 0) {
          broken++;
        }
      });
      return broken;
    });

    expect(brokenCount).toBeLessThanOrEqual(1);
  });

  test('320px viewport: No horizontal overflow on key pages', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const pages = ['/en', '/en/learn', '/en/translate', '/en/practice'];

    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow, `Overflow on ${path}`).toBe(false);
    }
  });
});
