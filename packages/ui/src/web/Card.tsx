import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import { radii } from '@mk/tokens';
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
    boxShadow:
      emphasis === 'accent'
        ? `0 20px 45px rgba(215, 38, 61, 0.15)`
        : `0 12px 30px rgba(16, 24, 40, 0.05)`,
    ...style,
  };
  return (
    <div style={cardStyle} {...rest}>
      {children}
    </div>
  );
}
