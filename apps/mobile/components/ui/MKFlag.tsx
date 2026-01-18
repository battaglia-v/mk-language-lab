/**
 * Macedonian Flag Component for React Native
 * 
 * Uses the native 🇲🇰 emoji for consistent, recognizable display.
 * 
 * @see PARITY_CHECKLIST.md - UI parity
 * @see components/ui/MKFlag.tsx (PWA implementation)
 */

import React from 'react';
import { Text } from 'react-native';

type MKFlagProps = {
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * North Macedonia Flag Emoji Component
 */
export function MKFlag({ size = 'md' }: MKFlagProps) {
  return (
    <Text
      style={{ fontSize: SIZE_MAP[size], lineHeight: SIZE_MAP[size] * 1.2 }}
      accessibilityLabel="Macedonian flag"
    >
      🇲🇰
    </Text>
  );
}

export default MKFlag;
