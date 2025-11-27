import type { ButtonHTMLAttributes, CSSProperties, ReactElement } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { brandColors, designTokens, radii, semanticColors, spacingScale } from '@mk/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type WebButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  asChild?: boolean;
};

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacingScale.xs,
  borderRadius: radii['3xl'],
  borderWidth: 2,
  borderStyle: 'solid',
  fontWeight: 700,
  padding: `${spacingScale.sm}px ${spacingScale.xl}px`,
  cursor: 'pointer',
  transition: 'transform 150ms ease, box-shadow 150ms ease',
  textDecoration: 'none',
  color: brandColors.text,
};

const variantMap: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: brandColors.accent,
    borderColor: brandColors.accentEmphasis,
    color: semanticColors.textOnPrimary,
    boxShadow: designTokens.elevation.md,
  },
  secondary: {
    backgroundColor: brandColors.accentGreen,
    borderColor: brandColors.greenDark,
    color: semanticColors.textOnSecondary,
    boxShadow: designTokens.elevation.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: brandColors.accent,
    color: brandColors.accent,
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
