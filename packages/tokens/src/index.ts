/**
 * Brand naming - canonical values
 * For localized display, use i18n keys instead
 */
export const brandNames = {
  /** Store name (Google Play, App Store) - no emojis, ≤30 chars */
  store: 'Macedonian Language Lab',
  /** Short name for icons/home screen */
  short: 'MK Language',
  /** Full name (deprecated - use store or i18n) */
  full: 'Macedonian Language Lab',
} as const;

export const brandColors = {
  background: '#06060b',
  surface: '#0b0b12',
  surfaceRaised: '#111424',
  surfaceMuted: '#14172a',
  panel: '#151827',
  panelMuted: '#1b1f33',
  border: '#222536',
  borderStrong: '#2e3246',
  borderSoft: '#1a1d2b',
  text: '#f7f8fb',
  textMuted: 'rgba(247,248,251,0.72)',
  accent: '#f6d83b',
  accentEmphasis: '#f4b400',
  accentGreen: '#34d399',
  success: '#3ecf8e',
  warning: '#f4c84a',
  danger: '#ff7878',
  // Legacy aliases kept for existing component references
  gold: '#f6d83b',
  goldDark: '#f4b400',
  green: '#34d399',
  greenDark: '#2fa56c',
  red: '#ff7878',
  redDark: '#e86161',
  mint: 'rgba(52,211,153,0.14)',
  rose: 'rgba(255,120,120,0.12)',
  navy: '#f7f8fb',
  plum: '#1b1f33',
  cream: '#06060b',
  creamLight: '#0b0b12',
} as const;

export type BrandColorToken = keyof typeof brandColors;

export const surfaceColors = {
  base: brandColors.background,
  card: brandColors.surface,
  accent: `${brandColors.accent}1f`,
  contrast: brandColors.surfaceRaised,
} as const;

export const semanticColors = {
  surfaceElevated: '#0f1324',
  surfaceFrosted: '#0c0f1c',
  surfaceGoldTint: `${brandColors.accent}26`,
  borderAccentRed: `${brandColors.danger}33`,
  borderAccentPlum: `${brandColors.panelMuted}80`,
  borderNeutralMuted: `${brandColors.borderSoft}80`,
  textMuted: brandColors.textMuted,
  textOnPrimary: '#0b0a03',
  textOnSecondary: '#02150c',
  successSurface: `${brandColors.accentGreen}1f`,
  successBorder: brandColors.accentGreen,
  successText: brandColors.accentGreen,
  errorSurface: `${brandColors.danger}14`,
  errorBorder: brandColors.danger,
  errorText: brandColors.danger,
} as const;

export type SemanticColorToken = keyof typeof semanticColors;

export const spacingScale = {
  '2xs': 6,
  xs: 10,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
  '2xl': 36,
  '3xl': 44,
} as const;

export type SpacingToken = keyof typeof spacingScale;

export const radii = {
  none: 0,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 24,
  '3xl': 30,
  pill: 999,
} as const;

type TypographyConfig = {
  fontSize: number;
  lineHeight: number;
  fontWeight: 400 | 500 | 600 | 700;
  letterSpacing?: number;
  textTransform?: 'uppercase' | 'none';
  color?: string;
};

export const typographyScale: Record<string, TypographyConfig> = {
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: brandColors.textMuted,
  },
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 700,
    color: brandColors.text,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 700,
    color: brandColors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    color: brandColors.text,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
    color: brandColors.textMuted,
  },
} as const;

export type TypographyToken = keyof typeof typographyScale;

export const designTokens = {
  brand: brandNames,
  colors: brandColors,
  surfaces: surfaceColors,
  semantic: semanticColors,
  spacing: spacingScale,
  radii,
  typography: typographyScale,
  elevation: {
    sm: '0 10px 24px -18px rgba(0,0,0,0.58)',
    md: '0 18px 42px -20px rgba(0,0,0,0.6)',
    lg: '0 30px 64px -24px rgba(0,0,0,0.62)',
    focus: '0 0 0 3px rgba(246,216,59,0.28)',
  },
};

export const tokenMeta = {
  updatedAt: '2025-02-08',
  source: 'docs/design/tokens.md',
};

export function getColor(token: BrandColorToken) {
  return brandColors[token];
}

export function getSpacing(token: SpacingToken) {
  return spacingScale[token];
}

export function getTypography(token: TypographyToken) {
  return typographyScale[token];
}

export function getSemanticColor(token: SemanticColorToken) {
  return semanticColors[token];
}
