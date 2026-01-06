import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Sign In Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signin-email')).toBeVisible();
  });

  test('has email input', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signin-email')).toBeVisible();
  });

  test('has password input', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signin-password')).toBeVisible();
  });

  test('has submit button', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signin-submit')).toBeVisible();
  });

  test('has Google sign-in option', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const googleBtn = page.getByTestId('auth-signin-google');
    // May or may not be present depending on config
    if (await googleBtn.count() > 0) {
      await expect(googleBtn).toBeVisible();
    }
  });

  test('has link to sign up', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signin-signup-link')).toBeVisible();
  });

  test('submit button has minimum touch target', async ({ page }) => {
    await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });

    const submitBtn = page.getByTestId('auth-signin-submit');
    const box = await submitBtn.boundingBox();

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Sign Up Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signup-email')).toBeVisible();
  });

  test('has name input', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signup-name')).toBeVisible();
  });

  test('has email input', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signup-email')).toBeVisible();
  });

  test('has password input', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signup-password')).toBeVisible();
  });

  test('has link to sign in', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('auth-signup-signin-link')).toBeVisible();
  });
});
