'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  variant?: 'default' | 'primary' | 'outline';
};

export function CardButton({
  href, onClick, icon: Icon, title, subtitle, badge,
  disabled, active, className, variant = 'default',
}: Props) {
  const baseStyles = cn(
    'group flex min-h-[52px] w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    variant === 'primary' && 'bg-gradient-to-r from-primary to-amber-500 text-primary-foreground border-transparent shadow-lg',
    variant === 'outline' && 'border-border/60 bg-transparent hover:bg-muted/10 hover:border-primary/40',
    variant === 'default' && 'border-border/40 bg-card hover:bg-muted/20',
    active && 'border-primary/70 bg-primary/15 ring-1 ring-primary/25',
    disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
    className
  );

  const content = (
    <>
      {Icon && (
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          variant === 'primary' ? 'bg-white/20' : 'bg-muted/30'
        )}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{title}</p>
        {subtitle && <p className={cn('text-sm truncate', variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{subtitle}</p>}
      </div>
      {badge}
    </>
  );

  if (href && !disabled) {
    return <Link href={href} className={baseStyles}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={baseStyles}>
      {content}
    </button>
  );
}
