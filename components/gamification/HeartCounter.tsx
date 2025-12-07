"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { scaleIn } from "@/lib/animations";

interface HeartCounterProps {
  /**
   * Current number of hearts (0-5)
   */
  hearts: number;
  /**
   * Maximum hearts (default 5)
   */
  maxHearts?: number;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Show hearts as a row or show just the count
   */
  variant?: "row" | "compact";
  /**
   * Additional className
   */
  className?: string;
  /**
   * Animate heart loss
   */
  animateLoss?: boolean;
}

const SIZE_CONFIG = {
  sm: {
    heart: "h-4 w-4",
    text: "text-sm",
  },
  md: {
    heart: "h-5 w-5",
    text: "text-base",
  },
  lg: {
    heart: "h-6 w-6",
    text: "text-lg",
  },
};

export function HeartCounter({
  hearts,
  maxHearts = 5,
  size = "md",
  variant = "row",
  className,
  animateLoss = true,
}: HeartCounterProps) {
  const config = SIZE_CONFIG[size];
  const clampedHearts = Math.max(0, Math.min(hearts, maxHearts));

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <Heart
          className={cn(config.heart, clampedHearts > 0 ? "text-danger" : "text-muted-foreground")}
          fill={clampedHearts > 0 ? "currentColor" : "none"}
          strokeWidth={clampedHearts > 0 ? 0 : 2}
        />
        <span className={cn("font-bold", config.text, clampedHearts === 0 ? "text-muted-foreground" : "text-foreground")}>
          {clampedHearts}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <AnimatePresence mode="popLayout">
        {Array.from({ length: maxHearts }).map((_, index) => {
          const isFilled = index < clampedHearts;
          return (
            <motion.div
              key={index}
              variants={scaleIn}
              initial={animateLoss ? "initial" : false}
              animate="animate"
              exit="exit"
              transition={{ delay: index * 0.05 }}
            >
              <Heart
                className={cn(
                  config.heart,
                  isFilled ? "text-danger" : "text-muted-foreground/30"
                )}
                fill={isFilled ? "currentColor" : "none"}
                strokeWidth={isFilled ? 0 : 2}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Large heart display with regeneration info
 */
export function HeartCounterLarge({
  hearts,
  maxHearts = 5,
  nextHeartIn,
  className,
}: {
  hearts: number;
  maxHearts?: number;
  nextHeartIn?: string; // e.g., "2h 30m"
  className?: string;
}) {
  const clampedHearts = Math.max(0, Math.min(hearts, maxHearts));
  const isFull = clampedHearts === maxHearts;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hearts</p>
          <motion.p
            className="text-4xl font-bold text-foreground"
            key={hearts}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {clampedHearts}
            <span className="text-2xl text-muted-foreground">/{maxHearts}</span>
          </motion.p>
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: maxHearts }).map((_, index) => {
            const isFilled = index < clampedHearts;
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <Heart
                  className={cn(
                    "h-8 w-8",
                    isFilled ? "text-danger" : "text-muted-foreground/20"
                  )}
                  fill={isFilled ? "currentColor" : "none"}
                  strokeWidth={isFilled ? 0 : 2}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted p-3">
        {isFull ? (
          <p className="text-sm text-muted-foreground">
            💚 You&apos;re at full hearts! Great work staying focused.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Hearts regenerate over time
            </p>
            {nextHeartIn && (
              <p className="text-xs text-muted-foreground">
                Next heart in: <span className="font-medium text-accent">{nextHeartIn}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              1 heart regenerates every 4 hours
            </p>
          </div>
        )}
      </div>

      {clampedHearts === 0 && (
        <div className="mt-3 rounded-lg border border-danger/20 bg-danger/10 p-3">
          <p className="text-sm font-medium text-danger">
            ⚠️ Out of hearts! Wait for regeneration or practice without losing hearts.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Heart loss animation indicator
 */
export function HeartLossIndicator() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{ duration: 0.8 }}
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
    >
      <Heart className="h-24 w-24 text-danger" fill="currentColor" />
    </motion.div>
  );
}

/**
 * Heart gain animation indicator
 */
export function HeartGainIndicator() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        y: [50, 0, 0],
      }}
      exit={{
        scale: 0,
        opacity: 0,
        y: -50,
      }}
      transition={{ duration: 0.6 }}
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="flex flex-col items-center gap-2">
        <Heart className="h-16 w-16 text-danger" fill="currentColor" />
        <span className="text-xl font-bold text-success">+1 Heart!</span>
      </div>
    </motion.div>
  );
}
