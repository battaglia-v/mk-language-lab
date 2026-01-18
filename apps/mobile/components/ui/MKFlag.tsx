/**
 * Macedonian Flag Component for React Native
 * 
 * The flag of North Macedonia: Red field with a stylized yellow sun
 * with eight broadening rays extending from the center to the edges.
 * Adopted in 1995.
 * 
 * @see PARITY_CHECKLIST.md - UI parity
 * @see components/ui/MKFlag.tsx (PWA implementation)
 */

import React from 'react';
import { View } from 'react-native';
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
  sm: { width: 16, height: 8 },
  md: { width: 24, height: 12 },
  lg: { width: 32, height: 16 },
  xl: { width: 48, height: 24 },
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
      <Svg viewBox="0 0 2 1" width={width} height={height}>
        {/* Red background */}
        <Rect width="2" height="1" fill="#D20000" />

        {/* 8 broadening rays extending to flag edges */}
        {/* Top ray */}
        <Polygon points="0.88,0 1,0.5 1.12,0" fill="#FFE600" />
        {/* Top-right ray */}
        <Polygon points="2,0 1,0.5 2,0.35" fill="#FFE600" />
        {/* Right ray */}
        <Polygon points="2,0.38 1,0.5 2,0.62" fill="#FFE600" />
        {/* Bottom-right ray */}
        <Polygon points="2,0.65 1,0.5 2,1" fill="#FFE600" />
        {/* Bottom ray */}
        <Polygon points="1.12,1 1,0.5 0.88,1" fill="#FFE600" />
        {/* Bottom-left ray */}
        <Polygon points="0,1 1,0.5 0,0.65" fill="#FFE600" />
        {/* Left ray */}
        <Polygon points="0,0.62 1,0.5 0,0.38" fill="#FFE600" />
        {/* Top-left ray */}
        <Polygon points="0,0.35 1,0.5 0,0" fill="#FFE600" />

        {/* Central sun disc with red ring */}
        <Circle cx="1" cy="0.5" r="0.2" fill="#FFE600" />
        <Circle cx="1" cy="0.5" r="0.15" fill="#D20000" />
        <Circle cx="1" cy="0.5" r="0.1" fill="#FFE600" />
      </Svg>
    </View>
  );
}

export default MKFlag;
