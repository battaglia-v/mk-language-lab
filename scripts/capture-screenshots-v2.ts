/**
 * Play Store Screenshot Capture v2
 * - Hides language toggle bar completely
 * - Shows logged-in state with profile pic
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public/screenshots/play-store-v2');
const PROFILE_PIC_URL = '/images/vinny-profile.png';

const SCREENSHOTS = [
  { name: '01-learn-home', path: '/en/learn', header: 'Start Your Journey', sub: 'Structured paths from alphabet to fluency' },
  { name: '02-a1-path', path: '/en/learn?level=beginner', header: 'Learn Step by Step', sub: 'Unlock lessons as you progress' },
  { name: '03-practice', path: '/en/practice', header: 'Practice That Sticks', sub: 'Quick 5-minute drills that build fluency' },
  { name: '04-translator', path: '/en/translate', header: 'Instant Translation', sub: 'Macedonian to English in a tap' },
  { name: '05-reader', path: '/en/reader', header: 'Read Real Macedonian', sub: 'Tap any word to translate instantly' },
  { name: '06-profile', path: '/en/profile', header: 'Track Your Progress', sub: 'XP, streaks, and achievements', mockProfile: true },
  { name: '07-news', path: '/en/news', header: 'Live News Headlines', sub: 'Practice reading real Macedonian' },
  { name: '08-mk-locale', path: '/mk/learn', header: 'Достапно на македонски', sub: 'Full Macedonian localization' },
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

async function hideTopBar(page: any) {
  await page.evaluate(() => {
    // Hide the entire top bar with language toggle
    const topBars = document.querySelectorAll('div');
    topBars.forEach(el => {
      const text = el.textContent || '';
      const hasLanguageToggle = text.includes('македонски') && text.includes('Sign In');
      const hasFlag = el.innerHTML.includes('🇲🇰') || el.innerHTML.includes('flag');
      const isSmallBar = el.getBoundingClientRect().height < 80 && el.getBoundingClientRect().height > 30;

      if ((hasLanguageToggle || hasFlag) && isSmallBar) {
        (el as HTMLElement).style.display = 'none';
      }
    });

    // More aggressive: hide anything with "македонски" text at the top
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 100 && rect.height < 80) {
        const text = el.textContent || '';
        if (text.includes('македонски') && text.includes('Sign In')) {
          (el as HTMLElement).style.display = 'none';
        }
      }
    });

    // Hide specific toggle patterns - look for rounded pill with flags
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

async function mockLoggedInProfile(page: any, profilePicUrl: string) {
  await page.evaluate((picUrl: string) => {
    // Find profile section and replace content
    const profileCards = document.querySelectorAll('[class*="card"], [class*="Card"]');

    profileCards.forEach(card => {
      const text = card.textContent || '';
      if (text.includes('Sign in to view') || text.includes('PROFILE SIGN-IN')) {
        // Replace with mock logged-in content
        (card as HTMLElement).innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <img src="${picUrl}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px; border: 3px solid #F7C948;" />
            <h3 style="color: white; font-size: 20px; margin: 0 0 4px 0;">Vinny B</h3>
            <p style="color: #888; font-size: 14px; margin: 0;">Learning since Dec 2024</p>
          </div>
        `;
      }
    });

    // Update any "Sign In" buttons to show profile avatar
    document.querySelectorAll('button, a').forEach(el => {
      if (el.textContent?.trim() === 'Sign In') {
        (el as HTMLElement).innerHTML = `<img src="${picUrl}" style="width: 32px; height: 32px; border-radius: 50%;" />`;
      }
    });
  }, profilePicUrl);
}

async function main() {
  console.log('📸 Capturing Play Store screenshots v2...\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 732 },
    deviceScaleFactor: 2.625,
  });

  const page = await ctx.newPage();

  // Set localStorage for XP display
  await page.goto(`${BASE_URL}/en/learn`);
  await page.evaluate(() => {
    localStorage.setItem('mk-daily-goal', '20');
    localStorage.setItem('mk-xp-today', '45');
    localStorage.setItem('mk-streak', '7');
    localStorage.setItem('mk-total-xp', '1250');
  });

  for (const s of SCREENSHOTS) {
    console.log(`  → ${s.name}`);
    await page.goto(`${BASE_URL}${s.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Hide language toggle bar
    await hideTopBar(page);

    // Mock logged-in state for profile
    if ((s as any).mockProfile) {
      await mockLoggedInProfile(page, PROFILE_PIC_URL);
    }

    await page.waitForTimeout(300);

    const raw = await page.screenshot({ type: 'png' });
    const final = await addHeader(raw, s.header, s.sub);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${s.name}.png`), final);
  }

  await browser.close();

  // Copy to Desktop folder
  const desktopDir = path.join(process.env.HOME!, 'Desktop/PlayStore-Assets/phone-screenshots');
  if (fs.existsSync(desktopDir)) {
    fs.readdirSync(OUTPUT_DIR).forEach(file => {
      fs.copyFileSync(path.join(OUTPUT_DIR, file), path.join(desktopDir, file));
    });
    console.log(`\n📁 Also copied to: ${desktopDir}`);
  }

  // Copy feature graphic
  const fgSrc = path.join(process.cwd(), 'public/feature-graphic-v2.png');
  const fgDest = path.join(process.env.HOME!, 'Desktop/PlayStore-Assets/feature-graphic/feature-graphic.png');
  if (fs.existsSync(fgSrc) && fs.existsSync(path.dirname(fgDest))) {
    fs.copyFileSync(fgSrc, fgDest);
    console.log(`📁 Feature graphic copied to Desktop`);
  }

  console.log(`\n✅ Done! Screenshots in: ${OUTPUT_DIR}`);
}

main().catch(console.error);
