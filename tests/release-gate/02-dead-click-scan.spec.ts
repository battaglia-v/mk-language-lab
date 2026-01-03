import { test, expect, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSignedIn, signInWithCredentials } from './_auth';
import { getReleaseGateMode, isSignedInMode } from './_mode';
import { resolveGateRoutes, type GateRoute } from './_routes';
import { maybeAddDiscoveredCustomDeckEditorRoute, maybeAddDiscoveredLessonRoute } from './_discover';
import {
  closeOverlays,
  getDomSignature,
  getHref,
  getOverlaySignature,
  getRole,
  getSignalSnapshot,
  getStableLabel,
  getTagName,
  getVisibleInteractives,
  instrumentActionSignals,
  isDisabled,
  safeGoto,
} from './_scan-utils';

type InteractionAction = 'navigate' | 'open modal' | 'submit' | 'toggle' | 'play audio' | 'disabled-with-reason' | 'unknown';

type InteractionRecord = {
  routeId: string;
  routePath: string;
  resolvedPathname: string;
  mode: string;
  testId: string | null;
  selector: string;
  tagName: string;
  role: string | null;
  href: string | null;
  label: string;
  disabled: boolean;
  action: InteractionAction;
  outcome: 'pass' | 'dead-click';
  navigationTo?: string;
  popupUrl?: string;
};

type DeadClick = {
  routeId: string;
  routePath: string;
  resolvedPathname: string;
  selector: string;
  label: string;
  repro: string[];
};

type RouteError = {
  routeId: string;
  routePath: string;
  error: string;
};

async function hasActiveSession(page: Page): Promise<boolean> {
  const resp = await page.request.get('/api/auth/session');
  if (!resp.ok()) return false;
  const json = await resp.json().catch(() => null);
  if (!json || typeof json !== 'object') return false;
  return Boolean((json as { user?: unknown }).user);
}

function buildSelector(testId: string | null, href: string | null): string {
  if (!testId) return '<missing data-testid>';
  const escaped = testId.replace(/"/g, '\\"');
  if (href) {
    const escapedHref = href.replace(/"/g, '\\"');
    return `[data-testid="${escaped}"][href="${escapedHref}"]`;
  }
  return `[data-testid="${escaped}"]`;
}

async function elementActionSignature(locator: Locator): Promise<Record<string, string | null>> {
  return locator.evaluate((node) => {
    const el = node as HTMLElement;
    const attrs: Array<[string, string | null]> = [
      ['aria-expanded', el.getAttribute('aria-expanded')],
      ['aria-pressed', el.getAttribute('aria-pressed')],
      ['aria-checked', el.getAttribute('aria-checked')],
      ['data-state', el.getAttribute('data-state')],
      ['data-selected', el.getAttribute('data-selected')],
      ['class', el.getAttribute('class')],
    ];
    return Object.fromEntries(attrs);
  });
}

async function clickAndDetect(page: Page, locator: Locator): Promise<{
  action: InteractionAction;
  dead: boolean;
  navigationTo?: string;
  popupUrl?: string;
}> {
  const tagName = await getTagName(locator);
  const role = await getRole(locator);

  const beforeUrl = page.url();
  const beforeOverlay = await getOverlaySignature(page);
  const beforeSignals = await getSignalSnapshot(page);
  const beforeDom = await getDomSignature(page);
  const beforeAttrs = await elementActionSignature(locator).catch(() => ({}));

  const popupPromise = page.waitForEvent('popup', { timeout: 1200 }).catch(() => null);
  let popupResolved = false;
  let popupValue: Page | null = null;
  popupPromise.then((popup) => {
    popupResolved = true;
    popupValue = popup;
  });

  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ timeout: 2000 }).catch(() => {});

  const pollDelaysMs = [120, 200, 300, 450];
  for (const delay of pollDelaysMs) {
    await page.waitForTimeout(delay);

    if (popupResolved && popupValue) {
      const popup = popupValue;
      await popup.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      const popupUrl = popup.url();
      await popup.close().catch(() => {});
      return { action: 'navigate', dead: false, popupUrl };
    }

    const afterUrl = page.url();
    if (afterUrl !== beforeUrl) {
      return { action: 'navigate', dead: false, navigationTo: afterUrl };
    }

    const afterOverlay = await getOverlaySignature(page);
    if (afterOverlay.openCount > beforeOverlay.openCount) {
      return { action: 'open modal', dead: false };
    }

    const afterSignals = await getSignalSnapshot(page);
    if (afterSignals.audioPlayCalls > beforeSignals.audioPlayCalls) {
      return { action: 'play audio', dead: false };
    }
    if (afterSignals.speechSpeakCalls > beforeSignals.speechSpeakCalls) {
      return { action: 'play audio', dead: false };
    }
    if (afterSignals.clipboardWrites > beforeSignals.clipboardWrites) {
      return { action: 'toggle', dead: false };
    }

    const afterDom = await getDomSignature(page);
    const afterAttrs = await elementActionSignature(locator).catch(() => ({}));

    const attributeChanged = Object.keys({ ...beforeAttrs, ...afterAttrs }).some((key) => beforeAttrs[key] !== afterAttrs[key]);
    const activeChanged = beforeDom.activeElementTag !== afterDom.activeElementTag;
    const textChanged = beforeDom.textLength !== afterDom.textLength;

    if (attributeChanged || activeChanged || textChanged) {
      const submitType = await locator.getAttribute('type').catch(() => null);
      if (tagName === 'button' && submitType === 'submit') {
        return { action: 'submit', dead: false };
      }
      if (role === 'switch' || role === 'tab' || role === 'checkbox') {
        return { action: 'toggle', dead: false };
      }
      return { action: 'toggle', dead: false };
    }
  }

  if (popupResolved && popupValue) {
    const popup = popupValue;
    await popup.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    const popupUrl = popup.url();
    await popup.close().catch(() => {});
    return { action: 'navigate', dead: false, popupUrl };
  }

  return { action: 'unknown', dead: true };
}

