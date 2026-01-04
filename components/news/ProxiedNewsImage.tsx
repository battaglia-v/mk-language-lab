'use client';

import { useState, useCallback, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { getSourceFallbackImage, getSourceColors } from '@/lib/news-source-branding';
import type { ThemeMode } from '@/lib/news-source-branding';

interface ProxiedNewsImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  /** Original image URL (will be proxied) */
  imageUrl: string | null;
  /** Alt text for accessibility */
  alt: string;
  /** Source ID for branded fallback (e.g., 'time-mk', 'meta-mk') */
  sourceId?: string;
  /** Source name for fallback display (deprecated, use sourceId) */
  sourceName?: string;
  /** Additional class name for the container */
  containerClassName?: string;
  /** Max retry attempts (default: 1 - fail fast, show branded fallback) */
  maxRetries?: number;
}

// Reduced timeout - show branded fallback faster for better UX
const MAX_LOADING_TIMEOUT_MS = 5000;

/**
 * Proxied News Image Component
 *
 * Handles image loading through the server-side proxy with automatic fallback
 * to a SOURCE-BRANDED placeholder when images fail to load.
 *
 * Key improvement: Instead of showing a generic placeholder, we show a
 * branded SVG specific to the news source (Time.mk, Meta.mk, etc.)
 * This makes failed images look intentional rather than broken.
 *
 * Features:
 * - Server-side proxy URL generation (never direct hotlink)
 * - Fast failure with branded fallback (1 retry max)
 * - Source-specific branded placeholders
 * - 5s timeout to prevent infinite skeleton
 * - Lazy loading support
 * - No layout shift (explicit dimensions)
 */
export function ProxiedNewsImage({
  imageUrl,
  alt,
  sourceId = 'unknown',
  sourceName,
  containerClassName,
  className,
  maxRetries = 1, // Reduced from 2 - fail fast, show branded fallback
  ...imgProps
}: ProxiedNewsImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { resolvedTheme } = useTheme();

  // Get theme-aware branding for fallback
  const themeMode: ThemeMode = resolvedTheme === 'light' ? 'light' : 'dark';
  const colors = getSourceColors(sourceId, themeMode);
  const fallbackImage = getSourceFallbackImage(sourceId, themeMode);
  const displayName = sourceName || sourceId.replace('-', '.');

  // Reset state when imageUrl changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setRetryCount(0);

    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, [imageUrl]);

  // Max timeout - show fallback after 5s
  useEffect(() => {
    if (!imageUrl || isLoaded || hasError) return;

    maxTimeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        setHasError(true);
      }
    }, MAX_LOADING_TIMEOUT_MS);

    return () => {
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [imageUrl, isLoaded, hasError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  // Generate proxy URL
  const proxyUrl = imageUrl
    ? `/api/news/image?src=${encodeURIComponent(imageUrl)}${retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;

  const handleError = useCallback(() => {
    if (retryCount < maxRetries) {
      // Quick retry (500ms) then fail
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 500);
    } else {
      setHasError(true);
    }
  }, [retryCount, maxRetries]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  // Show fallback if no image URL or load failed
  const showFallback = !imageUrl || hasError;
  const isLoading = proxyUrl && !showFallback && !isLoaded;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        containerClassName
      )}
      style={{
        backgroundColor: colors.bgColor1,
      }}
    >
      {/* Branded fallback - only show when confirmed failed or no URL */}
      {showFallback && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fallbackImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute bottom-3 left-3">
            <span
              className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide rounded"
              style={{
                backgroundColor: `${colors.textColor}20`,
                color: colors.textColor,
              }}
            >
              {displayName}
            </span>
          </div>
        </>
      )}

      {/* Actual image - show when we have a URL and haven't failed */}
      {proxyUrl && !showFallback && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${imageUrl}-${retryCount}`}
          src={proxyUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={800}
          height={450}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...imgProps}
        />
      )}

      {/* Loading state - show placeholder color with subtle animation */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: colors.bgColor1 }} />
      )}
    </div>
  );
}

/**
 * Get proxied image URL for direct usage
 * Use this for cases where you need the URL string directly
 */
export function getProxiedImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return `/api/news/image?src=${encodeURIComponent(imageUrl)}`;
}
