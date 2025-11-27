import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import { designTokens, radii } from '@mk/tokens';
import { getSurfaceColors } from '../helpers';

type WebCardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    emphasis?: 'base' | 'card' | 'accent';
  }
>;

export function WebCard({ children, emphasis = 'card', style, ...rest }: WebCardProps) {
  const palette = getSurfaceColors(emphasis);
  const cardStyle: CSSProperties = {
    borderRadius: radii['3xl'],
    border: `1px solid ${palette.border}`,
    background: palette.background,
    color: palette.text,
    boxShadow: emphasis === 'accent' ? designTokens.elevation.md : designTokens.elevation.sm,
    ...style,
  };
  return (
    <div style={cardStyle} {...rest}>
      {children}
    </div>
  );
}
