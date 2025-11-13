import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { brandColors, spacingScale, radii } from '@mk/tokens';

export type WebStatPillProps = PropsWithChildren<{
  icon?: ReactNode;
  label: string;
  value: string;
  accent?: 'red' | 'gold' | 'green';
  style?: CSSProperties;
}>;

const accentMap = {
  red: {
    background: `${brandColors.red}10`,
    border: `${brandColors.redDark}40`,
    color: brandColors.redDark,
  },
  gold: {
    background: `${brandColors.gold}25`,
    border: `${brandColors.goldDark}50`,
    color: brandColors.goldDark,
  },
  green: {
    background: `${brandColors.mint}`,
    border: `${brandColors.green}40`,
    color: brandColors.greenDark,
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
    fontWeight: 600,
    ...style,
  };

  return (
    <div style={container}>
      {icon ? <span style={{ display: 'inline-flex' }}>{icon}</span> : null}
      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}
