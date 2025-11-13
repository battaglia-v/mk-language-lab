import type { PropsWithChildren } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { XStack, styled } from 'tamagui';
import { brandColors } from '@mk/tokens';
import { NativeTypography } from './Typography';

type Accent = 'red' | 'gold' | 'green';

const accentMap: Record<Accent, { background: string; border: string; color: string }> = {
  red: {
    background: `${brandColors.red}22`,
    border: `${brandColors.redDark}55`,
    color: brandColors.redDark,
  },
  gold: {
    background: `${brandColors.gold}33`,
    border: `${brandColors.goldDark}55`,
    color: brandColors.goldDark,
  },
  green: {
    background: brandColors.mint,
    border: `${brandColors.green}55`,
    color: brandColors.greenDark,
  },
};

export type NativeStatPillProps = PropsWithChildren<{
  label: string;
  value: string;
  accent?: Accent;
  style?: StyleProp<ViewStyle>;
}>;

const PillBase = styled(XStack, {
  name: 'NativeStatPill',
  alignItems: 'center',
  gap: '$xs',
  borderRadius: '$radius.pill',
  borderWidth: 1,
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
});

export function NativeStatPill({ label, value, accent = 'red', style }: NativeStatPillProps) {
  const palette = accentMap[accent];
  return (
    <PillBase style={[{ backgroundColor: palette.background, borderColor: palette.border }, style]}>
      <NativeTypography variant="caption" style={{ color: palette.color, letterSpacing: 1 }}>
        {label.toUpperCase()}
      </NativeTypography>
      <NativeTypography variant="body" style={{ color: palette.color, fontWeight: '600' }}>
        {value}
      </NativeTypography>
    </PillBase>
  );
}
