import type { ButtonHTMLAttributes, CSSProperties, ReactElement } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { brandColors, spacingScale, radii } from '@mk/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type WebButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
};

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: radii['3xl'],
  borderWidth: 2,
  borderStyle: 'solid',
  fontWeight: 600,
  padding: `${spacingScale.sm}px ${spacingScale.xl}px`,
  cursor: 'pointer',
  transition: 'transform 150ms ease, box-shadow 150ms ease',
  textDecoration: 'none',
};

const variantMap: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: brandColors.red,
    borderColor: brandColors.redDark,
    color: brandColors.creamLight,
    boxShadow: `0 10px 20px rgba(215, 38, 61, 0.2)`,
  },
  secondary: {
    backgroundColor: brandColors.gold,
    borderColor: brandColors.goldDark,
    color: brandColors.navy,
    boxShadow: `0 10px 20px rgba(247, 201, 72, 0.25)`,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: brandColors.red,
    color: brandColors.red,
    boxShadow: 'none',
  },
};

export const WebButton = forwardRef<HTMLButtonElement, WebButtonProps>(function WebButton(
  { children, variant = 'primary', asChild = false, style, ...rest },
  ref,
) {
  const styleObject: CSSProperties = {
    ...baseStyle,
    ...variantMap[variant],
    ...style,
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ style?: CSSProperties }>;
    return cloneElement(child, {
      style: {
        ...styleObject,
        ...(child.props.style ?? {}),
      },
    });
  }

  return (
    <button ref={ref} style={styleObject} {...rest}>
      {children}
    </button>
  );
});
