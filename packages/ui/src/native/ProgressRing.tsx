import type { PropsWithChildren } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from 'tamagui';
import { NativeTypography } from './Typography';

export type NativeProgressRingProps = PropsWithChildren<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  label?: string;
  value?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function NativeProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  trackColor,
  progressColor,
  label,
  value,
  style,
}: NativeProgressRingProps) {
  const theme = useTheme();
  const resolvedTrackColor = trackColor ?? theme.borderColor?.val ?? 'rgba(16,24,40,0.12)';
  const resolvedProgressColor = progressColor ?? theme.primary?.val ?? '#D7263D';
  const normalized = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - normalized * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={resolvedTrackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <Circle
          stroke={resolvedProgressColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.label}>
        {label ? (
          <NativeTypography variant="caption" style={styles.caption}>
            {label.toUpperCase()}
          </NativeTypography>
        ) : null}
        {value ? (
          <NativeTypography variant="title">
            {value}
          </NativeTypography>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  caption: {
    letterSpacing: 1,
  },
});
