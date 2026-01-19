'use client';

/**
 * useMilestones - Hook for tracking and celebrating milestones
 * 
 * Tracks user progress and triggers milestone celebrations
 * when thresholds are reached.
 * 
 * Parity: Shared hook for PWA and Android (via lib/gamification/milestones.ts)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  checkNewMilestones,
  getNextMilestones,
  MILESTONES,
  type Milestone,
  type MilestoneProgress,
  type MilestoneCategory,
} from '@/lib/gamification/milestones';

const EARNED_MILESTONES_KEY = 'mk-earned-milestones';
const PENDING_CELEBRATION_KEY = 'mk-pending-milestone';

interface UseMilestonesReturn {
  /** Milestone to celebrate (if any) */
  pendingCelebration: Milestone | null;
  /** Dismiss the current celebration */
  dismissCelebration: () => void;
  /** Check for new milestones based on current progress */
  checkMilestones: (progress: MilestoneProgress) => Milestone[];
  /** Get IDs of all earned milestones */
  earnedMilestoneIds: Set<string>;
  /** Get next milestone in each category */
  nextMilestones: ReturnType<typeof getNextMilestones>;
  /** Total milestones earned */
  totalEarned: number;
  /** Total milestones available */
  totalAvailable: number;
}

export function useMilestones(): UseMilestonesReturn {
  const [earnedMilestoneIds, setEarnedMilestoneIds] = useState<Set<string>>(new Set());
  const [pendingCelebration, setPendingCelebration] = useState<Milestone | null>(null);
  const [nextMilestones, setNextMilestones] = useState<ReturnType<typeof getNextMilestones>>({});

  // Load earned milestones from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(EARNED_MILESTONES_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setEarnedMilestoneIds(new Set(ids));
      }

      // Check for pending celebration
      const pending = localStorage.getItem(PENDING_CELEBRATION_KEY);
      if (pending) {
        const milestone = MILESTONES[pending as keyof typeof MILESTONES];
        if (milestone) {
          setPendingCelebration(milestone);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save earned milestones to localStorage
  const saveEarnedMilestones = useCallback((ids: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(EARNED_MILESTONES_KEY, JSON.stringify([...ids]));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Check for new milestones
  const checkMilestones = useCallback((progress: MilestoneProgress): Milestone[] => {
    const newMilestones = checkNewMilestones(progress, earnedMilestoneIds);
    
    if (newMilestones.length > 0) {
      // Update earned milestones
      const updatedIds = new Set(earnedMilestoneIds);
      newMilestones.forEach(m => updatedIds.add(m.id));
      setEarnedMilestoneIds(updatedIds);
      saveEarnedMilestones(updatedIds);

      // Set the first new milestone for celebration
      const firstMilestone = newMilestones[0];
      setPendingCelebration(firstMilestone);
      
      // Save pending celebration in case page refreshes
      try {
        localStorage.setItem(PENDING_CELEBRATION_KEY, firstMilestone.id);
      } catch {
        // Ignore
      }
    }

    // Update next milestones
    setNextMilestones(getNextMilestones(progress, earnedMilestoneIds));

    return newMilestones;
  }, [earnedMilestoneIds, saveEarnedMilestones]);

  // Dismiss celebration
  const dismissCelebration = useCallback(() => {
    setPendingCelebration(null);
    try {
      localStorage.removeItem(PENDING_CELEBRATION_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    pendingCelebration,
    dismissCelebration,
    checkMilestones,
    earnedMilestoneIds,
    nextMilestones,
    totalEarned: earnedMilestoneIds.size,
    totalAvailable: Object.keys(MILESTONES).length,
  };
}

export default useMilestones;
