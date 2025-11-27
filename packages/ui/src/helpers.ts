import type { CSSProperties } from 'react';
import type { TextStyle } from 'react-native';
import { brandColors, surfaceColors, typographyScale, type TypographyToken } from '@mk/tokens';

export type NativeTextStyle = Pick<
  TextStyle,
  'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing' | 'textTransform' | 'color'
>;

const px = (value: number) => `${value}px`;

export type TypographyVariant = TypographyToken;

const toNativeFontWeight = (value?: number): TextStyle['fontWeight'] => {
  if (!value) return undefined;
  if (value === 700) return '700';
  if (value === 600) return '600';
  if (value === 500) return '500';
  if (value === 400) return '400';
  return `${value}` as TextStyle['fontWeight'];
};

export function getNativeTypography(variant: TypographyVariant): NativeTextStyle {
  const style = typographyScale[variant];
  if (!style) {
    throw new Error(`Unknown typography token: ${variant}`);
  }
  return {
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: toNativeFontWeight(style.fontWeight),
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    color: style.color ?? brandColors.text,
  };
}

export function getWebTypography(variant: TypographyVariant): CSSProperties {
  const style = typographyScale[variant];
  if (!style) {
    throw new Error(`Unknown typography token: ${variant}`);
  }
  return {
    fontSize: px(style.fontSize),
    lineHeight: px(style.lineHeight),
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    textTransform: style.textTransform ?? 'none',
    color: style.color ?? brandColors.text,
  };
}

type SurfaceEmphasis = 'base' | 'card' | 'accent';

export function getSurfaceColors(emphasis: SurfaceEmphasis = 'base') {
  if (emphasis === 'card') {
    return {
      background: surfaceColors.card,
      border: `${brandColors.border}80`,
      text: brandColors.text,
    };
  }
  if (emphasis === 'accent') {
    return {
      background: `${brandColors.accent}1f`,
      border: `${brandColors.accentEmphasis}60`,
      text: brandColors.text,
    };
  }
  return {
    background: surfaceColors.base,
    border: `${brandColors.border}99`,
    text: brandColors.text,
  };
}

export { brandColors, surfaceColors } from '@mk/tokens';
