'use client';

import { useState, useCallback, useEffect, ImgHTMLAttributes } from 'react';
import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProxiedNewsImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  /** Original image URL (will be proxied) */
  imageUrl: string | null;
  /** Alt text for accessibility */
  alt: string;
  /** Source name for fallback display */
  sourceName?: string;
  /** Additional class name for the container */
  containerClassName?: string;
}

/**
 * Proxied News Image Component
 *
 * Handles image loading through the proxy with automatic fallback
 * to a branded placeholder when images fail to load.
 *
 * Features:
 * - Automatic proxy URL generation
 * - Graceful fallback on error
 * - Loading state handling with skeleton
 * - Lazy loading support
 * - No layout shift (explicit dimensions)
 */
export function ProxiedNewsImage({
  imageUrl,
  alt,
  sourceName = 'News',
  containerClassName,
  className,
  ...imgProps
}: ProxiedNewsImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset state when imageUrl changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [imageUrl]);

  // Generate proxy URL - prefer new news/image endpoint for better caching
  const proxyUrl = imageUrl
    ? `/api/news/image?src=${encodeURIComponent(imageUrl)}`
    : null;

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Show fallback if no image URL or if loading failed
  const showFallback = !imageUrl || hasError;

  return (
    <div className={cn(
      "relative w-full overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800",
      containerClassName
    )}>
      {/* Actual image - hidden when showing fallback */}
      {proxyUrl && !showFallback && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxyUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={800}
          height={450}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...imgProps}
        />
      )}

      {/* Loading skeleton - shown while image loads */}
      {proxyUrl && !showFallback && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
            <Newspaper className="h-6 w-6 text-slate-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Fallback placeholder */}
      {showFallback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Newspaper className="h-8 w-8 text-slate-300" />
          </div>
          <span className="text-xs font-medium text-slate-400">{sourceName}</span>
        </div>
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
