'use client';

import { cn } from '@/lib/utils';

interface MKFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Macedonian Flag SVG Component
 *
 * The flag of North Macedonia: Red field with a stylized yellow sun
 * with eight broadening rays extending from the center to the edges.
 * Adopted in 1995.
 */
export function MKFlag({ className, size = 'md' }: MKFlagProps) {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
  };

  return (
    <svg
      viewBox="0 0 2 1"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
      role="img"
      aria-label="Macedonian flag"
    >
      {/* Red background */}
      <rect width="2" height="1" fill="#D20000" />

      {/* 8 broadening rays extending to flag edges */}
      {/* Top ray */}
      <polygon points="0.88,0 1,0.5 1.12,0" fill="#FFE600" />
      {/* Top-right ray */}
      <polygon points="2,0 1,0.5 2,0.35" fill="#FFE600" />
      {/* Right ray */}
      <polygon points="2,0.38 1,0.5 2,0.62" fill="#FFE600" />
      {/* Bottom-right ray */}
      <polygon points="2,0.65 1,0.5 2,1" fill="#FFE600" />
      {/* Bottom ray */}
      <polygon points="1.12,1 1,0.5 0.88,1" fill="#FFE600" />
      {/* Bottom-left ray */}
      <polygon points="0,1 1,0.5 0,0.65" fill="#FFE600" />
      {/* Left ray */}
      <polygon points="0,0.62 1,0.5 0,0.38" fill="#FFE600" />
      {/* Top-left ray */}
      <polygon points="0,0.35 1,0.5 0,0" fill="#FFE600" />

      {/* Central sun disc with red ring */}
      <circle cx="1" cy="0.5" r="0.2" fill="#FFE600" />
      <circle cx="1" cy="0.5" r="0.15" fill="#D20000" />
      <circle cx="1" cy="0.5" r="0.1" fill="#FFE600" />
    </svg>
  );
}

export default MKFlag;
