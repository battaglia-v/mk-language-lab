import { NextRequest, NextResponse } from 'next/server';

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
]);

const CACHE_MAX_AGE = 86400; // 24 hours in seconds
const CACHE_STALE_WHILE_REVALIDATE = 604800; // 7 days

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

  // Upgrade HTTP to HTTPS for security, or accept HTTPS
  if (parsedUrl.protocol === 'http:') {
    parsedUrl.protocol = 'https:';
  } else if (parsedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
  }

  const secureUrl = parsedUrl.toString();

  // Validate domain is in allowlist (use original URL for domain check)
  if (!isAllowedDomain(url)) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    // Try HTTPS first
    let response = await fetch(secureUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MKLanguageLab/1.0; +https://mk-language-lab.vercel.app)',
        Accept: 'image/*',
        Referer: parsedUrl.origin,
      },
      cache: 'no-store',
    });

    // If HTTPS fails, fall back to HTTP for domains that don't support HTTPS
    if (!response.ok && url.startsWith('http://')) {
      response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; MKLanguageLab/1.0; +https://mk-language-lab.vercel.app)',
          Accept: 'image/*',
          Referer: new URL(url).origin,
        },
        cache: 'no-store',
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL did not return an image' }, { status: 400 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
      },
    });
  } catch (error) {
    console.error('[Image Proxy] Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

export const runtime = 'edge';
