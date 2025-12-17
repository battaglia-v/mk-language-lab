/**
 * News Image Proxy API Route
 * 
 * Dedicated endpoint for reliably serving news article images.
 * Features:
 * - Server-side fetching to bypass CORS restrictions
 * - Multiple fetch strategies for stubborn sources
 * - Persistent caching to S3/R2 for fast subsequent loads
 * - In-memory LRU cache for immediate response
 * - Graceful SVG fallback on any failure
 * - Comprehensive error logging for monitoring
 * 
 * @see /docs/ux-audit/02-news-image-reliability.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageCache, getCacheKey } from '@/lib/image-proxy-cache';
import { 
  generateStorageKey, 
  getStoredImage, 
  storeImage, 
  isStorageEnabled 
} from '@/lib/image-storage';

// ==================== Configuration ====================

const CONFIG = {
  // Timeouts - increased for slow Macedonian servers
  FETCH_TIMEOUT_MS: 15000,
  SLOW_DOMAIN_TIMEOUT_MS: 20000,
  
  // Retry settings
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 500,
  RETRY_BACKOFF: 1.5,
  
  // Size limits
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_CACHEABLE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB for persistent cache
  
  // Cache TTLs
  BROWSER_CACHE_MAX_AGE: 86400, // 24 hours
  STALE_WHILE_REVALIDATE: 604800, // 7 days
  
  // Known slow domains (give extra time)
  SLOW_DOMAINS: new Set([
    'time.mk',
    'meta.mk',
    'libertas.mk',
    'novamakedonija.com.mk',
    'nezavisen.mk',
    'a1on.mk',
    'sdk.mk',
  ]),
} as const;

// Allowed domains for security (same as main image-proxy)
const ALLOWED_DOMAINS = new Set([
  // Primary aggregators
  'time.mk', 'meta.mk',
  // Major outlets
  '360stepeni.mk', 'zurnal.mk', 'libertas.mk', 'novamakedonija.com.mk',
  'nezavisen.mk', 'plusinfo.mk', 'kanal5.com.mk', 'alfa.mk', 'telma.mk',
  'mia.mk', 'sdk.mk', 'skopje1.mk', 'denesen.mk', 'lokalno.mk', 'a1on.mk',
  'sitel.com.mk', 'vecer.mk', 'slobodenpecat.mk', 'faktor.mk',
  'netpress.com.mk', 'makfax.com.mk', 'kurir.mk', 'off.net.mk',
  'prizma.mk', 'portalb.mk', 'tv21.tv', '24.mk', 'alsat.mk', 'kanal77.mk',
  'sakamda.mk', 'inovativnost.mk', 'racin.mk', 'pressing.mk', 'fokus.mk',
  'republika.mk', 'lider.mk', 'kapital.mk', 'ekran.mk', 'ipon.mk',
  'sportstation.mk', 'trn.mk', 'topsport.mk', 'sportplus.mk', 'skopjeinfo.mk',
  'vecer.press',
  // CDNs
  'cloudinary.com', 'wp.com', 'amazonaws.com', 'imgix.net',
  'akamaized.net', 'fastly.net', 'cloudfront.net', 'b-cdn.net',
]);

// User agents that mimic real browsers
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// ==================== Fallback SVG ====================

const FALLBACK_SVG = `<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="50%" style="stop-color:#334155"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <g transform="translate(340, 165)">
    <rect x="0" y="0" width="120" height="120" rx="24" fill="rgba(255,255,255,0.1)"/>
    <path d="M60 30 L90 70 L80 70 L80 90 L40 90 L40 70 L30 70 Z" fill="rgba(255,255,255,0.3)"/>
    <circle cx="75" cy="45" r="8" fill="rgba(255,255,255,0.4)"/>
  </g>
  <text x="400" y="320" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui, sans-serif" font-size="14" font-weight="500">Macedonian News</text>
</svg>`;

// ==================== Helpers ====================

function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    for (const allowed of ALLOWED_DOMAINS) {
      if (hostname === allowed || hostname.endsWith(`.${allowed}`)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function isSlowDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    for (const slow of CONFIG.SLOW_DOMAINS) {
      if (hostname === slow || hostname.endsWith(`.${slow}`)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getFallbackResponse(): NextResponse {
  return new NextResponse(FALLBACK_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${CONFIG.BROWSER_CACHE_MAX_AGE}, stale-while-revalidate=${CONFIG.STALE_WHILE_REVALIDATE}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Image-Source': 'fallback',
    },
  });
}

// ==================== Fetch Strategies ====================

interface FetchStrategy {
  name: string;
  headers: HeadersInit;
  transformUrl?: (url: string) => string;
}

function getFetchStrategies(url: URL): FetchStrategy[] {
  const origin = url.origin;
  const userAgent = getRandomUserAgent();
  
  return [
    // Strategy 1: Spoof as coming from the source site
    {
      name: 'origin-referer',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
        'Referer': origin + '/',
        'Origin': origin,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
      },
    },
    // Strategy 2: No referer
    {
      name: 'no-referer',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    },
    // Strategy 3: Googlebot
    {
      name: 'googlebot',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'image/*,*/*',
      },
    },
    // Strategy 4: HTTP fallback for HTTPS-only failures
    {
      name: 'http-fallback',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MKLanguageLab/1.0)',
        'Accept': 'image/*',
      },
      transformUrl: (u) => u.replace('https://', 'http://'),
    },
  ];
}

