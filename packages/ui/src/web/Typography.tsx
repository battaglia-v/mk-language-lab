import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { getWebTypography, type TypographyVariant } from '../helpers';

type WebTypographyProps<T extends ElementType = 'span'> = {
  as?: T;
  variant: TypographyVariant;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

export function WebTypography<T extends ElementType = 'span'>({
  as,
  variant,
  style,
  children,
  ...rest
}: WebTypographyProps<T>) {
  const Component = as ?? ('span' as ElementType);
  const variantStyle = getWebTypography(variant);
  return (
    <Component
      style={{
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
