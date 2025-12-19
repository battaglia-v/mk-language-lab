'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LessonRunner } from '@/components/lesson/LessonRunner';
import { generateQuizFromSample, getQuizDifficulty } from '@/lib/reader/quiz-generator';
import { Sparkles } from 'lucide-react';
import type { ReaderSample } from '@/lib/reader-samples';
import type { LessonResults } from '@/lib/lesson-runner/types';

export function ReaderQuizButton({ sample }: { sample: ReaderSample }) {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    const steps = generateQuizFromSample(sample, { maxQuestions: 8 });

    return (
      <LessonRunner
        steps={steps}
        onComplete={(results: LessonResults) => {
          setShowQuiz(false);
          // TODO: Save results to user progress
        }}
        lessonTitle={sample.title_en}
        difficulty={getQuizDifficulty(sample.difficulty)}
        onExit={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <Button
      size="lg"
      onClick={() => setShowQuiz(true)}
      className="w-full gap-2"
    >
      <Sparkles className="h-5 w-5" />
      Start Vocabulary Quiz
    </Button>
  );
}