// Structured logging for diagnostics
interface ImageProxyLog {
  event: string;
  timestamp: string;
  url: string;
  hostname: string;
  strategy: string;
  statusCode?: number;
  contentType?: string | null;
  contentLength?: string | null;
  success: boolean;
  error?: string;
  isHtmlBotBlock?: boolean;
}

function logImageProxy(data: ImageProxyLog) {
  // Structured JSON logging for monitoring/debugging
  console.log(JSON.stringify(data));
}

interface FetchResult {
  response: Response | null;
  successStrategy: string | null;
  lastStatusCode: number | null;
  lastContentType: string | null;
}

async function fetchWithStrategies(url: string): Promise<FetchResult> {
  const parsedUrl = new URL(url);
  const timeout = isSlowDomain(url) 
    ? CONFIG.SLOW_DOMAIN_TIMEOUT_MS 
    : CONFIG.FETCH_TIMEOUT_MS;
  
  const strategies = getFetchStrategies(parsedUrl);
  let lastStatusCode: number | null = null;
  let lastContentType: string | null = null;
  
  for (const strategy of strategies) {
    try {
      const fetchUrl = strategy.transformUrl ? strategy.transformUrl(url) : url;
      
      const response = await fetch(fetchUrl, {
        headers: strategy.headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(timeout),
      });
      
      lastStatusCode = response.status;
      lastContentType = response.headers.get('content-type');
      
      // Check if response is an HTML bot-block page
      const isHtmlBotBlock = lastContentType?.includes('text/html') ?? false;
      
      // Log every attempt for diagnostics
      logImageProxy({
        event: 'image_proxy_attempt',
        timestamp: new Date().toISOString(),
        url: url.slice(0, 100),
        hostname: parsedUrl.hostname,
        strategy: strategy.name,
        statusCode: response.status,
        contentType: lastContentType,
        contentLength: response.headers.get('content-length'),
        success: response.ok && !isHtmlBotBlock,
        isHtmlBotBlock,
      });
      
      if (response.ok && !isHtmlBotBlock) {
        return { response, successStrategy: strategy.name, lastStatusCode, lastContentType };
      }
      
      // Don't try more strategies for client errors (except 403)
      if (response.status >= 400 && response.status < 500 && response.status !== 403) {
        break;
      }
    } catch (error) {
      const err = error as Error;
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      
      logImageProxy({
        event: 'image_proxy_attempt',
        timestamp: new Date().toISOString(),
        url: url.slice(0, 100),
        hostname: parsedUrl.hostname,
        strategy: strategy.name,
        success: false,
        error: isTimeout ? 'timeout' : err.message,
      });
    }
    
    // Small delay before next strategy
    await new Promise(r => setTimeout(r, CONFIG.RETRY_DELAY_MS));
  }
  
  return { response: null, successStrategy: null, lastStatusCode, lastContentType };
}

