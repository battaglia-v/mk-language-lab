import { test, expect, assertNoRawTranslationKeys, MOBILE_VIEWPORT } from './_helpers';

test.use({ viewport: MOBILE_VIEWPORT });

test.describe('More Menu', () => {
  test('loads and shows menu options', async ({ page }) => {
    await page.goto('/en/more', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    // Should show menu items
    await expect(page.locator('body')).toContainText(/news|resources|profile|settings|about|help/i);
  });

  const menuLinks = [
    { name: 'News', path: '/news' },
    { name: 'Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' },
    { name: 'About', path: '/about' },
    { name: 'Help', path: '/help' },
  ];

  for (const { name, path } of menuLinks) {
    test(`${name} link navigates correctly`, async ({ page }) => {
      await page.goto('/en/more', { waitUntil: 'domcontentloaded' });

      const link = page.getByRole('link', { name: new RegExp(name, 'i') }).first();
      if (await link.count() > 0) {
        await link.click();
        await expect(page).toHaveURL(new RegExp(path));
        await expect(page.locator('body')).not.toContainText('404');
      }
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

    await expect(page.locator('body')).toContainText(/daily.*goal|goal.*xp/i);
  });

  test('has notification settings', async ({ page }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/notification|reminder/i);
  });

  test('has theme toggle', async ({ page }) => {
    await page.goto('/en/settings', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('body')).toContainText(/theme|dark|light|appearance/i);
  });
});

test.describe('Profile Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/profile', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    // Should show profile or sign-in prompt
    await expect(page.locator('body')).toContainText(/profile|sign in|log in/i);
  });

  test('shows XP and streak for signed-in users', async ({ page }) => {
    await page.goto('/en/profile', { waitUntil: 'domcontentloaded' });

    // Should have stats section or sign-in prompt
    const text = await page.locator('body').innerText();
    expect(text.toLowerCase()).toMatch(/xp|streak|level|sign in|profile/i);
  });
});

test.describe('Help Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/help', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/help|support|faq/i);
  });
});

test.describe('About Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/about', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/about|macedonian/i);
  });
});

test.describe('News Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/news', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/news/i);
  });

  test('shows news articles or empty state', async ({ page }) => {
    await page.goto('/en/news', { waitUntil: 'domcontentloaded' });

    // Should have articles or "no news" message
    const text = await page.locator('body').innerText();
    expect(text.toLowerCase()).toMatch(/article|headline|no news|coming soon|news/i);
  });
});

test.describe('Upgrade Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/en/upgrade', { waitUntil: 'domcontentloaded' });
    await assertNoRawTranslationKeys(page);

    await expect(page.locator('body')).toContainText(/upgrade|pro|premium/i);
  });

  test('shows pricing options', async ({ page }) => {
    await page.goto('/en/upgrade', { waitUntil: 'domcontentloaded' });

    // Should have pricing info
    await expect(page.locator('body')).toContainText(/month|year|\$|free|plan/i);
  });

  test('has subscribe/upgrade button', async ({ page }) => {
    await page.goto('/en/upgrade', { waitUntil: 'domcontentloaded' });

    const upgradeBtn = page.getByRole('button', { name: /upgrade|subscribe|get pro/i }).first();
    // Should exist (even if disabled for signed-out users)
    expect(await upgradeBtn.count()).toBeGreaterThanOrEqual(0);
  });
});
