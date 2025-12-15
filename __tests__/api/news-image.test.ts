/**
 * Tests for the News Image Proxy API
 * 
 * @see /app/api/news/image/route.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the image storage module
vi.mock('@/lib/image-storage', () => ({
  generateStorageKey: vi.fn((url: string) => `news-images/2025/12/15/test-${url.slice(-10)}`),
  getStoredImage: vi.fn(() => Promise.resolve(null)),
  storeImage: vi.fn(() => Promise.resolve('stored-key')),
  imageExists: vi.fn(() => Promise.resolve(false)),
  isStorageEnabled: vi.fn(() => false),
}));

// Mock the image cache module
vi.mock('@/lib/image-proxy-cache', () => ({
  imageCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
    getStats: vi.fn(() => ({ entries: 0, totalSizeBytes: 0 })),
  },
  getCacheKey: vi.fn((url: string) => `cache-${url}`),
}));

describe('News Image Proxy API', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Parameter Validation', () => {
    it('returns 400 when src parameter is missing', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      const request = new NextRequest('http://localhost:3000/api/news/image');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing src parameter');
    });

    it('returns 400 for invalid URL format', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      const request = new NextRequest(
        'http://localhost:3000/api/news/image?src=not-a-valid-url'
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid URL format');
    });
  });

  describe('Domain Allowlist', () => {
    it('returns fallback SVG for blocked domains', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      const blockedUrl = encodeURIComponent('https://malicious-site.com/image.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${blockedUrl}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
      expect(response.headers.get('X-Image-Source')).toBe('fallback');
    });

    it('allows requests from time.mk', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      const { imageCache } = await import('@/lib/image-proxy-cache');
      
      // Mock successful fetch
      const mockImageBuffer = new ArrayBuffer(100);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'image/jpeg']]),
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      
      const allowedUrl = encodeURIComponent('https://time.mk/image.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${allowedUrl}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Image-Source')).toBe('origin');
      expect(imageCache.set).toHaveBeenCalled();
    });

    it('allows subdomains of allowed domains', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      
      // Mock successful fetch
      const mockImageBuffer = new ArrayBuffer(100);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'image/jpeg']]),
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      
      const subdomainUrl = encodeURIComponent('https://cdn.time.mk/images/photo.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${subdomainUrl}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Image-Source')).toBe('origin');
    });
  });

  describe('Caching Behavior', () => {
    it('returns cached image from memory cache', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      const { imageCache } = await import('@/lib/image-proxy-cache');
      
      const mockCachedImage = {
        data: new ArrayBuffer(50),
        contentType: 'image/png',
        timestamp: Date.now(),
        size: 50,
      };
      
      vi.mocked(imageCache.get).mockReturnValueOnce(mockCachedImage);
      
      const url = encodeURIComponent('https://meta.mk/cached-image.png');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Image-Source')).toBe('memory-cache');
      expect(response.headers.get('Content-Type')).toBe('image/png');
    });

    it('returns cached image from persistent storage', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      const { isStorageEnabled, getStoredImage } = await import('@/lib/image-storage');
      
      vi.mocked(isStorageEnabled).mockReturnValue(true);
      vi.mocked(getStoredImage).mockResolvedValueOnce({
        data: new ArrayBuffer(75),
        contentType: 'image/webp',
        key: 'test-key',
      });
      
      const url = encodeURIComponent('https://a1on.mk/stored-image.webp');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Image-Source')).toBe('persistent-cache');
      expect(response.headers.get('Content-Type')).toBe('image/webp');
    });
  });

  describe('Error Handling', () => {
    it('returns fallback on fetch error', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const url = encodeURIComponent('https://sdk.mk/error-image.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
      expect(response.headers.get('X-Image-Source')).toBe('fallback');
    });

    it('returns fallback for non-image content type', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
      });
      
      const url = encodeURIComponent('https://faktor.mk/not-an-image');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Image-Source')).toBe('fallback');
    });

    it('returns fallback for oversized images', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([
          ['content-type', 'image/jpeg'],
          ['content-length', '15000000'], // 15MB
        ]),
      });
      
      const url = encodeURIComponent('https://libertas.mk/huge-image.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('X-Image-Source')).toBe('fallback');
    });
  });

  describe('Cache Headers', () => {
    it('sets appropriate cache control headers', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      
      const mockImageBuffer = new ArrayBuffer(100);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'image/jpeg']]),
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      
      const url = encodeURIComponent('https://nezavisen.mk/test.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('max-age=86400');
      expect(cacheControl).toContain('stale-while-revalidate');
    });

    it('includes security headers', async () => {
      const { GET } = await import('@/app/api/news/image/route');
      
      const mockImageBuffer = new ArrayBuffer(100);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'image/jpeg']]),
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      
      const url = encodeURIComponent('https://plusinfo.mk/secure.jpg');
      const request = new NextRequest(
        `http://localhost:3000/api/news/image?src=${url}`
      );
      
      const response = await GET(request);
      
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'none'");
    });
  });
});