// ==================== Main Handler ====================

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('src');
  const retry = request.nextUrl.searchParams.get('retry');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 });
  }
  
  // On retry, skip memory cache to force re-fetch
  const skipMemoryCache = retry && parseInt(retry, 10) > 0;
  
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }
  
  // Security check
  if (!isAllowedDomain(url)) {
    console.warn(`[NewsImage] Blocked domain: ${parsedUrl.hostname}`);
    return getFallbackResponse();
  }
  
  // 1. Check in-memory cache first (fastest) - skip on retry
  const memoryCacheKey = getCacheKey(url);
  if (!skipMemoryCache) {
    const memoryCached = imageCache.get(memoryCacheKey);
    if (memoryCached) {
      return new NextResponse(memoryCached.data, {
        status: 200,
        headers: {
          'Content-Type': memoryCached.contentType,
          'Cache-Control': `public, max-age=${CONFIG.BROWSER_CACHE_MAX_AGE}, stale-while-revalidate=${CONFIG.STALE_WHILE_REVALIDATE}`,
          'X-Content-Type-Options': 'nosniff',
          'X-Image-Source': 'memory-cache',
        },
      });
    }
  }
  
  // 2. Check persistent storage (if enabled)
  const storageKey = generateStorageKey(url);
  
  if (isStorageEnabled()) {
    try {
      const stored = await getStoredImage(storageKey);
      if (stored) {
        // Also populate memory cache for next request
        imageCache.set(memoryCacheKey, stored.data, stored.contentType);
        
        return new NextResponse(stored.data, {
          status: 200,
          headers: {
            'Content-Type': stored.contentType,
            'Cache-Control': `public, max-age=${CONFIG.BROWSER_CACHE_MAX_AGE}, stale-while-revalidate=${CONFIG.STALE_WHILE_REVALIDATE}`,
            'X-Content-Type-Options': 'nosniff',
            'X-Image-Source': 'persistent-cache',
          },
        });
      }
    } catch (error) {
      console.warn(`[NewsImage] Storage read error:`, error);
    }
  }
  
  // 3. Fetch from source
  try {
    const fetchResult = await fetchWithStrategies(url);
    
    if (!fetchResult.response) {
      logImageProxy({
        event: 'image_proxy_all_failed',
        timestamp: new Date().toISOString(),
        url: url.slice(0, 100),
        hostname: parsedUrl.hostname,
        strategy: 'all',
        statusCode: fetchResult.lastStatusCode ?? undefined,
        contentType: fetchResult.lastContentType,
        success: false,
      });
      return getFallbackResponse();
    }
    
    const { response, successStrategy } = fetchResult;
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.startsWith('image/')) {
      logImageProxy({
        event: 'image_proxy_not_image',
        timestamp: new Date().toISOString(),
        url: url.slice(0, 100),
        hostname: parsedUrl.hostname,
        strategy: successStrategy ?? 'unknown',
        statusCode: response.status,
        contentType,
        success: false,
        isHtmlBotBlock: contentType?.includes('text/html') ?? false,
      });
      return getFallbackResponse();
    }
    
    // Check size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > CONFIG.MAX_IMAGE_SIZE_BYTES) {
      console.warn(`[NewsImage] Too large: ${contentLength} bytes`);
      return getFallbackResponse();
    }
    
    const buffer = await response.arrayBuffer();
    
    // Double-check size
    if (buffer.byteLength > CONFIG.MAX_IMAGE_SIZE_BYTES) {
      console.warn(`[NewsImage] Too large after fetch: ${buffer.byteLength} bytes`);
      return getFallbackResponse();
    }
    
    // Store in memory cache
    imageCache.set(memoryCacheKey, buffer, contentType);
    
    // Store in persistent storage (async, don't block response)
    if (isStorageEnabled() && buffer.byteLength <= CONFIG.MAX_CACHEABLE_SIZE_BYTES) {
      storeImage(storageKey, buffer, contentType).catch(err => {
        console.warn(`[NewsImage] Failed to persist:`, err);
      });
    }
    
    // Log successful fetch
    logImageProxy({
      event: 'image_proxy_success',
      timestamp: new Date().toISOString(),
      url: url.slice(0, 100),
      hostname: parsedUrl.hostname,
      strategy: successStrategy ?? 'unknown',
      statusCode: response.status,
      contentType,
      contentLength: String(buffer.byteLength),
      success: true,
    });
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CONFIG.BROWSER_CACHE_MAX_AGE}, stale-while-revalidate=${CONFIG.STALE_WHILE_REVALIDATE}`,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
        'X-Image-Source': 'origin',
        // Debug headers for diagnostics
        'X-Image-Debug': JSON.stringify({
          strategy: successStrategy,
          statusCode: response.status,
          contentType,
          bytesReturned: buffer.byteLength,
        }),
      },
    });
  } catch (error) {
    const err = error as Error;
    logImageProxy({
      event: 'image_proxy_error',
      timestamp: new Date().toISOString(),
      url: url.slice(0, 100),
      hostname: parsedUrl.hostname,
      strategy: 'fetch',
      success: false,
      error: err.message,
    });
    return getFallbackResponse();
  }
}

// Edge runtime for best performance
export const runtime = 'edge';
