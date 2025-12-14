import { NextRequest, NextResponse } from 'next/server';
import { imageCache, getCacheKey } from '@/lib/image-proxy-cache';

// Timeout and size limits for image proxy
const IMAGE_FETCH_TIMEOUT_MS = 12000; // 12 seconds - increased for slow Macedonian servers
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max image size
const RETRY_DELAY_MS = 500; // Delay between retries

// Fetch strategies to try in order
type FetchStrategy = 'origin-referer' | 'no-referer' | 'googlebot' | 'http-fallback';

const FETCH_STRATEGIES: FetchStrategy[] = [
  'origin-referer',
  'no-referer', 
  'googlebot',
  'http-fallback',
];

// Domains that allow proxying for our news aggregation feature
// Time.MK is a news aggregator that links to articles from various Macedonian outlets.
// Their og:image tags reference images hosted on the original source domains.
const ALLOWED_DOMAINS = new Set([
  // Primary news aggregators
  'time.mk',
  'meta.mk',
  
  // Major Macedonian news outlets
  '360stepeni.mk',
  'zurnal.mk',
  'libertas.mk',
  'novamakedonija.com.mk',
  'nezavisen.mk',
  'plusinfo.mk',
  'kanal5.com.mk',
  'alfa.mk',
  'telma.mk',
  'mia.mk',
  'sdk.mk',
  'skopje1.mk',
  'denesen.mk',
  'lokalno.mk',
  'a1on.mk',
  'sitel.com.mk',
  'vecer.mk',
  'slobodenpecat.mk',
  'faktor.mk',
  'netpress.com.mk',
  'makfax.com.mk',
  'kurir.mk',
  'off.net.mk',
  'prizma.mk',
  'portalb.mk',
  
  // TV stations with news content
  'tv21.tv',        // TV21 - includes mk.tv21.tv subdomain
  '24.mk',          // 24 Vesti
  'alsat.mk',       // Alsat-M
  'kanal77.mk',     // Kanal 77
  
  // Additional news sources discovered from Time.MK aggregation
  'sakamda.mk',
  'inovativnost.mk',
  'racin.mk',
  'pressing.mk',
  'fokus.mk',
  'republika.mk',
  'lider.mk',
  'kapital.mk',
  'ekran.mk',
  'ipon.mk',         // IPON news
  'sportstation.mk',
  'trn.mk',
  'topsport.mk',
  'sportplus.mk',
  'skopjeinfo.mk',
  'vecer.press',
  
  // CDN and cloud hosting used by Macedonian news sites
  'cloudinary.com', // Cloudinary CDN (used by 24vesti and others)
  'wp.com',         // WordPress CDN
  'amazonaws.com',  // AWS S3/CloudFront (some news sites use this)
  'imgix.net',      // Imgix CDN
  'your-objectstorage.com', // Hetzner object storage
  
  // Additional CDNs commonly used by news aggregators
  'akamaized.net',  // Akamai CDN
  'fastly.net',     // Fastly CDN
  'gstatic.com',    // Google static content
  'fbcdn.net',      // Facebook CDN (for shared images)
  'cdninstagram.com', // Instagram CDN
  'twimg.com',      // Twitter image CDN
  'cloudfront.net', // AWS CloudFront
  'b-cdn.net',      // BunnyCDN
  'jsdelivr.net',   // jsDelivr CDN
  'staticflickr.com', // Flickr CDN
]);

const CACHE_MAX_AGE = 86400; // 24 hours in seconds
const CACHE_STALE_WHILE_REVALIDATE = 604800; // 7 days

// Base64 encoded minimal SVG placeholder (inline to avoid file I/O)
const FALLBACK_SVG = `<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e293b"/><stop offset="50%" style="stop-color:#334155"/><stop offset="100%" style="stop-color:#1e293b"/></linearGradient></defs><rect width="800" height="450" fill="url(#bg)"/><g transform="translate(340, 165)"><rect x="0" y="0" width="120" height="120" rx="24" fill="rgba(255,255,255,0.1)"/><path d="M60 30 L90 70 L80 70 L80 90 L40 90 L40 70 L30 70 Z" fill="rgba(255,255,255,0.3)"/><circle cx="75" cy="45" r="8" fill="rgba(255,255,255,0.4)"/></g><text x="400" y="320" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui, sans-serif" font-size="14" font-weight="500">Macedonian News</text></svg>`;

