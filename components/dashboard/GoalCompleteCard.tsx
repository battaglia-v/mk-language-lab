'use client';

import { motion } from 'framer-motion';
import { PartyPopper, Share2, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface GoalCompleteCardProps {
  /** XP earned today */
  xpEarned: number;
  /** Daily goal XP */
  xpGoal: number;
  /** Current streak days */
  streakDays: number;
  /** Callback for share button */
  onShare?: () => void;
  /** Callback for continue practicing */
  onContinue?: () => void;
  /** Translations */
  t: {
    doneForToday: string;
    streakProtected: string;
    comeBackTomorrow: string;
    shareStreak: string;
    keepPracticing: string;
    xpEarned: string;
  };
  /** Additional class name */
  className?: string;
}

/**
 * GoalCompleteCard - Celebration card when daily goal is achieved
 * 
 * Shows congratulations message, XP earned, streak status,
 * and options to share or continue practicing.
 */
export function GoalCompleteCard({
  xpEarned,
  xpGoal: _xpGoal,
  streakDays,
  onShare,
  onContinue,
  t,
  className,
}: GoalCompleteCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Card className={cn(
      "overflow-hidden border-2 border-success/40",
      "bg-gradient-to-br from-success/15 via-background to-success/10",
      "shadow-[0_15px_50px_rgba(34,197,94,0.2)]",
      className
    )}>
      <CardContent className="relative p-6">
        {/* Confetti decoration (static) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-8 h-2 w-2 rounded-full bg-yellow-400 opacity-60" />
          <div className="absolute top-8 right-12 h-3 w-3 rounded-full bg-pink-400 opacity-50" />
          <div className="absolute bottom-12 left-16 h-2 w-2 rounded-full bg-blue-400 opacity-60" />
          <div className="absolute bottom-8 right-8 h-2.5 w-2.5 rounded-full bg-purple-400 opacity-50" />
        </div>

        <div className="relative flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20"
          >
            <PartyPopper className="h-10 w-10 text-success" />
          </motion.div>

          {/* Main message */}
          <div className="space-y-2">
            <motion.h2
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-success"
            >
              🎉 {t.doneForToday}
            </motion.h2>
            <p className="text-muted-foreground">
              {t.comeBackTomorrow}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-success">
                <Sparkles className="h-5 w-5" />
                <span className="text-2xl font-bold">{xpEarned}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t.xpEarned.replace('{xp}', '')}
              </span>
            </div>
            <div className="h-10 w-px bg-border/60" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Trophy className="h-5 w-5" />
                <span className="text-2xl font-bold">{streakDays}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t.streakProtected}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onShare && (
              <Button
                onClick={onShare}
                variant="outline"
                className="min-h-[48px] rounded-full border-success/40 px-6 text-success hover:bg-success/10"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t.shareStreak}
              </Button>
            )}
            {onContinue && (
              <Button
                onClick={onContinue}
                className="min-h-[48px] rounded-full bg-success/20 px-6 text-success hover:bg-success/30"
              >
                {t.keepPracticing}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
