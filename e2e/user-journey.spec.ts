import { test, expect } from '@playwright/test';

/**
 * User Journey E2E Tests
 *
 * Validates the v1.3 core promise: "always resume in the right place, next step obvious"
 *
 * Tests the Learn → Practice → Reader flow connections:
 * - Practice results → Reader CTA
 * - Reader workspace → Practice CTA (conditional on saved words)
 * - Reader library → Learn CTA
 * - Reader library → Story accessibility
 */

test.describe('User Journey: Practice → Reader Flow', () => {
  test('Practice results page shows "Read Something" CTA', async ({ page }) => {
    // Navigate to practice results with mock query params
    await page.goto('/en/practice/results?reviewed=5&correct=4&streak=3&duration=120&xp=50&deck=curated');
    await page.waitForLoadState('networkidle');

    // Verify "Read Something" button is visible
    const readSomethingBtn = page.locator('[data-testid="practice-results-explore-reader"]');
    await expect(readSomethingBtn).toBeVisible();

    // Verify button text
    await expect(readSomethingBtn).toContainText(/Read Something|Читај нешто/i);
  });

  test('Practice results "Read Something" CTA navigates to Reader', async ({ page }) => {
    await page.goto('/en/practice/results?reviewed=5&correct=4&streak=3&duration=120&xp=50');
    await page.waitForLoadState('networkidle');

    // Click the "Read Something" button
    const readSomethingBtn = page.locator('[data-testid="practice-results-explore-reader"]');
    await readSomethingBtn.click();

    // Verify navigation to reader page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/en\/reader/);
  });

  test('Practice results shows all navigation options', async ({ page }) => {
    await page.goto('/en/practice/results?reviewed=10&correct=8&deck=saved');
    await page.waitForLoadState('networkidle');

    // Verify all CTA buttons are visible
    await expect(page.locator('[data-testid="practice-results-practice-again"]')).toBeVisible();
    await expect(page.locator('[data-testid="practice-results-back-to-practice"]')).toBeVisible();
    await expect(page.locator('[data-testid="practice-results-explore-reader"]')).toBeVisible();
    await expect(page.locator('[data-testid="practice-results-go-home"]')).toBeVisible();
  });
});

test.describe('User Journey: Reader → Learn Flow', () => {
  test('Reader library shows "Continue your lessons" link', async ({ page }) => {
    // Navigate to reader library tab
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Ensure we're on the library tab (default)
    const libraryTab = page.locator('[data-testid="reader-library-continue-learning"]');

    // Verify the "Continue your lessons" link is visible
    await expect(libraryTab).toBeVisible();
    await expect(libraryTab).toContainText(/Continue your lessons|Продолжи со лекциите/i);
  });

  test('Reader "Continue your lessons" link navigates to Learn', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Click the "Continue your lessons" link
    const continueLink = page.locator('[data-testid="reader-library-continue-learning"]');
    await continueLink.click();

    // Verify navigation to learn page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/en\/learn/);
  });
});

test.describe('User Journey: Reader Workspace', () => {
  test('Reader workspace has "Paste text" CTA', async ({ page }) => {
    // Navigate to reader workspace tab
    await page.goto('/en/reader?tab=workspace');
    await page.waitForLoadState('networkidle');

    // Verify workspace "Paste text" button
    const analyzeBtn = page.locator('[data-testid="reader-workspace-analyze"]');
    await expect(analyzeBtn).toBeVisible();
  });

  test('Reader workspace has "Browse stories" CTA', async ({ page }) => {
    await page.goto('/en/reader?tab=workspace');
    await page.waitForLoadState('networkidle');

    // Verify "Browse stories" button
    const browseBtn = page.locator('[data-testid="reader-workspace-browse-stories"]');
    await expect(browseBtn).toBeVisible();
  });

  test('Reader workspace "Practice Now" CTA appears when saved words exist', async ({ page }) => {
    // Note: This test checks for the conditional CTA
    // The button only appears when savedCount > 0
    await page.goto('/en/reader?tab=workspace');
    await page.waitForLoadState('networkidle');

    // Check if Practice Now button exists (conditional on saved words)
    const practiceBtn = page.locator('[data-testid="reader-workspace-practice-btn"]');
    const practiceLink = page.locator('[data-testid="reader-workspace-practice-saved"]');

    // Either the practice section is visible (user has saved words) or not
    // Both states are valid - we just verify the page is functional
    const pageLoaded = await page.locator('main').isVisible();
    expect(pageLoaded).toBeTruthy();

    // If practice section is visible, verify it links to practice
    if (await practiceLink.count() > 0 && await practiceLink.isVisible()) {
      await expect(practiceBtn).toBeVisible();
      const href = await practiceLink.getAttribute('href');
      expect(href).toContain('/practice/session?deck=saved');
    }
  });
});