test.describe.serial('release gate: dead_click_scan', () => {
  test('all visible interactives cause an observable action', async ({ page }) => {
    test.setTimeout(45 * 60 * 1000);
    const mode = getReleaseGateMode();
    const outDir = path.join(process.cwd(), 'test-results', 'release-gate', mode);
    fs.mkdirSync(outDir, { recursive: true });

    await instrumentActionSignals(page);
    const creds = await ensureSignedIn(page, mode);

    const routes = await resolveGateRoutes();
    await maybeAddDiscoveredLessonRoute(page, routes);
    await maybeAddDiscoveredCustomDeckEditorRoute(page, routes);
    const maxRoutes = Number(process.env.RELEASE_GATE_MAX_ROUTES || 0);
    const routesToScan = maxRoutes > 0 ? routes.slice(0, maxRoutes) : routes;
    const interactions: InteractionRecord[] = [];
    const deadClicks: DeadClick[] = [];
    const routeErrors: RouteError[] = [];

    const ensureModeAuth = async () => {
      if (!isSignedInMode(mode)) return;
      const ok = await hasActiveSession(page);
      if (ok) return;
      await signInWithCredentials(page, creds, mode);
    };

    for (const route of routesToScan) {
      await ensureModeAuth();
      console.log(`[dead_click_scan] Visiting ${route.id} ${route.path}`);
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

      await scanRoute(page, route, mode, resolvedPathname, interactions, deadClicks, ensureModeAuth);
    }

    fs.writeFileSync(
      path.join(outDir, 'interaction-inventory.json'),
      JSON.stringify(
        {
          mode,
          generatedAt: new Date().toISOString(),
          totalRoutes: routesToScan.length,
          routes: routesToScan,
          totalInteractions: interactions.length,
          routeErrorCount: routeErrors.length,
          deadClickCount: deadClicks.length,
          routeErrors,
          interactions,
          deadClicks,
        },
        null,
        2
      )
    );

    expect(routeErrors, 'All routes must be reachable').toHaveLength(0);
    expect(deadClicks, '0 dead-click detections').toHaveLength(0);
  });
});

async function scanRoute(
  page: Page,
  route: GateRoute,
  mode: string,
  resolvedPathname: string,
  interactions: InteractionRecord[],
  deadClicks: DeadClick[],
  ensureModeAuth: () => Promise<void>
): Promise<void> {
  const visited = new Set<string>();
  const safetyLimit = 250;

  for (let step = 0; step < safetyLimit; step += 1) {
    const candidates = await getVisibleInteractives(page);
    const count = await candidates.count();
    let progressed = false;

    for (let i = 0; i < count; i += 1) {
      const el = candidates.nth(i);
      const label = await getStableLabel(el);
      const tagName = await getTagName(el);
      const role = await getRole(el);
      const href = await getHref(el);
      const disabled = await isDisabled(el);
      const testId = await el.getAttribute('data-testid').catch(() => null);
      const scanGroup = await el.getAttribute('data-scan-group').catch(() => null);

      const key = scanGroup
        ? `${scanGroup}|${tagName}|${role ?? ''}|${href ?? ''}`
        : `${testId ?? 'missing'}|${tagName}|${role ?? ''}|${href ?? ''}|${label}`;
      if (visited.has(key)) continue;
      visited.add(key);
      progressed = true;

      const selector = buildSelector(testId, href);
      let action: InteractionAction = 'unknown';
      let outcome: InteractionRecord['outcome'] = 'pass';
      let navigationTo: string | undefined;
      let popupUrl: string | undefined;

      if (disabled) {
        action = 'disabled-with-reason';
      } else {
        const result = await clickAndDetect(page, el);
        action = result.action;
        navigationTo = result.navigationTo;
        popupUrl = result.popupUrl;
        if (result.dead) {
          outcome = 'dead-click';
          deadClicks.push({
            routeId: route.id,
            routePath: route.path,
            resolvedPathname,
            selector,
            label,
            repro: [
              `Go to ${route.path}`,
              `Click ${selector} (${label})`,
              'Observe: no navigation, modal, or state change',
            ],
          });
        }
      }

      interactions.push({
        routeId: route.id,
        routePath: route.path,
        resolvedPathname,
        mode,
        testId,
        selector,
        tagName,
        role,
        href,
        label,
        disabled,
        action,
        outcome,
        navigationTo,
        popupUrl,
      });

      // Normalize state so subsequent clicks are still on this route.
      await closeOverlays(page);
      await ensureModeAuth();

      const nowPathname = new URL(page.url()).pathname;
      if (nowPathname !== resolvedPathname) {
        await safeGoto(page, route.path);
      }

      break; // Re-query interactives after each click
    }

    if (!progressed) break;
  }
}
