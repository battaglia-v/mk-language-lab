#!/usr/bin/env node
/**
 * Generate favicon.ico from PNG files
 */

import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

async function generateFavicon() {
  console.log('🔧 Generating favicon.ico...\n');

  const pngFiles = [
    join(publicDir, 'favicon-16x16.png'),
    join(publicDir, 'favicon-32x32.png'),
  ];

  try {
    const buf = await pngToIco(pngFiles);
    writeFileSync(join(publicDir, 'favicon.ico'), buf);
    console.log('✓ favicon.ico generated from 16x16 and 32x32 PNGs');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
    process.exit(1);
  }
}

generateFavicon();
