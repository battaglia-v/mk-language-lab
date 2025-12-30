'use client';

import { LessonRunner } from '@/components/lesson/LessonRunner';
import { lessonToSteps } from '@/lib/lesson-runner/adapters/exercise-adapter';
import type { GrammarLesson } from '@/lib/grammar-engine';
import type { LessonResults } from '@/lib/lesson-runner/types';

interface GrammarLessonWrapperProps {
  lesson: GrammarLesson;
  onComplete: (results: LessonResults) => void;
  onExit: () => void;
  locale: 'en' | 'mk';
}

export function GrammarLessonWrapper({
  lesson,
  onComplete,
  onExit,
  locale,
}: GrammarLessonWrapperProps) {
  const steps = lessonToSteps(lesson, locale);

  return (
    <LessonRunner
      steps={steps}
      onComplete={onComplete}
      lessonId={lesson.id}
      lessonTitle={locale === 'en' ? lesson.titleEn : lesson.titleMk}
      difficulty={lesson.difficulty}
      onExit={onExit}
      autoSave={false}
    />
  );
}
