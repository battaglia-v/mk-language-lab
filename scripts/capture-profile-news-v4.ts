/**
 * Capture Profile & News Screenshots v4
 * - Profile: Full custom mockup with stats
 * - News: Scroll to show actual articles
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public/screenshots/play-store-v4');

async function addHeader(screenshot: Buffer, header: string, sub: string): Promise<Buffer> {
  const W = 1080, H = 1920, HDR = 160;
  const svg = `<svg width="${W}" height="${HDR}">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a0800"/>
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0"/>
    </linearGradient></defs>
    <rect width="${W}" height="${HDR}" fill="url(#g)"/>
    <text x="${W/2}" y="65" font-family="system-ui,-apple-system,sans-serif" font-size="44" font-weight="700" fill="white" text-anchor="middle">${header}</text>
    <text x="${W/2}" y="105" font-family="system-ui,-apple-system,sans-serif" font-size="22" fill="#888" text-anchor="middle">${sub}</text>
    <rect x="${W/2-50}" y="125" width="100" height="4" rx="2" fill="#F7C948"/>
  </svg>`;
  const resized = await sharp(screenshot).resize(W, H - HDR, { fit: 'cover', position: 'top' }).toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: '#000' } })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, { input: resized, top: HDR, left: 0 }])
    .png().toBuffer();
}

async function captureProfile(page: any, outputDir: string) {
  console.log('  → 06-profile (full custom)');

  // Create a completely custom profile page
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          padding: 24px 20px;
        }
        .profile-card {
          background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%);
          border-radius: 24px;
          padding: 32px 24px;
          text-align: center;
          border: 1px solid #2a2a2a;
        }
        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #F7C948;
          box-shadow: 0 0 30px rgba(247, 201, 72, 0.3);
          margin-bottom: 16px;
          object-fit: cover;
        }
        .name { color: white; font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .subtitle { color: #888; font-size: 15px; margin-bottom: 28px; }
        .stats {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 28px;
        }
        .stat { text-align: center; }
        .stat-value { font-size: 36px; font-weight: 700; }
        .stat-value.gold { color: #F7C948; }
        .stat-value.orange { color: #ff6b35; }
        .stat-value.green { color: #4ade80; }
        .stat-label { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .progress-card {
          background: #252525;
          border-radius: 16px;
          padding: 20px;
          margin-top: 20px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .progress-label { color: #888; font-size: 14px; }
        .progress-value { color: #F7C948; font-size: 14px; font-weight: 600; }
        .progress-bar {
          background: #333;
          border-radius: 8px;
          height: 10px;
          overflow: hidden;
        }
        .progress-fill {
          background: linear-gradient(90deg, #F7C948, #ff9500);
          height: 100%;
          width: 90%;
          border-radius: 8px;
        }
        .badges-section {
          margin-top: 24px;
          text-align: left;
        }
        .badges-title {
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .badges-row {
          display: flex;
          gap: 12px;
        }
        .badge {
          width: 56px;
          height: 56px;
          background: #1f1f1f;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
      </style>
    </head>
    <body>
      <div class="profile-card">
        <img src="/images/vinny-profile.png" class="avatar" />
        <div class="name">Vinny B</div>
        <div class="subtitle">Learning since December 2024</div>

        <div class="stats">
          <div class="stat">
            <div class="stat-value gold">1,250</div>
            <div class="stat-label">Total XP</div>
          </div>
          <div class="stat">
            <div class="stat-value orange">🔥 7</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat">
            <div class="stat-value green">12</div>
            <div class="stat-label">Lessons</div>
          </div>
        </div>

        <div class="progress-card">
          <div class="progress-header">
            <span class="progress-label">Today's Goal</span>
            <span class="progress-value">45 / 50 XP</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <div class="badges-section">
          <div class="badges-title">Recent Achievements</div>
          <div class="badges-row">
            <div class="badge">🎯</div>
            <div class="badge">📚</div>
            <div class="badge">🔥</div>
            <div class="badge">⭐</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `, { waitUntil: 'networkidle' });

  await page.waitForTimeout(500);
  const raw = await page.screenshot({ type: 'png' });
  const final = await addHeader(raw, 'Track Your Progress', 'XP, streaks, and achievements');
  fs.writeFileSync(path.join(outputDir, '06-profile.png'), final);
}

async function captureNews(page: any, outputDir: string) {
  console.log('  → 07-news (scrolled to articles)');

  await page.goto(`${BASE_URL}/en/news`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for news to load

  // Scroll down to show articles
  await page.evaluate(() => {
    window.scrollBy(0, 400);
  });
  await page.waitForTimeout(1000);

  // Hide top bar
  await page.evaluate(() => {
    document.querySelectorAll('[class*="rounded"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 150 && rect.width > 200 && rect.height < 60) {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('македонски') || text.includes('sign in')) {
          (el as HTMLElement).style.opacity = '0';
        }
      }
    });
  });

  await page.waitForTimeout(300);
  const raw = await page.screenshot({ type: 'png' });
  const final = await addHeader(raw, 'Live News Headlines', 'Practice reading real Macedonian');
  fs.writeFileSync(path.join(outputDir, '07-news.png'), final);
}

async function main() {
  console.log('📸 Capturing profile & news v4...\n');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 732 },
    deviceScaleFactor: 2.625,
  });
  const page = await ctx.newPage();

  await captureProfile(page, OUTPUT_DIR);
  await captureNews(page, OUTPUT_DIR);

  await browser.close();

  // Copy to Desktop
  const desktopDir = path.join(process.env.HOME!, 'Desktop/PlayStore-Assets/phone-screenshots');
  ['06-profile.png', '07-news.png'].forEach(file => {
    const src = path.join(OUTPUT_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(desktopDir, file));
    }
  });

  console.log(`\n✅ Screenshots updated and copied to Desktop`);
}

main().catch(console.error);
