import type { Page } from '@playwright/test';
import type { GateRoute } from './_routes';
import { safeGoto } from './_scan-utils';

/**
 * Some routes (e.g., /[locale]/lesson/[lessonId]) depend on DB IDs that may not
 * be available to the test runner. This helper discovers a representative
 * lesson deep link by crawling the Learn page.
 */
export async function maybeAddDiscoveredLessonRoute(page: Page, routes: GateRoute[]): Promise<void> {
  if (routes.some((r) => r.id === 'lesson')) return;

  const locale = process.env.RELEASE_GATE_LOCALE ?? 'en';
  console.log(`[discover] Attempting to discover a lesson deep link from /${locale}/learn`);
  try {
    await safeGoto(page, `/${locale}/learn`);
  } catch (error) {
    console.warn('[discover] Failed to load Learn page to discover lesson route:', (error as Error)?.message || error);
    return;
  }

  const lessonLink = page.locator('a[href*="/lesson/"]').first();
  const href = await lessonLink.getAttribute('href', { timeout: 2000 }).catch(() => null);
  if (!href) return;

  const path = href.startsWith('http') ? new URL(href).pathname : href;
  routes.push({ id: 'lesson', label: 'Lesson (discovered)', path });
}

async function hasActiveSession(page: Page): Promise<boolean> {
  const resp = await page.request.get('/api/auth/session').catch(() => null);
  if (!resp?.ok()) return false;
  const json = await resp.json().catch(() => null);
  if (!json || typeof json !== 'object') return false;
  return Boolean((json as { user?: unknown }).user);
}

/**
 * /[locale]/practice/decks/[deckId] is backed by user-scoped DB IDs.
 * Discover (or create) a representative custom deck so the release gate scans
 * include the deck editor route.
 */
export async function maybeAddDiscoveredCustomDeckEditorRoute(page: Page, routes: GateRoute[]): Promise<void> {
  if (routes.some((r) => r.id === 'customDeckEditor')) return;

  if (!(await hasActiveSession(page))) {
    console.log('[discover] Skipping custom deck discovery (no active session)');
    return;
  }

  const locale = process.env.RELEASE_GATE_LOCALE ?? 'en';
  const decksResp = await page.request.get('/api/decks?archived=false').catch(() => null);
  let deckId: string | null = null;

  if (decksResp?.ok()) {
    const json = (await decksResp.json().catch(() => ({}))) as { decks?: Array<{ id?: string }> };
    deckId = (json.decks || []).find((d) => typeof d.id === 'string' && d.id.length > 0)?.id ?? null;
  }

  if (!deckId) {
    console.log('[discover] No custom decks found; creating one via /api/decks');
    const createResp = await page.request
      .post('/api/decks', {
        data: {
          name: `MKLL Release Gate Deck ${new Date().toISOString()}`,
          description: 'Created by release-gate scanner',
        },
      })
      .catch(() => null);

    if (!createResp?.ok()) {
      console.warn('[discover] Failed to create a custom deck:', createResp?.status());
      return;
    }

    const json = (await createResp.json().catch(() => ({}))) as { deck?: { id?: string } };
    deckId = (typeof json.deck?.id === 'string' && json.deck.id.length > 0) ? json.deck.id : null;
  }

  if (!deckId) return;

  // Ensure the route is reachable (avoids poisoning the route list with a bad ID).
  const path = `/${locale}/practice/decks/${deckId}`;
  try {
    await safeGoto(page, path);
  } catch (error) {
    console.warn('[discover] Failed to verify custom deck editor route:', (error as Error)?.message || error);
    return;
  }

  routes.push({ id: 'customDeckEditor', label: 'Custom deck editor (discovered)', path });
}
