'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface MarkCompleteButtonProps {
  sampleId: string;
  locale: string;
  /** Day number for the 30-day challenge (e.g., "1" for Day 1) */
  dayNumber?: string;
}

export function MarkCompleteButton({ sampleId, locale: _locale, dayNumber: _dayNumber }: MarkCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isJustCompleted, setIsJustCompleted] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  // Auto-reset celebration animation after 500ms
  useEffect(() => {
    if (isJustCompleted) {
      const timer = setTimeout(() => setIsJustCompleted(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isJustCompleted]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/practice/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctCount: 1, // Award XP for completing the reading
          totalCount: 1,
          type: 'reader',
          sampleId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record completion');
      }

      const data = await response.json();

      setIsComplete(true);
      setIsJustCompleted(true); // Trigger celebration animation
      addToast({
        title: 'Lesson Complete!',
        description: `+${data.xpEarned} XP earned. Next lesson unlocked!`,
        type: 'success',
      });

      // Refresh the page to update any server-rendered progress
      router.refresh();
    } catch (error) {
      console.error('Failed to mark complete:', error);
      addToast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [sampleId, router, addToast]);

  if (isComplete) {
    return (
      <Button
        size="lg"
        className={cn(
          'w-full gap-2 bg-emerald-600 hover:bg-emerald-600 text-white transition-transform',
          !prefersReducedMotion && isJustCompleted && 'animate-bounce-correct'
        )}
        disabled
        data-testid="reader-mark-complete"
      >
        <CheckCircle
          className={cn(
            'h-5 w-5',
            !prefersReducedMotion && isJustCompleted && 'animate-in zoom-in-75 duration-200'
          )}
        />
        Completed!
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full gap-2 bg-gradient-to-r from-primary to-amber-500 text-slate-900 font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.01] transition-all"
      onClick={handleComplete}
      disabled={isLoading}
      data-testid="reader-mark-complete"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Check className="h-5 w-5" />
          Mark as Complete
        </>
      )}
    </Button>
  );
}
