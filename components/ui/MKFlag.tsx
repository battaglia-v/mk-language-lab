'use client';

import { cn } from '@/lib/utils';

interface MKFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

/**
 * Macedonian Flag SVG Component
 * 
 * Renders the actual Macedonian flag (red background with yellow sun)
 * as an SVG for consistent display across all browsers and platforms.
 * 
 * The emoji 🇲🇰 renders inconsistently on different systems.
 */
export function MKFlag({ className, size = 'md' }: MKFlagProps) {
  const pixelSize = sizeMap[size];
  const width = pixelSize * 1.5; // 3:2 aspect ratio for flags
  const height = pixelSize;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block flex-shrink-0', className)}
      role="img"
      aria-label="Macedonian flag"
    >
      {/* Red background */}
      <rect width="36" height="24" fill="#D20000" rx="2" />
      
      {/* Yellow sun with 8 rays */}
      <g fill="#FFE600">
        {/* Center circle */}
        <circle cx="18" cy="12" r="4" />
        
        {/* 8 rays extending to edges */}
        {/* Top ray */}
        <polygon points="18,0 16,8 20,8" />
        {/* Bottom ray */}
        <polygon points="18,24 16,16 20,16" />
        {/* Left ray */}
        <polygon points="0,12 8,10 8,14" />
        {/* Right ray */}
        <polygon points="36,12 28,10 28,14" />
        {/* Top-left ray */}
        <polygon points="3,3 9,8 7,10" />
        {/* Top-right ray */}
        <polygon points="33,3 27,8 29,10" />
        {/* Bottom-left ray */}
        <polygon points="3,21 9,16 7,14" />
        {/* Bottom-right ray */}
        <polygon points="33,21 27,16 29,14" />
      </g>
    </svg>
  );
}

export default MKFlag;
