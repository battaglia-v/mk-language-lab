/**
 * Modern Feature Graphic v3
 * - Centered, balanced layout
 * - Sleek dark design with subtle gradients
 * - Phone mockup showing app
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'public/feature-graphic-v3.png');
const ICON_PATH = path.join(process.cwd(), 'public/icon-512.png');

async function generateFeatureGraphic() {
  const W = 1024;
  const H = 500;

  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Rich dark gradient background -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f0f0f"/>
          <stop offset="30%" style="stop-color:#1a1208"/>
          <stop offset="70%" style="stop-color:#0d0d0d"/>
          <stop offset="100%" style="stop-color:#0a0a0a"/>
        </linearGradient>

        <!-- Gold gradient for accents -->
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#F7C948"/>
          <stop offset="50%" style="stop-color:#ffdb70"/>
          <stop offset="100%" style="stop-color:#F7C948"/>
        </linearGradient>

        <!-- Subtle glow -->
        <radialGradient id="glowGrad" cx="30%" cy="50%" r="60%">
          <stop offset="0%" style="stop-color:#F7C948;stop-opacity:0.08"/>
          <stop offset="100%" style="stop-color:#F7C948;stop-opacity:0"/>
        </radialGradient>

        <!-- Icon glow filter -->
        <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" result="blur"/>
          <feFlood flood-color="#F7C948" flood-opacity="0.4"/>
          <feComposite in2="blur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

      <!-- Ambient glow -->
      <rect width="${W}" height="${H}" fill="url(#glowGrad)"/>

      <!-- Subtle grid pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.3" opacity="0.03"/>
      </pattern>
      <rect width="${W}" height="${H}" fill="url(#grid)"/>

      <!-- Bottom accent line -->
      <rect x="0" y="${H - 3}" width="${W}" height="3" fill="url(#goldGrad)"/>

      <!-- LEFT SIDE: Icon + Text (centered vertically) -->
      <g transform="translate(120, ${H/2 - 100})">
        <!-- App name in Cyrillic -->
        <text x="180" y="50" font-family="SF Pro Display, -apple-system, Helvetica Neue, sans-serif" font-size="56" font-weight="800" fill="url(#goldGrad)">
          Македонски
        </text>

        <!-- Subtitle -->
        <text x="180" y="95" font-family="SF Pro Display, -apple-system, Helvetica Neue, sans-serif" font-size="24" font-weight="500" fill="#ffffff" opacity="0.9">
          MK Language Lab
        </text>

        <!-- Tagline -->
        <text x="180" y="140" font-family="SF Pro Display, -apple-system, Helvetica Neue, sans-serif" font-size="18" fill="#888888">
          Learn Macedonian the smart way
        </text>

        <!-- Feature tags -->
        <g transform="translate(180, 165)">
          <rect x="0" y="0" width="90" height="32" rx="16" fill="#1f1f1f" stroke="#333" stroke-width="1"/>
          <text x="45" y="21" font-family="SF Pro Display, -apple-system, sans-serif" font-size="13" fill="#fff" text-anchor="middle">Lessons</text>

          <rect x="100" y="0" width="90" height="32" rx="16" fill="#1f1f1f" stroke="#333" stroke-width="1"/>
          <text x="145" y="21" font-family="SF Pro Display, -apple-system, sans-serif" font-size="13" fill="#fff" text-anchor="middle">Practice</text>

          <rect x="200" y="0" width="100" height="32" rx="16" fill="#1f1f1f" stroke="#333" stroke-width="1"/>
          <text x="250" y="21" font-family="SF Pro Display, -apple-system, sans-serif" font-size="13" fill="#fff" text-anchor="middle">Translate</text>
        </g>
      </g>

      <!-- RIGHT SIDE: Phone mockup frame -->
      <g transform="translate(${W - 280}, 50)">
        <!-- Phone bezel -->
        <rect x="0" y="0" width="180" height="380" rx="24" fill="#1a1a1a" stroke="#333" stroke-width="2"/>

        <!-- Phone screen area -->
        <rect x="8" y="8" width="164" height="364" rx="18" fill="#0d0d0d"/>

        <!-- Screen content preview -->
        <g transform="translate(16, 24)">
          <!-- Mini header -->
          <text x="0" y="14" font-family="SF Pro Display, -apple-system, sans-serif" font-size="11" fill="#F7C948" font-weight="600">Learn Macedonian</text>

          <!-- Mini card -->
          <rect x="0" y="28" width="148" height="50" rx="8" fill="#1f1f1f"/>
          <text x="12" y="48" font-family="SF Pro Display, -apple-system, sans-serif" font-size="10" fill="#fff" font-weight="600">A1 Foundations</text>
          <text x="12" y="62" font-family="SF Pro Display, -apple-system, sans-serif" font-size="8" fill="#888">Master the basics</text>

          <!-- Mini lesson node -->
          <circle cx="74" cy="115" r="22" fill="#F7C948"/>
          <text x="74" y="120" font-family="SF Pro Display, -apple-system, sans-serif" font-size="11" fill="#000" text-anchor="middle" font-weight="700">▶</text>
          <text x="74" y="150" font-family="SF Pro Display, -apple-system, sans-serif" font-size="9" fill="#fff" text-anchor="middle">Alphabet</text>

          <!-- Locked nodes -->
          <circle cx="74" cy="195" r="18" fill="#333" stroke="#444" stroke-width="1"/>
          <text x="74" y="200" font-family="SF Pro Display, -apple-system, sans-serif" font-size="10" fill="#666" text-anchor="middle">🔒</text>

          <circle cx="74" cy="255" r="18" fill="#333" stroke="#444" stroke-width="1"/>
          <text x="74" y="260" font-family="SF Pro Display, -apple-system, sans-serif" font-size="10" fill="#666" text-anchor="middle">🔒</text>

          <!-- Progress bar -->
          <rect x="0" y="300" width="148" height="6" rx="3" fill="#333"/>
          <rect x="0" y="300" width="45" height="6" rx="3" fill="#F7C948"/>
        </g>

        <!-- Phone notch -->
        <rect x="60" y="12" width="60" height="6" rx="3" fill="#000"/>
      </g>

      <!-- FREE badge -->
      <g transform="translate(180, ${H - 60})">
        <rect x="0" y="0" width="70" height="28" rx="14" fill="url(#goldGrad)"/>
        <text x="35" y="19" font-family="SF Pro Display, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#000" text-anchor="middle">FREE</text>
      </g>
    </svg>
  `;

  // Load and resize icon
  const iconBuffer = fs.readFileSync(ICON_PATH);
  const resizedIcon = await sharp(iconBuffer)
    .resize(140, 140)
    .png()
    .toBuffer();

  // Create rounded icon mask
  const iconMask = Buffer.from(`
    <svg width="140" height="140">
      <rect width="140" height="140" rx="32" fill="white"/>
    </svg>
  `);

  const roundedIcon = await sharp(resizedIcon)
    .composite([{
      input: await sharp(iconMask).png().toBuffer(),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // Create base graphic
  const baseGraphic = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  // Composite icon onto graphic
  const finalGraphic = await sharp(baseGraphic)
    .composite([
      {
        input: roundedIcon,
        top: 150,  // Centered vertically
        left: 120, // Left side
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(OUTPUT_PATH, finalGraphic);

  // Also copy to Desktop
  const desktopPath = path.join(process.env.HOME!, 'Desktop/PlayStore-Assets/feature-graphic/feature-graphic.png');
  fs.copyFileSync(OUTPUT_PATH, desktopPath);

  console.log(`✅ Feature graphic saved to: ${OUTPUT_PATH}`);
  console.log(`📁 Copied to Desktop`);
}

generateFeatureGraphic().catch(console.error);
