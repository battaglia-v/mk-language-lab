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

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt, i) => {
        const isSelected = selectedAnswer === opt;
        const isCorrectAnswer = opt === correctAnswer;

        return (
          <Button
            key={i}
            variant="outline"
            onClick={() => onSelect(opt)}
            disabled={disabled || !!feedback}
            className={cn(
              'min-h-[52px] justify-start rounded-xl text-left active:scale-[0.98]',
              isSelected && feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
              isSelected && feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20 animate-shake',
              feedback && isCorrectAnswer && 'border-emerald-400 bg-emerald-500/15'
            )}
          >
            <span className="mr-2 text-muted-foreground">{labels[i]}.</span>
            {opt}
          </Button>
        );
      })}
    </div>
  );
}
