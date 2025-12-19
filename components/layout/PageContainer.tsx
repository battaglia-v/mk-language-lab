import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

export type PageContainerSize =
  | 'sm' // 640px
  | 'md' // 768px
  | 'lg' // 1024px
  | 'xl' // 1280px
  | '2xl' // 1536px
  | 'content' // 896px - optimal for reading
  | 'wide' // 1120px - optimal for app content
  | 'full'; // 100% at all breakpoints

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container (applies at sm: breakpoint and above)
   * @default 'wide'
   */
  size?: PageContainerSize;

  /**
   * Render as a semantic element
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav';
}

/**
 * PageContainer component enforcing mobile-first layout contract.
 *
 * MOBILE-FIRST CONTRACT (NON-NEGOTIABLE):
 * - Mobile (<640px): FULL WIDTH with only px-4 padding, NO max-width
 * - Tablet+ (>=640px): Constrained with max-width and centered
 *
 * This ensures no "narrow app" feel on mobile devices.
 *
 * @example
 * ```tsx
 * <PageContainer size="content">
 *   <h1>Page Title</h1>
 *   <p>Content goes here</p>
 * </PageContainer>
 * ```
 *
 * @example
 * ```tsx
 * // Full width at all breakpoints
 * <PageContainer size="full">
 *   <HeroSection />
 * </PageContainer>
 * ```
 */
export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ size = 'wide', as: Component = 'div', className, children, ...props }, ref) => {
    // Mobile-first: Always full width with px-4 padding on mobile
    // Only apply max-width at sm: breakpoint and above
    const sizeClasses = {
      sm: 'sm:max-w-screen-sm',
      md: 'sm:max-w-screen-md',
      lg: 'sm:max-w-screen-lg',
      xl: 'sm:max-w-screen-xl',
      '2xl': 'sm:max-w-screen-2xl',
      content: 'sm:max-w-[56rem]', // 896px
      wide: 'sm:max-w-[70rem]', // 1120px
      full: '', // No max-width at any breakpoint
    };

    return (
      <Component
        ref={ref}
        className={cn(
          // Mobile: full width with normal padding
          'w-full max-w-none px-4',
          // Tablet+: constrained width, centered, more padding
          size !== 'full' && [sizeClasses[size], 'sm:mx-auto sm:px-6'],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

PageContainer.displayName = 'PageContainer';
