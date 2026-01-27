'use client';

/**
 * SkipLink Component
 * 
 * Provides keyboard-only navigation shortcuts for accessibility.
 * Visible only when focused via keyboard (Tab key).
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  /** Target element ID to skip to */
  href?: string;
  /** Override the default label */
  label?: string;
  /** Additional class names */
  className?: string;
  dataTestId?: string;
}

export function SkipLink({
  href = '#main-content',
  label,
  className,
  dataTestId = 'skip-link'
}: SkipLinkProps) {
  const t = useTranslations('accessibility');

  return (
    <a
      href={href}
      data-testid={dataTestId}
      className={cn(
        // Use the same CSS approach as TopNav's skip link for reliability
        'skip-nav-link',
        className
      )}
    >
      {label || t('skipToMainContent')}
    </a>
  );
}

/**
 * SkipLinks - Multiple skip navigation targets
 * 
 * Provides multiple navigation shortcuts for complex pages.
 */
interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  const t = useTranslations('accessibility');

  const defaultLinks = [
    { href: '#main-content', label: t('skipToMainContent') },
    { href: '#navigation', label: t('skipToNavigation') },
  ];

  const allLinks = links || defaultLinks;

  return (
    <div className={cn('fixed left-0 top-0 z-[var(--z-skip-link)]', className)}>
      {allLinks.map((link, index) => (
        <a
          key={link.href}
          href={link.href}
          data-testid={`skip-link-${index}`}
          className={cn(
            // Hidden by default
            'sr-only',
            // Visible on focus
            'focus:not-sr-only focus:absolute',
            // Stagger position for multiple links
            'focus:left-4',
            index === 0 ? 'focus:top-4' : 'focus:top-16',
            // Styling
            'focus:rounded-[var(--radius-control)] focus:bg-primary focus:px-4 focus:py-3',
            'focus:text-primary-foreground focus:text-sm focus:font-medium',
            // Focus ring
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            // Animation
            'focus:animate-in focus:fade-in-0 focus:slide-in-from-top-2',
            // Minimum touch target
            'focus:min-h-[48px] focus:flex focus:items-center'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

/**
 * VisuallyHidden - Hide content visually but keep it accessible
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
}

/**
 * LiveRegion - Announce dynamic content changes to screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  /** 'polite' waits for user to finish, 'assertive' interrupts */
  priority?: 'polite' | 'assertive';
  /** 'additions' only announces new content, 'all' announces all changes */
  relevant?: 'additions' | 'all' | 'removals' | 'text';
  /** Whether the region is atomic (announce all content) or not */
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({ 
  children, 
  priority = 'polite',
  relevant = 'additions',
  atomic = false,
  className 
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-relevant={relevant}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

/**
 * FocusTrap - Trap focus within a container (for modals, dialogs)
 * Note: For most cases, use the Dialog component from shadcn/ui
 * which includes focus trapping. This is for custom implementations.
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  return { handleKeyDown };
}
