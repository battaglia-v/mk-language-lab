'use client';

import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type SpacingVariant = 'compact' | 'normal' | 'spacious';

interface LessonSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Enable entrance animation */
  animate?: boolean;
  /** Spacing between child elements */
  spacing?: SpacingVariant;
  /** Additional class names */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface LessonSectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional badge content (e.g., count) */
  badge?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

interface LessonSectionCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant for styling */
  variant?: 'default' | 'highlighted' | 'muted' | 'success' | 'warning';
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Spacing Configuration
// ============================================================================

const SPACING_CLASSES: Record<SpacingVariant, string> = {
  compact: 'space-y-4',
  normal: 'space-y-6',
  spacious: 'space-y-8',
};

const PADDING_CLASSES = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const CARD_VARIANT_CLASSES = {
  default: 'bg-card border-border',
  highlighted: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
  muted: 'bg-muted/50 border-border/50',
  success: 'bg-green-500/5 border-green-500/20',
  warning: 'bg-amber-500/5 border-amber-500/20',
};

// ============================================================================
// LessonSection Component
// ============================================================================

/**
 * LessonSection - Unified wrapper for lesson content sections
 *
 * Provides consistent:
 * - Spacing between child elements
 * - Entrance animations
 * - Responsive padding
 *
 * Usage:
 * ```tsx
 * <LessonSection spacing="normal" animate>
 *   <LessonSection.Header title="Vocabulary" subtitle="Learn these words" />
 *   <LessonSection.Card variant="highlighted">
 *     ...content...
 *   </LessonSection.Card>
 * </LessonSection>
 * ```
 */
export function LessonSection({
  children,
  animate = true,
  spacing = 'normal',
  className,
  'data-testid': testId,
}: LessonSectionProps) {
  return (
    <div
      className={cn(
        SPACING_CLASSES[spacing],
        animate && 'animate-in fade-in slide-in-from-right-4 duration-300',
        className
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

// ============================================================================
// LessonSection.Header Component
// ============================================================================

/**
 * Section header with title, optional subtitle, and badge
 */
function LessonSectionHeader({
  title,
  subtitle,
  badge,
  className,
}: LessonSectionHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {badge && (
          <span className="text-sm text-muted-foreground">{badge}</span>
        )}
      </div>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

// ============================================================================
// LessonSection.Card Component
// ============================================================================

/**
 * Styled card for lesson content with consistent padding and variants
 */
function LessonSectionCard({
  children,
  variant = 'default',
  padding = 'md',
  className,
}: LessonSectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        CARD_VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// LessonSection.Grid Component
// ============================================================================

interface LessonSectionGridProps {
  /** Grid content */
  children: React.ReactNode;
  /** Number of columns on larger screens */
  columns?: 1 | 2 | 3;
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const GRID_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

const GRID_GAPS = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * Responsive grid for lesson items (vocabulary cards, exercises, etc.)
 */
function LessonSectionGrid({
  children,
  columns = 2,
  gap = 'sm',
  className,
}: LessonSectionGridProps) {
  return (
    <div
      className={cn(
        'grid',
        GRID_COLUMNS[columns],
        GRID_GAPS[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// LessonSection.Divider Component
// ============================================================================

interface LessonSectionDividerProps {
  /** Optional label in the divider */
  label?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Visual divider with optional label
 */
function LessonSectionDivider({ label, className }: LessonSectionDividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return <hr className={cn('border-border', className)} />;
}

// ============================================================================
// LessonSection.Tip Component
// ============================================================================

interface LessonSectionTipProps {
  /** Tip content */
  children: React.ReactNode;
  /** Tip variant */
  variant?: 'info' | 'warning' | 'success';
  /** Additional class names */
  className?: string;
}

const TIP_VARIANTS = {
  info: 'bg-primary/5 border-primary/20 text-primary',
  warning: 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400',
  success: 'bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400',
};

/**
 * Styled tip/hint box for lesson guidance
 */
function LessonSectionTip({
  children,
  variant = 'info',
  className,
}: LessonSectionTipProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border text-sm',
        TIP_VARIANTS[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Attach Sub-components
// ============================================================================

LessonSection.Header = LessonSectionHeader;
LessonSection.Card = LessonSectionCard;
LessonSection.Grid = LessonSectionGrid;
LessonSection.Divider = LessonSectionDivider;
LessonSection.Tip = LessonSectionTip;

export default LessonSection;
