"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /**
   * Progress value (0-100)
   */
  progress: number;
  /**
   * Size of the ring in pixels
   */
  size?: number;
  /**
   * Stroke width in pixels
   */
  strokeWidth?: number;
  /**
   * Color of the progress ring
   */
  progressColor?: string;
  /**
   * Color of the background ring
   */
  backgroundColor?: string;
  /**
   * Content to display in the center
   */
  children?: React.ReactNode;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Show percentage text
   */
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  progressColor = "var(--mk-accent)",
  backgroundColor = "var(--mk-border)",
  children,
  className,
  showPercentage = false,
}: ProgressRingProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset: circumference * (1 - clampedProgress / 100),
            opacity: 1,
          }}
          initial={{
            strokeDashoffset: circumference,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          style={{
            filter: clampedProgress > 0 ? "drop-shadow(0 0 4px currentColor)" : "none",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          // @ts-expect-error framer-motion type compatibility issue with Next.js 16
          <motion.span
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {Math.round(clampedProgress)}%
          </motion.span>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Smaller progress ring for inline use
 */
export function ProgressRingMini({
  progress,
  size = 48,
  className,
}: {
  progress: number;
  size?: number;
  className?: string;
}) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={4}
      className={className}
    >
      <span className="text-xs font-semibold">{Math.round(progress)}%</span>
    </ProgressRing>
  );
}
