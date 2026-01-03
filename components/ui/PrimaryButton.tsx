'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Loading state */
  loading?: boolean;
  /** Visual variant */
  variant?: 'default' | 'success' | 'outline';
  /** Size variant - all maintain 44px+ touch target */
  size?: 'default' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Haptic feedback pattern on click */
  haptic?: 'light' | 'medium' | 'success' | false;
}

/**
 * PrimaryButton - Main action button for sessions and CTAs
 *
 * Always 44px+ height for touch targets (WCAG 2.1 AA).
 * Includes optional haptic feedback on tap.
 *
 * @example
 * <PrimaryButton onClick={handleCheck}>Check</PrimaryButton>
 * <PrimaryButton variant="success" loading>Checking...</PrimaryButton>
 * <PrimaryButton variant="outline" onClick={handleSkip}>Skip</PrimaryButton>
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      children,
      className,
      loading = false,
      variant = 'default',
      size = 'default',
      fullWidth = true,
      haptic: hapticFeedback = 'light',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback && !disabled && !loading) {
        triggerHaptic(hapticFeedback);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-[0.98]',

          // Size variants (minimum 44px height)
          size === 'default' && 'h-12 px-6 text-base',
          size === 'lg' && 'h-14 px-8 text-lg',

          // Color variants
          variant === 'default' && [
            'bg-primary text-black',
            'hover:bg-primary/90',
            'shadow-md shadow-primary/20',
          ],
          variant === 'success' && [
            'bg-emerald-500 text-white',
            'hover:bg-emerald-500/90',
            'shadow-md shadow-emerald-500/20',
          ],
          variant === 'outline' && [
            'border-2 border-border bg-transparent text-foreground',
            'hover:bg-muted/50 hover:border-muted-foreground/30',
          ],

          // Width
          fullWidth && 'w-full',

          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
