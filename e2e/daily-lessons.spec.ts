import { test, expect, Page } from '@playwright/test';

const mockInstagramPostsResponse = {
  items: [
    {
      id: 'mock-lesson-1',
      caption: 'Добредојдовте во дневните лекции! Учиме поздрави и основни фрази.',
      media_type: 'IMAGE',
      media_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      permalink: 'https://www.instagram.com/p/mock-lesson-1/',
      timestamp: '2025-01-10T09:00:00.000Z',
    },
    {
      id: 'mock-lesson-2',
      caption: 'Слушнете го изговорот на буквата Љ и вежбајте со аудио пример.',
      media_type: 'IMAGE',
      media_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
      permalink: 'https://www.instagram.com/p/mock-lesson-2/',
      timestamp: '2025-01-09T17:30:00.000Z',
    },
  ],
  meta: {
    count: 2,
    fetchedAt: '2025-01-10T09:05:00.000Z',
    cached: true,
    source: 'mock',
  },
};

const mockTagsResponse = {
  tags: [
    { id: 'grammar', name: 'Grammar Tips', slug: 'grammar', color: '#a855f7', icon: 'book' },
    { id: 'listening', name: 'Listening', slug: 'listening', color: '#38bdf8', icon: 'ear' },
  ],
  count: 2,
};

const mockPostTags: Record<string, typeof mockTagsResponse.tags> = {
  'mock-lesson-1': [mockTagsResponse.tags[0]],
  'mock-lesson-2': [mockTagsResponse.tags[1]],
};

async function mockDailyLessonsApi(page: Page) {
  await page.route(/\/api\/instagram\/posts\?.*$/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockInstagramPostsResponse),
    });
  });

  await page.route('**/api/tags**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTagsResponse),
    });
  });

  await page.route('**/api/instagram/posts/*/tags**', async (route) => {
    const url = new URL(route.request().url, 'http://localhost');
    const segments = url.pathname.split('/');
    const postId = segments[segments.length - 2];
    const tags = mockPostTags[postId] ?? [];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tags, count: tags.length }),
    });
  });
}

async function waitForDailyLessonsContent(page: Page) {
  await page.waitForSelector('[data-testid="daily-lessons-feed"]');
  await page.waitForSelector('[data-testid="daily-lessons-feed"] img');
}

test.describe('Daily Lessons Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockDailyLessonsApi(page);
    await page.goto('/mk/daily-lessons');
  });

  test('should display hero title and CTA', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Daily Lessons|Дневни лекции/i });
    await expect(heading).toBeVisible();
    const heroCta = page.locator('[data-testid="daily-lessons-hero"] a[href*="instagram.com"]');
    await expect(heroCta.first()).toBeVisible();
  });

  test('should render mocked lesson cards', async ({ page }) => {
    await waitForDailyLessonsContent(page);
    const cards = page.locator('[data-testid="daily-lessons-feed"] a[href*="/p/"]');
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText(/Добредојдовте/i);
    await expect(cards.nth(1)).toContainText(/Љ/);
  });

  test('daily lessons hero matches visual snapshot', async ({ page }) => {
    // Skip in CI - visual snapshots differ across environments
    test.skip(!!process.env.CI, 'Visual snapshot skipped in CI');

    await waitForDailyLessonsContent(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);

    const hero = page.locator('[data-testid="daily-lessons-hero"]');
    if (await hero.isVisible()) {
      await expect(hero).toHaveScreenshot('daily-lessons-hero.png', {
        animations: 'disabled',
        scale: 'css',
      });
    }
  });

  test('daily lessons feed matches visual snapshot', async ({ page }) => {
    // Skip in CI - visual snapshots differ across environments
    test.skip(!!process.env.CI, 'Visual snapshot skipped in CI');

    await waitForDailyLessonsContent(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);

    const feed = page.locator('[data-testid="daily-lessons-feed"]');
    if (await feed.isVisible()) {
      await expect(feed).toHaveScreenshot('daily-lessons-feed.png', {
        animations: 'disabled',
        scale: 'css',
      });
    }
  });
});
