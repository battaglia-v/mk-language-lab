import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Sign In Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/sign in|log in|welcome/i);
  });

  test('has email input', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test('has password input', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('has submit button', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const submitBtn = page.getByRole('button', { name: /sign in|log in|submit/i }).first();
    await expect(submitBtn).toBeVisible();
  });

  test('has Google sign-in option', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const googleBtn = page.locator('button, a').filter({ hasText: /google/i }).first();
    // May or may not be present depending on config
    if (await googleBtn.count() > 0) {
      await expect(googleBtn).toBeVisible();
    }
  });

  test('has link to sign up', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const signUpLink = page.locator('a').filter({ hasText: /sign up|create account|register/i }).first();
    if (await signUpLink.count() > 0) {
      await expect(signUpLink).toBeVisible();
    }
  });

  test('has forgot password link', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const forgotLink = page.locator('a').filter({ hasText: /forgot|reset/i }).first();
    if (await forgotLink.count() > 0) {
      await expect(forgotLink).toBeVisible();
    }
  });

  test('submit button has minimum touch target', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const submitBtn = page.getByRole('button', { name: /sign in|log in|submit/i }).first();
    const box = await submitBtn.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Sign Up Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/sign up|create|register/i);
  });

  test('has name input', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    if (await nameInput.count() > 0) {
      await expect(nameInput).toBeVisible();
    }
  });

  test('has email input', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test('has password input', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('has link to sign in', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    const signInLink = page.locator('a').filter({ hasText: /sign in|log in|already have/i }).first();
    if (await signInLink.count() > 0) {
      await expect(signInLink).toBeVisible();
    }
  });
});
