import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSignedIn } from './_auth';
import { getReleaseGateMode } from './_mode';
import { resolveGateRoutes } from './_routes';
import { maybeAddDiscoveredCustomDeckEditorRoute, maybeAddDiscoveredLessonRoute } from './_discover';
import {
  instrumentActionSignals,
  TESTID_REQUIRED_SELECTOR,
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
    let missingTotal = 0;
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

      const maxDetails = Number(process.env.RELEASE_GATE_MAX_MISSING_DETAILS_PER_ROUTE || 500);
      const missingOnRoute = await page.evaluate(
        ({ selector, maxDetails: max }: { selector: string; maxDetails: number }) => {
          const results: Array<{
            tagName: string;
            role: string | null;
            href: string | null;
            label: string;
            disabled: boolean;
          }> = [];
          let missingCount = 0;

          const isVisible = (el: Element): boolean => {
            const node = el as HTMLElement;
            const style = window.getComputedStyle(node);
            if (style.display === 'none') return false;
            if (style.visibility === 'hidden') return false;
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          };

          const isDisabled = (el: Element): boolean => {
            const node = el as HTMLElement;
            const ariaDisabled = node.getAttribute('aria-disabled');
            if (ariaDisabled === 'true') return true;
            if ('disabled' in (node as any) && Boolean((node as any).disabled)) return true;
            return false;
          };

          const stableLabel = (el: Element): string => {
            const node = el as HTMLElement;
            const attrs = ['data-scan-label', 'aria-label', 'title', 'placeholder', 'value'] as const;
            for (const attr of attrs) {
              const value = node.getAttribute(attr);
              if (value && value.trim()) return value.trim();
            }
            const text = node.innerText?.replace(/\s+/g, ' ').trim();
            if (text) return text;
            const imgAlt = node.querySelector('img[alt]')?.getAttribute('alt');
            if (imgAlt && imgAlt.trim()) return imgAlt.trim();
            return node.tagName.toLowerCase();
          };

          const nodes = Array.from(document.querySelectorAll(selector));
          for (const el of nodes) {
            if (!isVisible(el)) continue;
            const testId = el.getAttribute('data-testid');
            if (testId && testId.trim()) continue;

            missingCount += 1;
            if (results.length < max) {
              results.push({
                tagName: el.tagName.toLowerCase(),
                role: el.getAttribute('role'),
                href: el.getAttribute('href'),
                label: stableLabel(el),
                disabled: isDisabled(el),
              });
            }

            // Keep counting even if we stop collecting details.
          }

          return { results, missingCount, scanned: nodes.length };
        },
        { selector: TESTID_REQUIRED_SELECTOR, maxDetails }
      );

      missingTotal += missingOnRoute.missingCount;
      for (const entry of missingOnRoute.results) {
        missing.push({
          routeId: route.id,
          routePath: route.path,
          resolvedPathname,
          ...entry,
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
          missingCount: missingTotal,
          missingDetailsCount: missing.length,
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
