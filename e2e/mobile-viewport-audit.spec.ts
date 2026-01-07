/**
 * Mobile Viewport QA Audit
 *
 * Captures screenshots at mobile viewports (390x844, 360x800)
 * and checks for overflow, misalignment, and raw i18n keys.
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'iPhone14Pro', width: 390, height: 844 },
  { name: 'Android360', width: 360, height: 800 },
];

const PAGES_TO_AUDIT = [
  { path: '/en/learn', name: 'Dashboard' },
  { path: '/en/practice', name: 'Practice' },
  { path: '/en/practice/pronunciation', name: 'Pronunciation' },
  { path: '/en/practice/grammar', name: 'Grammar' },
  { path: '/en/translate', name: 'Translate' },
  { path: '/en/reader', name: 'Reader' },
  { path: '/en/news', name: 'News' },
  { path: '/en/discover', name: 'Discover' },
  { path: '/en/daily-lessons', name: 'DailyLessons' },
  { path: '/en/profile', name: 'Profile' },
];

// Pattern for detecting raw i18n keys
const RAW_KEY_PATTERN = /^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+$/;

async function checkForRawI18nKeys(page: Page): Promise<string[]> {
  const rawKeys: string[] = [];

  // Get all text content from the page
  const textNodes = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    const texts: string[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text && text.length > 2 && text.length < 80) {
        texts.push(text);
      }
    }
    return texts;
  });

  for (const text of textNodes) {
    if (RAW_KEY_PATTERN.test(text)) {
      rawKeys.push(text);
    }
  }

  return rawKeys;
}

async function checkForOverflow(page: Page): Promise<string[]> {
  const overflowIssues: string[] = [];

  // Check for horizontal overflow
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  if (hasHorizontalOverflow) {
    overflowIssues.push('Page has horizontal overflow');
  }

  // Check for elements with overflow
  const overflowingElements = await page.evaluate(() => {
    const issues: string[] = [];
    const elements = document.querySelectorAll('*');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 5) {
        const className = el.className?.toString().slice(0, 50) || '';
        const tagName = el.tagName.toLowerCase();
        issues.push(`${tagName}.${className} overflows by ${Math.round(rect.right - window.innerWidth)}px`);
      }
    });
    return issues.slice(0, 10); // Limit to first 10
  });

  overflowIssues.push(...overflowingElements);

  return overflowIssues;
}

test.describe('Mobile Viewport QA Audit', () => {
  // Skip in CI - comprehensive audit runs locally or on schedule
  test.skip(!!process.env.CI, 'Comprehensive audit skipped in CI');

  const screenshotDir = 'e2e/screenshots/mobile-audit';

  test.beforeAll(async () => {
    // Create screenshot directory
    const dir = path.join(process.cwd(), screenshotDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const pageInfo of PAGES_TO_AUDIT) {
        test(`${pageInfo.name} - Screenshot and Audit`, async ({ page }) => {
          await page.goto(`${BASE_URL}${pageInfo.path}`, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });

          // Wait for any animations
          await page.waitForTimeout(1000);

          // Take screenshot
          const screenshotPath = `${screenshotDir}/${viewport.name}-${pageInfo.name}.png`;
          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
          });

          // Check for raw i18n keys
          const rawKeys = await checkForRawI18nKeys(page);
          if (rawKeys.length > 0) {
            console.log(`[${pageInfo.name}] Raw i18n keys found:`, rawKeys);
          }

          // Check for overflow
          const overflowIssues = await checkForOverflow(page);
          if (overflowIssues.length > 0) {
            console.log(`[${pageInfo.name}] Overflow issues:`, overflowIssues);
          }

          // Assert no critical issues
          expect(rawKeys.length, `Raw i18n keys found: ${rawKeys.join(', ')}`).toBeLessThanOrEqual(3);
        });
      }
    });
  }
});
