#!/usr/bin/env node
/**
 * Convert SVG icons to PNG format using sharp
 */

import sharp from 'sharp';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const conversions = [
  { svg: 'icon-512.svg', png: 'icon-512.png', size: 512 },
  { svg: 'icon-512-maskable.svg', png: 'icon-512-maskable.png', size: 512 },
  { svg: 'icon-192.svg', png: 'icon-192.png', size: 192 },
  { svg: 'apple-touch-icon.svg', png: 'apple-touch-icon.png', size: 180 },
  { svg: 'favicon-64x64.svg', png: 'favicon-64x64.png', size: 64 },
  { svg: 'favicon-32x32.svg', png: 'favicon-32x32.png', size: 32 },
  { svg: 'favicon-16x16.svg', png: 'favicon-16x16.png', size: 16 },
];

console.log('🖼️  Converting SVG icons to PNG...\n');

async function convertAll() {
  for (const { svg, png, size } of conversions) {
    const svgPath = join(publicDir, svg);
    const pngPath = join(publicDir, png);

    if (!existsSync(svgPath)) {
      console.log(`⚠️  Skipping ${svg} (not found)`);
      continue;
    }

    try {
      const svgBuffer = readFileSync(svgPath);

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      console.log(`✓ ${svg} → ${png} (${size}x${size})`);

      // Clean up SVG file
      unlinkSync(svgPath);
    } catch (error) {
      console.error(`✗ Failed to convert ${svg}:`, error.message);
    }
  }

  console.log('\n✅ PNG conversion complete!');
}

convertAll().catch(console.error);
