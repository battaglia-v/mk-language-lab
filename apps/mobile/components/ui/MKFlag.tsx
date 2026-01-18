/**
 * Macedonian Flag Component for React Native
 * 
 * Uses actual flag colors and design for consistent rendering
 * across all platforms (unlike emoji which varies by OS)
 * 
 * Flag design: Red background with golden/yellow sun with 8 rays
 * 
 * @see PARITY_CHECKLIST.md - UI parity
 * @see components/ui/MKFlag.tsx (PWA implementation)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Polygon, Circle } from 'react-native-svg';

type MKFlagProps = {
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom width (overrides size) */
  width?: number;
  /** Custom height (overrides size) */
  height?: number;
};

const SIZE_MAP = {
  sm: { width: 16, height: 12 },
  md: { width: 24, height: 16 },
  lg: { width: 32, height: 24 },
  xl: { width: 48, height: 32 },
};

/**
 * North Macedonia Flag SVG Component
 * 
 * Renders the actual Macedonian flag (red background with golden sun)
 * for consistent display across iOS, Android, and Web.
 */
export function MKFlag({ size = 'md', width: customWidth, height: customHeight }: MKFlagProps) {
  const { width, height } = customWidth && customHeight 
    ? { width: customWidth, height: customHeight }
    : SIZE_MAP[size];

  return (
    <View style={{ width, height }}>
      <Svg viewBox="0 0 28 14" width={width} height={height}>
        {/* Red background */}
        <Rect width="28" height="14" fill="#D20000" />

        {/* Golden rays extending from center to corners and edges */}
        {/* Top ray */}
        <Polygon points="14,0 11,7 17,7" fill="#FFD200" />
        {/* Bottom ray */}
        <Polygon points="14,14 11,7 17,7" fill="#FFD200" />
        {/* Left ray */}
        <Polygon points="0,7 14,4 14,10" fill="#FFD200" />
        {/* Right ray */}
        <Polygon points="28,7 14,4 14,10" fill="#FFD200" />

        {/* Diagonal rays */}
        {/* Top-left */}
        <Polygon points="0,0 14,7 11,4" fill="#FFD200" />
        <Polygon points="0,0 14,7 4,10" fill="#FFD200" />
        {/* Top-right */}
        <Polygon points="28,0 14,7 17,4" fill="#FFD200" />
        <Polygon points="28,0 14,7 24,10" fill="#FFD200" />
        {/* Bottom-left */}
        <Polygon points="0,14 14,7 11,10" fill="#FFD200" />
        <Polygon points="0,14 14,7 4,4" fill="#FFD200" />
        {/* Bottom-right */}
        <Polygon points="28,14 14,7 17,10" fill="#FFD200" />
        <Polygon points="28,14 14,7 24,4" fill="#FFD200" />

        {/* Central sun circle */}
        <Circle cx="14" cy="7" r="3" fill="#FFD200" />

        {/* Red circle in center of sun */}
        <Circle cx="14" cy="7" r="2" fill="#D20000" />

        {/* Golden border around red center */}
        <Circle cx="14" cy="7" r="1.5" fill="#FFD200" />
      </Svg>
    </View>
  );
}

export default MKFlag;
