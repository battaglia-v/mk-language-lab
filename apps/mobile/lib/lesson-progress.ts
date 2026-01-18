/**
 * Lesson Progress Persistence for React Native
 * 
 * Tracks and syncs lesson completion, step progress, and time spent
 * Mirrors PWA's lib/lesson-runner/types.ts and useLessonRunner.ts
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/lesson-runner/useLessonRunner.ts (PWA implementation)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

const STORAGE_KEY = 'mkll:lesson-progress';
const OFFLINE_QUEUE_KEY = 'mkll:lesson-progress-queue';

// ============================================================================
// Types
// ============================================================================

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export type StepAnswer = {
  stepId: string;
  answer: string | string[];
  correct: boolean;
  timestamp: number;
};

export type LessonProgress = {
  lessonId: string;
  status: LessonStatus;
  /** Progress percentage 0-100 */
  progress: number;
  /** Time spent in minutes */
  timeSpent: number;
  /** Current step index for resume */
  currentStepIndex: number;
  /** Answers for each step */
  stepAnswers: Record<string, StepAnswer> | null;
  /** ISO timestamp of last activity */
  lastViewedAt: string;
  /** ISO timestamp of completion */
  completedAt: string | null;
  /** Correct answers count */
  correctCount?: number;
  /** Total scored steps */
  totalSteps?: number;
};

export type LessonResults = {
  lessonId: string;
  totalSteps: number;
  correctAnswers: number;
  totalTime: number; // milliseconds
  xpEarned: number;
  completedAt: number;
};

type OfflineProgressEntry = {
  id: string;
  data: Partial<LessonProgress> & { lessonId: string };
  timestamp: number;
  synced: boolean;
};

// ============================================================================
// Local Storage
// ============================================================================

/**
 * Read all lesson progress from local storage
 */
async function readAllProgress(): Promise<Record<string, LessonProgress>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('[LessonProgress] Failed to read:', error);
    return {};
  }
}

/**
 * Write all lesson progress to local storage
 */
async function writeAllProgress(data: Record<string, LessonProgress>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[LessonProgress] Failed to write:', error);
  }
}

/**
 * Get progress for a specific lesson
 */
export async function getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
  const all = await readAllProgress();
  return all[lessonId] || null;
}

/**
 * Save lesson progress locally
 */
export async function saveLessonProgress(
  lessonId: string,
  updates: Partial<LessonProgress>
): Promise<void> {
  const all = await readAllProgress();
  const existing = all[lessonId] || {
    lessonId,
    status: 'not_started',
    progress: 0,
    timeSpent: 0,
    currentStepIndex: 0,
    stepAnswers: null,
    lastViewedAt: new Date().toISOString(),
    completedAt: null,
  };

  all[lessonId] = {
    ...existing,
    ...updates,
    lastViewedAt: new Date().toISOString(),
  };

  await writeAllProgress(all);
}

/**
 * Mark a lesson as started (in_progress)
 */
export async function startLesson(lessonId: string): Promise<void> {
  await saveLessonProgress(lessonId, {
    status: 'in_progress',
    currentStepIndex: 0,
  });
  
  // Sync to server
  await syncProgressToServer(lessonId, {
    lessonId,
    status: 'in_progress',
    currentStepIndex: 0,
  });
}

/**
 * Update step progress during lesson
 */
export async function updateStepProgress(
  lessonId: string,
  stepId: string,
  answer: StepAnswer,
  currentIndex: number,
  totalSteps: number
): Promise<void> {
  const existing = await getLessonProgress(lessonId);
  const stepAnswers = existing?.stepAnswers || {};
  
  stepAnswers[stepId] = answer;
  
  const correctCount = Object.values(stepAnswers).filter(a => a.correct).length;
  const progress = Math.round((currentIndex / totalSteps) * 100);
  
  await saveLessonProgress(lessonId, {
    currentStepIndex: currentIndex,
    stepAnswers,
    progress,
    correctCount,
    totalSteps,
  });
}

/**
 * Mark a lesson as completed
 */
export async function completeLesson(
  lessonId: string,
  results: LessonResults
): Promise<void> {
  const timeSpentMinutes = Math.ceil(results.totalTime / 60000);
  
  await saveLessonProgress(lessonId, {
    status: 'completed',
    progress: 100,
    timeSpent: timeSpentMinutes,
    currentStepIndex: 0,
    stepAnswers: null, // Clear step-level data on completion
    completedAt: new Date().toISOString(),
    correctCount: results.correctAnswers,
    totalSteps: results.totalSteps,
  });
  
  // Sync completion to server
  await syncProgressToServer(lessonId, {
    lessonId,
    status: 'completed',
    progress: 100,
    timeSpent: timeSpentMinutes,
    currentStepIndex: 0,
    stepAnswers: null,
  });
}

