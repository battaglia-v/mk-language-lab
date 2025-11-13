import type { PropsWithChildren } from 'react';
import type { ButtonProps } from 'tamagui';
import { Button, styled } from 'tamagui';

export type NativeButtonVariant = 'primary' | 'secondary' | 'ghost';

type NativeButtonProps = PropsWithChildren<Omit<ButtonProps, 'variant'> & { variant?: NativeButtonVariant }>;

const StyledButton = styled(Button, {
  name: 'NativeButton',
  borderRadius: '$radius.3xl',
  borderWidth: 2,
  gap: '$sm',
  fontFamily: '$body',
  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        borderColor: '$primaryDark',
        color: '#fff',
      },
      secondary: {
        backgroundColor: '$secondary',
        borderColor: '$secondaryDark',
        color: '$color',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: '$primary',
        color: '$primary',
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export function NativeButton({ children, variant = 'primary', ...rest }: NativeButtonProps) {
  return (
    <StyledButton variant={variant} {...rest}>
      {children}
    </StyledButton>
  );
}
