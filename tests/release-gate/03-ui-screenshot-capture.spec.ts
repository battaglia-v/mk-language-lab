import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSignedIn } from './_auth';
import { getReleaseGateMode } from './_mode';
import { MAJOR_ROUTE_IDS, resolveGateRoutes } from './_routes';
import { maybeAddDiscoveredCustomDeckEditorRoute, maybeAddDiscoveredLessonRoute } from './_discover';
import { instrumentActionSignals, safeGoto } from './_scan-utils';

const VIEWPORTS = [
  { id: '390x844', width: 390, height: 844 },
  { id: '360x800', width: 360, height: 800 },
];

test.describe.serial('ui audit: screenshots', () => {
  test('capture major route screenshots (mobile-first)', async ({ page }) => {
    test.setTimeout(20 * 60 * 1000);
    const mode = getReleaseGateMode();
    const outDir = path.join(process.cwd(), 'docs', 'ui-audit', 'screenshots');
    fs.mkdirSync(outDir, { recursive: true });

    await instrumentActionSignals(page);
    await ensureSignedIn(page, mode);

    const routes = await resolveGateRoutes();
    await maybeAddDiscoveredLessonRoute(page, routes);
    await maybeAddDiscoveredCustomDeckEditorRoute(page, routes);
    const major = routes.filter((r) => (MAJOR_ROUTE_IDS as readonly string[]).includes(r.id));

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const viewportDir = path.join(outDir, viewport.id);
      fs.mkdirSync(viewportDir, { recursive: true });

      for (const route of major) {
        console.log(`[ui_screenshot_capture] ${viewport.id} ${route.id} ${route.path}`);
        await safeGoto(page, route.path);
        await page.waitForTimeout(650);

        const fileName = `${route.id}.png`;
        await page.screenshot({ path: path.join(viewportDir, fileName), fullPage: true });
      }
    }
  });
});
