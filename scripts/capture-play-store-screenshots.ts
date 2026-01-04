/**
 * Play Store Screenshot Capture Script
 *
 * Captures professional screenshots for Google Play Store submission
 * - English locale (with one Macedonian example)
 * - Logged-in state with profile picture
 * - Marketing headers
 * - A1 learning path with unlock/play icons
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public/screenshots/play-store');
const PROFILE_PIC = path.join(process.cwd(), 'public/images/vinny-profile.png');

// Phone dimensions for Play Store (1080x1920)
const VIEWPORT = { width: 412, height: 915 }; // Will be scaled to 1080x1920

interface ScreenshotConfig {
  name: string;
  path: string;
  header: string;
  subheader: string;
  locale: 'en' | 'mk';
  waitForSelector?: string;
  beforeCapture?: (page: Page) => Promise<void>;
}

const SCREENSHOTS: ScreenshotConfig[] = [
  {
    name: '01-learn-home',
    path: '/en/learn',
    header: 'Start Your Journey',
    subheader: 'Structured paths from alphabet to fluency',
    locale: 'en',
    waitForSelector: '[data-testid="learn-page"]',
  },
  {
    name: '02-a1-path',
    path: '/en/learn/paths/a1',
    header: 'Learn Step by Step',
    subheader: 'Unlock lessons as you progress',
    locale: 'en',
    waitForSelector: '[data-testid="lesson-path"]',
  },
  {
    name: '03-practice-hub',
    path: '/en/practice',
    header: 'Practice That Sticks',
    subheader: 'Quick 5-minute drills that build fluency',
    locale: 'en',
    waitForSelector: '[data-testid="practice-page"]',
  },
  {
    name: '04-translator',
    path: '/en/translate',
    header: 'Instant Translation',
    subheader: 'Macedonian to English in a tap',
    locale: 'en',
    waitForSelector: '[data-testid="translate-page"]',
  },
  {
    name: '05-reader',
    path: '/en/reader',
    header: 'Read Real Macedonian',
    subheader: 'Tap any word to translate instantly',
    locale: 'en',
    waitForSelector: '[data-testid="reader-page"]',
  },
  {
    name: '06-profile',
    path: '/en/profile',
    header: 'Track Your Progress',
    subheader: 'XP, streaks, and achievements',
    locale: 'en',
    waitForSelector: '[data-testid="profile-page"]',
  },
  {
    name: '07-news',
    path: '/en/news',
    header: 'Live News Headlines',
    subheader: 'Practice reading real Macedonian',
    locale: 'en',
    waitForSelector: '[data-testid="news-page"]',
  },
  {
    name: '08-macedonian-locale',
    path: '/mk/learn',
    header: 'Available in Macedonian',
    subheader: 'Full app localization',
    locale: 'mk',
    waitForSelector: '[data-testid="learn-page"]',
  },
];

async function setupLoggedInState(page: Page): Promise<void> {
  // Set localStorage to simulate logged-in state with XP and streaks
  await page.evaluate(() => {
    localStorage.setItem('mk-daily-goal', '20');
    localStorage.setItem('mk-xp-today', '45');
    localStorage.setItem('mk-streak', '7');
    localStorage.setItem('mk-total-xp', '1250');
  });
}

async function hideLanguageToggle(page: Page): Promise<void> {
  // Hide the language toggle bar that shows circles
  await page.evaluate(() => {
    const toggles = document.querySelectorAll('[data-testid="language-toggle"], .language-toggle');
    toggles.forEach(el => (el as HTMLElement).style.display = 'none');

    // Also hide any floating elements that might be the toggle
    const floatingBars = document.querySelectorAll('[class*="macedonian"], [class*="toggle"]');
    floatingBars.forEach(el => {
      const element = el as HTMLElement;
      if (element.textContent?.includes('македонски') && element.querySelector('button')) {
        element.style.display = 'none';
      }
    });
  });
}

async function injectProfilePic(page: Page): Promise<void> {
  // Inject profile picture into any avatar/profile elements
  await page.evaluate((profileUrl) => {
    const avatars = document.querySelectorAll('[data-testid="user-avatar"], [class*="avatar"], [class*="profile-pic"]');
    avatars.forEach(el => {
      const img = el.querySelector('img') || el;
      if (img instanceof HTMLImageElement) {
        img.src = profileUrl;
      }
    });
  }, '/images/vinny-profile.png');
}

async function addMarketingHeader(
  screenshotBuffer: Buffer,
  header: string,
  subheader: string
): Promise<Buffer> {
  const HEADER_HEIGHT = 180;
  const FINAL_WIDTH = 1080;
  const FINAL_HEIGHT = 1920;

  // Create header with gradient background
  const headerSvg = `
    <svg width="${FINAL_WIDTH}" height="${HEADER_HEIGHT}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1a0a00;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0d0d;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="${FINAL_WIDTH}" height="${HEADER_HEIGHT}" fill="url(#headerGrad)"/>
      <text x="${FINAL_WIDTH/2}" y="70" font-family="SF Pro Display, -apple-system, sans-serif" font-size="48" font-weight="700" fill="white" text-anchor="middle">${header}</text>
      <text x="${FINAL_WIDTH/2}" y="115" font-family="SF Pro Display, -apple-system, sans-serif" font-size="24" fill="#888888" text-anchor="middle">${subheader}</text>
      <rect x="${FINAL_WIDTH/2 - 60}" y="135" width="120" height="4" rx="2" fill="#F7C948"/>
    </svg>
  `;

  // Resize screenshot to final dimensions minus header
  const screenshotHeight = FINAL_HEIGHT - HEADER_HEIGHT;
  const resizedScreenshot = await sharp(screenshotBuffer)
    .resize(FINAL_WIDTH, screenshotHeight, { fit: 'cover', position: 'top' })
    .toBuffer();

  // Composite header and screenshot
  const headerBuffer = Buffer.from(headerSvg);

  return sharp({
    create: {
      width: FINAL_WIDTH,
      height: FINAL_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([
      { input: await sharp(headerBuffer).png().toBuffer(), top: 0, left: 0 },
      { input: resizedScreenshot, top: HEADER_HEIGHT, left: 0 }
    ])
    .png()
    .toBuffer();
}

async function captureScreenshot(
  browser: Browser,
  config: ScreenshotConfig
): Promise<void> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2.625, // To get 1080px width (412 * 2.625 ≈ 1080)
  });

  const page = await context.newPage();

  try {
    // Setup logged-in state
    await page.goto(`${BASE_URL}${config.path}`, { waitUntil: 'networkidle' });
    await setupLoggedInState(page);
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for page content
    if (config.waitForSelector) {
      try {
        await page.waitForSelector(config.waitForSelector, { timeout: 5000 });
      } catch {
        console.log(`  Warning: Selector ${config.waitForSelector} not found, continuing...`);
      }
    }

    // Wait a bit for animations
    await page.waitForTimeout(1000);

    // Hide language toggle
    await hideLanguageToggle(page);

    // Inject profile pic
    await injectProfilePic(page);

    // Run any custom setup
    if (config.beforeCapture) {
      await config.beforeCapture(page);
    }

    // Wait for any DOM changes to settle
    await page.waitForTimeout(500);

    // Capture screenshot
    const rawScreenshot = await page.screenshot({ type: 'png' });

    // Add marketing header
    const finalScreenshot = await addMarketingHeader(
      rawScreenshot,
      config.header,
      config.subheader
    );

    // Save
    const outputPath = path.join(OUTPUT_DIR, `${config.name}.png`);
    fs.writeFileSync(outputPath, finalScreenshot);
    console.log(`  ✓ Saved: ${config.name}.png`);

  } finally {
    await context.close();
  }
}

async function main() {
  console.log('🎬 Capturing Play Store Screenshots\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if profile pic exists
  if (!fs.existsSync(PROFILE_PIC)) {
    console.log('⚠️  Profile pic not found at:', PROFILE_PIC);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const config of SCREENSHOTS) {
      console.log(`📸 Capturing: ${config.name}`);
      await captureScreenshot(browser, config);
    }

    console.log(`\n✅ All screenshots saved to: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review screenshots in the output folder');
    console.log('2. Copy to Desktop/PlayStore-Assets/phone-screenshots/');

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
