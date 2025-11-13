import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export const AUDIO_CACHE_DIR =
  `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ''}practice-audio-cache`;

const AUDIO_CACHE_MANIFEST_KEY = '@mk/practice:audio-cache-manifest';
const AUDIO_CACHE_PREFETCH_KEY = '@mk/practice:audio-prefetch-job';
const MAX_CACHE_ENTRIES = 40;
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type AudioPrefetchItem = {
  id: string;
  url: string;
};

export type AudioPrefetchJob = {
  deckId: string;
  queuedAt: string;
  items: AudioPrefetchItem[];
};

type AudioCacheManifest = Record<
  string,
  {
    path: string;
    lastUsedAt: string;
  }
>;

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9-_]/g, '_');
}

async function ensureCacheDir() {
  try {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  } catch {
    // directory already exists
  }
}

async function readManifest(): Promise<AudioCacheManifest> {
  try {
    const raw = await AsyncStorage.getItem(AUDIO_CACHE_MANIFEST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AudioCacheManifest;
    return parsed ?? {};
  } catch {
    return {};
  }
}

async function writeManifest(manifest: AudioCacheManifest) {
  await AsyncStorage.setItem(AUDIO_CACHE_MANIFEST_KEY, JSON.stringify(manifest));
}

export async function cacheAudioClip(audioId: string, audioUrl: string): Promise<string> {
  if (!audioUrl) {
    throw new Error('Audio URL missing');
  }
  await ensureCacheDir();
  const normalized = sanitizeId(audioId);
  const targetPath = `${AUDIO_CACHE_DIR}/${normalized}.mp3`;
  const info = await FileSystem.getInfoAsync(targetPath);
  if (!info.exists) {
    await FileSystem.downloadAsync(audioUrl, targetPath);
  }
  return targetPath;
}

export async function markAudioUsage(audioId: string, fileUri: string) {
  const manifest = await readManifest();
  manifest[sanitizeId(audioId)] = {
    path: fileUri,
    lastUsedAt: new Date().toISOString(),
  };
  await writeManifest(manifest);
}

export async function trimAudioCache(
  maxEntries: number = MAX_CACHE_ENTRIES,
  maxAgeMs: number = MAX_CACHE_AGE_MS
) {
  const manifest = await readManifest();
  const entries = Object.entries(manifest);
  if (entries.length === 0) {
    return;
  }

  const now = Date.now();
  const staleKeys: string[] = [];

  entries.forEach(([key, meta]) => {
    const lastUsed = new Date(meta.lastUsedAt ?? 0).getTime();
    if (!meta.path) {
      staleKeys.push(key);
      return;
    }
    if (now - lastUsed > maxAgeMs) {
      staleKeys.push(key);
    }
  });

  for (const key of staleKeys) {
    const meta = manifest[key];
    if (meta?.path) {
      await FileSystem.deleteAsync(meta.path, { idempotent: true }).catch(() => undefined);
    }
    delete manifest[key];
  }

  const remainingEntries = Object.entries(manifest).sort(
    (a, b) =>
      new Date(a[1].lastUsedAt ?? 0).getTime() - new Date(b[1].lastUsedAt ?? 0).getTime()
  );

  while (remainingEntries.length > maxEntries) {
    const [key, meta] = remainingEntries.shift()!;
    if (meta?.path) {
      await FileSystem.deleteAsync(meta.path, { idempotent: true }).catch(() => undefined);
    }
    delete manifest[key];
  }

  await writeManifest(manifest);
}

export async function loadPrefetchJob(): Promise<AudioPrefetchJob | null> {
  try {
    const raw = await AsyncStorage.getItem(AUDIO_CACHE_PREFETCH_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AudioPrefetchJob;
    if (!parsed?.items?.length) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function savePrefetchJob(job: AudioPrefetchJob | null): Promise<void> {
  if (!job) {
    await AsyncStorage.removeItem(AUDIO_CACHE_PREFETCH_KEY);
    return;
  }
  await AsyncStorage.setItem(AUDIO_CACHE_PREFETCH_KEY, JSON.stringify(job));
}

export async function enqueueAudioPrefetchJob(deckId: string, items: AudioPrefetchItem[]) {
  if (!items.length) {
    return;
  }
  const uniqueMap = new Map<string, AudioPrefetchItem>();
  items.forEach((item) => {
    if (item.url) {
      uniqueMap.set(sanitizeId(item.id), { id: sanitizeId(item.id), url: item.url });
    }
  });

  if (uniqueMap.size === 0) {
    return;
  }

  const job: AudioPrefetchJob = {
    deckId,
    queuedAt: new Date().toISOString(),
    items: Array.from(uniqueMap.values()),
  };

  await savePrefetchJob(job);
}
