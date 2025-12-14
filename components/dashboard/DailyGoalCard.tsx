'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ProgressRing } from '@/components/gamification/ProgressRing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyGoalCardProps {
  /** Current XP earned today */
  todayXP: number;
  /** Daily XP goal */
  dailyGoalXP: number;
  /** Callback when user clicks the primary CTA */
  onStartLesson?: () => void;
  /** Translations */
  t: {
    dailyGoal: string;
    description: string;
    keepGoing: string;
    xpRemaining: string;
    goalComplete: string;
    goalCompleteMessage: string;
    continueLesson: string;
    keepPracticing: string;
  };
}

/**
 * DailyGoalCard - Main dashboard widget showing daily progress
 * 
 * Displays a progress ring with XP earned vs goal, motivational
 * messaging, and a primary CTA to continue learning.
 */
export function DailyGoalCard({
  todayXP,
  dailyGoalXP,
  onStartLesson,
  t,
}: DailyGoalCardProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Calculate progress (clamped to 0-100)
  const progress = dailyGoalXP > 0 
    ? Math.min((todayXP / dailyGoalXP) * 100, 100) 
    : 0;
  
  const isComplete = progress >= 100;
  const xpRemaining = Math.max(0, dailyGoalXP - todayXP);

  return (
    <Card className={cn(
      "border-2 transition-all duration-300",
      isComplete 
        ? "border-success/40 bg-gradient-to-br from-success/10 via-background to-success/5" 
        : "border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isComplete ? (
            <>
              <PartyPopper className="h-5 w-5 text-success" />
              {t.goalComplete}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-primary" />
              {t.dailyGoal}
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isComplete ? t.goalCompleteMessage : t.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Progress Ring */}
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ProgressRing 
            progress={progress} 
            size={140} 
            strokeWidth={12}
            progressColor={isComplete ? 'var(--success)' : 'var(--mk-accent)'}
          >
            <div className="flex flex-col items-center">
              <span className={cn(
                "text-3xl font-bold",
                isComplete ? "text-success" : "text-foreground"
              )}>
                {todayXP}
              </span>
              <span className="text-xs text-muted-foreground">
                / {dailyGoalXP} XP
              </span>
            </div>
          </ProgressRing>
        </motion.div>

        {/* Message + CTA */}
        <div className="flex flex-1 flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          {isComplete ? (
            <>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-success">
                  🎉 {t.goalComplete}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.goalCompleteMessage}
                </p>
              </div>
              <Button
                onClick={onStartLesson}
                variant="outline"
                className="min-h-[48px] rounded-full border-success/40 px-6 text-success hover:bg-success/10"
              >
                {t.keepPracticing}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {t.keepGoing}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.xpRemaining.replace('{xp}', String(xpRemaining))}
                </p>
              </div>
              <Button
                onClick={onStartLesson}
                size="lg"
                className="min-h-[52px] rounded-full bg-gradient-to-r from-primary to-secondary px-8 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                {t.continueLesson}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
