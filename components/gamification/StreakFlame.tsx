"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { streakFlame } from "@/lib/animations";

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
  className,
}: StreakFlameProps) {
  const config = SIZE_CONFIG[size];

  // Flame color based on streak milestones
  const getFlameColor = () => {
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

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-full",
          config.container,
          streak > 0 && "bg-accent/10"
        )}
        variants={streakFlame}
        animate={celebrate ? "celebrate" : streak > 0 ? "idle" : "initial"}
        style={{
          scale: getFlameScale(),
        }}
      >
        <Flame
          className={cn(config.icon, getFlameColor())}
          fill={streak > 0 ? "currentColor" : "none"}
          strokeWidth={streak > 0 ? 0 : 2}
        />
      </motion.div>

      {showNumber && (
        <div className="flex flex-col">
          <motion.span
            className={cn("font-bold text-foreground", config.text)}
            key={streak} // Re-mount on streak change for animation
            initial={{ scale: celebrate ? 1.5 : 1, opacity: celebrate ? 0 : 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {streak}
          </motion.span>
          {longestStreak !== undefined && longestStreak > streak && (
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
  className,
}: {
  streak: number;
  longestStreak: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <div className="flex items-center gap-4">
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20"
          variants={streakFlame}
          animate="idle"
        >
          <Flame
            className="h-12 w-12 text-orange-500"
            fill="currentColor"
            strokeWidth={0}
          />
        </motion.div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Current Streak</p>
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

      {/* Milestone messages */}
      {streak > 0 && (
        <div className="mt-4 rounded-lg bg-accent/10 p-3">
          <p className="text-sm font-medium text-foreground">
            {streak >= 100 && "🎉 Legendary streak! You're unstoppable!"}
            {streak >= 30 && streak < 100 && "🔥 You're on fire! Keep it up!"}
            {streak >= 7 && streak < 30 && "💪 One week streak! Amazing dedication!"}
            {streak > 0 && streak < 7 && `Keep going! ${7 - streak} more ${7 - streak === 1 ? "day" : "days"} to reach 1 week!`}
          </p>
        </div>
      )}

      {streak === 0 && (
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
