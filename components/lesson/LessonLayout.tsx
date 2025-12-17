'use client';

import { ReactNode } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LessonLayoutProps {
  /** Lesson title */
  title: string;
  /** Current progress (0-100) */
  progress: number;
  /** Main content area */
  children: ReactNode;
  /** Primary action button config */
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  /** Secondary action (skip/hint) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Back/exit handler */
  onExit: () => void;
  /** Additional class */
  className?: string;
}

/**
 * Duolingo-style full-screen lesson layout
 * - Sticky top: back button + title + progress
 * - Scrollable content area
 * - Sticky bottom: action buttons
 */
export function LessonLayout({
  title,
  progress,
  children,
  primaryAction,
  secondaryAction,
  onExit,
  className,
}: LessonLayoutProps) {
  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col bg-background', className)}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-background/95 backdrop-blur px-4 py-3 safe-area-top">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onExit}
          aria-label="Exit lesson"
          className="shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <Progress value={progress} className="h-2" />
        </div>
        <span className="text-xs font-medium text-muted-foreground shrink-0">
          {Math.round(progress)}%
        </span>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-6 text-xl font-bold text-foreground">{title}</h1>
          {children}
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <footer className="sticky bottom-0 z-10 border-t border-border/40 bg-background/95 backdrop-blur px-4 py-4 safe-area-bottom">
        <div className="mx-auto flex max-w-lg gap-3">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="flex-1 min-h-[52px]"
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className={cn('min-h-[52px]', secondaryAction ? 'flex-[2]' : 'w-full')}
            >
              {primaryAction.loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading...
                </span>
              ) : (
                primaryAction.label
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
