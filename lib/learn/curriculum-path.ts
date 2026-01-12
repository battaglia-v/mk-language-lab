/**
 * Database-driven Curriculum Path Generator
 *
 * Replaces hardcoded starter-path.ts and a2-path.ts with dynamic
 * curriculum from the CurriculumLesson database.
 */

import prisma from '@/lib/prisma';
import type { LessonPath, LessonNode, LessonNodeStatus } from './lesson-path-types';

/**
 * Alphabet lesson node - prepended to A1 path
 * Completion is tracked via localStorage (mkll:alphabet-progress)
 * Status is set to 'available' here and updated client-side based on localStorage
 */
const ALPHABET_NODE: LessonNode = {
  id: 'alphabet',
  type: 'lesson',
  title: 'The Alphabet',
  titleMk: 'Азбуката',
  description: 'Learn the Cyrillic alphabet and basic pronunciation',
  status: 'available', // Will be updated client-side based on localStorage
  xpReward: 20,
  href: '/learn/lessons/alphabet',
  contentId: 'alphabet',
};

/**
 * Journey ID to path configuration mapping
 */
const JOURNEY_CONFIG: Record<string, { title: string; description: string }> = {
  'ukim-a1': {
    title: 'A1 Beginner',
    description: 'Build core basics: alphabet, greetings, the verb "to be", numbers, and gender.',
  },
  'ukim-a2': {
    title: 'A2 Elementary',
    description: 'Everyday topics like shopping, directions, food and drink, and past tense basics.',
  },
  'ukim-b1': {
    title: 'B1 Intermediate',
    description: 'Strengthen fluency with future tense, modals, aspect, and complex sentences.',
  },
};

/**
 * Generate a LessonPath from database curriculum
 *
 * @param journeyId - The journey ID (ukim-a1, ukim-a2, ukim-b1)
 * @param userId - Optional user ID to fetch completion status
 * @returns LessonPath with nodes from database
 */
export async function getCurriculumPath(
  journeyId: string,
  userId?: string
): Promise<LessonPath> {
  // Fetch all modules and lessons for this journey
  const modules = await prisma.module.findMany({
    where: { journeyId },
    orderBy: { orderIndex: 'asc' },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          orderIndex: true,
        },
      },
    },
  });

  // Fetch user's completed lessons if userId provided
  const completedLessonIds = new Set<string>();
  if (userId) {
    const userProgress = await prisma.userLessonProgress.findMany({
      where: {
        userId,
        status: 'completed',
        lesson: {
          module: {
            journeyId,
          },
        },
      },
      select: {
        lessonId: true,
      },
    });
    userProgress.forEach((p) => completedLessonIds.add(p.lessonId));
  }

  // Flatten lessons from all modules into a single ordered list
  const allLessons = modules.flatMap((module) => module.lessons);

  // Find the first incomplete lesson index
  const firstIncompleteIndex = allLessons.findIndex(
    (lesson) => !completedLessonIds.has(lesson.id)
  );
  const nextIndex = firstIncompleteIndex === -1 ? allLessons.length : firstIncompleteIndex;

  // Transform to LessonNodes
  const nodes: LessonNode[] = allLessons.map((lesson, index) => {
    const isCompleted = completedLessonIds.has(lesson.id);

    // Determine status
    let status: LessonNodeStatus;
    if (isCompleted) {
      status = 'completed';
    } else if (index === nextIndex) {
      status = 'available';
    } else if (index > nextIndex) {
      status = 'locked';
    } else {
      // Lessons before the first incomplete should also be available
      status = 'available';
    }

    // Generate description from summary or content snippet
    const description = lesson.summary
      || (lesson.content ? lesson.content.slice(0, 100).trim() + '...' : undefined);

    return {
      id: lesson.id,
      type: 'lesson' as const,
      title: lesson.title,
      titleMk: lesson.title, // Content is already in Macedonian
      description,
      status,
      xpReward: 20,
      href: `/lesson/${lesson.id}`,
      contentId: lesson.id,
    };
  });

  const config = JOURNEY_CONFIG[journeyId] || {
    title: journeyId,
    description: '',
  };

  // For A1, prepend alphabet lesson as the first node
  // Alphabet completion is tracked client-side via localStorage
  // The status will be updated in LearnPageClient based on localStorage
  if (journeyId === 'ukim-a1') {
    nodes.unshift({ ...ALPHABET_NODE });
    return {
      id: `curriculum-${journeyId}`,
      title: config.title,
      description: config.description,
      nodes,
      completedCount: completedLessonIds.size, // Alphabet completion added client-side
      totalCount: allLessons.length + 1, // +1 for alphabet
    };
  }

  return {
    id: `curriculum-${journeyId}`,
    title: config.title,
    description: config.description,
    nodes,
    completedCount: completedLessonIds.size,
    totalCount: allLessons.length,
  };
}

/**
 * Get curriculum path for A1 level
 */
export async function getA1Path(userId?: string): Promise<LessonPath> {
  return getCurriculumPath('ukim-a1', userId);
}

/**
 * Get curriculum path for A2 level
 */
export async function getA2Path(userId?: string): Promise<LessonPath> {
  return getCurriculumPath('ukim-a2', userId);
}

/**
 * Get curriculum path for B1 level
 */
export async function getB1Path(userId?: string): Promise<LessonPath> {
  return getCurriculumPath('ukim-b1', userId);
}
