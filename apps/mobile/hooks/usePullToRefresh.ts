/**
 * usePullToRefresh - Standardized pull-to-refresh hook
 * 
 * Provides consistent refresh behavior across all list screens
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see hooks/use-pull-to-refresh.ts (PWA implementation)
 */

import { useState, useCallback } from 'react';
import { RefreshControlProps } from 'react-native';
import { haptic } from '../lib/haptics';

type RefreshCallback = () => Promise<void> | void;

type UsePullToRefreshOptions = {
  /** Callback function to execute on refresh */
  onRefresh: RefreshCallback;
  /** Enable haptic feedback on refresh */
  enableHaptics?: boolean;
  /** Minimum refresh duration in ms (prevents flicker) */
  minDuration?: number;
};

type UsePullToRefreshReturn = {
  /** Whether refresh is currently in progress */
  isRefreshing: boolean;
  /** Handler to trigger refresh programmatically */
  handleRefresh: () => Promise<void>;
  /** Alias for handleRefresh */
  onRefresh: () => Promise<void>;
  /** Props to spread on RefreshControl */
  refreshControlProps: Pick<RefreshControlProps, 'refreshing' | 'onRefresh' | 'tintColor' | 'colors'>;
};

/**
 * Hook for consistent pull-to-refresh behavior
 * 
 * @example
 * ```tsx
 * const { refreshControlProps } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await fetchData();
 *   },
 * });
 * 
 * return (
 *   <ScrollView
 *     refreshControl={<RefreshControl {...refreshControlProps} />}
 *   >
 *     ...
 *   </ScrollView>
 * );
 * ```
 */
export function usePullToRefresh({
  onRefresh,
  enableHaptics = true,
  minDuration = 500,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    
    // Trigger haptic feedback
    if (enableHaptics) {
      haptic.light();
    }

    const startTime = Date.now();

    try {
      await onRefresh();
    } catch (error) {
      console.error('[PullToRefresh] Refresh failed:', error);
    } finally {
      // Ensure minimum duration to prevent flicker
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      
      setIsRefreshing(false);
    }
  }, [onRefresh, enableHaptics, minDuration, isRefreshing]);

  return {
    isRefreshing,
    handleRefresh,
    onRefresh: handleRefresh, // Alias
    refreshControlProps: {
      refreshing: isRefreshing,
      onRefresh: handleRefresh,
      tintColor: '#f6d83b',
      colors: ['#f6d83b'], // Android
    },
  };
}

/**
 * Simplified hook when you just need the refreshing state
 */
export function useRefreshState(): {
  isRefreshing: boolean;
  startRefresh: () => void;
  endRefresh: () => void;
} {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return {
    isRefreshing,
    startRefresh: () => setIsRefreshing(true),
    endRefresh: () => setIsRefreshing(false),
  };
}

export default usePullToRefresh;
