#!/usr/bin/env node
/**
 * Generate app icon assets for MK Language Lab
 *
 * Design: Cyrillic "М" with book spine accent
 * Palette: Red (#DC2626) + Yellow/Gold (#F7C948) - Macedonian flag inspired
 *
 * Outputs:
 * - icon-512.png (Play Store)
 * - icon-512-maskable.png (Play Store maskable)
 * - icon-192.png (PWA)
 * - apple-touch-icon.png (180x180)
 * - favicon-64x64.png
 * - favicon-32x32.png
 * - favicon-16x16.png
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// Macedonian flag-inspired palette
const COLORS = {
  primary: '#DC2626',      // Red
  accent: '#F7C948',       // Yellow/Gold
  background: '#1A1A1A',   // Dark background
  backgroundLight: '#2A2A2A',
};

/**
 * Generate the main icon SVG
 * Design: Bold Cyrillic "М" with subtle book spine accent on left
 */
function generateIconSVG(size, maskable = false) {
  // For maskable icons, we need extra padding (safe zone is 80% of icon)
  const padding = maskable ? size * 0.1 : size * 0.08;
  const innerSize = size - (padding * 2);

  // Book spine width (left accent bar)
  const spineWidth = size * 0.06;
  const spineX = padding;
  const spineHeight = innerSize * 0.75;
  const spineY = padding + (innerSize - spineHeight) / 2;
  const spineRadius = spineWidth / 2;

  // Letter "М" positioning
  const letterX = padding + spineWidth + (size * 0.04);
  const letterWidth = innerSize - spineWidth - (size * 0.04);
  const letterY = padding;
  const letterHeight = innerSize;

  // Calculate М letter geometry
  const strokeWidth = size * 0.09;
  const letterLeft = letterX + strokeWidth / 2;
  const letterRight = letterX + letterWidth - strokeWidth / 2;
  const letterTop = letterY + strokeWidth / 2 + (size * 0.05);
  const letterBottom = letterY + letterHeight - strokeWidth / 2 - (size * 0.05);
  const letterMiddle = (letterLeft + letterRight) / 2;
  const vHeight = letterBottom - letterTop;
  const peakY = letterTop + vHeight * 0.35;

  // Background with subtle gradient
  const bgGradientId = `bg-gradient-${size}`;
  const accentGradientId = `accent-gradient-${size}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="${bgGradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.background}"/>
      <stop offset="100%" style="stop-color:${COLORS.backgroundLight}"/>
    </linearGradient>

    <!-- Accent bar gradient -->
    <linearGradient id="${accentGradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.accent}"/>
      <stop offset="100%" style="stop-color:#E5A835"/>
    </linearGradient>

    <!-- Letter shadow -->
    <filter id="letter-shadow-${size}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.01}" stdDeviation="${size * 0.015}" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#${bgGradientId})"/>

  <!-- Book spine accent bar -->
  <rect
    x="${spineX}"
    y="${spineY}"
    width="${spineWidth}"
    height="${spineHeight}"
    rx="${spineRadius}"
    fill="url(#${accentGradientId})"
  />

  <!-- Cyrillic М letter -->
  <path
    d="M ${letterLeft} ${letterBottom}
       L ${letterLeft} ${letterTop}
       L ${letterMiddle} ${peakY}
       L ${letterRight} ${letterTop}
       L ${letterRight} ${letterBottom}"
    fill="none"
    stroke="${COLORS.primary}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#letter-shadow-${size})"
  />
</svg>`;
}

/**
 * Generate a simple favicon SVG (smaller, bolder design)
 */
function generateFaviconSVG(size) {
  const padding = size * 0.12;
  const innerSize = size - (padding * 2);

  // For small sizes, just use the М without the book spine
  const strokeWidth = size * 0.15;
  const letterLeft = padding + strokeWidth / 2;
  const letterRight = size - padding - strokeWidth / 2;
  const letterTop = padding + strokeWidth / 2;
  const letterBottom = size - padding - strokeWidth / 2;
  const letterMiddle = size / 2;
  const vHeight = letterBottom - letterTop;
  const peakY = letterTop + vHeight * 0.35;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${COLORS.background}"/>
  <path
    d="M ${letterLeft} ${letterBottom}
       L ${letterLeft} ${letterTop}
       L ${letterMiddle} ${peakY}
       L ${letterRight} ${letterTop}
       L ${letterRight} ${letterBottom}"
    fill="none"
    stroke="${COLORS.primary}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;
}

// Generate all icon sizes
const icons = [
  { name: 'icon-512.svg', size: 512, generator: generateIconSVG },
  { name: 'icon-512-maskable.svg', size: 512, generator: (s) => generateIconSVG(s, true) },
  { name: 'icon-192.svg', size: 192, generator: generateIconSVG },
  { name: 'apple-touch-icon.svg', size: 180, generator: generateIconSVG },
  { name: 'favicon-64x64.svg', size: 64, generator: generateFaviconSVG },
  { name: 'favicon-32x32.svg', size: 32, generator: generateFaviconSVG },
  { name: 'favicon-16x16.svg', size: 16, generator: generateFaviconSVG },
];

console.log('🎨 Generating app icon assets...\n');

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Generate each icon
for (const icon of icons) {
  const svg = icon.generator(icon.size);
  const filePath = join(publicDir, icon.name);
  writeFileSync(filePath, svg);
  console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
}

console.log('\n📝 SVG icons generated. To convert to PNG:');
console.log('   1. Install: npm install -g svgexport');
console.log('   2. Run: svgexport public/icon-512.svg public/icon-512.png 512:512');
console.log('   Or use an online converter like https://svgtopng.com/\n');

console.log('🔧 Next steps:');
console.log('   1. Convert SVGs to PNGs');
console.log('   2. Generate favicon.ico from 16x16, 32x32 PNGs');
console.log('   3. Update manifest.json icon references if needed\n');
