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
  const href = await lessonLink.getAttribute('href').catch(() => null);
  if (!href) return;

  const path = href.startsWith('http') ? new URL(href).pathname : href;
  routes.push({ id: 'lesson', label: 'Lesson (discovered)', path });
}
