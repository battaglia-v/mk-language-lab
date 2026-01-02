'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface MarkCompleteButtonProps {
  sampleId: string;
  locale: string;
  /** Day number for the 30-day challenge (e.g., "1" for Day 1) */
  dayNumber?: string;
}

export function MarkCompleteButton({ sampleId, locale: _locale, dayNumber: _dayNumber }: MarkCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

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
        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-600 text-white"
        disabled
      >
        <CheckCircle className="h-5 w-5" />
        Completed!
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full gap-2"
      onClick={handleComplete}
      disabled={isLoading}
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
