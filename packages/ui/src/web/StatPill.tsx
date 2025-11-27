import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { brandColors, spacingScale, radii } from '@mk/tokens';
import { getWebTypography } from '../helpers';

export type WebStatPillProps = PropsWithChildren<{
  icon?: ReactNode;
  label: string;
  value: string;
  accent?: 'red' | 'gold' | 'green';
  style?: CSSProperties;
}>;

const accentMap = {
  red: {
    background: `${brandColors.danger}10`,
    border: `${brandColors.danger}40`,
    color: brandColors.danger,
  },
  gold: {
    background: `${brandColors.accent}22`,
    border: `${brandColors.accentEmphasis}50`,
    color: brandColors.accentEmphasis,
  },
  green: {
    background: `${brandColors.accentGreen}1a`,
    border: `${brandColors.greenDark}40`,
    color: brandColors.accentGreen,
  },
};

export function WebStatPill({ icon, label, value, accent = 'red', style }: WebStatPillProps) {
  const accentStyle = accentMap[accent];
  const container: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingScale.xs,
    borderRadius: radii['3xl'],
    border: `1px solid ${accentStyle.border}`,
    background: accentStyle.background,
    padding: `${spacingScale.xs}px ${spacingScale.sm}px`,
    color: accentStyle.color,
    fontWeight: 700,
    ...style,
  };

  const labelStyle = {
    ...getWebTypography('eyebrow'),
    color: accentStyle.color,
  } satisfies CSSProperties;

  const valueStyle = {
    ...getWebTypography('caption'),
    color: accentStyle.color,
    fontWeight: 700,
  } satisfies CSSProperties;

  return (
    <div style={container}>
      {icon ? <span style={{ display: 'inline-flex' }}>{icon}</span> : null}
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  );
}
