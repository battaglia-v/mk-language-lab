'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getLocalXP } from '@/lib/gamification/local-xp';

/**
 * UserStats - Single source of truth for XP and stats
 *
 * Combines local XP (for immediate feedback) with server XP (for persistence).
 * Always returns the maximum of local vs server to prevent showing stale data.
 */
export interface UserStats {
  todayXP: number;
  weeklyXP: number;
  totalXP: number;
  streak: number;
  dailyGoal: number;
  isGoalComplete: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

const DEFAULT_STATS: UserStats = {
  todayXP: 0,
  weeklyXP: 0,
  totalXP: 0,
  streak: 0,
  dailyGoal: 20,
  isGoalComplete: false,
  isLoading: true,
  isError: false,
  refetch: async () => {},
};

/**
 * useUserStats - Unified hook for XP and stats across all pages
 *
 * This hook should be used by both Learn and Profile pages to ensure
 * consistent XP display. It combines:
 * - Local XP from localStorage (for immediate updates)
 * - Server XP from the API (for persistence)
 *
 * The hook returns the maximum values to handle sync delays.
 */
export function useUserStats(): UserStats {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);

  // Fetch server stats
  const fetchServerStats = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return null;
    }

    try {
      const response = await fetch('/api/user/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[useUserStats] Error fetching server stats:', error);
      return null;
    }
  }, [session, status]);

  // Combine local and server stats
  const updateStats = useCallback(async () => {
    setStats(prev => ({ ...prev, isLoading: true, isError: false }));

    // Get local XP
    const local = getLocalXP();

    // For unauthenticated users, just use local
    if (status === 'unauthenticated') {
      setStats({
        todayXP: local.todayXP,
        weeklyXP: local.todayXP, // For guest, weekly = today
        totalXP: local.todayXP, // For guest, total = today
        streak: local.streak,
        dailyGoal: local.dailyGoal,
        isGoalComplete: local.todayXP >= local.dailyGoal,
        isLoading: false,
        isError: false,
        refetch: updateStats,
      });
      return;
    }

    // For authenticated users, combine local and server
    const server = await fetchServerStats();

    if (server) {
      // Use maximum of local and server to handle sync delays
      setStats({
        todayXP: Math.max(local.todayXP, server.todayXP || 0),
        weeklyXP: Math.max(local.todayXP, server.weeklyXP || 0),
        totalXP: Math.max(local.todayXP, server.totalXP || 0),
        streak: Math.max(local.streak, server.streak || 0),
        dailyGoal: server.dailyGoal || local.dailyGoal,
        isGoalComplete: Math.max(local.todayXP, server.todayXP || 0) >= (server.dailyGoal || local.dailyGoal),
        isLoading: false,
        isError: false,
        refetch: updateStats,
      });
    } else {
      // Server fetch failed, use local only
      setStats({
        todayXP: local.todayXP,
        weeklyXP: local.todayXP,
        totalXP: local.todayXP,
        streak: local.streak,
        dailyGoal: local.dailyGoal,
        isGoalComplete: local.todayXP >= local.dailyGoal,
        isLoading: false,
        isError: true,
        refetch: updateStats,
      });
    }
  }, [status, fetchServerStats]);

  // Initial load
  useEffect(() => {
    if (status === 'loading') return;
    updateStats();
  }, [status, updateStats]);

  // Re-sync every 30 seconds if page is visible
  useEffect(() => {
    if (status === 'loading') return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status, updateStats]);

  return stats;
}

export default useUserStats;
