import { test, expect, type Locator, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSignedIn, signInWithCredentials } from './_auth';
import { getReleaseGateMode, isSignedInMode } from './_mode';
import { resolveGateRoutes, type GateRoute } from './_routes';
import { maybeAddDiscoveredCustomDeckEditorRoute, maybeAddDiscoveredLessonRoute } from './_discover';
import {
  closeOverlays,
  getOverlaySignature,
  getRole,
  getSignalSnapshot,
  getTagName,
  getViewportInteractivesSnapshot,
  instrumentActionSignals,
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

type VerifiedAction = {
  action: InteractionAction;
  navigationTo?: string;
  popupUrl?: string;
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
  // Establish a baseline mutation rate for noisy pages (polling/animations) so
  // we don't treat ambient re-renders as click-driven actions.
  await page.waitForTimeout(40);
  const baselineSignals = await getSignalSnapshot(page);
  const baselineDomDelta = baselineSignals.domMutations - beforeSignals.domMutations;
  const beforeAttrs = await elementActionSignature(locator).catch(() => ({}));

  const popupPromise = page.waitForEvent('popup', { timeout: 800 }).catch(() => null);
  let popupResolved = false;
  let popupValue: Page | null = null;
  popupPromise.then((popup) => {
    popupResolved = true;
    popupValue = popup;
  });

  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ timeout: 2000, noWaitAfter: true }).catch(() => {});

  const pollDelaysMs = [60, 120, 180];
  for (const delay of pollDelaysMs) {
    await page.waitForTimeout(delay);

    if (popupResolved && popupValue) {
      const popup = popupValue;
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
    if (afterSignals.audioPlayCalls > baselineSignals.audioPlayCalls) {
      return { action: 'play audio', dead: false };
    }
    if (afterSignals.speechSpeakCalls > baselineSignals.speechSpeakCalls) {
      return { action: 'play audio', dead: false };
    }
    if (afterSignals.clipboardWrites > baselineSignals.clipboardWrites) {
      return { action: 'toggle', dead: false };
    }

    const afterAttrs = await elementActionSignature(locator).catch(() => ({}));

    const attributeChanged = Object.keys({ ...beforeAttrs, ...afterAttrs }).some((key) => beforeAttrs[key] !== afterAttrs[key]);
    const domDelta = afterSignals.domMutations - baselineSignals.domMutations;
    const domChanged = domDelta > Math.max(2, baselineDomDelta + 2);

    if (attributeChanged || domChanged) {
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
    const verifiedGlobal = new Map<string, VerifiedAction>();

    const ensureModeAuth = async () => {
      if (!isSignedInMode(mode)) return;
      const ok = await hasActiveSession(page);
      if (ok) return;
      await signInWithCredentials(page, creds);
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

      await scanRoute(page, route, mode, resolvedPathname, interactions, deadClicks, ensureModeAuth, verifiedGlobal);
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
  ensureModeAuth: () => Promise<void>,
  verifiedGlobal: Map<string, VerifiedAction>
): Promise<void> {
  const debugInteractions = process.env.RELEASE_GATE_DEBUG_INTERACTIONS === 'true';
  const visited = new Set<string>();
  const safetyLimit = resolveMaxInteractionsPerRoute();

  let processed = 0;
  while (processed < safetyLimit) {
    const snapshots = await getViewportInteractivesSnapshot(page);
    const count = snapshots.length;
    let progressed = false;

    for (let i = 0; i < count && processed < safetyLimit; i += 1) {
      const snapshot = snapshots[i];
      const label = snapshot.label;
      const tagName = snapshot.tagName;
      const role = snapshot.role;
      const href = snapshot.href;
      const disabled = snapshot.disabled;
      const testId = snapshot.testId;
      const scanGroup = snapshot.scanGroup;

      const key = (() => {
        if (scanGroup) return `${scanGroup}|${tagName}|${role ?? ''}|${href ?? ''}`;
        if (testId) return `${testId}|${tagName}|${role ?? ''}|${href ?? ''}`;
        return `missing|${tagName}|${role ?? ''}|${href ?? ''}|${label}`;
      })();
      if (visited.has(key)) continue;
      visited.add(key);
      processed += 1;
      progressed = true;

      const selector = buildSelector(testId, href);
      const el = testId
        ? page.locator(`[data-testid="${testId.replace(/\"/g, '\\"')}"]`).first()
        : page.locator('body'); // Fallback: missing testid will be handled as dead-click.
      if (debugInteractions) {
        console.log(`[dead_click_scan] ${route.id} -> ${selector} (${label})`);
      }

      const globalKey = (() => {
        const base = scanGroup ? `group:${scanGroup}` : testId ? `id:${testId}` : null;
        if (!base) return null;
        return `${base}|${tagName}|${role ?? ''}|${href ?? ''}|${disabled ? 'disabled' : 'enabled'}`;
      })();

      let action: InteractionAction = 'unknown';
      let outcome: InteractionRecord['outcome'] = 'pass';
      let navigationTo: string | undefined;
      let popupUrl: string | undefined;
      let didAttemptClick = false;

      if (globalKey && verifiedGlobal.has(globalKey)) {
        const verified = verifiedGlobal.get(globalKey)!;
        action = verified.action;
        navigationTo = verified.navigationTo;
        popupUrl = verified.popupUrl;
        outcome = 'pass';
      } else if (disabled) {
        action = 'disabled-with-reason';
      } else {
        const trimmedHref = href?.trim() ?? '';
        const isAnchor = tagName === 'a';
        const isJavaScriptHref = trimmedHref.toLowerCase().startsWith('javascript:');
        const isHashOnly = trimmedHref === '#';

        const linkCheck = (() => {
          if (!isAnchor) return null;
          if (!trimmedHref || isHashOnly || isJavaScriptHref) return null;
          if (trimmedHref.startsWith('mailto:') || trimmedHref.startsWith('tel:')) return { href: trimmedHref, verify: false };
          try {
            const resolved = new URL(trimmedHref, page.url());
            const current = new URL(page.url());
            const sameOrigin = resolved.origin === current.origin;
            return { href: resolved.href, verify: sameOrigin };
          } catch {
            return null;
          }
        })();

        if (linkCheck) {
          action = 'navigate';
          navigationTo = linkCheck.href;

          if (linkCheck.verify) {
            const response = await page.request.get(linkCheck.href).catch(() => null);
            const status = response?.status() ?? 0;
            if (!response || status >= 400) {
              outcome = 'dead-click';
              deadClicks.push({
                routeId: route.id,
                routePath: route.path,
                resolvedPathname,
                selector,
                label,
                repro: [
                  `Go to ${route.path}`,
                  `Inspect ${selector} (${label})`,
                  `Expected: navigate to ${linkCheck.href}`,
                  `Observe: link resolves to HTTP ${status || 'error'}`,
                ],
              });
            }
          }
        } else {
          didAttemptClick = true;
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
      }

      if (globalKey && outcome === 'pass' && action !== 'unknown') {
        verifiedGlobal.set(globalKey, { action, navigationTo, popupUrl });
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
      if (didAttemptClick) {
        await closeOverlays(page);
      }
      await ensureModeAuth();

      if (didAttemptClick) {
        const nowPathname = new URL(page.url()).pathname;
        if (nowPathname !== resolvedPathname) {
          const wentBack = await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => null);
          if (!wentBack || new URL(page.url()).pathname !== resolvedPathname) {
            await safeGoto(page, route.path);
          }
        }

        break; // Re-query interactives after each click since the DOM likely changed.
      }
    }

    if (!progressed) break;
  }
}

function resolveMaxInteractionsPerRoute(): number {
  const explicit = Number(process.env.RELEASE_GATE_MAX_INTERACTIONS_PER_ROUTE || 0);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  try {
    const hostname = new URL(baseURL).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 90;
  } catch {}

  // Remote/prod audits should be polite and bounded by default.
  return 60;
}
