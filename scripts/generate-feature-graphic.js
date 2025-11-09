const sharp = require('sharp');
const path = require('path');

// Colors from manifest.json
const BACKGROUND_COLOR = '#080b12';
const PRIMARY_COLOR = '#ff5a2c';
const SECONDARY_COLOR = '#D63616';
const JAR_RED = '#E63E2A';
const LID_SILVER = '#CDD2DB';

async function createFeatureGraphic() {
  const width = 1024;
  const height = 500;

  // Create SVG with branding
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BACKGROUND_COLOR};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f1419;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${PRIMARY_COLOR};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${SECONDARY_COLOR};stop-opacity:1" />
        </linearGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

      <!-- Decorative elements - Macedonian flag colors -->
      <circle cx="100" cy="100" r="80" fill="${PRIMARY_COLOR}" opacity="0.1"/>
      <circle cx="${width - 100}" cy="${height - 100}" r="100" fill="#FFD700" opacity="0.08"/>

      <!-- App icon (Ajvar jar) - Left side -->
      <g transform="translate(150, 150) scale(3.5)">
        <!-- Jar Lid -->
        <path
          d="M12 8h16c.5 0 1 .3 1.2.7l.8 2c.2.5-.1 1-.8 1H11.8c-.7 0-1-.5-.8-1l.8-2C12 8.3 12.5 8 13 8z"
          fill="${LID_SILVER}"
        />
        <ellipse cx="20" cy="9.5" rx="6" ry="1.2" fill="white" fill-opacity="0.3"/>

        <!-- Jar Body -->
        <path
          d="M13 12.5h14c1.5 0 2.5 1 2.5 2.5v16c0 2-1.5 3.5-3.5 3.5h-12c-2 0-3.5-1.5-3.5-3.5v-16c0-1.5 1-2.5 2.5-2.5z"
          fill="${JAR_RED}"
        />

        <!-- Label -->
        <rect x="14" y="19" width="12" height="10" rx="1.5" fill="#FFFFFF" fill-opacity="0.95"/>
        <rect x="16" y="21.5" width="8" height="1.2" rx="0.6" fill="#2C3E50" fill-opacity="0.8" />
        <rect x="16.5" y="24" width="7" height="0.9" rx="0.45" fill="#2C3E50" fill-opacity="0.6" />

        <!-- Glass shine -->
        <ellipse cx="18" cy="18" rx="4" ry="6" fill="white" fill-opacity="0.2"/>
        <ellipse cx="20" cy="12.8" rx="6.5" ry="0.8" fill="white" fill-opacity="0.25"/>
      </g>

      <!-- App name and tagline - Right side -->
      <text x="400" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">
        Macedonian
      </text>
      <text x="400" y="270" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">
        Language Lab
      </text>

      <!-- Tagline with gradient -->
      <text x="400" y="340" font-family="Arial, sans-serif" font-size="36" font-weight="600" fill="url(#redGradient)">
        Learn Macedonian with Interactive Lessons
      </text>

      <!-- Macedonian flag emoji alternative - subtle accent -->
      <text x="400" y="410" font-family="Arial, sans-serif" font-size="32" fill="#FFD700" opacity="0.8">
        🇲🇰 • Македонски Јазик
      </text>
    </svg>
  `;

  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Generating Play Store feature graphic...');

  // Generate 1024x500 PNG
  await sharp(Buffer.from(svg))
    .png({ quality: 100, compressionLevel: 0 })
    .toFile(path.join(publicDir, 'feature-graphic.png'));

  console.log('✓ feature-graphic.png created (1024x500)');
  console.log('Location:', path.join(publicDir, 'feature-graphic.png'));
  console.log('\nFeature graphic ready for Play Store submission!');
}

createFeatureGraphic().catch(console.error);
