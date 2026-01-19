/**
 * ProgressBar - Unified progress bar component
 * 
 * Provides consistent styling across all screens
 * Supports different variants for different contexts
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';

type ProgressBarVariant = 'default' | 'primary' | 'challenge' | 'success' | 'grammar';

interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  progress: number;
  /** Visual variant */
  variant?: ProgressBarVariant;
  /** Custom height (default: 6) */
  height?: number;
  /** Whether to animate changes */
  animated?: boolean;
  /** Custom style for container */
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<ProgressBarVariant, { track: string; fill: string }> = {
  default: {
    track: 'rgba(247,248,251,0.1)',
    fill: '#f6d83b',
  },
  primary: {
    track: '#222536',
    fill: '#f6d83b',
  },
  challenge: {
    track: 'rgba(168,85,247,0.2)',
    fill: '#a855f7',
  },
  success: {
    track: 'rgba(34,197,94,0.2)',
    fill: '#22c55e',
  },
  grammar: {
    track: 'rgba(139,92,246,0.2)',
    fill: '#8b5cf6',
  },
};

export function ProgressBar({
  progress,
  variant = 'default',
  height = 6,
  animated = false,
  style,
}: ProgressBarProps) {
  const colors = VARIANT_COLORS[variant];
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: colors.track },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: colors.fill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ProgressBar;
