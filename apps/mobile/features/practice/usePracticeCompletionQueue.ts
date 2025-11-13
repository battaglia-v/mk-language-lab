import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PracticeDirection } from '@mk/practice';
import { submitPracticeCompletions, type PracticeCompletionEventPayload } from '@mk/api-client';
import { getApiBaseUrl } from '../../lib/api';
import { authenticatedFetch } from '../../lib/auth';
import type { PracticeDeckMode } from './useMobileQuickPracticeSession';

const STORAGE_KEY = '@mk/practice:pending-completions';
const MAX_QUEUE_SIZE = 25;

export type PracticeCompletionDraft = {
  deckId: string;
  category: string;
  mode: PracticeDeckMode;
  direction: PracticeDirection;
  correctCount: number;
  totalAttempts: number;
  accuracy: number;
  streakDelta: number;
  xpEarned: number;
  heartsRemaining: number;
};

type PracticeCompletionQueueState = {
  pending: PracticeCompletionEventPayload[];
  pendingCount: number;
  isHydrated: boolean;
  isSyncing: boolean;
  lastSyncedAt?: string | null;
  lastError?: string | null;
  hasPending: boolean;
};

type PracticeCompletionQueueActions = {
  queueCompletion: (draft: PracticeCompletionDraft) => Promise<void>;
  flushPending: () => Promise<void>;
  clearQueue: () => Promise<void>;
};

export type PracticeCompletionQueue = PracticeCompletionQueueState & PracticeCompletionQueueActions;

export function usePracticeCompletionQueue(): PracticeCompletionQueue {
  const [pending, setPending] = useState<PracticeCompletionEventPayload[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const queueRef = useRef<PracticeCompletionEventPayload[]>([]);
  const syncingRef = useRef(false);

  const persistQueue = useCallback(async (events: PracticeCompletionEventPayload[]) => {
    queueRef.current = events;
    setPending(events);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        events,
        updatedAt: new Date().toISOString(),
      })
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { events?: PracticeCompletionEventPayload[] };
          if (Array.isArray(parsed?.events)) {
            queueRef.current = parsed.events;
            if (!cancelled) {
              setPending(parsed.events);
            }
          }
        }
      } catch (error) {
        console.warn('[PracticeCompletionQueue] Failed to hydrate queue', error);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const flushPending = useCallback(async () => {
    if (syncingRef.current || queueRef.current.length === 0) {
      return;
    }

    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      setLastError('Missing API base URL');
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);
    try {
      await submitPracticeCompletions(queueRef.current, { baseUrl, fetcher: authenticatedFetch });
      await persistQueue([]);
      setLastSyncedAt(new Date().toISOString());
      setLastError(null);
    } catch (error) {
      console.warn('[PracticeCompletionQueue] Failed to flush queue', error);
      setLastError(error instanceof Error ? error.message : 'Failed to sync practice completions');
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [persistQueue]);

  const clearQueue = useCallback(async () => {
    queueRef.current = [];
    setPending([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const queueCompletion = useCallback(
    async (draft: PracticeCompletionDraft) => {
      const event: PracticeCompletionEventPayload = {
        id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
        deckId: draft.deckId,
        category: draft.category,
        mode: draft.mode,
        direction: draft.direction,
        correctCount: draft.correctCount,
        totalAttempts: draft.totalAttempts,
        accuracy: Math.min(100, Math.max(0, Math.round(draft.accuracy))),
        streakDelta: draft.streakDelta,
        xpEarned: Math.max(0, Math.round(draft.xpEarned)),
        heartsRemaining: draft.heartsRemaining,
        completedAt: new Date().toISOString(),
      };

      const nextQueue = [...queueRef.current, event].slice(-MAX_QUEUE_SIZE);
      await persistQueue(nextQueue);
      if (nextQueue.length === 1) {
        // First event – try flushing immediately.
        await flushPending();
      }
    },
    [flushPending, persistQueue]
  );

  useEffect(() => {
    const handleAppState = (status: AppStateStatus) => {
      if (status === 'active' && queueRef.current.length > 0) {
        void flushPending();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [flushPending]);

  useEffect(() => {
    if (!isHydrated) return;
    const interval = setInterval(() => {
      if (queueRef.current.length > 0) {
        void flushPending();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [flushPending, isHydrated]);

  const state = useMemo<PracticeCompletionQueueState>(
    () => ({
      pending,
      pendingCount: pending.length,
      hasPending: pending.length > 0,
      isHydrated,
      isSyncing,
      lastSyncedAt,
      lastError,
    }),
    [pending, isHydrated, isSyncing, lastSyncedAt, lastError]
  );

  return {
    ...state,
    queueCompletion,
    flushPending,
    clearQueue,
  };
}
