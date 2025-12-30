'use client';

import { LessonRunner } from '@/components/lesson/LessonRunner';
import type { LessonResults } from '@/lib/lesson-runner/types';
import type { Step } from '@/lib/lesson-runner/types';

interface CurriculumLessonWrapperProps {
  lessonId: string;
  lessonTitle: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  steps: Step[];
  onComplete: (results: LessonResults) => void;
  onExit: () => void;
}

export function CurriculumLessonWrapper({
  lessonId,
  lessonTitle,
  difficulty,
  steps,
  onComplete,
  onExit,
}: CurriculumLessonWrapperProps) {
  return (
    <LessonRunner
      steps={steps}
      onComplete={onComplete}
      lessonId={lessonId}
      lessonTitle={lessonTitle}
      difficulty={difficulty}
      onExit={onExit}
      autoSave={true}
    />
  );
}
