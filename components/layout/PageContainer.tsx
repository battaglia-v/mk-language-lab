import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';
import { Container, ContainerSize, ContainerSpacing } from './Container';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   * @default 'wide'
   */
  size?: ContainerSize;

  /**
   * Vertical padding (responsive)
   * @default 'md'
   */
  spacing?: ContainerSpacing;

  /**
   * Disable horizontal padding (useful for full-bleed content)
   * @default false
   */
  noPadding?: boolean;

  /**
   * Render as a semantic element
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav';
}

/**
 * Mobile-first page container with proper spacing and overflow handling.
 *
 * Key features:
 * - w-full min-w-0 to prevent overflow
 * - Mobile-first horizontal padding (px-4 → px-6 → px-8)
 * - Wraps existing Container component for max-width control
 * - Responsive vertical spacing
 *
 * @example
 * ```tsx
 * <PageContainer size="content" spacing="lg">
 *   <h1>Page Title</h1>
 *   <p>Content goes here</p>
 * </PageContainer>
 * ```
 *
 * @example
 * ```tsx
 * // Full width with no padding for custom layouts
 * <PageContainer size="full" spacing="none" noPadding>
 *   <CustomHero />
 * </PageContainer>
 * ```
 */
export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      size = 'wide',
      spacing = 'md',
      noPadding = false,
      as = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Container
        ref={ref}
        size={size}
        spacing={spacing}
        as={as}
        className={cn(
          'w-full min-w-0', // Prevent overflow on mobile
          !noPadding && 'px-4 sm:px-6 md:px-8', // Mobile-first horizontal padding
          className
        )}
        {...props}
      >
        {children}
      </Container>
    );
  }
);

PageContainer.displayName = 'PageContainer';
