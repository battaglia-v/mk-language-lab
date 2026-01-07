import { test, expect } from '@playwright/test';

/**
 * Reader Sample E2E Tests
 *
 * Tests the reading sample functionality including:
 * - Sample card visibility on Reader landing page
 * - Navigation to sample detail page
 * - Tab navigation (Text/Grammar/Vocabulary)
 * - Mobile-first layout validation
 *
 * Skipped in CI - reader sample tests are slow and better run locally.
 */
test.describe('Reader Samples', () => {
  test.skip(!!process.env.CI, 'Reader sample tests skipped in CI - run locally');
  test.describe('Mobile (360x800)', () => {
    test.use({ viewport: { width: 360, height: 800 } });

    test('shows sample reading card on Reader page', async ({ page }) => {
      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Check that Sample Readings section exists
      const sampleSection = page.getByRole('heading', { name: /sample readings/i });
      await expect(sampleSection).toBeVisible();

      // Check that at least one sample card exists
      const sampleCard = page.getByRole('link', { name: /open sample/i }).first();
      await expect(sampleCard).toBeVisible();
    });

    test('opens sample and displays content with full-width layout', async ({ page }) => {
      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Click on the sample card
      const openButton = page.getByRole('link', { name: /open sample/i }).first();
      await openButton.click();

      // Wait for navigation
      await page.waitForURL(/\/reader\/samples\//);
      await page.waitForLoadState('networkidle');

      // Verify title is visible
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();

      // Verify tabs are present
      const textTab = page.getByRole('tab', { name: /text/i });
      const grammarTab = page.getByRole('tab', { name: /grammar/i });
      const vocabTab = page.getByRole('tab', { name: /vocabulary/i });

      await expect(textTab).toBeVisible();
      await expect(grammarTab).toBeVisible();
      await expect(vocabTab).toBeVisible();

      // Verify text tab content is visible (default active tab)
      await expect(page.getByRole('tabpanel')).toBeVisible();

      // Check mobile layout - content should be full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // With px-4 padding (16px * 2 = 32px), content should be ~328px (360 - 32)
        expect(box.width).toBeGreaterThan(320);
        expect(box.width).toBeLessThan(360);
      }
    });

    test('navigates between tabs correctly', async ({ page }) => {
      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Open sample
      await page.getByRole('link', { name: /open sample/i }).first().click();
      await page.waitForURL(/\/reader\/samples\//);

      // Click Grammar tab
      await page.getByRole('tab', { name: /grammar/i }).click();

      // Wait for tab content to be visible
      await page.waitForTimeout(300);

      // Grammar content should be visible
      const grammarPanel = page.getByRole('tabpanel');
      await expect(grammarPanel).toBeVisible();

      // Click Vocabulary tab
      await page.getByRole('tab', { name: /vocabulary/i }).click();
      await page.waitForTimeout(300);

      // Vocabulary content should be visible
      const vocabPanel = page.getByRole('tabpanel');
      await expect(vocabPanel).toBeVisible();
    });

    test('has no console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Open sample
      await page.getByRole('link', { name: /open sample/i }).first().click();
      await page.waitForURL(/\/reader\/samples\//);
      await page.waitForLoadState('networkidle');

      // Check all tabs
      await page.getByRole('tab', { name: /grammar/i }).click();
      await page.waitForTimeout(300);

      await page.getByRole('tab', { name: /vocabulary/i }).click();
      await page.waitForTimeout(300);

      // Filter out known non-critical warnings
      const criticalErrors = errors.filter(
        (error) =>
          !error.includes('ResizeObserver') &&
          !error.includes('Loading chunk')
      );

      expect(criticalErrors).toEqual([]);
    });

    test('back button returns to reader page', async ({ page }) => {
      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Open sample
      await page.getByRole('link', { name: /open sample/i }).first().click();
      await page.waitForURL(/\/reader\/samples\//);

      // Click back button
      const backButton = page.getByRole('link', { name: /back to reader/i });
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Should return to reader page
      await page.waitForURL(/\/reader$/);
      await expect(page.getByRole('heading', { name: /sample readings/i })).toBeVisible();
    });
  });

  test.describe('Mobile (390x844)', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('displays full-width content on larger mobile', async ({ page }) => {
      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Open sample
      await page.getByRole('link', { name: /open sample/i }).first().click();
      await page.waitForURL(/\/reader\/samples\//);

      // Check layout is full width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // With px-4 padding, content should be ~358px (390 - 32)
        expect(box.width).toBeGreaterThan(350);
        expect(box.width).toBeLessThan(390);
      }

      // Verify no horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
    });
  });

  test.describe('Tablet (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('shows constrained layout on tablet', async ({ page }) => {
      await page.goto('/mk/reader');
      await page.waitForLoadState('networkidle');

      // Open sample
      await page.getByRole('link', { name: /open sample/i }).first().click();
      await page.waitForURL(/\/reader\/samples\//);

      // At tablet size, PageContainer with size="content" should apply max-width
      const container = page.locator('main').first();
      const box = await container.boundingBox();

      if (box) {
        // Content container should be constrained (not full 768px width)
        expect(box.width).toBeLessThan(768);
      }
    });
  });
});
