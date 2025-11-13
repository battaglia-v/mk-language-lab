import type { PropsWithChildren } from 'react';
import type { TextProps } from 'react-native';
import { Text } from 'react-native';
import { getNativeTypography, type TypographyVariant } from '../helpers';

type NativeTypographyProps = PropsWithChildren<TextProps & { variant?: TypographyVariant }>;

export function NativeTypography({ variant = 'body', style, children, ...rest }: NativeTypographyProps) {
  return (
    <Text style={[getNativeTypography(variant), style]} {...rest}>
      {children}
    </Text>
  );
}
