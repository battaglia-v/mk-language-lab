/**
 * Entitlement Hook - React hook for Pro feature access
 * 
 * Provides easy access to user's subscription status and feature gating.
 * Handles caching, server sync, and optimistic updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserEntitlement,
  UpsellTrigger,
  UpsellContext,
  createFreeEntitlement,
  getCachedEntitlement,
  cacheEntitlement,
  isFeatureAvailable,
  hasExceededPracticeLimit,
  shouldShowUpsell,
  getTodayPracticeCount,
  incrementPracticeCount,
  getLastUpsellShown,
  recordUpsellShown,
  canCreateCustomDeck,
  FREE_TIER_LIMITS,
} from '@/lib/entitlements';

interface UseEntitlementReturn {
  /** Current entitlement status */
  entitlement: UserEntitlement;
  /** Whether loading entitlement from server */
  isLoading: boolean;
  /** Check if a specific feature is available */
  hasFeature: (featureId: string) => boolean;
  /** Check if practice limit reached */
  isPracticeLimitReached: boolean;
  /** Today's practice count */
  todayPracticeCount: number;
  /** Remaining practice sessions for free users */
  remainingPracticeSessions: number;
  /** Record a practice session */
  recordPracticeSession: () => boolean;
  /** Check if user can create a custom deck */
  canCreateDeck: (currentDeckCount: number) => boolean;
  /** Check and potentially show upsell */
  checkUpsell: (trigger: UpsellTrigger, featureId?: string) => UpsellContext | null;
  /** Refresh entitlement from server */
  refresh: () => Promise<void>;
}

/**
 * Hook to manage user entitlements and Pro features
 */
export function useEntitlement(): UseEntitlementReturn {
  const [entitlement, setEntitlement] = useState<UserEntitlement>(() => {
    // Initialize from cache or default to free
    return getCachedEntitlement() || createFreeEntitlement();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [todayPracticeCount, setTodayPracticeCount] = useState(0);

  // Initialize practice count on mount
  useEffect(() => {
    setTodayPracticeCount(getTodayPracticeCount());
  }, []);

  // Fetch entitlement from server on mount
  useEffect(() => {
    const fetchEntitlement = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/entitlement');
        
        if (response.ok) {
          const data = await response.json();
          const serverEntitlement: UserEntitlement = data.entitlement;
          setEntitlement(serverEntitlement);
          cacheEntitlement(serverEntitlement);
        }
      } catch {
        // Use cached/default on error
        console.warn('[Entitlement] Failed to fetch from server, using cached');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntitlement();
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/entitlement');
      if (response.ok) {
        const data = await response.json();
        setEntitlement(data.entitlement);
        cacheEntitlement(data.entitlement);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasFeature = useCallback((featureId: string): boolean => {
    return isFeatureAvailable(featureId, entitlement);
  }, [entitlement]);

  const isPracticeLimitReached = useMemo(() => {
    return hasExceededPracticeLimit(todayPracticeCount, entitlement);
  }, [todayPracticeCount, entitlement]);

  const remainingPracticeSessions = useMemo(() => {
    if (entitlement.isPro) return Infinity;
    return Math.max(0, FREE_TIER_LIMITS.dailyPracticeSessions - todayPracticeCount);
  }, [todayPracticeCount, entitlement.isPro]);

  const recordPracticeSession = useCallback((): boolean => {
    // Check if limit reached before recording
    if (hasExceededPracticeLimit(todayPracticeCount, entitlement)) {
      return false;
    }
    
    const newCount = incrementPracticeCount();
    setTodayPracticeCount(newCount);
    return true;
  }, [todayPracticeCount, entitlement]);

  const canCreateDeck = useCallback((currentDeckCount: number): boolean => {
    return canCreateCustomDeck(currentDeckCount, entitlement);
  }, [entitlement]);

  const checkUpsell = useCallback((
    trigger: UpsellTrigger,
    featureId?: string
  ): UpsellContext | null => {
    const lastUpsell = getLastUpsellShown();
    
    if (!shouldShowUpsell(trigger, entitlement, lastUpsell)) {
      return null;
    }
    
    // Record that we're showing an upsell
    recordUpsellShown();
    
    return {
      trigger,
      featureId,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }, [entitlement]);

  return {
    entitlement,
    isLoading,
    hasFeature,
    isPracticeLimitReached,
    todayPracticeCount,
    remainingPracticeSessions,
    recordPracticeSession,
    canCreateDeck,
    checkUpsell,
    refresh,
  };
}

/**
 * Simplified hook for checking a single feature
 */
export function useProFeature(featureId: string): {
  isAvailable: boolean;
  isPro: boolean;
  isLoading: boolean;
} {
  const { hasFeature, entitlement, isLoading } = useEntitlement();
  
  return {
    isAvailable: hasFeature(featureId),
    isPro: entitlement.isPro,
    isLoading,
  };
}

