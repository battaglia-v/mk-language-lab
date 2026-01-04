import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * A2 Momentum Path - Building on basics
 * Focus: daily routines, past tense, ordering food, directions, dialogues
 */
export const a2PathNodes: LessonNode[] = [
  {
    id: 'a2-1',
    type: 'lesson',
    title: 'Daily Routines',
    titleMk: 'Дневни рутини',
    description: 'Talk about your day and regular habits',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=activities-hobbies-v1&difficulty=intermediate',
    contentId: 'daily-routines',
  },
  {
    id: 'a2-2',
    type: 'lesson',
    title: 'Past Tense Intro',
    titleMk: 'Минато време',
    description: 'Introduce past tense patterns and usage',
    status: 'locked',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'past-tense-intro',
  },
  {
    id: 'a2-3',
    type: 'lesson',
    title: 'Ordering Food',
    titleMk: 'Нарачување храна',
    description: 'Order meals and handle restaurant basics',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=intermediate',
    contentId: 'ordering-food',
  },
  {
    id: 'a2-4',
    type: 'lesson',
    title: 'Directions',
    titleMk: 'Насоки',
    description: 'Ask for and give directions clearly',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=intermediate',
    contentId: 'directions',
  },
  {
    id: 'a2-5',
    type: 'story',
    title: 'Short Dialogues',
    titleMk: 'Кратки дијалози',
    description: 'Read and practice short everyday conversations',
    status: 'locked',
    xpReward: 25,
    href: '/reader/samples/cafe-conversation',
    contentId: 'short-dialogues',
  },
];

/**
 * Create an A2 path with progress applied
 *
 * Note: All lessons are now unlocked by default for free navigation.
 * Users can start anywhere - no forced sequential locking.
 */
export function createA2Path(completedNodeIds: string[] = []): LessonPath {
  const nodes = a2PathNodes.map((node, index) => {
    const isCompleted = completedNodeIds.includes(node.id);
    const firstIncompleteIndex = a2PathNodes.findIndex(
      (n) => !completedNodeIds.includes(n.id)
    );

    let status = node.status;
    if (isCompleted) {
      status = 'completed';
    } else if (index === firstIncompleteIndex) {
      // Highlight next recommended lesson
      status = 'available';
    } else {
      // All other lessons are available (not locked)
      status = 'available';
    }

    return { ...node, status };
  });

  return {
    id: 'a2-path',
    title: 'A2 Momentum',
    description: 'Build confidence with routines, tenses, and real situations',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: a2PathNodes.length,
  };
}
