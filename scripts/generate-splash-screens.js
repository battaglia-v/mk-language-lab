const sharp = require('sharp');
const path = require('path');

// Colors
const BACKGROUND_COLOR = '#ff5a2c'; // Primary red/orange for better visibility
const JAR_RED = '#E63E2A';
const LID_SILVER = '#CDD2DB';

// Common splash screen sizes for Android
const SPLASH_SIZES = [
  { width: 640, height: 1136, name: 'splash-640x1136.png' },   // iPhone 5/SE
  { width: 750, height: 1334, name: 'splash-750x1334.png' },   // iPhone 6/7/8
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' }, // iPhone 6+/7+/8+
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS
  { width: 1242, height: 2688, name: 'splash-1242x2688.png' }, // iPhone XS Max
  { width: 828, height: 1792, name: 'splash-828x1792.png' },   // iPhone XR
  { width: 1170, height: 2532, name: 'splash-1170x2532.png' }, // iPhone 12/13/14
];

async function createSplashSVG(width, height) {
  // Modern design: small icon below large text
  const iconSize = Math.min(width * 0.15, 200); // Smaller icon
  const scale = iconSize / 40; // Original SVG is 40x40

  // Center position
  const centerX = width / 2;
  const centerY = height / 2;

  // Text above center, icon below
  const textY = centerY - 40;
  const iconY = centerY + 80;

  // Offset for centered icon
  const offsetX = centerX - (20 * scale);
  const offsetY = iconY - (20 * scale);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background and gradients -->
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ff5a2c;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff5a2c;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Dark background -->
      <rect width="${width}" height="${height}" fill="#080b12"/>

      <!-- Large crisp icon in center -->
      <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
        <!-- Jar Lid -->
        <path
          d="M12 8h16c.5 0 1 .3 1.2.7l.8 2c.2.5-.1 1-.8 1H11.8c-.7 0-1-.5-.8-1l.8-2C12 8.3 12.5 8 13 8z"
          fill="${LID_SILVER}"
        />
        <ellipse cx="20" cy="9.5" rx="6" ry="1.2" fill="white" fill-opacity="0.4"/>

        <!-- Jar Body -->
        <path
          d="M13 12.5h14c1.5 0 2.5 1 2.5 2.5v16c0 2-1.5 3.5-3.5 3.5h-12c-2 0-3.5-1.5-3.5-3.5v-16c0-1.5 1-2.5 2.5-2.5z"
          fill="${JAR_RED}"
        />

        <!-- Label -->
        <rect x="14" y="19" width="12" height="10" rx="1.5" fill="#FFFFFF" fill-opacity="0.95"/>
        <rect x="16" y="21.5" width="8" height="1.2" rx="0.6" fill="#2C3E50" fill-opacity="0.8" />
        <rect x="16.5" y="24" width="7" height="0.9" rx="0.45" fill="#2C3E50" fill-opacity="0.6" />
        <rect x="17" y="26" width="6" height="0.9" rx="0.45" fill="#2C3E50" fill-opacity="0.5" />

        <!-- Glass shine -->
        <ellipse cx="18" cy="18" rx="4" ry="6" fill="white" fill-opacity="0.25"/>
        <ellipse cx="20" cy="12.8" rx="6.5" ry="0.8" fill="white" fill-opacity="0.3"/>
      </g>

      <!-- Large gradient Cyrillic text -->
      <text
        x="${centerX}"
        y="${textY}"
        font-family="Arial, sans-serif"
        font-size="${Math.min(width * 0.12, 72)}"
        font-weight="900"
        fill="url(#textGradient)"
        text-anchor="middle"
        letter-spacing="2"
      >Македонски</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateSplashScreens() {
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Generating splash screens for Android/iOS...\n');

  for (const size of SPLASH_SIZES) {
    console.log(`Creating ${size.name} (${size.width}x${size.height})...`);

    const svgBuffer = await createSplashSVG(size.width, size.height);

    await sharp(svgBuffer)
      .png({ quality: 100, compressionLevel: 0 })
      .toFile(path.join(publicDir, size.name));

    console.log(`✓ ${size.name} created`);
  }

  console.log('\n✅ All splash screens generated successfully!');
  console.log('Files created in:', publicDir);
  console.log('\nNext: Update manifest.json to reference splash screens');
}

generateSplashScreens().catch(console.error);
