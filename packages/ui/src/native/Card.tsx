import type { PropsWithChildren } from 'react';
import type { StackProps } from 'tamagui';
import { YStack, styled } from 'tamagui';

type NativeCardProps = PropsWithChildren<StackProps & { emphasis?: 'base' | 'card' | 'accent' }>;

const CardBase = styled(YStack, {
  name: 'NativeCard',
  borderRadius: '$radius.3xl',
  borderWidth: 1,
  padding: '$lg',
  gap: '$sm',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
  variants: {
    emphasis: {
      base: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
      },
      card: {
        backgroundColor: '$surface',
        borderColor: '$borderColor',
      },
      accent: {
        backgroundColor: '$secondary',
        borderColor: '$secondaryDark',
      },
    },
  },
  defaultVariants: {
    emphasis: 'card',
  },
});

export function NativeCard({ children, emphasis = 'card', ...rest }: NativeCardProps) {
  return (
    <CardBase emphasis={emphasis} {...rest}>
      {children}
    </CardBase>
  );
}
