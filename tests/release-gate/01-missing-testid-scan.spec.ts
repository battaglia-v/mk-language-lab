import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSignedIn } from './_auth';
import { getReleaseGateMode } from './_mode';
import { resolveGateRoutes } from './_routes';
import { maybeAddDiscoveredCustomDeckEditorRoute, maybeAddDiscoveredLessonRoute } from './_discover';
import {
  getHref,
  getRole,
  getStableLabel,
  getTagName,
  getVisibleTestIdRequired,
  instrumentActionSignals,
  isDisabled,
  safeGoto,
} from './_scan-utils';

type MissingTestId = {
  routeId: string;
  routePath: string;
  resolvedPathname: string;
  tagName: string;
  role: string | null;
  href: string | null;
  label: string;
  disabled: boolean;
};

type RouteError = {
  routeId: string;
  routePath: string;
  error: string;
};

test.describe.serial('release gate: missing_testid_scan', () => {
  test('all visible interactives have data-testid', async ({ page }) => {
    test.setTimeout(15 * 60 * 1000);
    const mode = getReleaseGateMode();
    const outDir = path.join(process.cwd(), 'test-results', 'release-gate', mode);
    fs.mkdirSync(outDir, { recursive: true });

    await instrumentActionSignals(page);
    await ensureSignedIn(page, mode);

    const routes = await resolveGateRoutes();
    await maybeAddDiscoveredLessonRoute(page, routes);
    await maybeAddDiscoveredCustomDeckEditorRoute(page, routes);
    const maxRoutes = Number(process.env.RELEASE_GATE_MAX_ROUTES || 0);
    const routesToScan = maxRoutes > 0 ? routes.slice(0, maxRoutes) : routes;
    const missing: MissingTestId[] = [];
    const routeErrors: RouteError[] = [];

    for (const route of routesToScan) {
      console.log(`[missing_testid_scan] Visiting ${route.id} ${route.path}`);
      try {
        await safeGoto(page, route.path);
      } catch (error) {
        routeErrors.push({
          routeId: route.id,
          routePath: route.path,
          error: error?.message || String(error),
        });
        continue;
      }
      const resolvedPathname = new URL(page.url()).pathname;

      const interactives = await getVisibleTestIdRequired(page);
      const count = await interactives.count();

      for (let i = 0; i < count; i += 1) {
        const el = interactives.nth(i);
        const testId = await el.getAttribute('data-testid').catch(() => null);
        if (testId && testId.trim()) continue;

        missing.push({
          routeId: route.id,
          routePath: route.path,
          resolvedPathname,
          tagName: await getTagName(el),
          role: await getRole(el),
          href: await getHref(el),
          label: await getStableLabel(el),
          disabled: await isDisabled(el),
        });
      }
    }

    fs.writeFileSync(
      path.join(outDir, 'missing-testid.json'),
      JSON.stringify(
        {
          mode,
          generatedAt: new Date().toISOString(),
          totalRoutes: routesToScan.length,
          routes: routesToScan,
          routeErrorCount: routeErrors.length,
          missingCount: missing.length,
          routeErrors,
          missing,
        },
        null,
        2
      )
    );

    expect(routeErrors, 'All routes must be reachable').toHaveLength(0);
    expect(missing, 'All visible interactives must have data-testid').toHaveLength(0);
  });
});
