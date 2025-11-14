import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

export type ContainerSize =
  | 'sm'      // 640px
  | 'md'      // 768px
  | 'lg'      // 1024px
  | 'xl'      // 1280px
  | '2xl'     // 1536px
  | 'content' // 896px - optimal for reading
  | 'wide'    // 1120px - optimal for app content
  | 'full';   // 100%

export type ContainerSpacing = 'sm' | 'md' | 'lg' | 'xl' | 'none';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   * @default 'wide'
   */
  size?: ContainerSize;

  /**
   * Vertical padding (responsive)
   * @default 'none'
   */
  spacing?: ContainerSpacing;

  /**
   * Whether to center the container horizontally
   * @default true
   */
  center?: boolean;

  /**
   * Render as a semantic element
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav';
}

/**
 * Container component for consistent page layout and spacing.
 *
 * @example
 * ```tsx
 * <Container size="content" spacing="lg">
 *   <h1>Page Title</h1>
 *   <p>Content goes here</p>
 * </Container>
 * ```
 *
 * @example
 * ```tsx
 * // Full width container with no spacing
 * <Container size="full" spacing="none">
 *   <HeroSection />
 * </Container>
 * ```
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'wide',
      spacing = 'none',
      center = true,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'section-container',
          center && 'mx-auto',
          size !== 'full' && {
            'section-container-sm': size === 'sm',
            'section-container-md': size === 'md',
            'section-container-lg': size === 'lg',
            'section-container-xl': size === 'xl',
            'section-container-2xl': size === '2xl',
            'section-container-content': size === 'content',
            'section-container-wide': size === 'wide',
          },
          spacing !== 'none' && {
            'section-spacing-sm': spacing === 'sm',
            'section-spacing-md': spacing === 'md',
            'section-spacing-lg': spacing === 'lg',
            'section-spacing-xl': spacing === 'xl',
          },
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';
