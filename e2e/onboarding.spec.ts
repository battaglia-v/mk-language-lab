import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/onboarding');
  });

  test('should display onboarding wizard with progress indicator', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Македонски.*MK Language Lab/);

    // Check welcome badge
    await expect(page.getByText(/Welcome|Добредојдовте/i)).toBeVisible();

    // Check main heading
    await expect(page.getByRole('heading', { name: /set up your mission|поставиме вашата мисија/i })).toBeVisible();

    // Check progress indicator (3 steps)
    const progressBars = page.locator('[class*="rounded-full"]').filter({ hasText: '' });
    const progressCount = await progressBars.count();
    expect(progressCount).toBeGreaterThanOrEqual(3);
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Step 1: Goal selection
    await expect(page.getByText(/What's your main goal|Која е вашата главна цел/i)).toBeVisible();

    // Select "Conversation" goal
    const conversationButton = page.getByRole('button', { name: /Conversation|Разговор/i }).first();
    await conversationButton.click();

    // Check that it's selected (should show checkmark or active state)
    await expect(conversationButton).toHaveClass(/border-\[var\(--brand-red/);

    // Click Next
    const nextButton = page.getByRole('button', { name: /Next|Следно/i });
    await nextButton.click();

    // Step 2: Level selection
    await expect(page.getByText(/What's your current level|Кое е вашето тековно ниво/i)).toBeVisible();

    // Select "Beginner" level
    const beginnerButton = page.getByRole('button', { name: /Beginner|Почетник/i }).first();
    await beginnerButton.click();

    // Check that it's selected
    await expect(beginnerButton).toHaveClass(/border-\[var\(--brand-red/);

    // Click Next
    await nextButton.click();

    // Step 3: Daily goal
    await expect(page.getByText(/Set your daily goal|Поставете ја вашата дневна цел/i)).toBeVisible();

    // Select 20 minutes
    const twentyMinButton = page.getByRole('button', { name: '20' }).first();
    await twentyMinButton.click();

    // Check completion message
    await expect(page.getByText(/You're all set|Сето е подготвено/i)).toBeVisible();

    // Complete setup (this would normally redirect, but we'll just check the button exists)
    const completeButton = page.getByRole('button', { name: /Complete setup|Заврши поставување/i });
    await expect(completeButton).toBeVisible();
    await expect(completeButton).toBeEnabled();
  });

  test('should not allow proceeding without selections', async ({ page }) => {
    // Step 1: Try to click Next without selecting a goal
    const nextButton = page.getByRole('button', { name: /Next|Следно/i });

    // Next button should be disabled or have no effect
    const initialUrl = page.url();
    await nextButton.click();

    // Should still be on step 1
    await expect(page.getByText(/What's your main goal|Која е вашата главна цел/i)).toBeVisible();
  });

  test('should allow navigating back through steps', async ({ page }) => {
    // Select a goal and proceed to step 2
    const conversationButton = page.getByRole('button', { name: /Conversation|Разговор/i }).first();
    await conversationButton.click();

    const nextButton = page.getByRole('button', { name: /Next|Следно/i });
    await nextButton.click();

    // Now on step 2
    await expect(page.getByText(/What's your current level|Кое е вашето тековно ниво/i)).toBeVisible();

    // Click Back
    const backButton = page.getByRole('button', { name: /Back|Назад/i });
    await backButton.click();

    // Should be back on step 1
    await expect(page.getByText(/What's your main goal|Која е вашата главна цел/i)).toBeVisible();
  });

  test('should display all goal options', async ({ page }) => {
    // Check that all 5 goal options are visible
    await expect(page.getByText(/Conversation|Разговор/i).first()).toBeVisible();
    await expect(page.getByText(/Travel|Патување/i).first()).toBeVisible();
    await expect(page.getByText(/Culture|Култура/i).first()).toBeVisible();
    await expect(page.getByText(/Reading|Читање/i).first()).toBeVisible();
    await expect(page.getByText(/Professional|Професионално/i).first()).toBeVisible();
  });

  test('should display all level options', async ({ page }) => {
    // Navigate to step 2
    const conversationButton = page.getByRole('button', { name: /Conversation|Разговор/i }).first();
    await conversationButton.click();

    const nextButton = page.getByRole('button', { name: /Next|Следно/i });
    await nextButton.click();

    // Check that all 3 level options are visible
    await expect(page.getByText(/Beginner|Почетник/i).first()).toBeVisible();
    await expect(page.getByText(/Intermediate|Среден/i).first()).toBeVisible();
    await expect(page.getByText(/Advanced|Напреден/i).first()).toBeVisible();
  });

  test('should display daily goal minute options', async ({ page }) => {
    // Navigate to step 3
    const conversationButton = page.getByRole('button', { name: /Conversation|Разговор/i }).first();
    await conversationButton.click();

    let nextButton = page.getByRole('button', { name: /Next|Следно/i });
    await nextButton.click();

    const beginnerButton = page.getByRole('button', { name: /Beginner|Почетник/i }).first();
    await beginnerButton.click();

    nextButton = page.getByRole('button', { name: /Next|Следно/i });
    await nextButton.click();

    // Check that minute options are visible (5, 10, 15, 20, 30, 45, 60)
    await expect(page.getByRole('button', { name: '5' })).toBeVisible();
    await expect(page.getByRole('button', { name: '10' })).toBeVisible();
    await expect(page.getByRole('button', { name: '20' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30' })).toBeVisible();
  });

  test('should be responsive on mobile screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page to apply mobile layout
    await page.reload();

    // Check that wizard is still visible and usable
    await expect(page.getByRole('heading', { name: /set up your mission|поставиме вашата мисија/i })).toBeVisible();

    // Check that goal options are displayed properly
    const conversationButton = page.getByRole('button', { name: /Conversation|Разговор/i }).first();
    await expect(conversationButton).toBeVisible();
  });

  test('should have accessible heading hierarchy', async ({ page }) => {
    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check h2 headings exist for step titles
    const h2 = page.locator('h2');
    const h2Count = await h2.count();
    expect(h2Count).toBeGreaterThan(0);
  });
});
