import sharp from 'sharp';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Create a simple 32x32 PNG favicon
const svgIcon = `
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF5A2C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D63616;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="32" height="32" fill="url(#bg)" rx="2"/>

  <!-- Jar lid -->
  <rect x="7" y="6" width="18" height="4" fill="white" rx="1"/>

  <!-- Jar body -->
  <rect x="6" y="10" width="20" height="18" fill="white" rx="3"/>

  <!-- M letter -->
  <text x="16" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FF5A2C" text-anchor="middle">M</text>
</svg>
`;

async function generateFavicon() {
  try {
    console.log('Generating favicon.ico...');

    const publicDir = join(projectRoot, 'public');
    const faviconPath = join(publicDir, 'favicon.ico');

    // Generate PNG from SVG
    const pngBuffer = await sharp(Buffer.from(svgIcon))
      .resize(32, 32)
      .png()
      .toBuffer();

    // For ICO format, we'll use PNG as fallback (browsers accept PNG in .ico files)
    // True ICO format would require a library, but modern browsers handle PNG fine
    await fs.writeFile(faviconPath, pngBuffer);

    console.log('✅ favicon.ico created successfully at:', faviconPath);
    console.log('Note: File is PNG format with .ico extension (compatible with all modern browsers)');

  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
