import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Network from 'expo-network';
import {
  cacheAudioClip,
  enqueueAudioPrefetchJob,
  loadPrefetchJob,
  markAudioUsage,
  savePrefetchJob,
  trimAudioCache,
  type AudioPrefetchItem,
} from '../../lib/audioCache';

export const AUDIO_CACHE_TASK = 'practice-audio-cache';
const AUDIO_CACHE_LAST_RUN_KEY = '@mk/practice:audio-cache:last-run';
const PREFETCH_INTERVAL_MS = 24 * 60 * 60 * 1000;

if (Platform.OS !== 'web') {
  TaskManager.defineTask(AUDIO_CACHE_TASK, async () => {
    try {
      const result = await runAudioCacheTask();
      return result;
    } catch (error) {
      console.warn('[AudioCacheTask] Failed to execute', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

async function runAudioCacheTask(): Promise<BackgroundFetch.BackgroundFetchResult> {
  const job = await loadPrefetchJob();
  if (!job || job.items.length === 0) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  const lastRunIso = await AsyncStorage.getItem(AUDIO_CACHE_LAST_RUN_KEY);
  if (lastRunIso) {
    const lastRun = new Date(lastRunIso).getTime();
    if (!Number.isNaN(lastRun) && Date.now() - lastRun < PREFETCH_INTERVAL_MS) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  }

  const networkState = await Network.getNetworkStateAsync();
  if (
    !networkState.isConnected ||
    !networkState.isInternetReachable ||
    networkState.type !== Network.NetworkStateType.WIFI
  ) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  let downloaded = 0;
  for (const item of job.items) {
    try {
      const uri = await cacheAudioClip(item.id, item.url);
      await markAudioUsage(item.id, uri);
      downloaded += 1;
    } catch (error) {
      console.warn('[AudioCacheTask] Failed to cache audio', item.id, error);
    }
  }

  await AsyncStorage.setItem(AUDIO_CACHE_LAST_RUN_KEY, new Date().toISOString());
  await savePrefetchJob(null);
  await trimAudioCache();

  return downloaded > 0
    ? BackgroundFetch.BackgroundFetchResult.NewData
    : BackgroundFetch.BackgroundFetchResult.NoData;
}

export async function ensureAudioCacheTaskRegistered(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.info('[AudioCacheTask] Background fetch restricted; skipping registration.');
      return;
    }
    const registered = await TaskManager.getRegisteredTasksAsync();
    const alreadyRegistered = registered.some((task) => task.taskName === AUDIO_CACHE_TASK);
    if (!alreadyRegistered) {
      await BackgroundFetch.registerTaskAsync(AUDIO_CACHE_TASK, {
        minimumInterval: PREFETCH_INTERVAL_MS / 1000,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (error) {
    console.warn('[AudioCacheTask] Failed to register background task', error);
  }
}

export async function queueAudioPrefetch(items: AudioPrefetchItem[], deckId: string) {
  await enqueueAudioPrefetchJob(deckId, items);
}
