# Task 2: News Image Reliability Investigation

> **Last Updated:** 2025-12-14  
> **Owner:** Backend Team  
> **Review Cycle:** Monthly

---

## Root Cause Analysis

### Problem Statement
Images from time.mk news articles fail to load reliably, showing fallback placeholders instead of actual article images.

### Investigation Findings

| Factor | Status | Details |
|--------|--------|---------|
| **Hotlinking Restrictions** | ⚠️ Partial | Some source sites block non-origin referrers |
| **CORS Headers** | ❌ Issue | Many sources don't set `Access-Control-Allow-Origin` |
| **CDN Restrictions** | ⚠️ Partial | Akamai/Cloudflare edge blocks some requests |
| **Referrer Blocking** | ✅ Handled | Current proxy sets correct `Referer` header |
| **Timeout Issues** | ⚠️ Issue | 6s timeout insufficient for slow Macedonian servers |
| **DNS Resolution** | ✅ OK | DNS resolves correctly |
| **Image Size Limits** | ✅ OK | 10MB limit is reasonable |
| **Protocol Issues** | ⚠️ Issue | Some sites only serve HTTP, HTTPS upgrade fails |

### Root Causes (Ranked)

1. **Primary:** Many Macedonian news sites actively block image requests without their domain as `Referer`
2. **Secondary:** HTTPS upgrade fails for HTTP-only image sources
3. **Tertiary:** Slow server response times exceed 6s timeout
4. **Quaternary:** User-Agent string not mimicking real browsers closely enough

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  <ProxiedNewsImage imageUrl="https://time.mk/..." />        │    │
│  │     ↓                                                        │    │
│  │  src="/api/image-proxy?url=..." (with retry on error)       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE FUNCTION                              │
│  /api/image-proxy/route.ts                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 1. Validate URL & domain allowlist                          │    │
│  │ 2. Check in-memory cache (LRU)                              │    │
│  │ 3. Check Vercel KV cache (Redis)  ←── NEW                   │    │
│  │ 4. Fetch with retry + fallback strategies                   │    │
│  │ 5. Store in cache layers                                    │    │
│  │ 6. Return image or SVG fallback                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐    ┌───────────────────────┐    ┌───────────────────┐
│ Direct Fetch  │    │ Cloudflare R2 Bucket  │    │ Fallback SVG     │
│ (with spoof)  │    │ (persistent cache)    │    │ (branded)        │
│               │    │ ←── NEW               │    │                  │
└───────────────┘    └───────────────────────┘    └───────────────────┘
```

---

## Enhanced Image Proxy Implementation

### New Route: `/api/image-proxy/route.ts` (Enhanced)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// ============ CONFIGURATION ============

const CONFIG = {
  // Timeouts
  FETCH_TIMEOUT_MS: 10000, // Increased from 6s
  SLOW_SERVER_TIMEOUT_MS: 15000, // For known slow domains
  
  // Retry
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 500,
  RETRY_BACKOFF_MULTIPLIER: 2,
  
  // Cache
  MEMORY_CACHE_MAX_ITEMS: 500,
  MEMORY_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  KV_CACHE_TTL_SECONDS: 86400, // 24 hours
  BROWSER_CACHE_MAX_AGE: 86400,
  STALE_WHILE_REVALIDATE: 604800, // 7 days
  
  // Size limits
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
  
  // Known slow domains (give extra time)
  SLOW_DOMAINS: new Set([
    'time.mk',
    'meta.mk',
    'libertas.mk',
    'novamakedonija.com.mk',
  ]),
} as const;

// User agents that mimic real browsers (rotate through these)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// ============ FETCH STRATEGIES ============

interface FetchStrategy {
  name: string;
  headers: HeadersInit;
  transformUrl?: (url: string) => string;
}

function getFetchStrategies(url: URL): FetchStrategy[] {
  const origin = url.origin;
  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  return [
    // Strategy 1: Spoof as coming from the source site
    {
      name: 'origin-referer',
      headers: {
        'User-Agent': randomUA,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
        'Referer': origin + '/',
        'Origin': origin,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
      },
    },
    // Strategy 2: No referer (some sites prefer this)
    {
      name: 'no-referer',
      headers: {
        'User-Agent': randomUA,
        'Accept': 'image/*',
      },
    },
    // Strategy 3: Google bot (some sites whitelist crawlers)
    {
      name: 'googlebot',
      headers: {
        'User-Agent': 'Googlebot-Image/1.0',
        'Accept': 'image/*',
      },
    },
    // Strategy 4: Try HTTP if HTTPS fails
    {
      name: 'http-fallback',
      headers: {
        'User-Agent': randomUA,
        'Accept': 'image/*',
        'Referer': origin.replace('https:', 'http:') + '/',
      },
      transformUrl: (u) => u.replace('https:', 'http:'),
    },
  ];
}

// ============ CACHE IMPLEMENTATION ============

interface CacheEntry {
  data: ArrayBuffer;
  contentType: string;
  timestamp: number;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  set(key: string, data: ArrayBuffer, contentType: string): void {
    // LRU eviction
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    
    this.cache.set(key, {
      data,
      contentType,
      timestamp: Date.now(),
    });
  }
}

const memoryCache = new ImageCache(
  CONFIG.MEMORY_CACHE_MAX_ITEMS,
  CONFIG.MEMORY_CACHE_TTL_MS
);

// ============ MAIN HANDLER ============

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Parse and validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return getFallbackResponse();
  }

  if (!isAllowedDomain(parsedUrl.hostname)) {
    console.warn(`[ImageProxy] Blocked domain: ${parsedUrl.hostname}`);
    return getFallbackResponse();
  }

  const cacheKey = getCacheKey(url);

  // Check memory cache
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached) {
    return createImageResponse(memoryCached.data, memoryCached.contentType, 'memory');
  }

  // Check KV cache (Redis)
  try {
    const kvCached = await kv.get<{ data: string; contentType: string }>(cacheKey);
    if (kvCached) {
      const buffer = Buffer.from(kvCached.data, 'base64');
      memoryCache.set(cacheKey, buffer, kvCached.contentType);
      return createImageResponse(buffer, kvCached.contentType, 'kv');
    }
  } catch (e) {
    // KV might not be configured, continue
  }

  // Fetch with strategies
  const isSlowDomain = CONFIG.SLOW_DOMAINS.has(parsedUrl.hostname);
  const timeout = isSlowDomain ? CONFIG.SLOW_SERVER_TIMEOUT_MS : CONFIG.FETCH_TIMEOUT_MS;
  
  const strategies = getFetchStrategies(parsedUrl);
  
  for (const strategy of strategies) {
    try {
      const fetchUrl = strategy.transformUrl ? strategy.transformUrl(url) : url;
      
      const response = await fetchWithRetry(fetchUrl, {
        headers: strategy.headers,
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) continue;

      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) continue;

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > CONFIG.MAX_IMAGE_SIZE_BYTES) continue;

      // Cache the successful result
      memoryCache.set(cacheKey, buffer, contentType);
      
      // Async KV cache (don't await)
      cacheToKV(cacheKey, buffer, contentType).catch(() => {});

      console.log(`[ImageProxy] Success with strategy: ${strategy.name} for ${parsedUrl.hostname}`);
      return createImageResponse(buffer, contentType, 'fetch');

    } catch (e) {
      // Try next strategy
      continue;
    }
  }

  // All strategies failed
  console.warn(`[ImageProxy] All strategies failed for: ${url.slice(0, 100)}`);
  return getFallbackResponse();
}

// ============ HELPERS ============

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts = CONFIG.RETRY_ATTEMPTS
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, { ...options, cache: 'no-store' });
      if (response.ok) return response;
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (e) {
      lastError = e as Error;
      if (lastError.name === 'AbortError') throw lastError;
    }
    
    if (i < attempts - 1) {
      await new Promise(r => setTimeout(r, 
        CONFIG.RETRY_DELAY_MS * Math.pow(CONFIG.RETRY_BACKOFF_MULTIPLIER, i)
      ));
    }
  }
  
  throw lastError || new Error('Fetch failed');
}

async function cacheToKV(key: string, buffer: ArrayBuffer, contentType: string) {
  try {
    await kv.set(key, {
      data: Buffer.from(buffer).toString('base64'),
      contentType,
    }, { ex: CONFIG.KV_CACHE_TTL_SECONDS });
  } catch {
    // Silently fail
  }
}

function createImageResponse(
  data: ArrayBuffer,
  contentType: string,
  cacheSource: string
): NextResponse {
  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${CONFIG.BROWSER_CACHE_MAX_AGE}, stale-while-revalidate=${CONFIG.STALE_WHILE_REVALIDATE}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Cache': cacheSource.toUpperCase(),
    },
  });
}

function getCacheKey(url: string): string {
  return `img:${Buffer.from(url).toString('base64url').slice(0, 64)}`;
}

function getFallbackResponse(): NextResponse {
  // Returns branded SVG fallback (same as existing)
}

export const runtime = 'edge';
```

