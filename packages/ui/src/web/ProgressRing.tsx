import type { CSSProperties } from 'react';
import { brandColors, spacingScale } from '@mk/tokens';
import { getWebTypography } from '../helpers';

export type WebProgressRingProps = {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  label?: string;
  value?: string;
  style?: CSSProperties;
};

export function WebProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  trackColor = `${brandColors.border}80`,
  progressColor = brandColors.accent,
  label,
  value,
  style,
}: WebProgressRingProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - normalizedProgress * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <svg width={size} height={size}>
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          stroke={progressColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: brandColors.text,
          textAlign: 'center',
          gap: spacingScale.xs,
        }}
      >
        {label ? (
          <span
            style={{
              ...getWebTypography('eyebrow'),
              color: brandColors.textMuted,
            }}
          >
            {label}
          </span>
        ) : null}
        {value ? (
          <span
            style={{
              ...getWebTypography('title'),
              color: brandColors.text,
            }}
          >
            {value}
          </span>
        ) : null}
      </div>
    </div>
  );
}
