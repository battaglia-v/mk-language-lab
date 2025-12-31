'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

type Props = {
  xpEarned: number;
  dailyGoal: number;
  streak: number;
  onClose: () => void;
  className?: string;
};

export function GoalCelebration({ xpEarned, dailyGoal, streak, onClose, className }: Props) {
  const [visible, setVisible] = useState(false);

  const triggerConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#f6d83b', '#f59e0b', '#10b981', '#6366f1'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  useEffect(() => {
    // Slight delay for mount animation
    const t = setTimeout(() => {
      setVisible(true);
      triggerConfetti();
    }, 50);
    return () => clearTimeout(t);
  }, [triggerConfetti]);

  return (
    <div className={cn(
      'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
      visible ? 'opacity-100' : 'opacity-0',
      className
    )}>
      <div className={cn(
        'mx-4 max-w-sm rounded-3xl border border-primary/30 bg-gradient-to-br from-background via-background to-primary/10 p-6 text-center shadow-2xl transition-transform duration-300',
        visible ? 'scale-100' : 'scale-90'
      )}>
        {/* Celebration Icon */}
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20">
          <Trophy className="h-10 w-10 text-primary" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-bold text-foreground">Daily Goal Complete!</h2>
        <p className="mb-4 text-muted-foreground">You crushed it today!</p>

        {/* Stats */}
        <div className="mb-6 flex justify-center gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Star className="h-5 w-5" />
              {xpEarned}
            </div>
            <p className="text-xs text-muted-foreground">XP Today</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-400">
              <Flame className="h-5 w-5" />
              {streak}
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* CTA */}
        <Button onClick={onClose} className="w-full min-h-[48px] rounded-xl">
          Keep Going!
        </Button>
      </div>
    </div>
  );
}
