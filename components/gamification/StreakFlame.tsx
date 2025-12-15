"use client";

import { motion } from "framer-motion";
import { Flame, Snowflake, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { streakFlame } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface StreakFlameProps {
  /**
   * Current streak count
   */
  streak: number;
  /**
   * Longest streak achieved
   */
  longestStreak?: number;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Show streak number
   */
  showNumber?: boolean;
  /**
   * Celebrate animation (when streak increments)
   */
  celebrate?: boolean;
  /**
   * Whether streak is currently frozen/protected
   */
  isFrozen?: boolean;
  /**
   * Whether streak is at risk (24-48 hours without practice)
   */
  isAtRisk?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    icon: "h-5 w-5",
    container: "h-8",
    text: "text-sm",
  },
  md: {
    icon: "h-6 w-6",
    container: "h-10",
    text: "text-base",
  },
  lg: {
    icon: "h-8 w-8",
    container: "h-14",
    text: "text-xl",
  },
};

export function StreakFlame({
  streak,
  longestStreak,
  size = "md",
  showNumber = true,
  celebrate = false,
  isFrozen = false,
  isAtRisk = false,
  className,
}: StreakFlameProps) {
  const config = SIZE_CONFIG[size];
  const prefersReducedMotion = useReducedMotion();

  // Flame color based on streak milestones and status
  const getFlameColor = () => {
    if (isFrozen) return "text-blue-400"; // Frozen/protected
    if (isAtRisk) return "text-amber-300/70"; // At risk - dimmed
    if (streak === 0) return "text-muted-foreground";
    if (streak >= 100) return "text-purple-500"; // Epic
    if (streak >= 30) return "text-orange-500"; // Hot
    if (streak >= 7) return "text-amber-500"; // Warm
    return "text-warning"; // Active
  };

  // Flame scale based on streak milestones
  const getFlameScale = () => {
    if (streak >= 100) return 1.3;
    if (streak >= 30) return 1.2;
    if (streak >= 7) return 1.1;
    return 1;
  };

  // Get icon based on status
  const getIcon = () => {
    if (isFrozen) {
      return (
        <div className="relative">
          <Flame
            className={cn(config.icon, getFlameColor())}
            fill="currentColor"
            strokeWidth={0}
          />
          <Snowflake
            className={cn(
              "absolute -top-1 -right-1 h-3 w-3 text-blue-300",
              size === "lg" && "h-4 w-4",
              size === "sm" && "h-2 w-2"
            )}
          />
        </div>
      );
    }
    if (isAtRisk) {
      return (
        <div className="relative">
          <Flame
            className={cn(config.icon, getFlameColor(), "animate-pulse")}
            fill={streak > 0 ? "currentColor" : "none"}
            strokeWidth={streak > 0 ? 0 : 2}
          />
          <div
            className={cn(
              "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-warning animate-ping",
              size === "lg" && "h-3 w-3",
              size === "sm" && "h-1.5 w-1.5"
            )}
          />
        </div>
      );
    }
    return (
      <Flame
        className={cn(config.icon, getFlameColor())}
        fill={streak > 0 ? "currentColor" : "none"}
        strokeWidth={streak > 0 ? 0 : 2}
      />
    );
  };

  // Reduced motion variant - static display
  const reducedMotionVariant = {
    initial: { scale: 1, rotate: 0 },
    idle: { scale: 1, rotate: 0 },
    celebrate: { scale: 1, rotate: 0 },
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-full",
          config.container,
          streak > 0 && !isFrozen && "bg-accent/10",
          isFrozen && "bg-blue-500/10",
          isAtRisk && !isFrozen && "bg-warning/10"
        )}
        variants={prefersReducedMotion ? reducedMotionVariant : streakFlame}
        animate={celebrate ? "celebrate" : streak > 0 ? "idle" : "initial"}
        style={{
          scale: getFlameScale(),
        }}
      >
        {getIcon()}
      </motion.div>

      {showNumber && (
        <div className="flex flex-col">
          <motion.span
            className={cn(
              "font-bold",
              config.text,
              isFrozen ? "text-blue-400" : isAtRisk ? "text-warning" : "text-foreground"
            )}
            key={streak} // Re-mount on streak change for animation
            initial={{ scale: prefersReducedMotion ? 1 : (celebrate ? 1.5 : 1), opacity: prefersReducedMotion ? 1 : (celebrate ? 0 : 1) }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
          >
            {streak}
          </motion.span>
          {isFrozen && (
            <span className="flex items-center gap-0.5 text-xs text-blue-400">
              <Shield className="h-3 w-3" />
              Protected
            </span>
          )}
          {isAtRisk && !isFrozen && (
            <span className="text-xs text-warning">At risk!</span>
          )}
          {!isFrozen && !isAtRisk && longestStreak !== undefined && longestStreak > streak && (
            <span className="text-xs text-muted-foreground">
              Best: {longestStreak}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Large streak display for profile/stats
 */
export function StreakFlameLarge({
  streak,
  longestStreak,
  isFrozen = false,
  isAtRisk = false,
  className,
}: {
  streak: number;
  longestStreak: number;
  isFrozen?: boolean;
  isAtRisk?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <div className="flex items-center gap-4">
        <motion.div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full",
            isFrozen 
              ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
              : isAtRisk
              ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20"
              : "bg-gradient-to-br from-orange-500/20 to-amber-500/20"
          )}
          variants={streakFlame}
          animate="idle"
        >
          <div className="relative">
            <Flame
              className={cn(
                "h-12 w-12",
                isFrozen ? "text-blue-400" : isAtRisk ? "text-amber-400" : "text-orange-500"
              )}
              fill="currentColor"
              strokeWidth={0}
            />
            {isFrozen && (
              <Snowflake className="absolute -top-1 -right-1 h-5 w-5 text-blue-300" />
            )}
            {isAtRisk && !isFrozen && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warning animate-ping" />
            )}
          </div>
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            {isFrozen && (
              <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                <Shield className="h-3 w-3" />
                Protected
              </span>
            )}
            {isAtRisk && !isFrozen && (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">
                ⚠️ At risk
              </span>
            )}
          </div>
          <motion.p
            className="text-4xl font-bold text-foreground"
            key={streak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {streak}
          </motion.p>
          <p className="text-xs text-muted-foreground">
            {streak === 1 ? "day" : "days"} in a row
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Best</p>
          <p className="text-2xl font-bold text-accent">{longestStreak}</p>
        </div>
      </div>

      {/* Status messages */}
      {isFrozen && (
        <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
          <p className="text-sm font-medium text-blue-400">
            ❄️ Your streak is protected! Practice tomorrow to keep it going.
          </p>
        </div>
      )}

      {isAtRisk && !isFrozen && (
        <div className="mt-4 rounded-lg bg-warning/10 p-3">
          <p className="text-sm font-medium text-warning">
            ⚠️ Your streak is at risk! Practice now to save it.
          </p>
        </div>
      )}

      {/* Milestone messages */}
      {!isFrozen && !isAtRisk && streak > 0 && (
        <div className="mt-4 rounded-lg bg-accent/10 p-3">
          <p className="text-sm font-medium text-foreground">
            {streak >= 100 && "🎉 Legendary streak! You're unstoppable!"}
            {streak >= 30 && streak < 100 && "🔥 You're on fire! Keep it up!"}
            {streak >= 7 && streak < 30 && "💪 One week streak! Amazing dedication!"}
            {streak > 0 && streak < 7 && `Keep going! ${7 - streak} more ${7 - streak === 1 ? "day" : "days"} to reach 1 week!`}
          </p>
        </div>
      )}

      {!isFrozen && !isAtRisk && streak === 0 && (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-sm text-muted-foreground">
            Start practicing today to build your streak!
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact streak counter for headers/nav
 */
export function StreakFlameCompact({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1">
      <Flame
        className="h-4 w-4 text-warning"
        fill={streak > 0 ? "currentColor" : "none"}
        strokeWidth={streak > 0 ? 0 : 2}
      />
      <span className="text-sm font-bold text-foreground">{streak}</span>
    </div>
  );
}
