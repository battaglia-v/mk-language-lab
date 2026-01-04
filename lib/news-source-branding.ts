/**
 * News Source Branding
 *
 * Provides branded fallback images and colors for each news source.
 * When images fail to load, we show a branded placeholder that looks
 * intentional rather than broken.
 */

export type NewsSourceId = 'time-mk' | 'meta-mk' | 'makfax' | 'a1on' | 'unknown';

interface SourceBranding {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  /** SVG data URL for fallback image */
  fallbackSvg: string;
}

const SOURCE_BRANDING: Record<NewsSourceId, SourceBranding> = {
  'time-mk': {
    name: 'Time.mk',
    shortName: 'TIME',
    primaryColor: '#1a1a2e',
    secondaryColor: '#16213e',
    textColor: '#e94560',
    fallbackSvg: generateBrandedSvg('TIME.MK', '#e94560', '#1a1a2e', '#16213e'),
  },
  'meta-mk': {
    name: 'Meta.mk',
    shortName: 'META',
    primaryColor: '#0f4c75',
    secondaryColor: '#1b262c',
    textColor: '#3282b8',
    fallbackSvg: generateBrandedSvg('META.MK', '#3282b8', '#0f4c75', '#1b262c'),
  },
  'makfax': {
    name: 'Makfax',
    shortName: 'MKF',
    primaryColor: '#2d3436',
    secondaryColor: '#636e72',
    textColor: '#dfe6e9',
    fallbackSvg: generateBrandedSvg('MAKFAX', '#dfe6e9', '#2d3436', '#636e72'),
  },
  'a1on': {
    name: 'A1on',
    shortName: 'A1',
    primaryColor: '#c0392b',
    secondaryColor: '#922b21',
    textColor: '#ffffff',
    fallbackSvg: generateBrandedSvg('A1ON', '#ffffff', '#c0392b', '#922b21'),
  },
  'unknown': {
    name: 'News',
    shortName: 'MK',
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    textColor: '#94a3b8',
    fallbackSvg: generateBrandedSvg('MK NEWS', '#94a3b8', '#1e293b', '#334155'),
  },
};

function generateBrandedSvg(
  text: string,
  textColor: string,
  bgColor1: string,
  bgColor2: string
): string {
  const svg = `<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${text.replace(/\s/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor1}"/>
      <stop offset="50%" style="stop-color:${bgColor2}"/>
      <stop offset="100%" style="stop-color:${bgColor1}"/>
    </linearGradient>
    <pattern id="grid-${text.replace(/\s/g, '')}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${textColor}" stroke-width="0.5" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="800" height="450" fill="url(#bg-${text.replace(/\s/g, '')})"/>
  <rect width="800" height="450" fill="url(#grid-${text.replace(/\s/g, '')})"/>
  <g transform="translate(400, 200)">
    <rect x="-60" y="-60" width="120" height="120" rx="24" fill="${textColor}" opacity="0.1"/>
    <text x="0" y="8" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" letter-spacing="2">${text}</text>
  </g>
  <text x="400" y="320" text-anchor="middle" fill="${textColor}" opacity="0.5" font-family="system-ui, sans-serif" font-size="14">Macedonian News</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getSourceBranding(sourceId: string): SourceBranding {
  return SOURCE_BRANDING[sourceId as NewsSourceId] || SOURCE_BRANDING.unknown;
}

export function getSourceFallbackImage(sourceId: string): string {
  return getSourceBranding(sourceId).fallbackSvg;
}

export function normalizeSourceId(sourceId: string | null | undefined): NewsSourceId {
  if (!sourceId) return 'unknown';
  const normalized = sourceId.toLowerCase();
  if (normalized in SOURCE_BRANDING) {
    return normalized as NewsSourceId;
  }
  return 'unknown';
}
