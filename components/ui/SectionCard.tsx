import { forwardRef, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { cn } from '@/lib/utils';

export interface SectionCardProps {
  /**
   * Card title
   */
  title?: string;

  /**
   * Card description (optional subtitle)
   */
  description?: string;

  /**
   * Action buttons or elements for the header
   */
  actions?: ReactNode;

  /**
   * Main card content
   */
  children: ReactNode;

  /**
   * Footer content (optional)
   */
  footer?: ReactNode;

  /**
   * Additional className for the card root
   */
  className?: string;

  /**
   * Additional className for the content area
   */
  contentClassName?: string;
}

/**
 * Mobile-optimized section card with responsive padding.
 *
 * Key features:
 * - No fixed widths (fluid by default)
 * - Responsive padding: p-4 → p-5 → p-6
 * - Optional title, description, actions, and footer
 * - Extends existing Card component
 *
 * @example
 * ```tsx
 * <SectionCard
 *   title="Recent Activity"
 *   description="Your practice sessions this week"
 *   actions={<Button variant="ghost">View All</Button>}
 * >
 *   <ActivityList />
 * </SectionCard>
 * ```
 *
 * @example
 * ```tsx
 * // Simple card without header
 * <SectionCard>
 *   <p>Card content goes here</p>
 * </SectionCard>
 * ```
 */
export const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
  (
    {
      title,
      description,
      actions,
      children,
      footer,
      className,
      contentClassName,
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={cn('w-full min-w-0', className)}>
        {(title || description || actions) && (
          <CardHeader className="p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 min-w-0">
              <div className="flex-1 min-w-0">
                {title && <CardTitle className="truncate">{title}</CardTitle>}
                {description && (
                  <CardDescription className="mt-1.5 line-clamp-2">
                    {description}
                  </CardDescription>
                )}
              </div>
              {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
          </CardHeader>
        )}
        <CardContent
          className={cn(
            'p-4 sm:p-5 md:p-6',
            (title || description || actions) && 'pt-0',
            contentClassName
          )}
        >
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="p-4 pt-0 sm:p-5 sm:pt-0 md:p-6 md:pt-0">
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

SectionCard.displayName = 'SectionCard';
