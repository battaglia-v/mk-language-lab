import { test, expect } from '@playwright/test';

const mockNotifications = [
  {
    id: '1',
    type: 'streak_warning',
    title: '🔥 7-day streak at risk!',
    body: 'Only 4 hours left to practice today.',
    actionUrl: '/practice',
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'quest_invite',
    title: '🎯 New quest available',
    body: 'Complete 5 exercises today.',
    actionUrl: '/profile',
    isRead: true,
    readAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

test.describe('Notifications Inbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/notifications');
  });

  test('should load notifications page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Notifications.*MK Language Lab/);

    // Check notifications heading
    await expect(page.getByRole('heading', { name: /Notifications/i, level: 1 })).toBeVisible();
  });

  test('should display unread count or empty state', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1500);

    // Either show count or empty state
    const hasCount = await page.getByText(/unread notification|All caught up/i).isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/No notifications yet/i).isVisible().catch(() => false);

    expect(hasCount || hasEmpty).toBeTruthy();
  });

  test('should display empty state when no notifications', async ({ page }) => {
    // Mock empty notifications response
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [] }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check for empty state
    await expect(page.getByText(/No notifications yet/i)).toBeVisible();

    // Check for empty state icon/emoji
    await expect(page.getByText(/📬/)).toBeVisible();
  });

  test('should display notifications list when available', async ({ page }) => {
    // Mock notifications response
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'streak_warning',
              title: '🔥 7-day streak at risk!',
              body: 'Only 4 hours left to practice today.',
              actionUrl: '/practice',
              isRead: false,
              readAt: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              type: 'quest_invite',
              title: '🎯 New quest available',
              body: 'Complete 5 exercises today.',
              actionUrl: '/profile',
              isRead: true,
              readAt: new Date().toISOString(),
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check for notification titles
    await expect(page.getByText(/streak at risk/i)).toBeVisible();
    await expect(page.getByText(/New quest available/i)).toBeVisible();

    // Check for notification icons
    await expect(page.getByText(/🔥/)).toBeVisible();
    await expect(page.getByText(/🎯/)).toBeVisible();
  });

  test('should show mark as read button for unread notifications', async ({ page }) => {
    // Mock unread notification
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'streak_warning',
              title: 'Test Notification',
              body: 'This is unread',
              actionUrl: '/practice',
              isRead: false,
              readAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check for mark read button
    const markReadButton = page.getByRole('button', { name: /Mark read/i });
    await expect(markReadButton).toBeVisible();
  });

  test('should mark notification as read when button clicked', async ({ page }) => {
    // Mock unread notification
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'streak_warning',
              title: 'Test Notification',
              body: 'This is unread',
              actionUrl: '/practice',
              isRead: false,
              readAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // Mock mark as read endpoint
    await page.route('**/api/notifications/*/read', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          notification: {
            id: '1',
            isRead: true,
            readAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Click mark as read
    const markReadButton = page.getByRole('button', { name: /Mark read/i });

    if (await markReadButton.isVisible()) {
      await markReadButton.click();
      await page.waitForTimeout(500);

      // Button should disappear or notification should change style
      const isGone = !(await markReadButton.isVisible().catch(() => true));
      expect(isGone).toBeTruthy();
    }
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Should show error message
    await expect(page.getByText(/Unable to load|Error/i).first()).toBeVisible();
  });

  test('should display timestamps for notifications', async ({ page }) => {
    // Mock notification with timestamp
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'admin_note',
              title: 'System Update',
              body: 'New features available',
              actionUrl: null,
              isRead: false,
              readAt: null,
              createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            },
          ],
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check for relative time (like "1h ago")
    const timeElement = page.getByText(/\d+[hmsd]\s+ago|Just now/i);
    await expect(timeElement.first()).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.reload();
    await page.waitForTimeout(1000);

    // Heading should still be visible
    await expect(page.getByRole('heading', { name: /Notifications/i, level: 1 })).toBeVisible();

    // Content should be visible (either empty state or list)
    const hasContent = await page.getByText(/notification|All caught up|No notifications/i).first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('notifications hero matches visual snapshot', async ({ page }) => {
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: mockNotifications }),
      });
    });
    await page.reload();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const hero = page.locator('[data-testid="notifications-hero"]');
    await expect(hero).toHaveScreenshot('notifications-hero.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });

  test('notifications feed matches visual snapshot', async ({ page }) => {
    await page.route('**/api/notifications', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: mockNotifications }),
      });
    });
    await page.reload();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const feed = page.locator('[data-testid="notifications-feed"]');
    await expect(feed).toHaveScreenshot('notifications-feed.png', {
      animations: 'disabled',
      scale: 'css',
    });
  });
});
