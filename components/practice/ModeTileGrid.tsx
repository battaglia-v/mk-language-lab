'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { LucideIcon, Volume2, Brain, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ModeTileGrid - 2-column grid of practice mode tiles
 *
 * Duolingo-style mode selection with large tappable tiles
 * Each tile shows: icon, title, description, and card count badge
 */

export type ModeTile = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  cardCount?: number;
  badge?: string;
  variant?: 'default' | 'primary' | 'accent';
  disabled?: boolean;
};

export type ModeTileGridProps = {
  tiles: ModeTile[];
  className?: string;
};

const defaultTiles: Omit<ModeTile, 'href'>[] = [
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Master patterns',
    icon: Brain,
    variant: 'default',
  },
  {
    id: 'word-sprint',
    title: 'Word Sprint',
    description: 'Fill the gap',
    icon: FileText,
    variant: 'primary',
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Build word bank',
    icon: Sparkles,
    variant: 'default',
  },
];

export function ModeTileGrid({ tiles, className }: ModeTileGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {tiles.map((tile) => (
        <ModeTileCard key={tile.id} tile={tile} />
      ))}
    </div>
  );
}

function ModeTileCard({ tile }: { tile: ModeTile }) {
  const Icon = tile.icon;
  const locale = useLocale();

  const content = (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-2xl p-4 transition-all duration-200',
        'min-h-[120px] sm:min-h-[140px]',
        // Touch target ensures 44px minimum
        'active:scale-[0.98]',
        // Variants
        tile.variant === 'primary'
          ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 hover:border-primary/50'
          : tile.variant === 'accent'
          ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 hover:border-amber-500/50'
          : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8',
        tile.disabled && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          tile.variant === 'primary'
            ? 'bg-primary/20 text-primary'
            : tile.variant === 'accent'
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-white/10 text-white/80'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{tile.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {tile.description}
        </p>
      </div>

      {/* Badge or card count */}
      {(tile.badge || tile.cardCount) && (
        <div className="flex items-center justify-between">
          {tile.badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {tile.badge}
            </span>
          )}
          {tile.cardCount !== undefined && tile.cardCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {tile.cardCount} cards
            </span>
          )}
        </div>
      )}

      {/* Arrow indicator */}
      <ArrowRight
        className={cn(
          'absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0',
          'transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5'
        )}
      />
    </div>
  );

  if (tile.disabled) {
    return content;
  }

  // Ensure href has locale if not already
  const href = tile.href.startsWith(`/${locale}`)
    ? tile.href
    : `/${locale}${tile.href}`;

  return <Link href={href}>{content}</Link>;
}

/**
 * Pre-configured grid with standard practice modes
 */
export function StandardModeTileGrid({
  className,
  cardCounts,
}: {
  className?: string;
  cardCounts?: Record<string, number>;
}) {
  const locale = useLocale();

  const tiles: ModeTile[] = defaultTiles.map((tile) => ({
    ...tile,
    href: `/${locale}/practice/${tile.id}`,
    cardCount: cardCounts?.[tile.id],
  }));

  return <ModeTileGrid tiles={tiles} className={className} />;
}

/**
 * Continue CTA - The dominant action button for the practice hub
 */
export function ContinueCTA({
  href,
  label = 'Continue',
  subtitle,
  className,
}: {
  href: string;
  label?: string;
  subtitle?: string;
  className?: string;
}) {
  const locale = useLocale();
  const fullHref = href.startsWith(`/${locale}`) ? href : `/${locale}${href}`;

  return (
    <Link
      href={fullHref}
      className={cn(
        'group flex items-center justify-between gap-4 rounded-2xl p-4 sm:p-5',
        'bg-gradient-to-r from-primary via-primary to-amber-500',
        'text-slate-950 font-bold',
        'shadow-lg shadow-primary/20',
        'transition-all duration-200 hover:brightness-105 active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6" />
        <div>
          <span className="text-lg">{label}</span>
          {subtitle && (
            <p className="text-sm font-normal opacity-80">{subtitle}</p>
          )}
        </div>
      </div>
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