---

## Monitoring & Alerting

### Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Image proxy success rate | > 85% | < 70% |
| Cache hit ratio (memory) | > 40% | < 20% |
| Cache hit ratio (KV) | > 60% | < 40% |
| Average fetch latency | < 2s | > 5s |
| Fallback rate | < 15% | > 30% |

### Logging Schema

```typescript
interface ImageProxyLog {
  timestamp: string;
  url: string;
  hostname: string;
  strategy: string | null;
  success: boolean;
  cacheHit: 'memory' | 'kv' | null;
  latencyMs: number;
  error?: string;
}
```

### Health Check Endpoint

```typescript
// /api/image-proxy/health/route.ts
export async function GET() {
  const testUrls = [
    'https://time.mk/images/logo.png',
    'https://meta.mk/wp-content/uploads/logo.png',
  ];
  
  const results = await Promise.all(
    testUrls.map(async (url) => {
      const start = Date.now();
      try {
        const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
        return {
          url,
          status: res.status,
          latency: Date.now() - start,
          isFallback: res.headers.get('X-Fallback') === 'true',
        };
      } catch (e) {
        return { url, error: (e as Error).message };
      }
    })
  );
  
  const healthy = results.every(r => !('error' in r) && r.status === 200);
  
  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    checks: results,
    timestamp: new Date().toISOString(),
  }, { status: healthy ? 200 : 503 });
}
```

