'use client';

import { useRouter } from 'next/navigation';
import { CurriculumLessonWrapper } from './CurriculumLessonWrapper';
import LessonContent from './LessonContent';
import type { LessonResults, Step } from '@/lib/lesson-runner/types';

interface LessonPageContentProps {
  lesson: {
    id: string;
    title: string;
    summary?: string | null;
    estimatedMinutes?: number;
    difficultyLevel?: string;
    vocabularyItems: unknown[];
    grammarNotes: unknown[];
    exercises: unknown[];
    module: { title: string };
  };
  userProgress: { progress?: number } | null;
  nextLesson: { id: string; title: string } | null;
  userId?: string;
  useLessonRunner?: boolean;
  lessonRunnerConfig?: string | null;
}

export function LessonPageContent({
  lesson,
  userProgress,
  nextLesson,
  userId,
  useLessonRunner,
  lessonRunnerConfig,
}: LessonPageContentProps) {
  const router = useRouter();

  // If using LessonRunner system
  if (useLessonRunner && lessonRunnerConfig) {
    let steps: Step[] = [];
    try {
      steps = JSON.parse(lessonRunnerConfig) as Step[];
    } catch (error) {
      console.error('Failed to parse lessonRunnerConfig:', error);
      // Fall back to old system
      return (
        <LessonContent
          lesson={lesson}
          userProgress={userProgress}
          nextLesson={nextLesson}
          userId={userId}
        />
      );
    }

    const handleComplete = async (results: LessonResults) => {
      if (!userId) {
        // Navigate without saving
        if (nextLesson) {
          router.push(`/lesson/${nextLesson.id}`);
        } else {
          router.push('/');
        }
        return;
      }

      // Save lesson progress
      try {
        await fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson.id,
            status: 'completed',
            progress: 100,
            timeSpent: Math.ceil(results.answers.length * 2), // Rough estimate
          }),
        });

        // Navigate to next lesson or home
        if (nextLesson) {
          router.push(`/lesson/${nextLesson.id}`);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    };

    const handleExit = () => {
      router.back();
    };

    const difficulty = (lesson.difficultyLevel as 'beginner' | 'intermediate' | 'advanced') || 'beginner';

    return (
      <CurriculumLessonWrapper
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        difficulty={difficulty}
        steps={steps}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );
  }

  // Fall back to old lesson system
  return (
    <LessonContent
      lesson={lesson}
      userProgress={userProgress}
      nextLesson={nextLesson}
      userId={userId}
    />
  );
}
