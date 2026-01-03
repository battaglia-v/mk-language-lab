#!/usr/bin/env node
/**
 * Capture Play Store Screenshots using Playwright
 * Captures 8 key screens in mobile viewport (1080x1920 portrait)
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'public', 'screenshots', 'store');

// Mobile viewport (portrait, 1080x1920 for Play Store)
const VIEWPORT = { width: 412, height: 915 }; // Pixel 7 dimensions, will be scaled
const DEVICE_SCALE_FACTOR = 2.625; // For 1080x1920 output

const BASE_URL = process.env.SCREENSHOT_URL || 'https://mklanguage.com';

const SCREENS = [
  { name: '01-learn-home', path: '/mk/learn', description: 'Learn page with paths' },
  { name: '02-practice-hub', path: '/mk/practice', description: 'Practice hub' },
  { name: '03-translator', path: '/mk/translate', description: 'Translator' },
  { name: '04-reader', path: '/mk/reader', description: 'Reader samples' },
  { name: '05-profile', path: '/mk/profile', description: 'Profile & stats' },
  { name: '06-discover', path: '/mk/discover', description: 'Discover feed' },
  { name: '07-news', path: '/mk/news', description: 'News headlines' },
  { name: '08-settings', path: '/mk/settings', description: 'Settings' },
];

async function captureScreenshots() {
  console.log('📸 Capturing Play Store screenshots...\n');
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
    locale: 'mk-MK',
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  // Set dark theme preference
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
  });

  const results = [];

  for (const screen of SCREENS) {
    const url = `${BASE_URL}${screen.path}`;
    const outputPath = join(OUTPUT_DIR, `${screen.name}.png`);

    console.log(`📷 ${screen.name}: ${screen.description}`);
    console.log(`   URL: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for content to render
      await page.waitForTimeout(2000);

      // Hide any cookie banners or modals
      await page.evaluate(() => {
        const selectors = [
          '[data-testid="cookie-banner"]',
          '.cookie-consent',
          '[role="dialog"]',
          '.modal-backdrop',
        ];
        selectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => el.remove());
        });
      });

      // Capture screenshot
      await page.screenshot({
        path: outputPath,
        fullPage: false,
      });

      console.log(`   ✅ Saved: ${screen.name}.png\n`);
      results.push({ screen: screen.name, success: true, path: outputPath });
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      results.push({ screen: screen.name, success: false, error: error.message });
    }
  }

  await browser.close();

  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  console.log(`   ${successful}/${SCREENS.length} screenshots captured`);
  console.log(`   Output directory: ${OUTPUT_DIR}`);

  if (successful < SCREENS.length) {
    console.log('\n⚠️  Some screenshots failed. You may need to capture these manually.');
  }

  return results;
}

// Run
captureScreenshots().catch(console.error);
