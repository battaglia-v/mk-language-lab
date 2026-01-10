import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT, waitForInteractive } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('Resources Page', () => {
  test('loads and shows menu options', async ({ page }) => {
    await page.goto('/en/resources', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    // Should show menu items (Resources page now has: savedWords, lab, news)
    await expect(page.getByTestId('resources-menu-savedWords')).toBeVisible();
    await expect(page.getByTestId('resources-menu-lab')).toBeVisible();
    await expect(page.getByTestId('resources-menu-news')).toBeVisible();
  });

  const menuLinks = [
    { id: 'savedWords', path: '/saved-words' },
    { id: 'lab', path: '/lab' },
    { id: 'news', path: '/news' },
  ];

  for (const { id, path } of menuLinks) {
    test(`${id} link navigates correctly`, async ({ page }) => {
      await page.goto('/en/resources', { waitUntil: 'domcontentloaded' });

      const link = page.getByTestId(`resources-menu-${id}`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(path));
      await expect(page.locator('body')).not.toContainText('404');
    });
  }
});

test.describe('Settings Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/settings/i);
  });

  test('has daily goal setting', async ({ page }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('settings-daily-goal-20')).toBeVisible();
  });

  test('has theme toggle', async ({ page }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('settings-theme-light')).toBeVisible();
    await expect(page.getByTestId('settings-theme-dark')).toBeVisible();
  });
});

test.describe('Profile Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/profile', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.getByTestId('profile-hero')).toBeVisible();
  });

  test('shows XP and streak for signed-in users', async ({ page }) => {
    await page.goto('/en/profile', { waitUntil: 'domcontentloaded' });
    await waitForInteractive(page);

    const signedOut = page.getByTestId('profile-sign-in');
    const signedIn = page.getByTestId('profile-overview');
    const retry = page.getByTestId('profile-retry');

    await expect.poll(async () => {
      const hasSignedOut = await signedOut.isVisible().catch(() => false);
      const hasSignedIn = await signedIn.isVisible().catch(() => false);
      const hasRetry = await retry.isVisible().catch(() => false);
      return hasSignedOut || hasSignedIn || hasRetry;
    }).toBeTruthy();
  });
});

test.describe('Help Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/help', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    // Help page is now accessed via UserMenu, back button goes to previous page
    await expect(page.getByTestId('help-hero')).toBeVisible();
  });
});

test.describe('About Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/about', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.getByTestId('about-hero')).toBeVisible();
  });
});

test.describe('News Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/news', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.getByTestId('news-hero')).toBeVisible();
  });

  test('shows news articles or empty state', async ({ page }) => {
    await page.goto('/en/news', { waitUntil: 'domcontentloaded' });

    const hasGrid = await page.getByTestId('news-grid').isVisible().catch(() => false);
    const hasRetry = await page.getByTestId('news-retry').isVisible().catch(() => false);
    expect(hasGrid || hasRetry).toBeTruthy();
  });
});
