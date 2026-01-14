'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CurriculumLessonWrapper } from './CurriculumLessonWrapper';
import LessonContent from './LessonContent';
import LessonPageContentV2 from './LessonPageContentV2';
import { useToast } from '@/components/ui/use-toast';
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
    dialogues?: unknown[]; // New: dialogues support
    module: { title: string };
  };
  userProgress: { progress?: number } | null;
  nextLesson: { id: string; title: string } | null;
  userId?: string;
  useLessonRunner?: boolean;
  lessonRunnerConfig?: string | null;
  /** Use the new guided step-by-step lesson flow (V2) */
  useNewLessonFlow?: boolean;
}

export function LessonPageContent({
  lesson,
  userProgress,
  nextLesson,
  userId,
  useLessonRunner,
  lessonRunnerConfig,
  useNewLessonFlow = true, // Default to new system
}: LessonPageContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const { addToast } = useToast();

  // If using new guided lesson flow (V2)
  if (useNewLessonFlow && !useLessonRunner) {
    return (
      <LessonPageContentV2
        lesson={lesson as Parameters<typeof LessonPageContentV2>[0]['lesson']}
        userProgress={userProgress}
        nextLesson={nextLesson}
        userId={userId}
      />
    );
  }

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
      // Navigate helper - always navigate regardless of save success
      const navigateNext = () => {
        if (nextLesson) {
          router.push(`/${locale}/lesson/${nextLesson.id}`);
        } else {
          router.push(`/${locale}/learn`);
        }
      };

      if (!userId) {
        // Navigate without saving (guest user)
        navigateNext();
        return;
      }

      // Save lesson progress (fire and forget - don't block navigation)
      try {
        const response = await fetch('/api/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson.id,
            status: 'completed',
            progress: 100,
            timeSpent: Math.ceil(results.answers.length * 2), // Rough estimate
          }),
        });

        if (!response.ok) {
          throw new Error('Save failed');
        }
      } catch (error) {
        console.error('Failed to save progress:', error);
        // Show subtle toast - don't block the user
        addToast({
          title: 'Progress not saved',
          description: 'Your progress may not have been saved. Please check your connection.',
          type: 'warning',
          duration: 4000,
        });
      }

      // Always navigate - graceful degradation
      navigateNext();
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
