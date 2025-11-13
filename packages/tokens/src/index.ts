export const brandColors = {
  red: '#D7263D',
  redDark: '#B4162B',
  gold: '#F7C948',
  goldDark: '#D8A524',
  green: '#2FBF71',
  greenDark: '#208F56',
  mint: '#DFF6EA',
  rose: '#FFE3E3',
  navy: '#101828',
  plum: '#4C1D95',
  cream: '#FFF6E1',
  creamLight: '#FFFAF0',
} as const;

export type BrandColorToken = keyof typeof brandColors;

export const surfaceColors = {
  base: brandColors.cream,
  card: brandColors.creamLight,
  accent: brandColors.gold,
  contrast: brandColors.navy,
} as const;

export const semanticColors = {
  surfaceElevated: '#FFF9F2',
  surfaceFrosted: '#FFF3E4',
  surfaceGoldTint: '#FFEECB',
  borderAccentRed: '#D7263D33',
  borderAccentPlum: '#4C1D9540',
  borderNeutralMuted: '#1C1E2326',
  textMuted: '#6E4625',
  textOnPrimary: '#FFF9F4',
  textOnSecondary: '#281501',
  successSurface: brandColors.mint,
  successBorder: brandColors.green,
  successText: brandColors.greenDark,
  errorSurface: brandColors.rose,
  errorBorder: brandColors.red,
  errorText: brandColors.red,
} as const;

export type SemanticColorToken = keyof typeof semanticColors;

export const spacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export type SpacingToken = keyof typeof spacingScale;

export const radii = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 18,
  '3xl': 24,
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
    fontWeight: 600,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: brandColors.goldDark,
  },
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 700,
    color: brandColors.navy,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 600,
    color: brandColors.navy,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    color: brandColors.navy,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
    color: brandColors.navy,
  },
} as const;

export type TypographyToken = keyof typeof typographyScale;

export const designTokens = {
  colors: brandColors,
  surfaces: surfaceColors,
  semantic: semanticColors,
  spacing: spacingScale,
  radii,
  typography: typographyScale,
};

export const tokenMeta = {
  updatedAt: '2025-12-01',
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
