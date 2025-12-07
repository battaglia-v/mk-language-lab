"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { progressFill } from "@/lib/animations";

interface XPBarProps {
  /**
   * Current XP amount
   */
  currentXP: number;
  /**
   * XP required for next level
   */
  xpForNextLevel: number;
  /**
   * Current level number
   */
  level: number;
  /**
   * Level name/title
   */
  levelName?: string;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Show numeric XP values
   */
  showValues?: boolean;
  /**
   * Compact mode (smaller, no labels)
   */
  compact?: boolean;
}

// Level thresholds (from plan)
const LEVEL_CONFIG = {
  beginner: { min: 0, max: 100, name: "Beginner" },
  elementary: { min: 100, max: 300, name: "Elementary" },
  intermediate: { min: 300, max: 700, name: "Intermediate" },
  advanced: { min: 700, max: 1500, name: "Advanced" },
  fluent: { min: 1500, max: Infinity, name: "Fluent" },
};

export function getLevelInfo(totalXP: number) {
  if (totalXP < 100) {
    return {
      level: 1,
      name: "Beginner",
      currentXP: totalXP,
      xpForNextLevel: 100,
      progress: (totalXP / 100) * 100,
    };
  } else if (totalXP < 300) {
    return {
      level: 2,
      name: "Elementary",
      currentXP: totalXP - 100,
      xpForNextLevel: 200,
      progress: ((totalXP - 100) / 200) * 100,
    };
  } else if (totalXP < 700) {
    return {
      level: 3,
      name: "Intermediate",
      currentXP: totalXP - 300,
      xpForNextLevel: 400,
      progress: ((totalXP - 300) / 400) * 100,
    };
  } else if (totalXP < 1500) {
    return {
      level: 4,
      name: "Advanced",
      currentXP: totalXP - 700,
      xpForNextLevel: 800,
      progress: ((totalXP - 700) / 800) * 100,
    };
  } else {
    return {
      level: 5,
      name: "Fluent",
      currentXP: totalXP - 1500,
      xpForNextLevel: 1000,
      progress: Math.min(((totalXP - 1500) / 1000) * 100, 100),
    };
  }
}

export function XPBar({
  currentXP,
  xpForNextLevel,
  level,
  levelName,
  className,
  showValues = true,
  compact = false,
}: XPBarProps) {
  // Safety check to prevent NaN/Infinity
  const progress = xpForNextLevel > 0
    ? (currentXP / xpForNextLevel) * 100
    : 0;
  const clampedProgress = Math.min(
    Math.max(
      isNaN(progress) || !isFinite(progress) ? 0 : progress,
      0
    ),
    100
  );

  // Animated XP counter
  const motionXP = useMotionValue(0);
  const displayXP = useTransform(motionXP, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionXP, currentXP, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [currentXP, motionXP]);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm font-bold text-accent">Lv {level}</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-2 to-accent-3"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px var(--mk-accent-2)",
            }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {currentXP}/{xpForNextLevel}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Level info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {level}
          </motion.span>
          {levelName && (
            <span className="text-sm font-semibold text-foreground">{levelName}</span>
          )}
        </div>
        {showValues && (
          <motion.span className="text-sm font-medium text-muted-foreground">
            {Math.round(motionXP.get())} / {xpForNextLevel} XP
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-2 via-accent to-accent-3"
          variants={progressFill}
          initial="initial"
          animate="animate"
          custom={clampedProgress}
          style={{
            transformOrigin: "left",
            boxShadow: "0 0 12px var(--mk-accent-2)",
          }}
        />

        {/* Shine effect */}
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Large XPBar for profile/achievements page
 */
export function XPBarLarge({ totalXP, className }: { totalXP: number; className?: string }) {
  const levelInfo = getLevelInfo(totalXP);

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Level {levelInfo.level}</h3>
          <p className="text-sm text-muted-foreground">{levelInfo.name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-accent">{totalXP}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
      </div>

      <XPBar
        currentXP={levelInfo.currentXP}
        xpForNextLevel={levelInfo.xpForNextLevel}
        level={levelInfo.level}
        showValues={true}
      />

      {levelInfo.level < 5 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {levelInfo.xpForNextLevel - levelInfo.currentXP} XP until {LEVEL_CONFIG[Object.keys(LEVEL_CONFIG)[levelInfo.level] as keyof typeof LEVEL_CONFIG]?.name}
        </p>
      )}
    </div>
  );
}
