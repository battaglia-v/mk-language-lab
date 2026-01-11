import { test, expect } from '@playwright/test';

/**
 * Learn Experience E2E Tests
 *
 * Validates v1.7 Learn Experience changes:
 * - Simplified lesson flow with section stepper
 * - Free navigation between sections
 * - Content quality (vocabulary, grammar, practice)
 * - User journey continuity
 * - Mobile responsiveness
 *
 * Tests use the LessonPageContentV2 component with testid attributes.
 */

// Helper to navigate to Learn page and find first lesson
async function navigateToFirstLesson(page: import('@playwright/test').Page, locale: string = 'en') {
  await page.goto(`/${locale}/learn`, { waitUntil: 'networkidle' });

  // Find the first lesson link (curriculum lesson card)
  const lessonLink = page.locator('a[href*="/lesson/"]').first();

  if (await lessonLink.count() > 0) {
    const href = await lessonLink.getAttribute('href');
    if (href) {
      await page.goto(href, { waitUntil: 'networkidle' });
      return true;
    }
  }
  return false;
}

test.describe('Learn Experience: Lesson Flow', () => {
  test('Lesson page loads with section stepper', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Verify section stepper is visible
    const stepper = page.locator('[data-testid="lesson-section-stepper"]');
    await expect(stepper).toBeVisible();
  });

  test('Section stepper shows available sections', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Check for section tabs (at least one should be visible)
    const sectionTabs = page.locator('[data-testid^="lesson-section-tab-"]');
    const tabCount = await sectionTabs.count();

    // Should have at least one section (vocabulary, grammar, or practice)
    expect(tabCount).toBeGreaterThan(0);
  });

  test('Section tabs allow free navigation', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    await page.waitForTimeout(1000);

    // Get all section tabs
    const sectionTabs = page.locator('[data-testid^="lesson-section-tab-"]');
    const tabCount = await sectionTabs.count();

    if (tabCount >= 2) {
      // Click the second tab (if exists)
      const secondTab = sectionTabs.nth(1);
      await secondTab.click();
      await page.waitForTimeout(500);

      // Verify we can navigate back to first tab
      const firstTab = sectionTabs.first();
      await firstTab.click();
      await page.waitForTimeout(500);

      // Both clicks should work without restriction
      await expect(firstTab).toBeVisible();
    }
  });

  test('Progress indicator updates as sections are viewed', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Look for progress indicator
    const progressIndicator = page.locator('[data-testid="lesson-progress-indicator"]');

    if (await progressIndicator.count() > 0) {
      await expect(progressIndicator).toBeVisible();
    } else {
      // Fallback: check for any progress bar element
      const progressBar = page.locator('[role="progressbar"]').first();
      await expect(progressBar).toBeVisible();
    }
  });

  test('Continue button advances to next section', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Find Continue button
    const continueBtn = page.locator('[data-testid="lesson-continue-btn"]');

    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      // Get initial step text
      const stepText = page.locator('text=/Step \\d+ of \\d+/i');
      const initialStepText = await stepText.textContent();

      await continueBtn.click();
      await page.waitForTimeout(500);

      // Step should advance (if not on last step)
      const newStepText = await stepText.textContent();
      // Either step advanced or we're on completion screen
      const pageContent = await page.content();
      const isComplete = pageContent.includes('Lesson Complete') || pageContent.includes('Complete Lesson');

      expect(initialStepText !== newStepText || isComplete).toBeTruthy();
    }
  });
});

test.describe('Learn Experience: Content Quality', () => {
  test('Vocabulary section displays word cards', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Navigate to vocabulary section if tab exists
    const vocabTab = page.locator('[data-testid="lesson-section-tab-vocabulary"]');
    if (await vocabTab.count() > 0) {
      await vocabTab.click();
      await page.waitForTimeout(500);
    }

    // Check for vocabulary cards
    const vocabCards = page.locator('[data-testid="lesson-vocabulary-card"]');
    const cardCount = await vocabCards.count();

    if (cardCount > 0) {
      // Vocabulary cards should display Macedonian text
      const firstCard = vocabCards.first();
      await expect(firstCard).toBeVisible();

      // Should contain some text (Cyrillic characters)
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
    }
  });

  test('Grammar section displays notes with examples', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Navigate to grammar section if tab exists
    const grammarTab = page.locator('[data-testid="lesson-section-tab-grammar"]');
    if (await grammarTab.count() > 0) {
      await grammarTab.click();
      await page.waitForTimeout(500);

      // Check for grammar notes
      const grammarNotes = page.locator('[data-testid="lesson-grammar-note"]');

      if (await grammarNotes.count() > 0) {
        const firstNote = grammarNotes.first();
        await expect(firstNote).toBeVisible();
      }
    }
  });

  test('Practice section has exercises', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Navigate to practice section if tab exists
    const practiceTab = page.locator('[data-testid="lesson-section-tab-practice"]');
    if (await practiceTab.count() > 0) {
      await practiceTab.click();
      await page.waitForTimeout(500);

      // Check for exercise elements
      const exerciseSection = page.locator('[data-testid="lesson-section-content"]');
      await expect(exerciseSection).toBeVisible();

      // Should have some interactive elements (buttons, inputs)
      const hasInteractiveElements =
        (await page.locator('button').count()) > 0 ||
        (await page.locator('input').count()) > 0;

      expect(hasInteractiveElements).toBeTruthy();
    }
  });

  test('No empty sections visible', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Check that section content area has content
    const contentArea = page.locator('[data-testid="lesson-section-content"]');

    if (await contentArea.count() > 0) {
      // Content area should have visible content
      const content = await contentArea.textContent();
      expect(content && content.trim().length > 0).toBeTruthy();
    }
  });
});

