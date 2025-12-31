'use client';

import { useRouter } from 'next/navigation';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Difficulty, SESSION_XP, DIFFICULTY_COLORS } from './types';

type Props = {
  onSelect: (difficulty: Difficulty) => void;
  title?: string;
};

export function DifficultyPicker({ onSelect, title = 'Word Sprint' }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-0"
          onClick={() => router.back()}
        >
          <X className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold">{title}</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Difficulty</h2>
            <p className="text-muted-foreground">Select your challenge level</p>
          </div>
          <div className="space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                variant="outline"
                className={cn(
                  'w-full h-16 justify-between rounded-xl text-left',
                  DIFFICULTY_COLORS[d].border,
                  `hover:${DIFFICULTY_COLORS[d].bg}`
                )}
                onClick={() => onSelect(d)}
              >
                <div>
                  <span className="font-semibold capitalize">{d}</span>
                  <span className="block text-xs text-muted-foreground">
                    {d === 'easy' && 'Multiple choice'}
                    {d === 'medium' && 'Word bank'}
                    {d === 'hard' && 'Type answer'}
                  </span>
                </div>
                <span className={cn('text-sm font-bold flex items-center gap-1', DIFFICULTY_COLORS[d].text)}>
                  <Zap className="h-3 w-3" />
                  +{SESSION_XP[d]} XP
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
