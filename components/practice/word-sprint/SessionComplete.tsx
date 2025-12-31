'use client';

import { Plus, ArrowUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Difficulty, SESSION_XP, DIFFICULTY_COLORS } from './types';

type Props = {
  difficulty: Difficulty;
  correctCount: number;
  totalAnswered: number;
  onAddMore: () => void;
  onHarder: () => void;
  onFinish: () => void;
};

export function SessionComplete({
  difficulty,
  correctCount,
  totalAnswered,
  onAddMore,
  onHarder,
  onFinish,
}: Props) {
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const xp = SESSION_XP[difficulty];
  const canGoHarder = difficulty !== 'hard';
  const nextDifficulty: Difficulty | null = difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-0"
          onClick={onFinish}
        >
          <X className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold">Session Complete</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-6xl font-bold text-primary">+{xp} XP</div>
          <div className="text-xl text-muted-foreground">{accuracy}% accuracy</div>
          <p className="text-sm text-muted-foreground">
            {correctCount} / {totalAnswered} correct
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={onAddMore} size="lg" className="min-h-[52px] rounded-xl">
              <Plus className="h-5 w-5 mr-2" />
              +5 More
            </Button>
            {canGoHarder && nextDifficulty && (
              <Button
                onClick={onHarder}
                variant="outline"
                size="lg"
                className={`min-h-[52px] rounded-xl ${DIFFICULTY_COLORS[nextDifficulty].border}`}
              >
                <ArrowUp className="h-5 w-5 mr-2" />
                Try {nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onFinish}
              size="lg"
              className="min-h-[52px] rounded-xl"
            >
              Finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
