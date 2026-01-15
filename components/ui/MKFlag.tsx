'use client';

import { cn } from '@/lib/utils';

interface MKFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Macedonian Flag SVG Component
 *
 * Uses actual flag colors and design for consistent rendering
 * across all platforms (unlike emoji which varies by OS)
 *
 * Flag design: Red background with golden/yellow sun with 8 rays
 */
export function MKFlag({ className, size = 'md' }: MKFlagProps) {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
  };

  return (
    <svg
      viewBox="0 0 28 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
      role="img"
      aria-label="Macedonian flag"
    >
      {/* Red background */}
      <rect width="28" height="14" fill="#D20000" />

      {/* Golden rays extending from center to corners and edges */}
      {/* Top ray */}
      <polygon points="14,0 11,7 17,7" fill="#FFD200" />
      {/* Bottom ray */}
      <polygon points="14,14 11,7 17,7" fill="#FFD200" />
      {/* Left ray */}
      <polygon points="0,7 14,4 14,10" fill="#FFD200" />
      {/* Right ray */}
      <polygon points="28,7 14,4 14,10" fill="#FFD200" />

      {/* Diagonal rays */}
      {/* Top-left */}
      <polygon points="0,0 14,7 11,4" fill="#FFD200" />
      <polygon points="0,0 14,7 4,10" fill="#FFD200" />
      {/* Top-right */}
      <polygon points="28,0 14,7 17,4" fill="#FFD200" />
      <polygon points="28,0 14,7 24,10" fill="#FFD200" />
      {/* Bottom-left */}
      <polygon points="0,14 14,7 11,10" fill="#FFD200" />
      <polygon points="0,14 14,7 4,4" fill="#FFD200" />
      {/* Bottom-right */}
      <polygon points="28,14 14,7 17,10" fill="#FFD200" />
      <polygon points="28,14 14,7 24,4" fill="#FFD200" />

      {/* Central sun circle */}
      <circle cx="14" cy="7" r="3" fill="#FFD200" />

      {/* Red circle in center of sun */}
      <circle cx="14" cy="7" r="2" fill="#D20000" />

      {/* Golden border around red center */}
      <circle cx="14" cy="7" r="1.5" fill="#FFD200" />
    </svg>
  );
}

export default MKFlag;
