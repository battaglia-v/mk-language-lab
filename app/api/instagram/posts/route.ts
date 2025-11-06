import { NextRequest, NextResponse } from 'next/server';
import type {
  InstagramPost,
  InstagramPostsResponse,
  InstagramGraphApiResponse,
} from '@/types/instagram';

// Revalidate every 30 minutes
export const revalidate = 1800;

const INSTAGRAM_GRAPH_API_VERSION = 'v18.0';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

// In-memory cache for Instagram posts
const postsCache = new Map<string, CacheEntry<InstagramPostsResponse>>();

/**
 * Mock data for development/demo mode
 */
const MOCK_POSTS: InstagramPost[] = [
  {
    id: 'mock-1',
    caption: 'Добро утро! 🌅 Today\'s word: "здраво" (zdravo) - Hello!\n\nPractice saying this greeting to start your day. #macedonian #language #learning',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800',
    permalink: 'https://www.instagram.com/p/mock1/',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    caption: '📚 Lesson 2: Family vocabulary\n\n• Татко (tatko) - Father\n• Мајка (majka) - Mother\n• Брат (brat) - Brother\n• Сестра (sestra) - Sister\n\nTag your family members! 👨‍👩‍👧‍👦',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
    permalink: 'https://www.instagram.com/p/mock2/',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    caption: '🎵 Pronunciation tip: The letter "Џ" (DŽ)\n\nListen to how it sounds in these words:\n• Џез (džez) - Jazz\n• Џеп (džep) - Pocket\n\nVideo coming soon! #pronunciation #macedonianlanguage',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    permalink: 'https://www.instagram.com/p/mock3/',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-4',
    caption: '💬 Common phrases for everyday conversation:\n\n1. Како си? (Kako si?) - How are you?\n2. Добро сум (Dobro sum) - I\'m good\n3. Благодарам (Blagodaram) - Thank you\n\nPractice these today!',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    permalink: 'https://www.instagram.com/p/mock4/',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-5',
    caption: '🇲🇰 Did you know?\n\nMacedonian is spoken by about 2 million people worldwide. It\'s the official language of North Macedonia and uses the Cyrillic alphabet.\n\n#macedonianculture #facts',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    permalink: 'https://www.instagram.com/p/mock5/',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get cached value if it exists and hasn't expired
 */
function getCachedValue<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): { hit: true; value: T } | { hit: false } {
  const entry = cache.get(key);
  if (!entry) {
    return { hit: false };
  }

  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return { hit: false };
  }

  return { hit: true, value: entry.value };
}

/**
 * Set cached value with TTL
 */
function setCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Fetch posts from Instagram Graph API
 */
async function fetchInstagramPosts(
  accessToken: string,
  accountId: string,
  limit: number,
  signal: AbortSignal
): Promise<InstagramPost[]> {
  const fields = 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url';
  const url = `https://graph.facebook.com/${INSTAGRAM_GRAPH_API_VERSION}/${accountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

  const response = await fetch(url, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instagram API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as InstagramGraphApiResponse;

  return data.data.map((post) => ({
    id: post.id,
    caption: post.caption || '',
    media_type: post.media_type,
    media_url: post.media_url,
    permalink: post.permalink,
    timestamp: post.timestamp,
    thumbnail_url: post.thumbnail_url,
  }));
}

/**
 * GET /api/instagram/posts
 *
 * Fetches recent Instagram posts from @macedonianlanguagecorner
 *
 * Query parameters:
 * - limit: Number of posts to return (default: 10, max: 25)
 *
 * Returns:
 * - items: Array of Instagram posts
 * - meta: Metadata about the response (count, fetchedAt, cached, source)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(limitParam)
    ? Math.max(1, Math.min(limitParam, MAX_LIMIT))
    : DEFAULT_LIMIT;

  const cacheKey = `posts-${limit}`;

  // Check cache first
  const cachedResult = getCachedValue(postsCache, cacheKey);
  if (cachedResult.hit) {
    return NextResponse.json({
      ...cachedResult.value,
      meta: {
        ...cachedResult.value.meta,
        cached: true,
      },
    });
  }

  // Check for Instagram credentials
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  // Demo mode: Return mock data if credentials not set or set to "demo"
  if (!accessToken || !accountId || accessToken === 'demo') {
    const response: InstagramPostsResponse = {
      items: MOCK_POSTS.slice(0, limit),
      meta: {
        count: Math.min(MOCK_POSTS.length, limit),
        fetchedAt: new Date().toISOString(),
        cached: false,
        source: 'mock',
      },
    };

    setCachedValue(postsCache, cacheKey, response);
    return NextResponse.json(response);
  }

  // Fetch from Instagram Graph API
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 8000);

  try {
    const posts = await fetchInstagramPosts(
      accessToken,
      accountId,
      limit,
      abortController.signal
    );

    const response: InstagramPostsResponse = {
      items: posts,
      meta: {
        count: posts.length,
        fetchedAt: new Date().toISOString(),
        cached: false,
        source: 'instagram-graph-api',
      },
    };

    // Cache the successful response
    setCachedValue(postsCache, cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    // Return cached data if available, otherwise return error
    const fallbackCache = getCachedValue(postsCache, cacheKey);
    if (fallbackCache.hit) {
      return NextResponse.json({
        ...fallbackCache.value,
        meta: {
          ...fallbackCache.value.meta,
          cached: true,
          error: `API error: ${(error as Error).message}. Serving cached data.`,
        },
      });
    }

    // No cache available, return error with empty items
    return NextResponse.json(
      {
        items: [],
        meta: {
          count: 0,
          fetchedAt: new Date().toISOString(),
          cached: false,
          source: 'instagram-graph-api',
          error: `Failed to fetch Instagram posts: ${(error as Error).message}`,
        },
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
