/**
 * Simple Play Store Screenshot Capture
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public/screenshots/play-store');

const SCREENSHOTS = [
  { name: '01-learn-home', path: '/en/learn', header: 'Start Your Journey', sub: 'Structured paths from alphabet to fluency' },
  { name: '02-a1-path', path: '/en/learn?level=beginner', header: 'Learn Step by Step', sub: 'Unlock lessons as you progress' },
  { name: '03-practice', path: '/en/practice', header: 'Practice That Sticks', sub: 'Quick 5-minute drills that build fluency' },
  { name: '04-translator', path: '/en/translate', header: 'Instant Translation', sub: 'Macedonian to English in a tap' },
  { name: '05-reader', path: '/en/reader', header: 'Read Real Macedonian', sub: 'Tap any word to translate instantly' },
  { name: '06-profile', path: '/en/profile', header: 'Track Your Progress', sub: 'XP, streaks, and achievements' },
  { name: '07-news', path: '/en/news', header: 'Live News Headlines', sub: 'Practice reading real Macedonian' },
  { name: '08-mk-locale', path: '/mk/learn', header: 'Достапно на македонски', sub: 'Full app localization' },
];

async function addHeader(screenshot: Buffer, header: string, sub: string): Promise<Buffer> {
  const W = 1080, H = 1920, HDR = 160;

  const svg = `<svg width="${W}" height="${HDR}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#1a0800"/>
        <stop offset="100%" style="stop-color:#000000;stop-opacity:0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${HDR}" fill="url(#g)"/>
    <text x="${W/2}" y="65" font-family="system-ui,-apple-system,sans-serif" font-size="44" font-weight="700" fill="white" text-anchor="middle">${header}</text>
    <text x="${W/2}" y="105" font-family="system-ui,-apple-system,sans-serif" font-size="22" fill="#888" text-anchor="middle">${sub}</text>
    <rect x="${W/2-50}" y="125" width="100" height="4" rx="2" fill="#F7C948"/>
  </svg>`;

  const resized = await sharp(screenshot).resize(W, H - HDR, { fit: 'cover', position: 'top' }).toBuffer();

  return sharp({ create: { width: W, height: H, channels: 4, background: '#000' } })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: resized, top: HDR, left: 0 }
    ])
    .png().toBuffer();
}

async function main() {
  console.log('📸 Capturing screenshots...\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 732 },
    deviceScaleFactor: 2.625,
  });

  const page = await ctx.newPage();

  // Set up logged-in state with XP
  await page.goto(`${BASE_URL}/en/learn`);
  await page.evaluate(() => {
    localStorage.setItem('mk-daily-goal', '20');
    localStorage.setItem('mk-xp-today', '45');
    localStorage.setItem('mk-streak', '7');
  });

  for (const s of SCREENSHOTS) {
    console.log(`  → ${s.name}`);
    await page.goto(`${BASE_URL}${s.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Hide language toggle if present
    await page.evaluate(() => {
      document.querySelectorAll('[class*="toggle"], [class*="language"]').forEach(el => {
        const e = el as HTMLElement;
        if (e.textContent?.includes('македонски') || e.textContent?.includes('English')) {
          if (e.closest('nav') === null) e.style.display = 'none';
        }
      });
    });

    const raw = await page.screenshot({ type: 'png' });
    const final = await addHeader(raw, s.header, s.sub);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${s.name}.png`), final);
  }

  await browser.close();
  console.log(`\n✅ Done! Screenshots in: ${OUTPUT_DIR}`);
}

main().catch(console.error);
