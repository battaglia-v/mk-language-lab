'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

type InfoPanelProps = {
  title: string;
  description?: string;
  items?: string[];
  icon?: ReactNode;
  cta?: {
    label: string;
    href: string;
    note?: string;
    external?: boolean;
  };
  className?: string;
};

export function InfoPanel({ title, description, items, icon, cta, className }: InfoPanelProps) {
  return (
    <Card className={cn('rounded-2xl border-border/40 bg-card/70 p-5', className)}>
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background/80 text-primary">
            {icon}
          </div>
        ) : null}
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>

      {items && items.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm text-foreground/90">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {cta ? (
        <div className="mt-4 space-y-1">
          <Button
            asChild
            variant="outline"
            className="w-full justify-center rounded-full border-border/50 bg-background text-sm font-semibold"
          >
            <a
              href={cta.href}
              target={cta.external ? '_blank' : undefined}
              rel={cta.external ? 'noreferrer' : undefined}
            >
              {cta.label}
              {cta.external ? <ExternalLink className="ml-2 h-4 w-4" /> : null}
            </a>
          </Button>
          {cta.note ? (
            <p className="text-center text-xs text-muted-foreground">{cta.note}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
