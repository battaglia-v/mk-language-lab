'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  type: string; // 'multiple_choice' | 'fill_blank' | 'translation'
  question: string;
  options: string; // Pipe-separated for multiple choice
  correctAnswer: string;
  explanation: string | null;
}

interface ExerciseSectionProps {
  exercises: Exercise[];
}

export default function ExerciseSection({ exercises }: ExerciseSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleCheck = (exerciseId: string, correctAnswer: string) => {
    const userAnswer = answers[exerciseId] || '';
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    setResults(prev => ({ ...prev, [exerciseId]: isCorrect }));
    setChecked(prev => ({ ...prev, [exerciseId]: true }));
  };

  const renderMultipleChoice = (exercise: Exercise) => {
    const options = exercise.options.split('|').map(opt => opt.trim());
    const userAnswer = answers[exercise.id];
    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = userAnswer === optionLetter;
          const isCorrectOption = exercise.correctAnswer === optionLetter;

          return (
            <Button
              key={index}
              variant="choice"
              onClick={() => !isChecked && setAnswers(prev => ({ ...prev, [exercise.id]: optionLetter }))}
              disabled={isChecked}
              data-selected={isSelected && !isChecked}
              data-correct={isChecked && isCorrectOption}
              data-incorrect={isChecked && isSelected && !isCorrect}
              className="w-full h-auto min-h-14 p-4 justify-start text-left"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="font-semibold text-muted-foreground label-nowrap">{optionLetter}.</span>
                <span className="flex-1">{option}</span>
                {isChecked && isCorrectOption && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                )}
                {isChecked && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 ml-auto flex-shrink-0" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

  const renderFillBlank = (exercise: Exercise) => {
    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];

    return (
      <div className="space-y-3">
        <Input
          value={answers[exercise.id] || ''}
          onChange={(e) => setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
          disabled={isChecked}
          placeholder="Type your answer..."
          className={cn(
            isChecked && isCorrect && 'border-green-500 bg-green-500/5',
            isChecked && !isCorrect && 'border-red-500 bg-red-500/5'
          )}
        />
        {isChecked && (
          <p className={cn(
            'text-sm flex items-center gap-2',
            isCorrect ? 'text-green-600' : 'text-red-600'
          )}>
            {isCorrect ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Correct!
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Incorrect. The correct answer is: <strong>{exercise.correctAnswer}</strong>
              </>
            )}
          </p>
        )}
      </div>
    );
  };

  const renderTranslation = (exercise: Exercise) => {
    const isChecked = checked[exercise.id];
    const isCorrect = results[exercise.id];

    return (
      <div className="space-y-3">
        <Input
          value={answers[exercise.id] || ''}
          onChange={(e) => setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
          disabled={isChecked}
          placeholder="Type your translation..."
          className={cn(
            isChecked && isCorrect && 'border-green-500 bg-green-500/5',
            isChecked && !isCorrect && 'border-red-500 bg-red-500/5'
          )}
        />
        {isChecked && (
          <p className={cn(
            'text-sm flex items-center gap-2',
            isCorrect ? 'text-green-600' : 'text-red-600'
          )}>
            {isCorrect ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Excellent translation!
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Suggested translation: <strong>{exercise.correctAnswer}</strong>
              </>
            )}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="p-6 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="exercise-header flex-1 min-w-0">
              <div className="exercise-meta">
                <span className="metadata-item">
                  <span className="label-nowrap">Exercise {index + 1}</span>
                </span>
                <span className="card-meta-separator">·</span>
                <span className="mode-badge bg-primary/10 text-primary">
                  {exercise.type.replace('_', ' ')}
                </span>
              </div>
              <p className="exercise-title mt-1">{exercise.question}</p>
            </div>
          </div>

          <div className="mt-4">
            {exercise.type === 'multiple_choice' && renderMultipleChoice(exercise)}
            {exercise.type === 'fill_blank' && renderFillBlank(exercise)}
            {exercise.type === 'translation' && renderTranslation(exercise)}
          </div>

          {!checked[exercise.id] && (
            <Button
              onClick={() => handleCheck(exercise.id, exercise.correctAnswer)}
              disabled={!answers[exercise.id]}
              className="mt-4"
            >
              Check Answer
            </Button>
          )}

          {checked[exercise.id] && exercise.explanation && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong>Explanation:</strong> {exercise.explanation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
