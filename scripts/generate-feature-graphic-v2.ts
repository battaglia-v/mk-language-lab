/**
 * Generate Modern Feature Graphic for Play Store
 *
 * Creates a 1024x500 feature graphic that matches the app's style
 * - Dark theme with gold accents
 * - App icon prominently displayed
 * - Key features highlighted
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'public/feature-graphic-v2.png');
const ICON_PATH = path.join(process.cwd(), 'public/icon-512.png');

async function generateFeatureGraphic() {
  const WIDTH = 1024;
  const HEIGHT = 500;

  // Create the feature graphic with SVG
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background gradient -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0a"/>
          <stop offset="50%" style="stop-color:#1a1510"/>
          <stop offset="100%" style="stop-color:#0d0d0d"/>
        </linearGradient>

        <!-- Gold accent gradient -->
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#F7C948"/>
          <stop offset="100%" style="stop-color:#ff9500"/>
        </linearGradient>

        <!-- Glow effect -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>

        <!-- Icon shadow -->
        <filter id="iconShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="#F7C948" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)"/>

      <!-- Decorative elements -->
      <circle cx="100" cy="100" r="200" fill="#F7C948" opacity="0.03"/>
      <circle cx="${WIDTH - 100}" cy="${HEIGHT - 100}" r="250" fill="#F7C948" opacity="0.02"/>

      <!-- Gold accent line -->
      <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#goldGrad)"/>

      <!-- App Title -->
      <text x="580" y="160" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="72" font-weight="800" fill="#F7C948">
        Македонски
      </text>

      <text x="580" y="220" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="#ffffff">
        MK Language Lab
      </text>

      <!-- Tagline -->
      <text x="580" y="290" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="22" fill="#888888">
        Learn Macedonian the modern way
      </text>

      <!-- Feature pills -->
      <g transform="translate(580, 330)">
        <!-- Pill 1 -->
        <rect x="0" y="0" width="130" height="36" rx="18" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
        <text x="65" y="24" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">📚 Lessons</text>

        <!-- Pill 2 -->
        <rect x="145" y="0" width="130" height="36" rx="18" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
        <text x="210" y="24" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">🎯 Practice</text>

        <!-- Pill 3 -->
        <rect x="290" y="0" width="130" height="36" rx="18" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
        <text x="355" y="24" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">🔄 Translate</text>
      </g>

      <!-- Free badge -->
      <g transform="translate(580, 400)">
        <rect x="0" y="0" width="80" height="32" rx="16" fill="url(#goldGrad)"/>
        <text x="40" y="22" font-family="SF Pro Display, -apple-system, Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#000000" text-anchor="middle">FREE</text>
      </g>

      <!-- Macedonian flag colors accent -->
      <g transform="translate(580, 450)">
        <rect x="0" y="0" width="30" height="4" rx="2" fill="#D20000"/>
        <rect x="35" y="0" width="30" height="4" rx="2" fill="#FFE600"/>
      </g>
    </svg>
  `;

  // Load the app icon
  const iconBuffer = fs.readFileSync(ICON_PATH);

  // Resize icon for the graphic
  const resizedIcon = await sharp(iconBuffer)
    .resize(280, 280)
    .png()
    .toBuffer();

  // Create the base graphic
  const baseGraphic = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  // Create rounded corners mask for icon
  const iconMask = Buffer.from(`
    <svg width="280" height="280">
      <rect width="280" height="280" rx="56" fill="white"/>
    </svg>
  `);

  // Apply rounded corners to icon
  const roundedIcon = await sharp(resizedIcon)
    .composite([{
      input: await sharp(iconMask).png().toBuffer(),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // Composite everything together
  const finalGraphic = await sharp(baseGraphic)
    .composite([
      {
        input: roundedIcon,
        top: 110,
        left: 120,
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(OUTPUT_PATH, finalGraphic);
  console.log(`✅ Feature graphic saved to: ${OUTPUT_PATH}`);
}

generateFeatureGraphic().catch(console.error);