/**
 * Reset lesson progress (for retake)
 */
export async function resetLessonProgress(lessonId: string): Promise<void> {
  await saveLessonProgress(lessonId, {
    status: 'not_started',
    progress: 0,
    timeSpent: 0,
    currentStepIndex: 0,
    stepAnswers: null,
    completedAt: null,
    correctCount: undefined,
    totalSteps: undefined,
  });
}

/**
 * Get all completed lessons
 */
export async function getCompletedLessons(): Promise<string[]> {
  const all = await readAllProgress();
  return Object.entries(all)
    .filter(([_, progress]) => progress.status === 'completed')
    .map(([lessonId]) => lessonId);
}

/**
 * Get all in-progress lessons
 */
export async function getInProgressLessons(): Promise<LessonProgress[]> {
  const all = await readAllProgress();
  return Object.values(all).filter(
    progress => progress.status === 'in_progress'
  );
}

/**
 * Get lesson completion stats
 */
export async function getLessonStats(): Promise<{
  completed: number;
  inProgress: number;
  totalTimeSpent: number;
}> {
  const all = await readAllProgress();
  const entries = Object.values(all);
  
  return {
    completed: entries.filter(p => p.status === 'completed').length,
    inProgress: entries.filter(p => p.status === 'in_progress').length,
    totalTimeSpent: entries.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
  };
}

// ============================================================================
// Server Sync
// ============================================================================

/**
 * Sync lesson progress to server
 */
async function syncProgressToServer(
  lessonId: string,
  data: Partial<LessonProgress> & { lessonId: string }
): Promise<boolean> {
  try {
    await apiFetch('/api/lessons/progress', {
      method: 'POST',
      body: data,
    });
    return true;
  } catch (error) {
    console.warn('[LessonProgress] Server sync failed, queuing:', error);
    await queueOfflineProgress(lessonId, data);
    return false;
  }
}

/**
 * Queue progress for offline sync
 */
async function queueOfflineProgress(
  lessonId: string,
  data: Partial<LessonProgress> & { lessonId: string }
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: OfflineProgressEntry[] = raw ? JSON.parse(raw) : [];
    
    // Remove existing entry for same lesson (keep latest)
    const filtered = queue.filter(e => e.data.lessonId !== lessonId);
    
    filtered.push({
      id: `${lessonId}-${Date.now()}`,
      data,
      timestamp: Date.now(),
      synced: false,
    });
    
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[LessonProgress] Failed to queue:', error);
  }
}

/**
 * Process offline queue when online
 */
export async function processOfflineQueue(): Promise<{
  success: number;
  failed: number;
}> {
  let success = 0;
  let failed = 0;
  
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return { success: 0, failed: 0 };
    
    const queue: OfflineProgressEntry[] = JSON.parse(raw);
    const unsynced = queue.filter(e => !e.synced);
    
    for (const entry of unsynced) {
      try {
        await apiFetch('/api/lessons/progress', {
          method: 'POST',
          body: entry.data,
        });
        entry.synced = true;
        success++;
      } catch {
        failed++;
      }
    }
    
    // Keep only recent unsynced entries
    const remaining = queue.filter(
      e => !e.synced && Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000
    );
    
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch (error) {
    console.error('[LessonProgress] Queue processing failed:', error);
  }
  
  return { success, failed };
}

/**
 * Fetch progress from server and merge with local
 */
export async function fetchAndMergeProgress(lessonId: string): Promise<LessonProgress | null> {
  try {
    const serverProgress = await apiFetch<LessonProgress>(
      `/api/lessons/progress/${lessonId}`
    );
    
    if (serverProgress) {
      // Server data takes precedence for completed lessons
      // Local data takes precedence for in-progress (more recent)
      const localProgress = await getLessonProgress(lessonId);
      
      if (serverProgress.status === 'completed') {
        await saveLessonProgress(lessonId, serverProgress);
        return serverProgress;
      }
      
      if (localProgress && localProgress.status === 'in_progress') {
        // Keep local if more recent
        const localTime = new Date(localProgress.lastViewedAt).getTime();
        const serverTime = serverProgress.lastViewedAt 
          ? new Date(serverProgress.lastViewedAt).getTime() 
          : 0;
        
        if (localTime > serverTime) {
          return localProgress;
        }
      }
      
      await saveLessonProgress(lessonId, serverProgress);
      return serverProgress;
    }
    
    return await getLessonProgress(lessonId);
  } catch (error) {
    console.warn('[LessonProgress] Server fetch failed:', error);
    return await getLessonProgress(lessonId);
  }
}