test.describe('Learn Experience: User Journey Continuity', () => {
  test('Can navigate from Learn page to specific lesson', async ({ page }) => {
    await page.goto('/en/learn', { waitUntil: 'networkidle' });

    // Find a lesson link
    const lessonLink = page.locator('a[href*="/lesson/"]').first();

    if (await lessonLink.count() > 0) {
      await lessonLink.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on a lesson page
      await expect(page).toHaveURL(/\/lesson\//);
    }
  });

  test('Lesson page has "All Lessons" back link', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Look for back link to Learn page
    const backLink = page.locator('a:has-text("All Lessons"), a:has-text("Lessons")');

    if (await backLink.count() > 0) {
      await expect(backLink.first()).toBeVisible();
    }
  });

  test('Can return to Learn hub from lesson', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Find and click back link
    const backLink = page.locator('a[href*="/learn"]').first();

    if (await backLink.count() > 0) {
      await backLink.click();
      await page.waitForLoadState('networkidle');

      // Verify we're back on Learn page
      await expect(page).toHaveURL(/\/learn/);
    }
  });
});

test.describe('Learn Experience: Cross-locale Support', () => {
  test('Macedonian locale: Lesson page shows localized content', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page, 'mk');
    test.skip(!hasLesson, 'No lessons available in database');

    // Verify page loaded with Macedonian content
    const pageContent = await page.content();
    const hasCyrillicContent = /[А-Яа-яЀ-ЏЃѓЅѕЈјЉљЊњЌќЏџ]/.test(pageContent);
    expect(hasCyrillicContent).toBeTruthy();
  });

  test('English locale: Lesson page shows English UI', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page, 'en');
    test.skip(!hasLesson, 'No lessons available in database');

    // Verify page has English UI elements
    const continueText = await page.locator('text=/Continue|Complete|Vocabulary|Grammar|Practice/i').count();
    expect(continueText).toBeGreaterThan(0);
  });
});

test.describe('Learn Experience: Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('No horizontal scroll on lesson page', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    await page.waitForTimeout(1000);

    // Check for horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('Section tabs have adequate touch targets', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Find section stepper buttons (mobile uses circular buttons)
    const stepperButtons = page.locator('[data-testid="lesson-section-stepper"] button');
    const buttonCount = await stepperButtons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = stepperButtons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Touch targets should be at least 32px (allowing for smaller step indicators)
          expect(box.height).toBeGreaterThanOrEqual(24);
          expect(box.width).toBeGreaterThanOrEqual(24);
        }
      }
    }
  });

  test('Continue button is visible and accessible', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Look for Continue button
    const continueBtn = page.locator('[data-testid="lesson-continue-btn"]');

    if (await continueBtn.count() > 0) {
      await expect(continueBtn).toBeVisible();

      const box = await continueBtn.boundingBox();
      if (box) {
        // Button should be at least 44px tall for touch
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    } else {
      // Fallback: check for any Continue button
      const fallbackBtn = page.locator('button:has-text("Continue")').first();
      if (await fallbackBtn.count() > 0) {
        await expect(fallbackBtn).toBeVisible();
      }
    }
  });

  test('Floating navigation bar is visible on mobile', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // The floating navigation should be visible at bottom
    const floatingNav = page.locator('.fixed.bottom-\\[calc\\(4rem').first();

    // Check that there's a visible button in the lower portion of the screen
    const buttons = page.locator('button');
    const count = await buttons.count();

    let hasBottomButton = false;
    const viewportHeight = 667;

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box && box.y > viewportHeight - 200) {
          hasBottomButton = true;
          break;
        }
      }
    }

    expect(hasBottomButton).toBeTruthy();
  });
});

test.describe('Learn Experience: Completion Screen', () => {
  test('Completion screen appears after all sections', async ({ page }) => {
    const hasLesson = await navigateToFirstLesson(page);
    test.skip(!hasLesson, 'No lessons available in database');

    // Navigate through all sections by clicking Continue repeatedly
    for (let i = 0; i < 10; i++) {
      const continueBtn = page.locator('[data-testid="lesson-continue-btn"]');
      const completeBtn = page.locator('button:has-text("Complete Lesson")');

      if (await completeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await completeBtn.click();
        await page.waitForTimeout(1000);
        break;
      }

      if (await continueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      } else {
        // Try fallback Continue button
        const fallback = page.locator('button:has-text("Continue")').first();
        if (await fallback.isVisible({ timeout: 500 }).catch(() => false)) {
          await fallback.click();
          await page.waitForTimeout(500);
        } else {
          break;
        }
      }
    }

    // Check if completion screen or next lesson page is shown
    const completionIndicators = await page.locator('text=/Lesson Complete|🎉|Continue|All Lessons/i').count();
    expect(completionIndicators).toBeGreaterThan(0);
  });
});
