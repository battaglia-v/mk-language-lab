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
    title: 'Past Aorist Tense',
    titleMk: 'Аористно минато',
    description: 'Completed past actions with aorist forms',
    status: 'locked',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'past-aorist-tense',
  },
  {
    id: 'a2-3',
    type: 'lesson',
    title: 'Food & Drink',
    titleMk: 'Храна и пијалаци',
    description: 'Order meals and drinks with polite phrases',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=food-drink-v1&difficulty=all',
    contentId: 'food-drink-v1',
  },
  {
    id: 'a2-4',
    type: 'lesson',
    title: 'Directions',
    titleMk: 'Насоки',
    description: 'Ask for and give directions clearly',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=directions-v1&difficulty=all',
    contentId: 'directions-v1',
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
  {
    id: 'a2-6',
    type: 'lesson',
    title: 'Shopping',
    titleMk: 'Купување',
    description: 'Prices, sizes, and payment basics',
    status: 'locked',
    xpReward: 20,
    href: '/practice/session?deck=shopping-v1&difficulty=all',
    contentId: 'shopping-v1',
  },
];

/**
 * Create an A2 path with progress applied
 *
 * Note: Lessons are sequential - only the next lesson is available,
 * and future lessons stay locked until prior ones are completed.
 */
export function createA2Path(completedNodeIds: string[] = []): LessonPath {
  const firstIncompleteIndex = a2PathNodes.findIndex(
    (node) => !completedNodeIds.includes(node.id)
  );
  const nextIndex = firstIncompleteIndex === -1 ? a2PathNodes.length : firstIncompleteIndex;

  const nodes = a2PathNodes.map((node, index) => {
    const isCompleted = completedNodeIds.includes(node.id);

    let status = node.status;
    if (isCompleted) {
      status = 'completed';
    } else if (index === nextIndex) {
      status = 'available';
    } else if (index > nextIndex) {
      status = 'locked';
    } else {
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
