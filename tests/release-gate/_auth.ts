import { expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
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

  await signInWithCredentials(page, creds, mode);
  return creds;
}

export async function signInWithCredentials(page: Page, creds: Credentials, mode: ReleaseGateMode): Promise<void> {
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

  if (mode === 'premium') {
    if (shouldSeedPremiumDb()) {
      try {
        await ensurePremiumSubscription(creds.email);
      } catch (error) {
        console.warn('[release-gate] Premium DB seed failed, falling back to entitlement mock:', (error as Error)?.message || error);
        await enablePremiumEntitlementMock(page);
      }
    } else {
      await enablePremiumEntitlementMock(page);
    }
  }
}

function shouldSeedPremiumDb(): boolean {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  let hostname = 'localhost';
  try {
    hostname = new URL(baseURL).hostname;
  } catch {
    hostname = 'localhost';
  }

  if (process.env.RELEASE_GATE_PREMIUM_MOCK === 'true') return false;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function enablePremiumEntitlementMock(page: Page): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);

  const entitlement = {
    isPro: true,
    tier: 'pro',
    source: 'promo',
    expiresAt: expiresAt.toISOString(),
    inGracePeriod: false,
    purchasedAt: now.toISOString(),
    period: 'monthly',
    productId: 'pro_monthly',
  };

  await page.route('**/api/user/entitlement', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ entitlement }),
    });
  });

  await page.route('**/api/subscription/status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ entitlement, limits: null, features: [] }),
    });
  });
}

async function ensurePremiumSubscription(email: string): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user?.id) throw new Error(`Cannot grant premium: user not found for ${email}`);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: 'active',
        source: 'promo',
        productId: 'pro_monthly',
        period: 'monthly',
        purchasedAt: new Date(),
        expiresAt,
        grantReason: 'release-gate-premium-mode',
      },
      update: {
        status: 'active',
        source: 'promo',
        productId: 'pro_monthly',
        period: 'monthly',
        purchasedAt: new Date(),
        expiresAt,
        grantReason: 'release-gate-premium-mode',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
