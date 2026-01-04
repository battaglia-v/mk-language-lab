/**
 * News Source Branding
 *
 * Provides branded fallback images and colors for each news source.
 * When images fail to load, we show a branded placeholder that looks
 * intentional rather than broken.
 *
 * Now supports light/dark themes for consistent appearance.
 */

export type NewsSourceId = 'time-mk' | 'meta-mk' | 'makfax' | 'a1on' | 'unknown';
export type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  bgColor1: string;
  bgColor2: string;
  textColor: string;
}

interface SourceBranding {
  name: string;
  shortName: string;
  /** Colors for dark mode (default) */
  dark: ThemeColors;
  /** Colors for light mode */
  light: ThemeColors;
  /** Legacy: primary color (dark mode) */
  primaryColor: string;
  /** Legacy: secondary color (dark mode) */
  secondaryColor: string;
  /** Legacy: text color (dark mode) */
  textColor: string;
}

const SOURCE_BRANDING: Record<NewsSourceId, SourceBranding> = {
  'time-mk': {
    name: 'Time.mk',
    shortName: 'TIME',
    // Dark mode - original colors
    dark: {
      bgColor1: '#1a1a2e',
      bgColor2: '#16213e',
      textColor: '#e94560',
    },
    // Light mode - softer, inverted
    light: {
      bgColor1: '#fef2f4',
      bgColor2: '#fce4e8',
      textColor: '#be123c',
    },
    // Legacy fields
    primaryColor: '#1a1a2e',
    secondaryColor: '#16213e',
    textColor: '#e94560',
  },
  'meta-mk': {
    name: 'Meta.mk',
    shortName: 'META',
    dark: {
      bgColor1: '#0f4c75',
      bgColor2: '#1b262c',
      textColor: '#3282b8',
    },
    light: {
      bgColor1: '#eff6ff',
      bgColor2: '#dbeafe',
      textColor: '#1d4ed8',
    },
    primaryColor: '#0f4c75',
    secondaryColor: '#1b262c',
    textColor: '#3282b8',
  },
  'makfax': {
    name: 'Makfax',
    shortName: 'MKF',
    dark: {
      bgColor1: '#2d3436',
      bgColor2: '#636e72',
      textColor: '#dfe6e9',
    },
    light: {
      bgColor1: '#f8fafc',
      bgColor2: '#f1f5f9',
      textColor: '#475569',
    },
    primaryColor: '#2d3436',
    secondaryColor: '#636e72',
    textColor: '#dfe6e9',
  },
  'a1on': {
    name: 'A1on',
    shortName: 'A1',
    dark: {
      bgColor1: '#c0392b',
      bgColor2: '#922b21',
      textColor: '#ffffff',
    },
    light: {
      bgColor1: '#fef2f2',
      bgColor2: '#fee2e2',
      textColor: '#b91c1c',
    },
    primaryColor: '#c0392b',
    secondaryColor: '#922b21',
    textColor: '#ffffff',
  },
  'unknown': {
    name: 'News',
    shortName: 'MK',
    dark: {
      bgColor1: '#1e293b',
      bgColor2: '#334155',
      textColor: '#94a3b8',
    },
    light: {
      bgColor1: '#f8fafc',
      bgColor2: '#f1f5f9',
      textColor: '#64748b',
    },
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    textColor: '#94a3b8',
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

/**
 * Get the fallback image SVG for a news source.
 * @param sourceId - The news source ID
 * @param theme - 'light' or 'dark' (defaults to 'dark')
 */
export function getSourceFallbackImage(sourceId: string, theme: ThemeMode = 'dark'): string {
  const branding = getSourceBranding(sourceId);
  const colors = theme === 'light' ? branding.light : branding.dark;
  return generateBrandedSvg(
    branding.shortName === 'MK' ? 'MK NEWS' : `${branding.shortName}.MK`,
    colors.textColor,
    colors.bgColor1,
    colors.bgColor2
  );
}

/**
 * Get theme-appropriate colors for a news source
 */
export function getSourceColors(sourceId: string, theme: ThemeMode = 'dark'): ThemeColors {
  const branding = getSourceBranding(sourceId);
  return theme === 'light' ? branding.light : branding.dark;
}

export function normalizeSourceId(sourceId: string | null | undefined): NewsSourceId {
  if (!sourceId) return 'unknown';
  const normalized = sourceId.toLowerCase();
  if (normalized in SOURCE_BRANDING) {
    return normalized as NewsSourceId;
  }
  return 'unknown';
}
