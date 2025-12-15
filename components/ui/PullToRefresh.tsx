'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { triggerHaptic } from '@/lib/haptics';
import { useEffect, useRef } from 'react';

interface PullToRefreshIndicatorProps {
  /** Current pull distance in pixels */
  pullDistance: number;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
  /** Whether user has pulled past threshold to trigger refresh */
  canRelease: boolean;
  /** Threshold distance to trigger refresh */
  threshold: number;
  /** Whether refresh just completed successfully */
  justCompleted?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Progress ring SVG component
 */
function ProgressRing({ 
  progress, 
  size = 32, 
  strokeWidth = 3,
  className 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress * circumference);

  return (
    <svg width={size} height={size} className={cn('transform -rotate-90', className)}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-muted/30"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-accent transition-all duration-100"
      />
    </svg>
  );
}

/**
 * Visual indicator component for pull-to-refresh
 * Shows progress ring when pulling, transforms to spinner when releasing
 */
export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  canRelease,
  threshold,
  justCompleted = false,
  className,
}: PullToRefreshIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const progress = Math.min(pullDistance / threshold, 1);
  const isVisible = pullDistance > 10 || isRefreshing || justCompleted;
  const wasCanRelease = useRef(false);

  // Haptic feedback when crossing threshold
  useEffect(() => {
    if (canRelease && !wasCanRelease.current) {
      triggerHaptic('medium');
    }
    wasCanRelease.current = canRelease;
  }, [canRelease]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 flex items-center justify-center overflow-hidden z-20',
        className
      )}
      style={{
        height: Math.max(pullDistance, isRefreshing || justCompleted ? 60 : 0),
        top: -(isRefreshing || justCompleted ? 60 : pullDistance),
        transform: `translateY(${isRefreshing || justCompleted ? 60 : pullDistance}px)`,
      }}
    >
      <AnimatePresence mode="wait">
        {justCompleted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              type: prefersReducedMotion ? 'tween' : 'spring',
              stiffness: 400,
              damping: 15,
              duration: prefersReducedMotion ? 0.01 : undefined,
            }}
            className="flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
          </motion.div>
        ) : isRefreshing ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <RefreshCw
                className={cn(
                  'h-6 w-6 text-accent',
                  !prefersReducedMotion && 'animate-spin'
                )}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pull"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.15 }}
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Progress ring behind arrow */}
              <ProgressRing 
                progress={progress} 
                size={32} 
                strokeWidth={3}
                className="absolute inset-0"
              />
              
              {/* Arrow with rotation */}
              <motion.div
                animate={{
                  rotate: canRelease ? 180 : 0,
                  scale: canRelease ? 1.15 : 1,
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
                    'h-4 w-4 transition-colors',
                    canRelease ? 'text-accent' : 'text-muted-foreground'
                  )}
                />
              </motion.div>
            </div>
            
            <motion.span
              animate={{
                y: canRelease ? -2 : 0,
              }}
              transition={{ duration: 0.15 }}
              className={cn(
                'text-xs transition-colors',
                canRelease ? 'text-accent font-medium' : 'text-muted-foreground'
              )}
            >
              {canRelease ? 'Release to refresh' : 'Pull to refresh'}
            </motion.span>
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
