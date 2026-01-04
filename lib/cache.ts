import { Redis } from '@upstash/redis';

/**
 * Redis-based caching utility for hot data
 *
 * Use this for data that:
 * - Is accessed very frequently (every page load)
 * - Can tolerate 30-60 seconds of staleness
 * - Is expensive to compute (multiple DB queries)
 *
 * This complements Next.js unstable_cache by providing:
 * - Cross-instance consistency (all serverless functions share cache)
 * - TTL-based expiration (not tag-based)
 * - Stale-while-revalidate pattern
 */

// Initialize Redis client (reuse from rate-limit.ts pattern)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null;

export type CacheOptions = {
  /** Time-to-live in seconds (default: 60) */
  ttl?: number;
  /** Stale-while-revalidate window in seconds (default: ttl * 2) */
  swr?: number;
  /** Cache key prefix for namespacing */
  prefix?: string;
};

const DEFAULT_TTL = 60; // 1 minute
const CACHE_PREFIX = 'cache:';

/**
 * Get a value from Redis cache
 * Returns null if not found or Redis is unavailable
 */
export async function cacheGet<T>(key: string, prefix = ''): Promise<T | null> {
  if (!redis) {
    return null;
  }

  try {
    const fullKey = `${CACHE_PREFIX}${prefix}${key}`;
    const cached = await redis.get<{ data: T; timestamp: number; ttl: number }>(fullKey);

    if (!cached) {
      return null;
    }

    // Return cached data (SWR check happens in cacheGetOrSet)
    return cached.data;
  } catch (error) {
    console.warn('[cache] Redis get failed:', error);
    return null;
  }
}

/**
 * Set a value in Redis cache with TTL
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!redis) {
    return false;
  }

  const { ttl = DEFAULT_TTL, prefix = '' } = options;

  try {
    const fullKey = `${CACHE_PREFIX}${prefix}${key}`;
    const payload = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Set with expiration (TTL + SWR window)
    const swrWindow = options.swr ?? ttl * 2;
    await redis.set(fullKey, payload, { ex: ttl + swrWindow });

    return true;
  } catch (error) {
    console.warn('[cache] Redis set failed:', error);
    return false;
  }
}

/**
 * Delete a cache entry (for invalidation)
 */
export async function cacheDelete(key: string, prefix = ''): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    const fullKey = `${CACHE_PREFIX}${prefix}${key}`;
    await redis.del(fullKey);
    return true;
  } catch (error) {
    console.warn('[cache] Redis delete failed:', error);
    return false;
  }
}

/**
 * Delete all cache entries matching a pattern (for bulk invalidation)
 * Use sparingly - SCAN can be slow on large datasets
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  if (!redis) {
    return 0;
  }

  try {
    const fullPattern = `${CACHE_PREFIX}${pattern}`;
    let cursor = 0;
    let deletedCount = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: fullPattern, count: 100 });
      cursor = Number(nextCursor);

      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== 0);

    return deletedCount;
  } catch (error) {
    console.warn('[cache] Redis pattern delete failed:', error);
    return 0;
  }
}

/**
 * Get-or-set with stale-while-revalidate pattern
 *
 * Returns cached data immediately if available, even if stale.
 * Triggers background refresh if data is stale but within SWR window.
 *
 * @example
 * const profile = await cacheGetOrSet(
 *   `profile:${userId}`,
 *   () => fetchProfileFromDB(userId),
 *   { ttl: 30, prefix: 'user:' }
 * );
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = DEFAULT_TTL, swr, prefix = '' } = options;
  const swrWindow = swr ?? ttl * 2;

  if (!redis) {
    // Redis unavailable, just fetch
    return fetcher();
  }

  const fullKey = `${CACHE_PREFIX}${prefix}${key}`;

  try {
    // Try to get cached value
    const cached = await redis.get<{ data: T; timestamp: number; ttl: number }>(fullKey);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      const isStale = age > cached.ttl * 1000;
      const isWithinSWR = age < (cached.ttl + swrWindow) * 1000;

      if (!isStale) {
        // Fresh data - return immediately
        return cached.data;
      }

      if (isWithinSWR) {
        // Stale but within SWR - return stale data and refresh in background
        refreshInBackground(fullKey, fetcher, { ttl, swr: swrWindow, prefix: '' });
        return cached.data;
      }
    }

    // No cache or expired beyond SWR - fetch fresh
    const fresh = await fetcher();
    await cacheSet(key, fresh, { ttl, swr: swrWindow, prefix });
    return fresh;
  } catch (error) {
    console.warn('[cache] cacheGetOrSet failed, falling back to fetcher:', error);
    return fetcher();
  }
}

/**
 * Background refresh without blocking the response
 */
function refreshInBackground<T>(
  fullKey: string,
  fetcher: () => Promise<T>,
  options: { ttl: number; swr: number; prefix: string }
): void {
  // Fire and forget - don't await
  (async () => {
    try {
      const fresh = await fetcher();
      const payload = {
        data: fresh,
        timestamp: Date.now(),
        ttl: options.ttl,
      };
      await redis?.set(fullKey, payload, { ex: options.ttl + options.swr });
    } catch (error) {
      console.warn('[cache] Background refresh failed:', error);
    }
  })();
}

/**
 * Check if Redis cache is available
 */
export function isCacheAvailable(): boolean {
  return redis !== null;
}

// ============================================
// Convenience functions for common cache keys
// ============================================

export const CacheKeys = {
  /** User profile summary: `profile:{userId}` */
  profileSummary: (userId: string) => `profile:${userId}`,

  /** League standings: `league:{tier}` */
  leagueStandings: (tier: string) => `league:${tier}`,

  /** User's league membership: `league-member:{userId}` */
  leagueMembership: (userId: string) => `league-member:${userId}`,

  /** Discover feed (global): `discover:feed` */
  discoverFeed: () => 'discover:feed',

  /** User's game progress: `progress:{userId}` */
  gameProgress: (userId: string) => `progress:${userId}`,
} as const;

// ============================================
// Cache invalidation helpers
// ============================================

/**
 * Invalidate all cache entries for a user
 * Call this when user data changes significantly (XP gain, level up, etc.)
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    cacheDelete(CacheKeys.profileSummary(userId)),
    cacheDelete(CacheKeys.gameProgress(userId)),
    cacheDelete(CacheKeys.leagueMembership(userId)),
  ]);
}

/**
 * Invalidate league standings (call when any user's rank changes)
 */
export async function invalidateLeagueCache(tier?: string): Promise<void> {
  if (tier) {
    await cacheDelete(CacheKeys.leagueStandings(tier));
  } else {
    // Invalidate all tiers
    await cacheDeletePattern('league:*');
  }
}
