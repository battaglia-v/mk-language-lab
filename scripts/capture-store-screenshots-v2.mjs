#!/usr/bin/env node
/**
 * Capture Play Store Screenshots v2
 *
 * Improvements:
 * - Logged-in user with profile picture
 * - English locale for most, one Macedonian
 * - Learning path with lesson tree
 * - Practice exercise with correct answer
 * - Reader with tap-to-translate demo
 * - News with rendered images
 * - No settings screenshot
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = process.env.SCREENSHOT_OUTPUT_DIR || join(ROOT, 'public', 'screenshots', 'store-v2');

const THEME = process.env.SCREENSHOT_THEME || 'light';

// Mobile viewport (target 1080x1920 by default)
const VIEWPORT = {
  width: Number(process.env.SCREENSHOT_WIDTH || 360),
  height: Number(process.env.SCREENSHOT_HEIGHT || 640),
};
const DEVICE_SCALE_FACTOR = Number(process.env.SCREENSHOT_SCALE || 3);

const BASE_URL = process.env.SCREENSHOT_URL || 'https://www.mklanguage.com';

// Test user credentials
const TEST_USER = {
  email: 'test@mklanguage.com',
  password: 'TestUser123!',
};

// Screenshot definitions
const SCREENSHOTS = [
  {
    name: '01-learn-paths',
    path: '/en/learn?level=beginner',
    locale: 'en',
    description: 'Lesson path tree showing unlock progression',
    waitFor: '[data-testid="learn-level-beginner"], [data-testid="learn-node-node-1"]',
    caption: { title: 'Structured Learning', subtitle: 'Paths from alphabet to fluency' },
  },
  {
    name: '02-lesson-alphabet',
    path: '/en/learn/lessons/alphabet',
    locale: 'en',
    description: 'Alphabet lesson with clear explanation',
    waitFor: '[data-testid="alphabet-tab-learn"]',
    caption: { title: 'Alphabet & Sounds', subtitle: 'Build your Cyrillic foundation' },
  },
  {
    name: '03-practice-session',
    path: '/en/practice/session?deck=curated&mode=multiple-choice',
    locale: 'en',
    description: 'Practice session with multiple choice answers',
    waitFor: '[data-testid="practice-session-choice-0"]',
    caption: { title: 'Practice Daily', subtitle: 'Quick exercises that build fluency' },
    interaction: async (page) => {
      await page.waitForTimeout(1500);
      const choice = page.locator('[data-testid="practice-session-choice-0"]');
      if (await choice.isVisible()) {
        await choice.click();
        await page.waitForTimeout(1000);
      }
    },
  },
  {
    name: '04-translator',
    path: '/en/translate',
    locale: 'en',
    description: 'Translator with sample translation result',
    waitFor: '[data-testid="translate-input"]',
    caption: { title: 'Instant Translation', subtitle: 'Macedonian ↔ English in a tap' },
    interaction: async (page) => {
      const textarea = page.locator('[data-testid="translate-input"]').first();
      await textarea.fill('Добро утро! Како си?');
      await page.waitForTimeout(800);
      const translateButtons = [
        page.locator('[data-testid="translate-submit-mobile"]'),
        page.locator('[data-testid="translate-submit-sticky"]'),
        page.locator('[data-testid="translate-submit-desktop"]'),
      ];
      for (const button of translateButtons) {
        if (await button.isVisible()) {
          await button.click();
          break;
        }
      }
      await page.waitForSelector('[data-testid="translate-copy"]', { timeout: 15000 }).catch(() => null);
      await page.waitForTimeout(800);
    },
  },
  {
    name: '05-reader-tap',
    path: '/en/reader/samples/day01-maliot-princ',
    locale: 'en',
    description: 'Reader with tap-to-translate feature',
    waitFor: '[data-word]',
    caption: { title: 'Tap to Translate', subtitle: 'Read real Macedonian stories' },
    hideOverlays: false,
    interaction: async (page) => {
      await page.waitForTimeout(2000);
      const word = page.locator('[data-word]').first();
      if (await word.isVisible()) {
        await word.click();
        await page.waitForTimeout(1200);
      }
    },
  },
  {
    name: '06-news',
    path: '/en/news',
    locale: 'en',
    description: 'News with article images',
    waitFor: '[data-testid="news-card"]',
    caption: { title: 'Real News', subtitle: 'Practice reading current events' },
    interaction: async (page) => {
      await page.waitForSelector('[data-testid="news-card"]', { timeout: 15000 }).catch(() => null);
      await page.waitForTimeout(4000);
    },
  },
  {
    name: '07-profile',
    path: '/en/profile',
    locale: 'en',
    description: 'User profile with stats',
    waitFor: 'text=XP',
    caption: { title: 'Track Progress', subtitle: 'XP, streaks & achievements' },
    requiresAuth: true,
  },
  {
    name: '08-macedonian-locale',
    path: '/mk/learn?level=beginner',
    locale: 'mk',
    description: 'Macedonian locale to show bilingual support',
    waitFor: '[data-testid="learn-level-beginner"], [data-testid="learn-node-node-1"]',
    caption: { title: 'Двојазична Апликација', subtitle: 'Bilingual: English & Macedonian UI' },
  },
];

async function signIn(page) {
  console.log('  🔐 Signing in...');

  try {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/en/sign-in`, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for form to load
    await page.waitForSelector('[data-testid="auth-signin-email"]', { timeout: 10000 });

    // Fill in credentials using proper testids
    await page.fill('[data-testid="auth-signin-email"]', TEST_USER.email);
    await page.fill('[data-testid="auth-signin-password"]', TEST_USER.password);

    // Click sign in button
    await page.click('[data-testid="auth-signin-submit"]');

    // Wait for navigation to complete (sign-in redirects to /learn)
    await page.waitForURL(/\/(en|mk)\/(learn|profile|practice)/, { timeout: 20000 });

    // Additional wait for page to settle
    await page.waitForTimeout(2000);

    console.log('  ✅ Signed in successfully');
    return true;
  } catch (error) {
    console.log(`  ⚠️ Sign-in failed: ${error.message}`);
    console.log('  Continuing without authentication...');
    return false;
  }
}

async function captureScreenshot(page, screen, isAuthenticated) {
  const url = `${BASE_URL}${screen.path}`;
  const outputPath = join(OUTPUT_DIR, `${screen.name}.png`);

  console.log(`\n📷 ${screen.name}: ${screen.description}`);
  console.log(`   URL: ${url}`);

  try {
    // Skip auth-required screens if not authenticated
    if (screen.requiresAuth && !isAuthenticated) {
      console.log(`   ⏭️ Skipping (requires auth)`);
      return { screen: screen.name, success: false, skipped: true };
    }

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for specific content
    if (screen.waitFor) {
      try {
        await page.waitForSelector(screen.waitFor, { timeout: 10000 });
      } catch {
        console.log(`   ⚠️ waitFor selector not found, continuing...`);
      }
    }

    // Run any custom interaction
    if (screen.interaction) {
      try {
        await screen.interaction(page);
      } catch (error) {
        console.log(`   ⚠️ Interaction failed: ${error.message}`);
      }
    }

    // Wait for animations/loading
    await page.waitForTimeout(1500);

    // Hide cookie banners and optional overlays
    await page.evaluate((hideOverlays) => {
      const cookieSelectors = ['[data-testid="cookie-banner"]', '.cookie-consent'];
      const overlaySelectors = ['[role="dialog"]', '.modal-backdrop', '[class*="tooltip"]', '[class*="Tooltip"]'];
      const selectors = hideOverlays ? cookieSelectors.concat(overlaySelectors) : cookieSelectors;
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (el instanceof HTMLElement) el.style.display = 'none';
        });
      });
    }, screen.hideOverlays !== false);

    // Capture screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: false,
    });

    console.log(`   ✅ Saved: ${screen.name}.png`);
    return { screen: screen.name, success: true, path: outputPath, caption: screen.caption };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { screen: screen.name, success: false, error: error.message };
  }
}

async function main() {
  console.log('📸 Capturing Play Store Screenshots v2\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    colorScheme: THEME === 'dark' ? 'dark' : 'light',
  });

  const page = await context.newPage();

  // Set theme preference before app scripts run
  await page.addInitScript((theme) => {
    localStorage.setItem('mk-theme', theme);
    localStorage.setItem('theme', theme);
  }, THEME);

  // Attempt to sign in
  const isAuthenticated = await signIn(page);

  const results = [];

  for (const screen of SCREENSHOTS) {
    const result = await captureScreenshot(page, screen, isAuthenticated);
    results.push(result);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  console.log(`   ✅ ${successful}/${SCREENSHOTS.length} screenshots captured`);
  if (skipped > 0) {
    console.log(`   ⏭️ ${skipped} skipped (auth required)`);
  }
  console.log(`   Output: ${OUTPUT_DIR}`);

  // Print caption info for framing
  console.log('\n📝 Captions for framing:');
  results.filter(r => r.success && r.caption).forEach(r => {
    console.log(`   ${r.screen}: "${r.caption.title}" / "${r.caption.subtitle}"`);
  });
}

main().catch(console.error);
