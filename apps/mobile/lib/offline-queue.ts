import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './api';

const QUEUE_KEY = '@mklanguage/practice-queue';
const MAX_RETRIES = 3;

/**
 * Data structure for a queued practice completion event
 */
export type QueuedEvent = {
  id: string;
  timestamp: number;
  data: {
    deckType: string;
    mode: string;
    correct: number;
    total: number;
    accuracy: number;
    xpEarned: number;
    durationMs: number;
  };
  retryCount: number;
};

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Queue a practice completion for later sync
 */
export async function queuePracticeCompletion(
  data: QueuedEvent['data']
): Promise<void> {
  try {
    const events = await getQueuedEvents();

    const newEvent: QueuedEvent = {
      id: generateEventId(),
      timestamp: Date.now(),
      data,
      retryCount: 0,
    };

    events.push(newEvent);

    // Limit queue size to prevent unbounded growth
    const MAX_QUEUE_SIZE = 100;
    const trimmedEvents = events.slice(-MAX_QUEUE_SIZE);

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(trimmedEvents));
  } catch (err) {
    console.warn('[OfflineQueue] Failed to queue event:', err);
  }
}

/**
 * Get all queued events
 */
export async function getQueuedEvents(): Promise<QueuedEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedEvent[];
  } catch (err) {
    console.warn('[OfflineQueue] Failed to get queued events:', err);
    return [];
  }
}

/**
 * Remove an event from the queue by ID
 */
export async function removeFromQueue(id: string): Promise<void> {
  try {
    const events = await getQueuedEvents();
    const filtered = events.filter((e) => e.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('[OfflineQueue] Failed to remove event:', err);
  }
}

/**
 * Update an event's retry count
 */
async function incrementRetryCount(id: string): Promise<void> {
  try {
    const events = await getQueuedEvents();
    const updated = events.map((e) =>
      e.id === id ? { ...e, retryCount: e.retryCount + 1 } : e
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[OfflineQueue] Failed to update retry count:', err);
  }
}

/**
 * Process the queue - attempt to sync all queued events
 *
 * @returns Object with success and failed counts
 */
export async function processQueue(): Promise<{
  success: number;
  failed: number;
}> {
  const events = await getQueuedEvents();

  if (events.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await apiFetch('/api/mobile/practice-completions', {
        method: 'POST',
        body: {
          ...event.data,
          completedAt: new Date(event.timestamp).toISOString(),
          fromQueue: true,
        },
      });

      // Success - remove from queue
      await removeFromQueue(event.id);
      success++;
    } catch (err) {
      // Failed - increment retry count or remove if max retries reached
      if (event.retryCount >= MAX_RETRIES - 1) {
        // Max retries reached, remove from queue
        console.warn(
          `[OfflineQueue] Event ${event.id} failed after ${MAX_RETRIES} retries, removing`
        );
        await removeFromQueue(event.id);
      } else {
        // Increment retry count
        await incrementRetryCount(event.id);
      }
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get the count of pending events in the queue
 */
export async function getQueueLength(): Promise<number> {
  const events = await getQueuedEvents();
  return events.length;
}

/**
 * Clear all events from the queue
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to clear queue:', err);
  }
}