---

## Frontend Integration

### Enhanced ProxiedNewsImage Component

```tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProxiedNewsImageProps {
  imageUrl: string | null;
  alt: string;
  sourceName?: string;
  priority?: boolean;
  onLoadComplete?: (success: boolean) => void;
}

export function ProxiedNewsImage({
  imageUrl,
  alt,
  sourceName = 'News',
  priority = false,
  onLoadComplete,
}: ProxiedNewsImageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const proxyUrl = imageUrl
    ? `/api/image-proxy?url=${encodeURIComponent(imageUrl)}&v=${retryCount}`
    : null;

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      // Retry with cache-busting param
      setTimeout(() => setRetryCount(c => c + 1), 1000);
    } else {
      setStatus('error');
      onLoadComplete?.(false);
    }
  }, [retryCount, onLoadComplete]);

  const handleLoad = useCallback(() => {
    setStatus('success');
    onLoadComplete?.(true);
  }, [onLoadComplete]);

  if (!imageUrl) {
    return <FallbackPlaceholder sourceName={sourceName} />;
  }

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
      {status === 'loading' && <LoadingSkeleton />}
      
      {status !== 'error' && proxyUrl && (
        <img
          src={proxyUrl}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            status === 'success' ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      
      {status === 'error' && <FallbackPlaceholder sourceName={sourceName} />}
    </div>
  );
}
```

---

## Deployment Checklist

- [ ] Add `@vercel/kv` package
- [ ] Configure Vercel KV in project settings
- [ ] Update environment variables
- [ ] Deploy image proxy changes
- [ ] Monitor error rates for 24h
- [ ] Set up alerting for degraded state
- [ ] Document runbook for image proxy issues
