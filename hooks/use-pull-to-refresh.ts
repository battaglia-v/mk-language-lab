'use client';

import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { triggerHaptic } from '@/lib/haptics';

interface PullToRefreshOptions {
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Minimum distance to pull before triggering refresh (default: 80px) */
  threshold?: number;
  /** Maximum overscroll distance (default: 120px) */
  maxPullDistance?: number;
  /** Disable the pull-to-refresh behavior */
  disabled?: boolean;
  /** Duration to show success state (default: 800ms) */
  successDuration?: number;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRelease: boolean;
  justCompleted: boolean;
}

/**
 * Hook for adding pull-to-refresh behavior to a scrollable container
 * 
 * @example
 * ```tsx
 * const { containerRef, indicatorProps, state } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetch();
 *   },
 * });
 * 
 * return (
 *   <div ref={containerRef} className="overflow-y-auto h-full">
 *     <PullToRefreshIndicator {...indicatorProps} />
 *     {children}
 *   </div>
 * );
 * ```
 */
export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>(
  options: PullToRefreshOptions
): {
  containerRef: RefObject<T | null>;
  state: PullToRefreshState;
  indicatorProps: {
    pullDistance: number;
    isRefreshing: boolean;
    canRelease: boolean;
    threshold: number;
    justCompleted: boolean;
  };
} {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 120,
    disabled = false,
    successDuration = 800,
  } = options;

  const containerRef = useRef<T | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRelease: false,
    justCompleted: false,
  });

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || state.isRefreshing || state.justCompleted) return;

      const container = containerRef.current;
      if (!container) return;

      // Only activate if scrolled to top
      if (container.scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      
      // Light haptic on start
      triggerHaptic('light');
      
      setState((prev) => ({ ...prev, isPulling: true, pullDistance: 0 }));
    },
    [disabled, state.isRefreshing, state.justCompleted]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !state.isPulling || state.isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      // Only pull if scrolled to top
      if (container.scrollTop > 0) {
        setState((prev) => ({ ...prev, isPulling: false, pullDistance: 0 }));
        return;
      }

      currentY.current = e.touches[0].clientY;
      const delta = currentY.current - startY.current;

      // Only allow pulling down
      if (delta < 0) {
        setState((prev) => ({ ...prev, pullDistance: 0, canRelease: false }));
        return;
      }

      // Apply resistance (logarithmic curve for natural feel)
      const resistance = 0.5;
      const distance = Math.min(delta * resistance, maxPullDistance);
      const canRelease = distance >= threshold;

      // Prevent default scroll when pulling
      if (distance > 0) {
        e.preventDefault();
      }

      setState((prev) => ({
        ...prev,
        pullDistance: distance,
        canRelease,
      }));
    },
    [disabled, state.isPulling, state.isRefreshing, threshold, maxPullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !state.isPulling) return;

    if (state.canRelease) {
      // Strong haptic on release
      triggerHaptic('heavy');
      
      setState((prev) => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullDistance: threshold, // Keep indicator visible during refresh
      }));

      try {
        await onRefresh();
        
        // Success haptic
        triggerHaptic('success');
        
        // Show success state briefly
        setState((prev) => ({
          ...prev,
          isRefreshing: false,
          justCompleted: true,
        }));
        
        // Clear success state after duration
        successTimeoutRef.current = setTimeout(() => {
          setState({
            isPulling: false,
            isRefreshing: false,
            pullDistance: 0,
            canRelease: false,
            justCompleted: false,
          });
        }, successDuration);
      } catch {
        // Error haptic
        triggerHaptic('error');
        
        // Reset state on error
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          canRelease: false,
          justCompleted: false,
        });
      }
    } else {
      // Snap back
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        canRelease: false,
        justCompleted: false,
      });
    }
  }, [disabled, state.isPulling, state.canRelease, threshold, onRefresh, successDuration]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    // Touch events with passive: false for preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  return {
    containerRef,
    state,
    indicatorProps: {
      pullDistance: state.pullDistance,
      isRefreshing: state.isRefreshing,
      canRelease: state.canRelease,
      threshold,
      justCompleted: state.justCompleted,
    },
  };
}
