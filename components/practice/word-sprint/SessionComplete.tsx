'use client';

import { Plus, ArrowUp, X, RotateCcw, Zap, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Difficulty, DIFFICULTY_COLORS } from './types';

type Props = {
  difficulty: Difficulty;
  correctCount: number;
  totalAnswered: number;
  totalXP: number;
  bestCombo: number;
  onAddMore: () => void;
  onHarder: () => void;
  onPlayAgain: () => void;
  onFinish: () => void;
};

export function SessionComplete({
  difficulty,
  correctCount,
  totalAnswered,
  totalXP,
  bestCombo,
  onAddMore,
  onHarder,
  onPlayAgain,
  onFinish,
}: Props) {
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
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
          data-testid="word-sprint-complete-close"
        >
          <X className="h-5 w-5" />
        </Button>
        <span className="text-lg font-semibold">Session Complete</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center space-y-8 max-w-sm w-full">
          {/* XP Display */}
          <div>
            <div className="text-6xl font-bold text-primary mb-2">+{totalXP} XP</div>
            <div className="text-sm text-muted-foreground">Total earned this session</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/40">
              <Target className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/40">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold">{bestCombo}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/40">
              <Zap className="h-5 w-5 text-emerald-500" />
              <div className="text-2xl font-bold">{correctCount}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {correctCount} / {totalAnswered} correct answers
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={onPlayAgain} size="lg" className="min-h-[52px] rounded-xl" data-testid="word-sprint-complete-play-again">
              <RotateCcw className="h-5 w-5 mr-2" />
              Play Again
            </Button>
            <Button onClick={onAddMore} variant="outline" size="lg" className="min-h-[52px] rounded-xl" data-testid="word-sprint-complete-add-more">
              <Plus className="h-5 w-5 mr-2" />
              +5 More
            </Button>
            {canGoHarder && nextDifficulty && (
              <Button
                onClick={onHarder}
                variant="outline"
                size="lg"
                className={`min-h-[52px] rounded-xl ${DIFFICULTY_COLORS[nextDifficulty].border}`}
                data-testid="word-sprint-complete-harder"
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
              data-testid="word-sprint-complete-back"
            >
              Back to Practice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
