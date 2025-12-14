/**
 * Image Proxy Utility - LRU Cache Implementation
 *
 * Provides in-memory caching for proxied images to reduce
 * latency and external requests. Works on Edge runtime.
 *
 * @see /app/api/image-proxy/route.ts
 */

interface CacheEntry {
  data: ArrayBuffer;
  contentType: string;
  timestamp: number;
  size: number;
}

// Maximum cache size: 50MB (safe for Edge runtime)
const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024;
// Maximum individual image size: 2MB for caching
const MAX_CACHEABLE_SIZE = 2 * 1024 * 1024;
// TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

class ImageLRUCache {
  private cache: Map<string, CacheEntry> = new Map();
  private totalSize = 0;

  /**
   * Get cached image if available and not expired
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry;
  }

  /**
   * Store image in cache with LRU eviction
   */
  set(key: string, data: ArrayBuffer, contentType: string): void {
    // Don't cache images that are too large
    if (data.byteLength > MAX_CACHEABLE_SIZE) {
      return;
    }

    // Delete existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Evict entries until we have space
    while (this.totalSize + data.byteLength > MAX_CACHE_SIZE_BYTES && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    const entry: CacheEntry = {
      data,
      contentType,
      timestamp: Date.now(),
      size: data.byteLength,
    };

    this.cache.set(key, entry);
    this.totalSize += entry.size;
  }

  /**
   * Delete entry from cache
   */
  private delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      this.cache.delete(key);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    return {
      entries: this.cache.size,
      totalSizeBytes: this.totalSize,
      totalSizeMB: (this.totalSize / 1024 / 1024).toFixed(2),
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }
}

// Singleton instance
export const imageCache = new ImageLRUCache();

/**
 * Generate a cache key from URL
 * Normalizes the URL to improve cache hits
 */
export function getCacheKey(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking params but keep essential ones
    const cleanParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams) {
      // Keep only params that affect the image
      if (['w', 'h', 'q', 'width', 'height', 'quality', 'size'].includes(key.toLowerCase())) {
        cleanParams.set(key, value);
      }
    }
    parsed.search = cleanParams.toString();
    return parsed.toString();
  } catch {
    return url;
  }
}
