'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  feedback: 'correct' | 'incorrect' | null;
  onSelect: (answer: string) => void;
  disabled?: boolean;
};

export function MultipleChoiceInput({
  options,
  correctAnswer,
  selectedAnswer,
  feedback,
  onSelect,
  disabled,
}: Props) {
  const labels = ['A', 'B', 'C', 'D'];

  // Limit to 2 choices for easy mode (A/B only)
  const displayOptions = options.slice(0, 2);

  return (
    <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
      {displayOptions.map((opt, i) => {
        const isSelected = selectedAnswer === opt;
        const isCorrectAnswer = opt === correctAnswer;

        return (
          <Button
            key={i}
            variant="outline"
            onClick={() => onSelect(opt)}
            disabled={disabled || !!feedback}
            className={cn(
              'min-h-[60px] justify-start rounded-xl text-left active:scale-[0.98] text-base',
              isSelected && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
              isSelected && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20 animate-shake',
              feedback && isCorrectAnswer && 'border-emerald-400 bg-emerald-500/15'
            )}
          >
            <span className="mr-3 text-lg font-bold text-muted-foreground">{labels[i]}.</span>
            <span className="flex-1">{opt}</span>
          </Button>
        );
      })}
    </div>
  );
}
