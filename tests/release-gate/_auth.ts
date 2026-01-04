import { expect, type Page } from '@playwright/test';
import type { ReleaseGateMode } from './_mode';

type Credentials = {
  email: string;
  password: string;
  name: string;
};

export function getReleaseGateCredentials(): Credentials {
  const email = process.env.RELEASE_GATE_TEST_EMAIL?.trim();
  const password = process.env.RELEASE_GATE_TEST_PASSWORD?.trim();
  const name = process.env.RELEASE_GATE_TEST_NAME?.trim() ?? 'MKLL Release Gate';

  if (email && password) return { email, password, name };

  const timestamp = Date.now();
  return {
    name,
    email: `mkll-release-gate-${timestamp}@example.com`,
    password: `MKLL-${timestamp}-Pass!`,
  };
}

export async function ensureSignedIn(page: Page, mode: ReleaseGateMode): Promise<Credentials> {
  const creds = getReleaseGateCredentials();

  if (mode === 'signed-out') {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    return creds;
  }

  await signInWithCredentials(page, creds);
  return creds;
}

export async function signInWithCredentials(page: Page, creds: Credentials): Promise<void> {
  // Create user (idempotent if email already exists).
  const register = await page.request.post('/api/auth/register', {
    data: {
      name: creds.name,
      email: creds.email,
      password: creds.password,
    },
  });
  expect([201, 400]).toContain(register.status());

  // Credentials sign-in via NextAuth (shares cookie jar with the page context).
  const csrfResp = await page.request.get('/api/auth/csrf');
  expect(csrfResp.ok()).toBeTruthy();
  const csrf = (await csrfResp.json()) as { csrfToken?: string };
  expect(csrf.csrfToken, 'Missing CSRF token from /api/auth/csrf').toBeTruthy();

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  const callbackUrl = `${baseURL.replace(/\/+$/, '')}/en/learn`;

  const signInResp = await page.request.post('/api/auth/callback/credentials', {
    form: {
      csrfToken: csrf.csrfToken!,
      email: creds.email,
      password: creds.password,
      callbackUrl,
      json: 'true',
    },
  });
  expect([200, 302]).toContain(signInResp.status());

  // Validate session is established.
  const sessionResp = await page.request.get('/api/auth/session');
  expect(sessionResp.ok()).toBeTruthy();
  const session = (await sessionResp.json()) as { user?: { email?: string } };
  expect(session.user?.email).toBe(creds.email);
}
