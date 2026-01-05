#!/usr/bin/env node
/**
 * Generate app icon assets for MK Language Lab
 *
 * Design: Ajvar jar with "М" on the label
 * - Represents Macedonian culture (ajvar = beloved condiment)
 * - "М" connects to language learning
 * - Warm orange/red background with vibrant jar
 *
 * Outputs (SVG for conversion to PNG):
 * - icon-512.svg (Play Store)
 * - icon-512-maskable.svg (Play Store maskable)
 * - icon-192.svg (PWA)
 * - apple-touch-icon.svg (180x180)
 * - favicon-64x64.svg
 * - favicon-32x32.svg
 * - favicon-16x16.svg
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// Brand colors
const COLORS = {
  background: '#FF5A2C',        // Warm orange-red gradient start
  backgroundEnd: '#D63616',     // Gradient end
  jarBody: '#E63E2A',           // Ajvar red
  lidLight: '#E8EAED',          // Silver lid highlight
  lidDark: '#B8BDC6',           // Silver lid base
  label: 'rgba(255,255,255,0.95)', // White label
  labelText: '#2C3E50',         // Dark text on label
  shine: 'rgba(255,255,255,0.2)', // Glass shine
};

/**
 * Generate large icon SVG (512px, 192px)
 * Full detail: lid shine, glass effect, М on label
 */
function generateLargeIconSVG(size, maskable = false) {
  const padding = maskable ? size * 0.1 : 0;
  const innerSize = size - padding * 2;
  const scale = innerSize / 180; // Base design is 180px

  // Jar dimensions (scaled)
  const jarWidth = 100 * scale;
  const jarHeight = 120 * scale;
  const bodyHeight = 99 * scale;
  const lidHeight = 18 * scale;
  const labelWidth = 60 * scale;
  const labelHeight = 50 * scale;

  const centerX = size / 2;
  const centerY = size / 2;
  const jarX = centerX - jarWidth / 2;
  const jarY = centerY - jarHeight / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.background}"/>
      <stop offset="100%" style="stop-color:${COLORS.backgroundEnd}"/>
    </linearGradient>
    <linearGradient id="lid-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lidLight}"/>
      <stop offset="100%" style="stop-color:${COLORS.lidDark}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg-${size})" ${maskable ? '' : `rx="${size * 0.15}"`}/>

  <!-- Jar Lid -->
  <rect
    x="${centerX - (85 * scale) / 2}"
    y="${jarY}"
    width="${85 * scale}"
    height="${lidHeight}"
    rx="${4 * scale}"
    fill="url(#lid-${size})"
  />

  <!-- Lid shine -->
  <rect
    x="${centerX - (50 * scale) / 2}"
    y="${jarY + 6 * scale}"
    width="${50 * scale}"
    height="${6 * scale}"
    rx="${3 * scale}"
    fill="white"
    fill-opacity="0.5"
  />

  <!-- Jar Body -->
  <rect
    x="${centerX - jarWidth / 2}"
    y="${jarY + lidHeight + 3 * scale}"
    width="${jarWidth}"
    height="${bodyHeight}"
    rx="${14 * scale}"
    fill="${COLORS.jarBody}"
  />

  <!-- Glass shine -->
  <ellipse
    cx="${centerX - jarWidth / 2 + 22 * scale}"
    cy="${jarY + lidHeight + 3 * scale + 37 * scale}"
    rx="${15 * scale}"
    ry="${25 * scale}"
    fill="white"
    fill-opacity="0.15"
  />

  <!-- Label -->
  <rect
    x="${centerX - labelWidth / 2}"
    y="${jarY + lidHeight + 3 * scale + (bodyHeight - labelHeight) / 2}"
    width="${labelWidth}"
    height="${labelHeight}"
    rx="${8 * scale}"
    fill="${COLORS.label}"
  />

  <!-- М on label -->
  <text
    x="${centerX}"
    y="${jarY + lidHeight + 3 * scale + bodyHeight / 2 + 12 * scale}"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${36 * scale}"
    font-weight="700"
    fill="${COLORS.labelText}"
  >М</text>
</svg>`;
}

/**
 * Generate small icon SVG (64px, 32px, 16px)
 * Simplified: bolder shapes, less detail
 */
function generateSmallIconSVG(size) {
  const scale = size / 32; // Base design is 32px

  const jarWidth = 22 * scale;
  const jarHeight = 26 * scale;
  const lidWidth = 18 * scale;
  const lidHeight = 4 * scale;
  const bodyHeight = 21 * scale;
  const labelWidth = 14 * scale;
  const labelHeight = 12 * scale;

  const centerX = size / 2;
  const centerY = size / 2;
  const jarX = centerX - jarWidth / 2;
  const jarY = centerY - jarHeight / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.background}"/>
      <stop offset="100%" style="stop-color:${COLORS.backgroundEnd}"/>
    </linearGradient>
    <linearGradient id="lid-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lidLight}"/>
      <stop offset="100%" style="stop-color:${COLORS.lidDark}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg-${size})" rx="${size * 0.15}"/>

  <!-- Simplified Lid -->
  <rect
    x="${centerX - lidWidth / 2}"
    y="${jarY}"
    width="${lidWidth}"
    height="${lidHeight}"
    rx="${1 * scale}"
    fill="url(#lid-${size})"
  />

  <!-- Simplified Jar Body -->
  <rect
    x="${centerX - jarWidth / 2}"
    y="${jarY + lidHeight + 1 * scale}"
    width="${jarWidth}"
    height="${bodyHeight}"
    rx="${4 * scale}"
    fill="${COLORS.jarBody}"
  />

  <!-- Simplified Label -->
  <rect
    x="${centerX - labelWidth / 2}"
    y="${jarY + lidHeight + 1 * scale + (bodyHeight - labelHeight) / 2}"
    width="${labelWidth}"
    height="${labelHeight}"
    rx="${2 * scale}"
    fill="${COLORS.label}"
  />

  <!-- М on label - bold for small sizes -->
  <text
    x="${centerX}"
    y="${jarY + lidHeight + 1 * scale + bodyHeight / 2 + 3 * scale}"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${10 * scale}"
    font-weight="800"
    fill="${COLORS.labelText}"
  >М</text>
</svg>`;
}

// Icon configurations
const icons = [
  { name: 'icon-512.svg', size: 512, generator: (s) => generateLargeIconSVG(s, false) },
  { name: 'icon-512-maskable.svg', size: 512, generator: (s) => generateLargeIconSVG(s, true) },
  { name: 'icon-192.svg', size: 192, generator: (s) => generateLargeIconSVG(s, false) },
  { name: 'apple-touch-icon.svg', size: 180, generator: (s) => generateLargeIconSVG(s, false) },
  { name: 'favicon-64x64.svg', size: 64, generator: generateSmallIconSVG },
  { name: 'favicon-32x32.svg', size: 32, generator: generateSmallIconSVG },
  { name: 'favicon-16x16.svg', size: 16, generator: generateSmallIconSVG },
];

console.log('🫙 Generating Ajvar jar app icon assets...\n');

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

console.log('\n📝 SVG icons generated!');
console.log('\n🔧 Next steps:');
console.log('   1. Run: node scripts/convert-icons-to-png.mjs');
console.log('   2. Run: node scripts/generate-favicon-ico.mjs');
console.log('   3. Verify icons look correct\n');
