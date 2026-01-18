/**
 * Offline mode and sync queue for React Native
 * 
 * Handles network state, queues operations when offline,
 * and syncs when connection is restored
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see components/providers/OfflineStatusToast.tsx (PWA implementation)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

const QUEUE_KEY = 'mkll:offline-queue';
const MAX_RETRIES = 3;

export type QueuedOperation = {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  retries: number;
  createdAt: string;
  type: 'practice_result' | 'lesson_complete' | 'progress_update' | 'generic';
};

/**
 * Read queued operations from storage
 */
export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOperation[];
  } catch (error) {
    console.warn('[Offline] Failed to read queue:', error);
    return [];
  }
}

/**
 * Save queued operations to storage
 */
async function saveQueue(queue: QueuedOperation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('[Offline] Failed to save queue:', error);
  }
}

/**
 * Add an operation to the offline queue
 */
export async function queueOperation(
  operation: Omit<QueuedOperation, 'id' | 'retries' | 'createdAt'>
): Promise<void> {
  const queue = await getQueuedOperations();
  
  const newOp: QueuedOperation = {
    ...operation,
    id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    retries: 0,
    createdAt: new Date().toISOString(),
  };
  
  queue.push(newOp);
  await saveQueue(queue);
  
  console.log('[Offline] Queued operation:', newOp.type, newOp.endpoint);
}

/**
 * Remove an operation from the queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueuedOperations();
  await saveQueue(queue.filter((op) => op.id !== id));
}

/**
 * Process the offline queue - called when coming online
 */
export async function processQueue(): Promise<{ success: number; failed: number }> {
  const queue = await getQueuedOperations();
  
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }
  
  console.log(`[Offline] Processing ${queue.length} queued operations`);
  
  let success = 0;
  let failed = 0;
  const remainingQueue: QueuedOperation[] = [];
  
  for (const operation of queue) {
    try {
      await apiFetch(operation.endpoint, {
        method: operation.method,
        body: operation.body,
      });
      
      success++;
      console.log('[Offline] Synced:', operation.type, operation.endpoint);
    } catch (error) {
      console.warn('[Offline] Failed to sync:', operation.type, error);
      
      if (operation.retries < MAX_RETRIES) {
        // Keep in queue for retry
        remainingQueue.push({
          ...operation,
          retries: operation.retries + 1,
        });
      } else {
        // Give up after max retries
        failed++;
        console.warn('[Offline] Giving up on operation after max retries:', operation.id);
      }
    }
  }
  
  await saveQueue(remainingQueue);
  
  return { success, failed };
}

/**
 * Get pending queue count
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getQueuedOperations();
  return queue.length;
}

/**
 * Clear the entire queue (for debugging/reset)
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Hook to track network state and trigger sync
 */
export function useNetworkState() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const wasOffline = useRef(false);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? false;
      
      setIsConnected(connected);
      setIsInternetReachable(reachable);
      
      // If we were offline and now connected, process queue
      if (wasOffline.current && connected && reachable) {
        console.log('[Offline] Connection restored, processing queue');
        processQueue();
      }
      
      wasOffline.current = !connected || !reachable;
    });

    // Check initial state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      wasOffline.current = !(state.isConnected && state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOnline: isConnected && isInternetReachable,
    isOffline: isConnected === false || isInternetReachable === false,
  };
}

/**
 * Higher-level hook for offline-aware API calls
 * Automatically queues operations when offline
 */
export function useOfflineAwareApi() {
  const { isOnline } = useNetworkState();
  
  const makeRequest = useCallback(
    async <T>(
      endpoint: string,
      options: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: unknown;
        queueIfOffline?: boolean;
        operationType?: QueuedOperation['type'];
      } = {}
    ): Promise<T | null> => {
      const { method = 'GET', body, queueIfOffline = false, operationType = 'generic' } = options;
      
      // GET requests can't be queued
      if (method === 'GET') {
        if (!isOnline) {
          console.log('[Offline] Skipping GET request while offline:', endpoint);
          return null;
        }
        return apiFetch<T>(endpoint, { method });
      }
      
      // For mutating requests
      if (isOnline) {
        return apiFetch<T>(endpoint, { method, body });
      }
      
      // Offline - queue if enabled (only for mutating methods)
      if (queueIfOffline) {
        await queueOperation({
          endpoint,
          method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
          body,
          type: operationType,
        });
        return null;
      }
      
      throw new Error('No network connection');
    },
    [isOnline]
  );
  
  return { makeRequest, isOnline };
}

/**
 * Queue a practice result for sync
 */
export async function queuePracticeResult(data: {
  sessionId: string;
  deckType: string;
  correct: number;
  total: number;
  xpEarned: number;
}): Promise<void> {
  await queueOperation({
    endpoint: '/api/mobile/practice-completions',
    method: 'POST',
    body: data,
    type: 'practice_result',
  });
}

/**
 * Queue a lesson completion for sync
 */
export async function queueLessonComplete(lessonId: string): Promise<void> {
  await queueOperation({
    endpoint: `/api/mobile/lesson/${lessonId}/complete`,
    method: 'POST',
    body: { completedAt: new Date().toISOString() },
    type: 'lesson_complete',
  });
}
