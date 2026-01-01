'use client';

import { useState } from 'react';
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedLength, setSelectedLength] = useState<SessionLength>(10);

  const handleStart = () => {
    if (selectedDifficulty) {
      onSelect(selectedDifficulty, selectedLength);
    }
  };

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
                  variant={selectedDifficulty === d ? 'default' : 'outline'}
                  className={cn(
                    'w-full h-16 justify-between rounded-xl text-left transition-all',
                    selectedDifficulty !== d && DIFFICULTY_COLORS[d].border,
                    selectedDifficulty !== d && `hover:${DIFFICULTY_COLORS[d].bg}`
                  )}
                  onClick={() => setSelectedDifficulty(d)}
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
                  variant={selectedLength === length ? 'default' : 'outline'}
                  className="h-16 rounded-xl flex-col"
                  onClick={() => setSelectedLength(length)}
                >
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-lg font-bold">{length}</span>
                  <span className="text-xs opacity-70">
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
              className="w-full min-h-[52px] rounded-xl"
              onClick={handleStart}
              disabled={!selectedDifficulty}
            >
              Start session
            </Button>
            {!selectedDifficulty && (
              <p className="text-center text-sm text-muted-foreground">
                Choose difficulty and length to start.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
