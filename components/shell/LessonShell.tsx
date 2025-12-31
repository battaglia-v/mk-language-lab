'use client';

import { X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LessonShellProps {
  /** Content to render in the main area */
  children: React.ReactNode;
  /** Current progress (0-100) */
  progress?: number;
  /** Current question/step number */
  current?: number;
  /** Total questions/steps */
  total?: number;
  /** XP earned so far (optional, shows in header) */
  xp?: number;
  /** Callback when close button clicked. If not provided, uses router.back() */
  onClose?: () => void;
  /** Custom close destination URL */
  closeHref?: string;
  /** Content for sticky bottom action area */
  footer?: React.ReactNode;
  /** Additional class for main content area */
  className?: string;
}

/**
 * LessonShell - Full-screen session layout without bottom navigation
 *
 * Used for practice sessions, drills, pronunciation exercises, etc.
 * Provides consistent header (close + progress) and sticky action footer.
 *
 * @example
 * <LessonShell
 *   progress={60}
 *   current={6}
 *   total={10}
 *   xp={45}
 *   footer={<PrimaryButton onClick={handleNext}>Continue</PrimaryButton>}
 * >
 *   <QuestionContent />
 * </LessonShell>
 */
export function LessonShell({
  children,
  progress = 0,
  current,
  total,
  xp,
  onClose,
  closeHref,
  footer,
  className,
}: LessonShellProps) {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeHref) {
      router.push(closeHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Sticky Header: Close + Progress + XP */}
      <header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50"
        style={{ paddingTop: 'var(--safe-area-top)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-10 w-10 shrink-0 rounded-full hover:bg-muted/50"
            aria-label="Close session"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            {current !== undefined && total !== undefined && (
              <span className="text-sm font-medium tabular-nums text-muted-foreground shrink-0">
                {current}/{total}
              </span>
            )}
          </div>

          {/* XP Display (optional) */}
          {xp !== undefined && xp > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 shrink-0">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold tabular-nums text-primary">+{xp}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn("flex-1 flex flex-col", className)}>
        {children}
      </main>

      {/* Sticky Footer Action Area */}
      {footer && (
        <footer
          className="sticky bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-sm px-4 py-3"
          style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 0.75rem)' }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}

export default LessonShell;
