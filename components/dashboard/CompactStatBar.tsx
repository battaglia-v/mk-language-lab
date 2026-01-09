'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { StreakFlameCompact } from '@/components/gamification/StreakFlame';
import { HeartCounter } from '@/components/gamification/HeartCounter';
import { XPBar } from '@/components/gamification/XPBar';
import { cn } from '@/lib/utils';

interface CompactStatBarProps {
  /** Current streak in days */
  streak: number;
  /** Current hearts (lives) */
  hearts: number;
  /** Maximum hearts */
  maxHearts?: number;
  /** Current XP in level */
  currentXP: number;
  /** XP needed for next level */
  xpForNextLevel: number;
  /** Current level number */
  level: number;
  /** Level display name */
  levelName: string;
  /** Additional class name */
  className?: string;
}

/**
 * CompactStatBar - Header widget showing key stats at a glance
 * 
 * Displays streak, hearts, and XP progress in a compact horizontal bar.
 * Used at the top of the Learn/Dashboard page.
 */
export function CompactStatBar({
  streak,
  hearts,
  maxHearts = 5,
  currentXP,
  xpForNextLevel,
  level,
  levelName,
  className,
}: CompactStatBarProps) {
  const locale = useLocale();
  
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl",
        "border border-white/10 bg-white/5 p-4",
        "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {/* Left: Streak + Hearts */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/profile?tab=streak`} className="transition-transform hover:scale-105">
          <StreakFlameCompact streak={streak} />
        </Link>
        <Link href={`/${locale}/profile?tab=hearts`} className="transition-transform hover:scale-105">
          <HeartCounter hearts={hearts} maxHearts={maxHearts} variant="compact" size="sm" />
        </Link>
      </div>

      {/* Right: XP Progress */}
      <div className="flex-1 px-2">
        <XPBar
          currentXP={currentXP}
          xpForNextLevel={xpForNextLevel}
          level={level}
          levelName={levelName}
          compact
        />
      </div>
    </header>
  );
}
