/**
 * Play Store Screenshot Capture v3
 * - News: scrolled to show articles
 * - Profile: centered with XP/streak stats
 * - Quiz: show correct answer with confetti
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public/screenshots/play-store-v3');
const PROFILE_PIC_URL = '/images/vinny-profile.png';

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

async function hideTopBar(page: any) {
  await page.evaluate(() => {
    document.querySelectorAll('[class*="rounded"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 150 && rect.width > 200 && rect.width < 400 && rect.height < 60) {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('македонски') || text.includes('sign in')) {
          (el as HTMLElement).style.opacity = '0';
        }
      }
    });
  });
}

async function captureNews(page: any, outputDir: string) {
  console.log('  → 07-news (scrolled to articles)');
  await page.goto(`${BASE_URL}/en/news`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await hideTopBar(page);

  // Scroll down to show news articles
  await page.evaluate(() => {
    window.scrollBy(0, 250);
  });
  await page.waitForTimeout(500);

  const raw = await page.screenshot({ type: 'png' });
  const final = await addHeader(raw, 'Live News Headlines', 'Practice reading real Macedonian');
  fs.writeFileSync(path.join(outputDir, '07-news.png'), final);
}

async function captureProfile(page: any, outputDir: string) {
  console.log('  → 06-profile (with stats)');
  await page.goto(`${BASE_URL}/en/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await hideTopBar(page);

  // Replace profile content with rich mock data
  await page.evaluate((picUrl: string) => {
    const container = document.querySelector('main') || document.body;

    // Find and replace the profile area
    const cards = container.querySelectorAll('[class*="card"], [class*="Card"]');
    let replaced = false;

    cards.forEach(card => {
      const text = card.textContent || '';
      if ((text.includes('Sign in') || text.includes('PROFILE')) && !replaced) {
        replaced = true;
        (card as HTMLElement).innerHTML = `
          <div style="padding: 24px; text-align: center; background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px;">
            <img src="${picUrl}" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 16px; border: 4px solid #F7C948; box-shadow: 0 0 20px rgba(247, 201, 72, 0.3);" />
            <h2 style="color: white; font-size: 28px; margin: 0 0 4px 0; font-weight: 700;">Vinny B</h2>
            <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">Learning since Dec 2024</p>

            <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #F7C948;">1,250</div>
                <div style="font-size: 12px; color: #888; text-transform: uppercase;">Total XP</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #ff6b35;">🔥 7</div>
                <div style="font-size: 12px; color: #888; text-transform: uppercase;">Day Streak</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #4ade80;">12</div>
                <div style="font-size: 12px; color: #888; text-transform: uppercase;">Lessons</div>
              </div>
            </div>

            <div style="background: #252525; border-radius: 12px; padding: 16px; margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #888; font-size: 14px;">Today's Progress</span>
                <span style="color: #F7C948; font-size: 14px; font-weight: 600;">45 / 50 XP</span>
              </div>
              <div style="background: #333; border-radius: 8px; height: 8px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #F7C948, #ff9500); width: 90%; height: 100%; border-radius: 8px;"></div>
              </div>
            </div>
          </div>
        `;
      }
    });
  }, PROFILE_PIC_URL);

  await page.waitForTimeout(300);
  const raw = await page.screenshot({ type: 'png' });
  const final = await addHeader(raw, 'Track Your Progress', 'XP, streaks, and achievements');
  fs.writeFileSync(path.join(outputDir, '06-profile.png'), final);
}

async function captureQuiz(page: any, outputDir: string) {
  console.log('  → 04-quiz (correct answer with confetti)');

  // Navigate to a practice session - vocabulary is good for this
  await page.goto(`${BASE_URL}/en/practice/vocabulary`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await hideTopBar(page);

  // Create a mock quiz screen with correct answer and confetti
  await page.evaluate(() => {
    const container = document.querySelector('main') || document.body;

    (container as HTMLElement).innerHTML = `
      <div style="min-height: 100vh; background: #0a0a0a; padding: 20px; position: relative; overflow: hidden;">
        <!-- Confetti -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; overflow: hidden;">
          ${Array.from({length: 50}, (_, i) => {
            const colors = ['#F7C948', '#ff6b35', '#4ade80', '#60a5fa', '#f472b6'];
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const size = 8 + Math.random() * 8;
            return `<div style="position: absolute; left: ${left}%; top: ${-20 + Math.random() * 60}%; width: ${size}px; height: ${size}px; background: ${color}; border-radius: ${Math.random() > 0.5 ? '50%' : '2px'}; transform: rotate(${Math.random() * 360}deg);"></div>`;
          }).join('')}
        </div>

        <!-- Question Card -->
        <div style="background: #1a1a1a; border-radius: 20px; padding: 32px 24px; margin-top: 40px; position: relative; border: 2px solid #4ade80;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="background: #4ade80; color: #000; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">✓ Correct!</span>
          </div>

          <p style="color: #888; font-size: 14px; text-align: center; margin-bottom: 8px;">Translate this word:</p>
          <h2 style="color: white; font-size: 36px; text-align: center; margin: 0 0 32px 0; font-weight: 700;">Добро утро</h2>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: #4ade80; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
              <span style="color: #000; font-size: 18px; font-weight: 600;">Good morning</span>
              <span style="font-size: 24px;">✓</span>
            </div>
            <div style="background: #252525; border-radius: 12px; padding: 16px 20px;">
              <span style="color: #666; font-size: 18px;">Good night</span>
            </div>
            <div style="background: #252525; border-radius: 12px; padding: 16px 20px;">
              <span style="color: #666; font-size: 18px;">Hello</span>
            </div>
            <div style="background: #252525; border-radius: 12px; padding: 16px 20px;">
              <span style="color: #666; font-size: 18px;">Goodbye</span>
            </div>
          </div>
        </div>

        <!-- XP Earned -->
        <div style="text-align: center; margin-top: 24px;">
          <span style="color: #F7C948; font-size: 24px; font-weight: 700;">+10 XP</span>
        </div>

        <!-- Continue Button -->
        <div style="position: absolute; bottom: 40px; left: 20px; right: 20px;">
          <button style="width: 100%; background: #F7C948; color: #000; border: none; border-radius: 12px; padding: 18px; font-size: 18px; font-weight: 700;">
            Continue
          </button>
        </div>
      </div>
    `;
  });

  await page.waitForTimeout(300);
  const raw = await page.screenshot({ type: 'png' });
  const final = await addHeader(raw, 'Learn by Doing', 'Interactive quizzes with instant feedback');
  fs.writeFileSync(path.join(outputDir, '04-quiz.png'), final);
}

async function main() {
  console.log('📸 Capturing updated screenshots v3...\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 732 },
    deviceScaleFactor: 2.625,
  });

  const page = await ctx.newPage();

  // Capture the three updated screenshots
  await captureProfile(page, OUTPUT_DIR);
  await captureQuiz(page, OUTPUT_DIR);
  await captureNews(page, OUTPUT_DIR);

  await browser.close();

  // Copy to Desktop, replacing old versions
  const desktopDir = path.join(process.env.HOME!, 'Desktop/PlayStore-Assets/phone-screenshots');
  ['04-quiz.png', '06-profile.png', '07-news.png'].forEach(file => {
    const src = path.join(OUTPUT_DIR, file);
    if (fs.existsSync(src)) {
      // Remove old translator if exists
      const oldTranslator = path.join(desktopDir, '04-translator.png');
      if (fs.existsSync(oldTranslator)) fs.unlinkSync(oldTranslator);

      fs.copyFileSync(src, path.join(desktopDir, file));
    }
  });

  console.log(`\n✅ Updated screenshots copied to Desktop`);
}

main().catch(console.error);
