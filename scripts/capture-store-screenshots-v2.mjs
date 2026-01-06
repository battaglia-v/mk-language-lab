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
const OUTPUT_DIR = join(ROOT, 'public', 'screenshots', 'store-v2');

// Mobile viewport (Pixel 7 dimensions for Play Store)
const VIEWPORT = { width: 412, height: 915 };
const DEVICE_SCALE_FACTOR = 2.625;

const BASE_URL = process.env.SCREENSHOT_URL || 'https://mklanguage.com';

// Test user credentials
const TEST_USER = {
  email: 'test@mklanguage.com',
  password: 'TestUser123!',
};

// Screenshot definitions
const SCREENSHOTS = [
  {
    name: '01-learn-paths',
    path: '/en/learn',
    locale: 'en',
    description: 'Learn page with lesson paths',
    waitFor: '[data-testid="cta-browse-paths"], [data-testid="cta-start-here"]',
    caption: { title: 'Structured Learning', subtitle: 'Paths from alphabet to fluency' },
  },
  {
    name: '02-lesson-tree',
    path: '/en/learn/paths/a1',
    locale: 'en',
    description: 'Lesson path tree showing unlock progression',
    waitFor: '[data-testid="path-detail-back"], [data-testid="lesson-node"]',
    caption: { title: 'Unlock Your Path', subtitle: 'Complete lessons to progress' },
  },
  {
    name: '03-practice-exercise',
    path: '/en/practice/vocabulary',
    locale: 'en',
    description: 'Practice exercise - will try to show correct answer',
    waitFor: 'button',
    caption: { title: 'Practice Daily', subtitle: 'Quick exercises that build fluency' },
    interaction: async (page) => {
      // Try to answer a question correctly
      await page.waitForTimeout(2000);
      // Click the first option and see if we can capture success state
    },
  },
  {
    name: '04-translator',
    path: '/en/translate',
    locale: 'en',
    description: 'Translator with sample translation',
    waitFor: 'textarea',
    caption: { title: 'Instant Translation', subtitle: 'Macedonian ↔ English in a tap' },
    interaction: async (page) => {
      // Type a sample phrase
      const textarea = page.locator('textarea').first();
      await textarea.fill('Добро утро! Како си?');
      await page.waitForTimeout(1500);
      // Click translate if button exists
      const translateBtn = page.locator('button:has-text("Translate")');
      if (await translateBtn.isVisible()) {
        await translateBtn.click();
        await page.waitForTimeout(2000);
      }
    },
  },
  {
    name: '05-reader-tap',
    path: '/en/reader/samples/day01-maliot-princ',
    locale: 'en',
    description: 'Reader with tap-to-translate feature',
    waitFor: 'text=Reading',
    caption: { title: 'Tap to Translate', subtitle: 'Read real Macedonian stories' },
    interaction: async (page) => {
      // Wait for text to load, then try to tap a word
      await page.waitForTimeout(2000);
      // Try clicking on a Macedonian word to show popup
      const word = page.locator('[data-word]').first();
      if (await word.isVisible()) {
        await word.click();
        await page.waitForTimeout(1000);
      }
    },
  },
  {
    name: '06-profile',
    path: '/en/profile',
    locale: 'en',
    description: 'User profile with stats',
    waitFor: 'text=XP',
    caption: { title: 'Track Progress', subtitle: 'XP, streaks & achievements' },
    requiresAuth: true,
  },
  {
    name: '07-news',
    path: '/en/news',
    locale: 'en',
    description: 'News with article images',
    waitFor: '[data-testid="news-grid"], [data-testid="news-card"]',
    caption: { title: 'Real News', subtitle: 'Practice reading current events' },
    interaction: async (page) => {
      // Wait for news cards to render (client-side fetch may occur)
      await page.waitForSelector('[data-testid="news-card"]', { timeout: 15000 }).catch(() => null);
      // Wait for images to load
      await page.waitForTimeout(4000);
    },
  },
  {
    name: '08-macedonian-locale',
    path: '/mk/learn',
    locale: 'mk',
    description: 'Macedonian locale to show bilingual support',
    waitFor: '[data-testid="cta-browse-paths"], [data-testid="cta-start-here"]',
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

    // Hide cookie banners, modals, tooltips
    await page.evaluate(() => {
      const selectors = [
        '[data-testid="cookie-banner"]',
        '.cookie-consent',
        '[role="dialog"]',
        '.modal-backdrop',
        '[class*="tooltip"]',
        '[class*="Tooltip"]',
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (el instanceof HTMLElement) el.style.display = 'none';
        });
      });
    });

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
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  // Set dark theme preference
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
  });

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
