import type { Page } from '@playwright/test';

const INTERSTITIAL_TEXT_PATTERNS = [
  /are you sure you want to visit this site\?/i,
  /internet use policy/i,
  /newly registered and observed domains/i,
  /^expedia group$/i,
];

async function hasNetworkInterstitial(page: Page): Promise<boolean> {
  for (const pattern of INTERSTITIAL_TEXT_PATTERNS) {
    if (await page.getByText(pattern).first().isVisible().catch(() => false)) {
      return true;
    }
  }
  return false;
}

/**
 * Some corporate networks inject an interstitial warning page (often a 403)
 * that must be acknowledged before accessing newly registered domains.
 *
 * This helper attempts to click through that interstitial if present.
 * If the interstitial cannot be dismissed, it throws a clear error so
 * production audits don't generate false "green" results.
 */
export async function bypassNetworkInterstitial(page: Page): Promise<boolean> {
  if (!(await hasNetworkInterstitial(page))) return false;

  const continueButton = page.getByRole('button', { name: /^continue$/i }).first();
  const continueLink = page.getByRole('link', { name: /^continue$/i }).first();

  if (await continueButton.isVisible().catch(() => false)) {
    await continueButton.click({ force: true });
  } else if (await continueLink.isVisible().catch(() => false)) {
    await continueLink.click({ force: true });
  } else {
    // Fallback: try a text click (some interstitials don't expose ARIA roles properly).
    const fallback = page.locator('text=/^continue$/i').first();
    if (await fallback.isVisible().catch(() => false)) {
      await fallback.click({ force: true });
    }
  }

  // Give the page a chance to reload or navigate.
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  if (await hasNetworkInterstitial(page)) {
    throw new Error(
      'Network interstitial detected (corporate warning page). Cannot reach the target site from this network without allowlisting/approval.'
    );
  }

  return true;
}

