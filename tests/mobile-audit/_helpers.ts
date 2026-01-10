import { Page, Locator, expect as baseExpect, test as base } from '@playwright/test';
import { bypassNetworkInterstitial } from '../../e2e/helpers/network-interstitial';

export const test = base.extend({
  page: async ({ page }, runWithPage) => {
    const originalGoto = page.goto.bind(page);
    page.goto = (async (url, options) => {
      const response = await originalGoto(url, options);
      const bypassed = await bypassNetworkInterstitial(page);
      if (bypassed) {
        return originalGoto(url, options);
      }
      return response;
    }) as Page['goto'];
    await runWithPage(page);
  },
});

export const expect = baseExpect;

/**
 * Playwright Mobile Audit Helpers
 *
 * Utility functions for comprehensive mobile UI testing
 */

/**
 * Attach console error and page error listeners
 * Returns a function to retrieve collected errors
 */
export function attachConsoleAndPageErrors(page: Page): () => string[] {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[console.error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });

  return () => errors;
}

/**
 * Assert no raw translation keys are visible on the page
 * Catches patterns like {key}, {{key}}, t('key'), or untranslated.key
 */
export async function assertNoRawTranslationKeys(page: Page): Promise<void> {
  const text = await page.locator('body').innerText();

  // Common patterns for untranslated keys
  const patterns = [
    /\{\{[a-zA-Z_]+\}\}/,           // {{key}}
    /\{[a-zA-Z_]+\}/,               // {key}
    /t\(['"][a-zA-Z_.]+['"]\)/,     // t('key') or t("key")
    /\b[a-z]+\.[a-z]+\.[a-z]+\b/i,  // namespace.key.subkey pattern
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Allow some known safe patterns
      const safe = ['MK Language Lab', 'mk.', '.mk', '@mk'];
      const isSafe = safe.some(s => match[0].includes(s));
      if (!isSafe) {
        expect(match, `Found raw translation key: ${match[0]}`).toBeNull();
      }
    }
  }
}

/**
 * Expect URL to change or a dialog/overlay to appear after click
 */
export type ElementState = {
  ariaPressed: string | null;
  ariaSelected: string | null;
  ariaExpanded: string | null;
  dataState: string | null;
  dataActive: string | null;
};

export async function getElementState(element?: Locator): Promise<ElementState | null> {
  if (!element) return null;
  try {
    return {
      ariaPressed: await element.getAttribute('aria-pressed'),
      ariaSelected: await element.getAttribute('aria-selected'),
      ariaExpanded: await element.getAttribute('aria-expanded'),
      dataState: await element.getAttribute('data-state'),
      dataActive: await element.getAttribute('data-active'),
    };
  } catch {
    return null;
  }
}

export async function expectUrlChangeOrDialog(
  page: Page,
  beforeUrl: string,
  options?: { element?: Locator; beforeState?: ElementState | null; timeout?: number }
): Promise<void> {
  const timeout = options?.timeout ?? 3000;
  const target = options?.element;
  const startedAt = Date.now();
  const beforeState = options?.beforeState ?? await getElementState(target);
  const dialogSelectors = [
    '[role="dialog"]',
    '[role="alertdialog"]',
    '[data-state="open"]',
    '.modal',
    '.dialog',
    '.overlay',
    '.sheet',
    '.bottom-sheet',
    '[class*="Dialog"]',
    '[class*="Modal"]',
    '[class*="Sheet"]',
  ];

  while (Date.now() - startedAt < timeout) {
    if (page.url() !== beforeUrl) {
      return;
    }

    if (target) {
      const afterState = await getElementState(target);
      if (beforeState && !afterState) {
        return;
      }
      if (beforeState && afterState && JSON.stringify(beforeState) !== JSON.stringify(afterState)) {
        return;
      }
    }

    for (const selector of dialogSelectors) {
      const dialog = page.locator(selector);
      if (await dialog.count() > 0 && await dialog.first().isVisible()) {
        return;
      }
    }

    const newContent = await page.locator('[data-state="open"], [aria-expanded="true"]').count();
    if (newContent > 0) {
      return;
    }

    await page.waitForTimeout(150);
  }

  throw new Error('No URL change or dialog detected');
}

/**
 * Wait for page to be interactive (not just loaded)
 */
export async function waitForInteractive(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForSelector('html[data-hydrated="true"]', { timeout: 10000 }).catch(() => {});
  // Extra buffer for microtasks after hydration
  await page.waitForTimeout(300);
}

/**
 * Get all visible clickable elements
 */
export async function getClickableElements(page: Page) {
  return page.locator('button:visible, a:visible, [role="button"]:visible');
}

/**
 * Check if element is truly interactive (not disabled/loading)
 */
export async function isInteractive(element: ReturnType<Page['locator']>): Promise<boolean> {
  try {
    const isDisabled = await element.getAttribute('disabled');
    const ariaDisabled = await element.getAttribute('aria-disabled');
    const hasLoadingClass = await element.evaluate((el) =>
      el.className.includes('loading') || el.className.includes('disabled')
    );

    return !isDisabled && ariaDisabled !== 'true' && !hasLoadingClass;
  } catch {
    return false;
  }
}

/**
 * Mobile viewport configuration
 */
export const MOBILE_VIEWPORT = {
  width: 390,
  height: 844,
};

/**
 * All routes to audit
 */
export const ALL_ROUTES = {
  // Core pages
  home: '/en',
  learn: '/en/learn',
  pathsHub: '/en/learn/paths',
  practice: '/en/practice',
  reader: '/en/reader',
  translate: '/en/translate',
  resources: '/en/resources',

  // Learning paths
  pathA1: '/en/learn/paths/a1',
  pathA2: '/en/learn/paths/a2',
  path30Day: '/en/learn/paths/30day',

  // Lessons
  lessonAlphabet: '/en/learn/lessons/alphabet',

  // Practice modes
  practiceWordSprint: '/en/practice/word-sprint',
  practiceGrammar: '/en/practice/grammar',

  // Reader samples (first 5 days)
  readerCafe: '/en/reader/samples/cafe-conversation',
  readerDay01: '/en/reader/samples/day01-maliot-princ',
  readerDay02: '/en/reader/samples/day02-maliot-princ',
  readerDay03: '/en/reader/samples/day03-maliot-princ',
  readerDay04: '/en/reader/samples/day04-maliot-princ',
  readerDay05: '/en/reader/samples/day05-maliot-princ',
  readerDayInSkopje: '/en/reader/samples/day-in-skopje',

  // Settings & profile
  settings: '/en/settings',
  profile: '/en/profile',
  help: '/en/help',
  about: '/en/about',
  news: '/en/news',

  // Auth (signed out)
  signIn: '/auth/signin',
  signUp: '/auth/signup',

  // Upgrade
  upgrade: '/en/upgrade',
};

/**
 * All reader sample IDs
 */
export const READER_SAMPLE_IDS = [
  'cafe-conversation',
  'day01-maliot-princ',
  'day02-maliot-princ',
  'day03-maliot-princ',
  'day04-maliot-princ',
  'day05-maliot-princ',
  'day06-maliot-princ',
  'day07-maliot-princ',
  'day08-maliot-princ',
  'day09-maliot-princ',
  'day10-maliot-princ',
  'day11-maliot-princ',
  'day12-maliot-princ',
  'day13-maliot-princ',
  'day14-maliot-princ',
  'day15-maliot-princ',
  'day16-maliot-princ',
  'day17-maliot-princ',
  'day18-maliot-princ',
  'day19-maliot-princ',
  'day20-maliot-princ',
  'day21-maliot-princ',
  'day22-maliot-princ',
  'day23-maliot-princ',
  'day24-maliot-princ',
  'day25-maliot-princ',
  'day26-maliot-princ',
  'day27-maliot-princ',
  'day28-maliot-princ',
  'day29-maliot-princ',
  'day30-maliot-princ',
  'day-in-skopje',
];

/**
 * Practice decks
 */
export const PRACTICE_DECKS = [
  'curated',
  'numbers-time-v1',
  'household-v1',
  'weather-seasons-v1',
  'body-health-v1',
  'activities-hobbies-v1',
  'clothing-appearance-v1',
  'cyrillic-alphabet-v1',
];

/**
 * Learning path IDs
 */
export const LEARNING_PATH_IDS = [
  'a1',
  'a2',
  '30day',
];