function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    // Check if the hostname matches any allowed domain or is a subdomain of one
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

/**
 * Return the fallback SVG image response
 */
function getFallbackResponse(): NextResponse {
  return new NextResponse(FALLBACK_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Fallback': 'true',
    },
  });
}

/**
 * Build fetch options for a specific strategy
 */
function buildFetchOptions(url: string, strategy: FetchStrategy): RequestInit {
  const parsedUrl = new URL(url);
  
  const baseOptions: RequestInit = {
    cache: 'no-store' as const,
    signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
  };

  switch (strategy) {
    case 'origin-referer':
      return {
        ...baseOptions,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'mk,en;q=0.9',
          'Referer': parsedUrl.origin + '/',
          'Origin': parsedUrl.origin,
        },
      };

    case 'no-referer':
      return {
        ...baseOptions,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        referrerPolicy: 'no-referrer' as const,
      };

    case 'googlebot':
      return {
        ...baseOptions,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'image/*,*/*',
        },
      };

    case 'http-fallback':
      // This strategy uses HTTP instead of HTTPS - handled in the fetch logic
      return {
        ...baseOptions,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MKLanguageLab/1.0; +https://mklanguage.com)',
          'Accept': 'image/*',
        },
      };
  }
}

/**
 * Fetch image with multiple strategy fallbacks
 */
async function fetchWithStrategies(
  url: string,
  strategies: FetchStrategy[] = FETCH_STRATEGIES
): Promise<Response> {
  let lastError: Error | null = null;
  const parsedUrl = new URL(url);
  
  for (const strategy of strategies) {
    try {
      const fetchUrl = strategy === 'http-fallback' && parsedUrl.protocol === 'https:'
        ? url.replace('https://', 'http://')
        : (parsedUrl.protocol === 'http:' ? url.replace('http://', 'https://') : url);
      
      const options = buildFetchOptions(url, strategy);
      const response = await fetch(fetchUrl, options);
      
      if (response.ok) {
        // Log successful strategy for debugging
        console.log(`[Image Proxy] Success with strategy: ${strategy} - ${parsedUrl.hostname}`);
        return response;
      }
      
      // Don't try more strategies for client errors (except 403 which might be referer-based)
      if (response.status >= 400 && response.status < 500 && response.status !== 403) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      lastError = new Error(`HTTP ${response.status} with strategy ${strategy}`);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on abort/timeout - move to next strategy
      if (lastError.name === 'TimeoutError' || lastError.name === 'AbortError') {
        console.warn(`[Image Proxy] Timeout with strategy: ${strategy} - ${parsedUrl.hostname}`);
        continue;
      }
    }
    
    // Small delay before trying next strategy
    if (strategies.indexOf(strategy) < strategies.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  
  throw lastError || new Error('All fetch strategies failed');
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url format' }, { status: 400 });
  }

  // Validate protocol (we'll handle http->https upgrade in fetch strategies)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
  }

  // Validate domain is in allowlist
  if (!isAllowedDomain(url)) {
    console.warn(`[Image Proxy] Domain blocked: ${parsedUrl.hostname} - URL: ${url.slice(0, 100)}`);
    return getFallbackResponse();
  }

  const cacheKey = getCacheKey(url);

  // Check in-memory cache first
  const cached = imageCache.get(cacheKey);
  if (cached) {
    return new NextResponse(cached.data, {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    // Use multi-strategy fetch for better reliability
    const response = await fetchWithStrategies(url);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn(`[Image Proxy] Not an image: ${contentType} - ${url.slice(0, 100)}`);
      return getFallbackResponse();
    }

    // Check content length to prevent fetching very large images
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE_BYTES) {
      console.warn(`[Image Proxy] Image too large: ${contentLength} bytes - ${url.slice(0, 100)}`);
      return getFallbackResponse();
    }

    const buffer = await response.arrayBuffer();
    
    // Double-check buffer size in case content-length was missing/wrong
    if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      console.warn(`[Image Proxy] Image too large after fetch: ${buffer.byteLength} bytes`);
      return getFallbackResponse();
    }

    // Store in cache for future requests
    imageCache.set(cacheKey, buffer, contentType);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    const err = error as Error;
    console.warn(`[Image Proxy] Error fetching: ${err.message} - ${url.slice(0, 80)}`);
    // Always return fallback on any error - never break the UI
    return getFallbackResponse();
  }
}

export const runtime = 'edge';
