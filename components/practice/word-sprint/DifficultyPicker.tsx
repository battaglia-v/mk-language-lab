'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Difficulty, type SessionLength, DIFFICULTY_COLORS, SESSION_LENGTH_OPTIONS, BASE_XP_PER_QUESTION } from './types';

type Props = {
  onSelect: (difficulty: Difficulty, length: SessionLength) => void;
  title?: string;
};

export function DifficultyPicker({ onSelect, title = 'Word Sprint' }: Props) {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedLength, setSelectedLength] = useState<SessionLength>(10);

  const startHref = `?difficulty=${selectedDifficulty ?? 'easy'}&length=${selectedLength}`;

  const handleStart = (event?: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    if (!selectedDifficulty) return;
    onSelect(selectedDifficulty, selectedLength);
    router.replace(startHref, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3 safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="h-11 rounded-full px-3 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
          data-testid="word-sprint-picker-close"
        >
          <X className="h-4 w-4" />
          <span className="text-xs font-semibold">Back</span>
        </Button>
        <span className="text-lg font-semibold">{title}</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Difficulty Selection */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Word Sprint</h2>
              <p className="text-muted-foreground">Pick your challenge.</p>
            </div>
            <div className="space-y-3">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={selectedDifficulty === d ? 'default' : 'outline'}
                  className={cn(
                    'w-full h-16 justify-between rounded-xl text-left transition-all',
                    selectedDifficulty !== d && DIFFICULTY_COLORS[d].border,
                    selectedDifficulty !== d && `hover:${DIFFICULTY_COLORS[d].bg}`
                  )}
                  onClick={() => setSelectedDifficulty(d)}
                  data-testid={`word-sprint-picker-difficulty-${d}`}
                >
                  <div>
                    <span className="font-semibold capitalize">{d}</span>
                    <span className="block text-xs opacity-70">
                      {d === 'easy' && 'Two choices'}
                      {d === 'medium' && 'Word bank'}
                      {d === 'hard' && 'Type the answer'}
                    </span>
                  </div>
                  <span className={cn('text-sm font-bold flex items-center gap-1', selectedDifficulty === d ? 'opacity-100' : DIFFICULTY_COLORS[d].text)}>
                    <Zap className="h-3 w-3" />
                    +{BASE_XP_PER_QUESTION[d]} XP/q
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Session Length Selection */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Session Length</h3>
              <p className="text-sm text-muted-foreground">How many questions?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SESSION_LENGTH_OPTIONS.map((length) => (
                <Button
                  key={length}
                  type="button"
                  variant={selectedLength === length ? 'default' : 'outline'}
                  className={cn(
                    "h-20 rounded-xl flex flex-col items-center justify-center gap-0.5 px-2",
                    selectedLength === length && "text-black"
                  )}
                  onClick={() => setSelectedLength(length)}
                  data-testid={`word-sprint-picker-length-${length}`}
                >
                  <span className="text-2xl font-bold leading-none">{length}</span>
                  <span className="text-xs opacity-70 leading-tight">
                    {length === 10 ? 'Quick' : 'Standard'}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full min-h-[52px] rounded-xl text-black gap-2"
              disabled={!selectedDifficulty}
              data-testid="word-sprint-picker-start"
              asChild
            >
              <Link href={startHref} onClick={handleStart}>
                <Zap className="h-5 w-5" />
                Start session
              </Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Adjust difficulty or length before starting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
