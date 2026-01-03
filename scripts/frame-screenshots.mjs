#!/usr/bin/env node
/**
 * Create framed Play Store screenshots with captions
 * Adds a gradient header with caption text above each screenshot
 */

import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT_DIR = join(ROOT, 'public', 'screenshots', 'store');
const OUTPUT_DIR = join(ROOT, 'public', 'screenshots', 'store-framed');

// Final dimensions for Play Store (portrait phone)
const FINAL_WIDTH = 1080;
const FINAL_HEIGHT = 1920;
const HEADER_HEIGHT = 320;
const SCREENSHOT_HEIGHT = FINAL_HEIGHT - HEADER_HEIGHT;

// Brand colors
const COLORS = {
  background: '#080B12',
  primary: '#FF5A2C',
  amber: '#F59E0B',
  text: '#FFFFFF',
  subtext: '#94A3B8',
};

// Screenshot captions (title + subtitle)
const CAPTIONS = {
  '01-learn-home': {
    title: 'Start Your Journey',
    subtitle: 'Structured paths from alphabet to fluency',
  },
  '02-practice-hub': {
    title: 'Practice That Sticks',
    subtitle: 'Quick 5-minute drills that build fluency',
  },
  '03-translator': {
    title: 'Instant Translation',
    subtitle: 'Macedonian to English in a tap',
  },
  '04-reader': {
    title: 'Read Real Macedonian',
    subtitle: 'Tap any word to translate instantly',
  },
  '05-profile': {
    title: 'Track Your Progress',
    subtitle: 'XP, streaks and stats that motivate',
  },
  '06-discover': {
    title: 'Discover Macedonia',
    subtitle: 'Culture, tips and curated content',
  },
  '07-news': {
    title: 'Live News Headlines',
    subtitle: 'Practice reading real Macedonian',
  },
  '08-settings': {
    title: 'Your Way, Your Pace',
    subtitle: 'Privacy-first, no ads ever',
  },
};

async function createFramedScreenshot(inputPath, outputPath, caption) {
  console.log(`  Creating framed: ${caption.title}`);

  // Read and resize original screenshot to fit the space below header
  const screenshot = await sharp(inputPath)
    .resize(FINAL_WIDTH, SCREENSHOT_HEIGHT, { fit: 'cover', position: 'top' })
    .toBuffer();

  // Create header SVG with gradient background and caption
  const headerSvg = `
    <svg width="${FINAL_WIDTH}" height="${HEADER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.primary}" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="${COLORS.background}" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${COLORS.primary}"/>
          <stop offset="100%" stop-color="${COLORS.amber}"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="${COLORS.background}"/>
      <rect width="100%" height="100%" fill="url(#headerGrad)"/>

      <!-- Decorative circle -->
      <circle cx="540" cy="80" r="45" fill="${COLORS.primary}" opacity="0.15"/>

      <!-- Title -->
      <text x="540" y="160"
            font-family="SF Pro Display, -apple-system, Arial, sans-serif"
            font-size="56"
            font-weight="700"
            fill="${COLORS.text}"
            text-anchor="middle">
        ${caption.title}
      </text>

      <!-- Subtitle -->
      <text x="540" y="220"
            font-family="SF Pro Display, -apple-system, Arial, sans-serif"
            font-size="30"
            font-weight="400"
            fill="${COLORS.subtext}"
            text-anchor="middle">
        ${caption.subtitle}
      </text>

      <!-- Accent line -->
      <rect x="390" y="260" width="300" height="5" rx="2.5" fill="url(#accentGrad)"/>
    </svg>
  `;

  // Create the header image
  const header = await sharp(Buffer.from(headerSvg)).png().toBuffer();

  // Composite header + screenshot vertically
  const background = await sharp({
    create: {
      width: FINAL_WIDTH,
      height: FINAL_HEIGHT,
      channels: 4,
      background: { r: 8, g: 11, b: 18, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  await sharp(background)
    .composite([
      { input: header, top: 0, left: 0 },
      { input: screenshot, top: HEADER_HEIGHT, left: 0 },
    ])
    .png()
    .toFile(outputPath);
}

async function main() {
  console.log('📸 Creating framed screenshots with captions...\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Process each screenshot
  const files = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.png'));

  for (const file of files) {
    const key = file.replace('.png', '');
    const caption = CAPTIONS[key];

    if (!caption) {
      console.log(`  ⚠️  No caption for: ${file}`);
      continue;
    }

    const inputPath = join(INPUT_DIR, file);
    const outputPath = join(OUTPUT_DIR, file);

    await createFramedScreenshot(inputPath, outputPath, caption);
  }

  console.log(`\n✅ Framed screenshots saved to: ${OUTPUT_DIR}`);
  console.log(`   Ready for Play Store upload!`);
}

main().catch(console.error);
