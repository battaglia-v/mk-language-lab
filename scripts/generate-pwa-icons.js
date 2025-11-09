const sharp = require('sharp');
const path = require('path');

// Colors from manifest.json
const BACKGROUND_COLOR = '#080b12';
const PRIMARY_COLOR = '#ff5a2c';
const JAR_RED = '#E63E2A';
const LID_SILVER = '#CDD2DB';

async function createAjvarJarSVG(size, maskable = false) {
  // For maskable icons, we need to add padding for the safe zone (80% of icon)
  const padding = maskable ? size * 0.1 : 0;
  const effectiveSize = size - (padding * 2);
  const scale = effectiveSize / 40; // Original SVG is 40x40

  // Calculate positions with padding
  const offsetX = padding;
  const offsetY = padding;

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="${BACKGROUND_COLOR}"/>

      <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
        <!-- Jar Lid - Solid metallic silver -->
        <path
          d="M12 8h16c.5 0 1 .3 1.2.7l.8 2c.2.5-.1 1-.8 1H11.8c-.7 0-1-.5-.8-1l.8-2C12 8.3 12.5 8 13 8z"
          fill="${LID_SILVER}"
        />

        <!-- Lid Shine - Subtle highlight -->
        <ellipse
          cx="20"
          cy="9.5"
          rx="6"
          ry="1.2"
          fill="white"
          fill-opacity="0.3"
        />

        <!-- Jar Body - Bright red Ajvar color -->
        <path
          d="M13 12.5h14c1.5 0 2.5 1 2.5 2.5v16c0 2-1.5 3.5-3.5 3.5h-12c-2 0-3.5-1.5-3.5-3.5v-16c0-1.5 1-2.5 2.5-2.5z"
          fill="${JAR_RED}"
        />

        <!-- Jar Label - Clean white label -->
        <rect
          x="14"
          y="19"
          width="12"
          height="10"
          rx="1.5"
          fill="#FFFFFF"
          fill-opacity="0.95"
        />

        <!-- Label Text Lines - Dark text on label -->
        <rect x="16" y="21.5" width="8" height="1.2" rx="0.6" fill="#2C3E50" fill-opacity="0.8" />
        <rect x="16.5" y="24" width="7" height="0.9" rx="0.45" fill="#2C3E50" fill-opacity="0.6" />
        <rect x="17" y="26" width="6" height="0.9" rx="0.45" fill="#2C3E50" fill-opacity="0.5" />

        <!-- Glass Shine - White highlight -->
        <ellipse
          cx="18"
          cy="18"
          rx="4"
          ry="6"
          fill="white"
          fill-opacity="0.2"
        />

        <!-- Top Rim Highlight -->
        <ellipse
          cx="20"
          cy="12.8"
          rx="6.5"
          ry="0.8"
          fill="white"
          fill-opacity="0.25"
        />
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Generating PWA icons...');

  // Generate icon-192.png
  console.log('Creating icon-192.png...');
  const svg192 = await createAjvarJarSVG(192);
  await sharp(svg192)
    .png({ quality: 100, compressionLevel: 0 })
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ icon-192.png created');

  // Generate icon-512.png
  console.log('Creating icon-512.png...');
  const svg512 = await createAjvarJarSVG(512);
  await sharp(svg512)
    .png({ quality: 100, compressionLevel: 0 })
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ icon-512.png created');

  // Generate icon-512-maskable.png (with safe zone padding)
  console.log('Creating icon-512-maskable.png...');
  const svg512Maskable = await createAjvarJarSVG(512, true);
  await sharp(svg512Maskable)
    .png({ quality: 100, compressionLevel: 0 })
    .toFile(path.join(publicDir, 'icon-512-maskable.png'));
  console.log('✓ icon-512-maskable.png created (with safe zone for maskable format)');

  console.log('\nAll PWA icons generated successfully!');
  console.log('Files created in:', publicDir);
}

generateIcons().catch(console.error);
