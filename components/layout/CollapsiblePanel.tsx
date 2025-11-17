'use client';

import { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export type CollapsiblePanelProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function CollapsiblePanel({
  title,
  eyebrow,
  description,
  children,
  defaultOpen = false,
  className,
}: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={clsx('fold-panel', className)}>
      <button
        type="button"
        className="fold-panel-summary"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="space-y-1 text-left">
          {eyebrow ? <p className="fold-eyebrow">{eyebrow}</p> : null}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="fold-description">{description}</p> : null}
        </div>
        <ChevronDown
          aria-hidden="true"
          className={clsx('fold-panel-icon', isOpen && 'rotate-180')}
        />
      </button>
      <div className={clsx('fold-panel-content', !isOpen && 'fold-panel-content-collapsed')}>{children}</div>
    </section>
  );
}
