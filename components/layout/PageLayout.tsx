import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageLayoutProps {
  /**
   * Page content
   */
  children: ReactNode;

  /**
   * Optional className for the main content wrapper
   */
  className?: string;

  /**
   * Whether to add top padding for fixed header
   * @default true
   */
  withHeaderPadding?: boolean;

  /**
   * Whether to add bottom padding for mobile bottom nav
   * @default true
   */
  withMobileNavPadding?: boolean;
}

/**
 * PageLayout wrapper component that provides consistent spacing
 * for page content. Works with the existing Sidebar and TopNav components.
 *
 * Features:
 * - Automatic spacing for fixed header and mobile bottom nav
 * - Flexible content area
 * - Sidebar offset on desktop
 * - Full viewport height for contained layouts
 *
 * @example
 * ```tsx
 * <PageLayout>
 *   <Container size="wide" spacing="lg">
 *     <h1>Page Title</h1>
 *     <p>Content goes here</p>
 *   </Container>
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  className,
  withHeaderPadding = true,
  withMobileNavPadding = true,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        withHeaderPadding && 'pt-14 lg:pt-16',
        withMobileNavPadding && 'pb-16 lg:pb-0',
        className
      )}
    >
      {children}
    </div>
  );
}
