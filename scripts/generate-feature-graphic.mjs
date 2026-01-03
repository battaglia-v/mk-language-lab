#!/usr/bin/env node
/**
 * Generate Google Play Store Feature Graphic (1024x500px)
 * Uses sharp for image manipulation
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const WIDTH = 1024;
const HEIGHT = 500;

// Macedonian flag colors + brand colors
const COLORS = {
  red: '#D20000',
  yellow: '#FFE600',
  background: '#080B12',
  primary: '#FF5A2C',
  amber: '#F59E0B',
};

async function generateFeatureGraphic() {
  console.log('Generating feature graphic (1024x500px)...');

  // Create gradient background with Macedonian-inspired design
  const svgBackground = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Radial gradient for sun effect -->
        <radialGradient id="sunGlow" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stop-color="${COLORS.yellow}" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="${COLORS.primary}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${COLORS.background}" stop-opacity="0"/>
        </radialGradient>

        <!-- Linear gradient for bottom accent -->
        <linearGradient id="bottomAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${COLORS.primary}"/>
          <stop offset="50%" stop-color="${COLORS.amber}"/>
          <stop offset="100%" stop-color="${COLORS.primary}"/>
        </linearGradient>
      </defs>

      <!-- Dark background -->
      <rect width="100%" height="100%" fill="${COLORS.background}"/>

      <!-- Sun glow effect -->
      <ellipse cx="512" cy="350" rx="400" ry="300" fill="url(#sunGlow)"/>

      <!-- Sun rays (simplified Vergina Sun motif) -->
      <g fill="${COLORS.yellow}" opacity="0.15">
        ${Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const x1 = 512;
          const y1 = 250;
          const length = 200;
          const x2 = x1 + Math.cos(angle) * length;
          const y2 = y1 + Math.sin(angle) * length;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLORS.yellow}" stroke-width="3" opacity="0.3"/>`;
        }).join('\n')}
      </g>

      <!-- Bottom accent bar -->
      <rect x="0" y="490" width="100%" height="10" fill="url(#bottomAccent)"/>

      <!-- App name -->
      <text x="512" y="180"
            font-family="Arial, Helvetica, sans-serif"
            font-size="64"
            font-weight="bold"
            fill="white"
            text-anchor="middle">
        Македонски
      </text>

      <!-- Subtitle -->
      <text x="512" y="230"
            font-family="Arial, Helvetica, sans-serif"
            font-size="28"
            fill="${COLORS.primary}"
            text-anchor="middle">
        MK Language Lab
      </text>

      <!-- Tagline -->
      <text x="512" y="320"
            font-family="Arial, Helvetica, sans-serif"
            font-size="24"
            fill="#94A3B8"
            text-anchor="middle">
        Learn Macedonian with AI-powered lessons
      </text>

      <!-- Feature badges -->
      <g font-family="Arial, Helvetica, sans-serif" font-size="16" fill="white">
        <!-- Practice badge -->
        <rect x="180" y="380" width="140" height="40" rx="20" fill="${COLORS.primary}" opacity="0.9"/>
        <text x="250" y="406" text-anchor="middle">Practice</text>

        <!-- Translate badge -->
        <rect x="360" y="380" width="140" height="40" rx="20" fill="${COLORS.amber}" opacity="0.9"/>
        <text x="430" y="406" text-anchor="middle" fill="#1a1a1a">Translate</text>

        <!-- Read badge -->
        <rect x="540" y="380" width="140" height="40" rx="20" fill="${COLORS.primary}" opacity="0.9"/>
        <text x="610" y="406" text-anchor="middle">Read</text>

        <!-- Learn badge -->
        <rect x="720" y="380" width="140" height="40" rx="20" fill="${COLORS.amber}" opacity="0.9"/>
        <text x="790" y="406" text-anchor="middle" fill="#1a1a1a">Learn</text>
      </g>

      <!-- Small text at bottom -->
      <text x="512" y="470"
            font-family="Arial, Helvetica, sans-serif"
            font-size="14"
            fill="#64748B"
            text-anchor="middle">
        Free • No Ads • Privacy-Focused
      </text>
    </svg>
  `;

  // Convert SVG to PNG
  const outputPath = join(ROOT, 'public', 'feature-graphic.png');

  await sharp(Buffer.from(svgBackground))
    .png()
    .toFile(outputPath);

  console.log(`✅ Feature graphic saved to: ${outputPath}`);
  console.log(`   Dimensions: ${WIDTH}x${HEIGHT}px`);

  return outputPath;
}

// Run
generateFeatureGraphic().catch(console.error);
