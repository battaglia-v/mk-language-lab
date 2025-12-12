'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface PullToRefreshIndicatorProps {
  /** Current pull distance in pixels */
  pullDistance: number;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
  /** Whether user has pulled past threshold to trigger refresh */
  canRelease: boolean;
  /** Threshold distance to trigger refresh */
  threshold: number;
  /** Additional class names */
  className?: string;
}

/**
 * Visual indicator component for pull-to-refresh
 * Shows an arrow when pulling, transforms to spinner when releasing
 */
export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  canRelease,
  threshold,
  className,
}: PullToRefreshIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const progress = Math.min(pullDistance / threshold, 1);
  const isVisible = pullDistance > 10 || isRefreshing;

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 flex items-center justify-center overflow-hidden',
        className
      )}
      style={{
        height: pullDistance,
        top: -pullDistance,
        transform: `translateY(${pullDistance}px)`,
      }}
    >
      <AnimatePresence mode="wait">
        {isRefreshing ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="flex items-center justify-center"
          >
            <RefreshCw
              className={cn(
                'h-6 w-6 text-accent',
                !prefersReducedMotion && 'animate-spin'
              )}
            />
          </motion.div>
        ) : (
          <motion.div
            key="arrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
            className="flex flex-col items-center justify-center gap-1"
          >
            <motion.div
              animate={{
                rotate: canRelease ? 180 : 0,
                scale: canRelease ? 1.1 : 1,
              }}
              transition={{
                type: prefersReducedMotion ? 'tween' : 'spring',
                stiffness: 300,
                damping: 20,
                duration: prefersReducedMotion ? 0.01 : undefined,
              }}
            >
              <ArrowDown
                className={cn(
                  'h-5 w-5 transition-colors',
                  canRelease ? 'text-accent' : 'text-muted-foreground'
                )}
              />
            </motion.div>
            <span
              className={cn(
                'text-xs transition-colors',
                canRelease ? 'text-accent font-medium' : 'text-muted-foreground'
              )}
            >
              {canRelease ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Wrapper component that combines the hook and indicator
 * Use this for simpler integration
 */
export { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