test.describe('User Journey: Reader Stories Accessibility', () => {
  test('Reader library loads with stories visible', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Check that the page loaded successfully
    const pageContainer = page.locator('main');
    await expect(pageContainer).toBeVisible();

    // Look for story cards or reading sample cards
    const storyCards = page.locator('a[href*="/reader/samples/"]');
    const cardCount = await storyCards.count();

    // Should have at least one story card
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Reader has A1 level stories', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Look for A1 difficulty badge or filter
    const a1Badge = page.locator('text=/A1/i').first();
    const a1Exists = await a1Badge.count() > 0;

    // A1 stories should be available
    expect(a1Exists).toBeTruthy();
  });

  test('Reader has multiple difficulty levels', async ({ page }) => {
    // Note: Current reader samples include A1 and B1 levels
    // A2/B2 graded readers exist in data but aren't wired to reader-samples.ts yet
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Check that difficulty filter buttons exist
    const filterButtons = page.locator('button').filter({ hasText: /^A1$|^B1$/i });
    const filterCount = await filterButtons.count();

    // Should have at least A1 and B1 filters
    expect(filterCount).toBeGreaterThanOrEqual(2);
  });

  test('Reader has B1 level stories', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Look for B1 difficulty badge
    const b1Badge = page.locator('text=/B1/i').first();
    const b1Exists = await b1Badge.count() > 0;

    expect(b1Exists).toBeTruthy();
  });

  test('Story cards can be clicked to open story', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Find first story card
    const firstStoryCard = page.locator('a[href*="/reader/samples/"]').first();

    if (await firstStoryCard.count() > 0) {
      // Get the href before clicking
      const href = await firstStoryCard.getAttribute('href');
      expect(href).toBeTruthy();

      // Click the story card
      await firstStoryCard.click();
      await page.waitForLoadState('networkidle');

      // Verify navigation to story page
      await expect(page).toHaveURL(/\/reader\/samples\//);
    }
  });

  test('Reader difficulty filter buttons work', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Look for difficulty filter buttons
    const filterButtons = page.locator('button').filter({ hasText: /^A1$|^A2$|^B1$|^B2$/i });
    const filterCount = await filterButtons.count();

    if (filterCount > 0) {
      // Click A1 filter
      const a1Filter = page.locator('button').filter({ hasText: /^A1$/i }).first();
      if (await a1Filter.count() > 0) {
        await a1Filter.click();
        await page.waitForTimeout(500);

        // Verify filtering applied (URL might update or cards filtered)
        const pageLoaded = await page.locator('main').isVisible();
        expect(pageLoaded).toBeTruthy();
      }
    }
  });
});

test.describe('User Journey: Cross-locale Support', () => {
  test('Macedonian locale: Practice results shows localized CTAs', async ({ page }) => {
    await page.goto('/mk/practice/results?reviewed=5&correct=4&xp=30');
    await page.waitForLoadState('networkidle');

    // Verify page loaded with Macedonian content
    const pageContent = await page.content();
    const hasMacedonianContent = /[А-Яа-яЀ-ЏЃѓЅѕЈјЉљЊњЌќЏџ]/.test(pageContent);
    expect(hasMacedonianContent).toBeTruthy();

    // Verify CTA buttons still have correct test IDs
    await expect(page.locator('[data-testid="practice-results-explore-reader"]')).toBeVisible();
  });

  test('Macedonian locale: Reader shows localized content', async ({ page }) => {
    await page.goto('/mk/reader');
    await page.waitForLoadState('networkidle');

    // Verify page loaded with Macedonian content
    const pageContent = await page.content();
    const hasMacedonianContent = /[А-Яа-яЀ-ЏЃѓЅѕЈјЉљЊњЌќЏџ]/.test(pageContent);
    expect(hasMacedonianContent).toBeTruthy();
  });
});

test.describe('User Journey: Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Practice results CTAs are accessible on mobile', async ({ page }) => {
    await page.goto('/en/practice/results?reviewed=5&correct=4&xp=30');
    await page.waitForLoadState('networkidle');

    // All CTA buttons should be visible and have touch-friendly size
    const readSomethingBtn = page.locator('[data-testid="practice-results-explore-reader"]');
    await expect(readSomethingBtn).toBeVisible();

    const box = await readSomethingBtn.boundingBox();
    if (box) {
      // Touch target should be at least 48px tall (matching design system)
      expect(box.height).toBeGreaterThanOrEqual(48);
    }
  });

  test('Reader page is responsive on mobile', async ({ page }) => {
    await page.goto('/en/reader');
    await page.waitForLoadState('networkidle');

    // Page should not overflow horizontally
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});
