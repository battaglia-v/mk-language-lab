import { test, expect } from '@playwright/test';
import { bypassNetworkInterstitial } from './helpers/network-interstitial';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || '';
const SHOULD_RUN = process.env.E2E_PROD_AUTH === 'true' && BASE_URL.length > 0;

function isLocalhost(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return true;
  }
}

test.describe('Production Authenticated Journey', () => {
  test.skip(!SHOULD_RUN, 'Set E2E_PROD_AUTH=true and PLAYWRIGHT_BASE_URL to run this suite.');
  test.skip(isLocalhost(BASE_URL), 'This suite is intended for production/staging, not localhost.');

  test('Sign up → Learn → Profile/Notifications load (authenticated)', async ({ page }) => {
    const timestamp = Date.now();
    const email = `mkll-e2e-${timestamp}@example.com`;
    const password = `MKLL-${timestamp}-Pass!`;

    await page.setViewportSize({ width: 390, height: 844 });

    // NOTE: Some corporate proxies block Next.js chunks and prevent hydration, which breaks
    // client-side auth forms. We validate the real backend/auth flow via API instead.

    // Create user in target DB.
    const register = await page.request.post('/api/auth/register', {
      data: {
        name: 'MKLL E2E',
        email,
        password,
      },
    });

    // 201 = created, 400 = already exists (shouldn't happen with timestamp email).
    expect([201, 400]).toContain(register.status());

    // Credentials sign-in via NextAuth (shares cookie jar with the page context).
    const csrfResp = await page.request.get('/api/auth/csrf');
    expect(csrfResp.ok()).toBeTruthy();
    const csrf = (await csrfResp.json()) as { csrfToken?: string };
    expect(csrf.csrfToken, 'Missing CSRF token from /api/auth/csrf').toBeTruthy();

    const signInResp = await page.request.post('/api/auth/callback/credentials', {
      form: {
        csrfToken: csrf.csrfToken!,
        email,
        password,
        callbackUrl: `${BASE_URL.replace(/\/+$/, '')}/en/learn`,
        json: 'true',
      },
    });
    expect([200, 302]).toContain(signInResp.status());

    const sessionResp = await page.request.get('/api/auth/session');
    expect(sessionResp.ok()).toBeTruthy();
    const session = (await sessionResp.json()) as { user?: { email?: string } };
    expect(session.user?.email).toBe(email);

    // Authenticated users should land on /en/learn (home redirects to learn).
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await bypassNetworkInterstitial(page);
    await page.waitForURL(/\/en\/learn(\/|$)/, { timeout: 45_000 });

    // Smoke check: Learn dashboard renders.
    await expect(page.getByRole('heading', { name: /learn macedonian/i })).toBeVisible();

    // Profile should NOT show sign-in required state.
    await page.goto('/en/profile', { waitUntil: 'domcontentloaded' });
    await bypassNetworkInterstitial(page);
    await expect(page.locator('[data-testid="profile-dashboard"]')).toBeVisible();
    await expect(page.getByTestId('profile-dashboard').locator('text=/sign in to view/i')).toHaveCount(0);

    // Notifications should render feed/settings for authed users.
    await page.goto('/en/notifications', { waitUntil: 'domcontentloaded' });
    await bypassNetworkInterstitial(page);
    await expect(page.getByTestId('reminder-settings')).toBeVisible();
  });
});
