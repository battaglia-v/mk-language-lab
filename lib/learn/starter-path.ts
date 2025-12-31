import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * Starter lesson path for new learners
 * MVP: 10 nodes covering basics
 */
export const starterPathNodes: LessonNode[] = [
  {
    id: 'node-1',
    type: 'lesson',
    title: 'Greetings',
    titleMk: 'Поздрави',
    description: 'Learn basic Macedonian greetings',
    status: 'available',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=beginner',
    contentId: 'greetings',
  },
  {
    id: 'node-2',
    type: 'lesson',
    title: 'The Alphabet',
    titleMk: 'Азбуката',
    description: 'Master the Cyrillic alphabet',
    status: 'locked',
    xpReward: 20,
    href: '/practice/pronunciation',
    contentId: 'alphabet',
  },
  {
    id: 'node-3',
    type: 'review',
    title: 'Quick Review',
    description: 'Practice what you learned',
    status: 'locked',
    xpReward: 10,
    href: '/practice/word-sprint',
  },
  {
    id: 'node-4',
    type: 'lesson',
    title: 'Numbers 1-10',
    titleMk: 'Броеви 1-10',
    description: 'Count from one to ten',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=beginner',
    contentId: 'numbers',
  },
  {
    id: 'node-5',
    type: 'story',
    title: 'First Words',
    titleMk: 'Први зборови',
    description: 'A simple reading exercise',
    status: 'locked',
    xpReward: 25,
    href: '/reader',
    contentId: 'first-words',
  },
  {
    id: 'node-6',
    type: 'checkpoint',
    title: 'Checkpoint 1',
    description: 'Test your progress',
    status: 'locked',
    xpReward: 30,
    href: '/practice/word-sprint',
  },
  {
    id: 'node-7',
    type: 'lesson',
    title: 'Family',
    titleMk: 'Семејство',
    description: 'Learn family vocabulary',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=intermediate',
    contentId: 'family',
  },
  {
    id: 'node-8',
    type: 'lesson',
    title: 'The Definite Article',
    titleMk: 'Определен член',
    description: 'Add -от, -та, -то to nouns',
    status: 'locked',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'definite-article-basics',
  },
  {
    id: 'node-9',
    type: 'review',
    title: 'Grammar Review',
    description: 'Practice the definite article',
    status: 'locked',
    xpReward: 10,
    href: '/practice/grammar',
  },
  {
    id: 'node-10',
    type: 'story',
    title: 'At the Café',
    titleMk: 'Во кафуле',
    description: 'Order coffee like a local',
    status: 'locked',
    xpReward: 25,
    href: '/reader',
    contentId: 'cafe',
  },
];

/**
 * Create a starter path with progress applied
 */
export function createStarterPath(completedNodeIds: string[] = []): LessonPath {
  // Apply completion status
  const nodes = starterPathNodes.map((node, index) => {
    const isCompleted = completedNodeIds.includes(node.id);

    // Find the first incomplete node to mark as available
    const firstIncompleteIndex = starterPathNodes.findIndex(
      (n) => !completedNodeIds.includes(n.id)
    );

    let status = node.status;
    if (isCompleted) {
      status = 'completed';
    } else if (index === firstIncompleteIndex) {
      status = 'available';
    } else if (index < firstIncompleteIndex) {
      status = 'completed';
    } else {
      status = 'locked';
    }

    return { ...node, status };
  });

  return {
    id: 'starter-path',
    title: 'Basics',
    description: 'Start your Macedonian journey',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: starterPathNodes.length,
  };
}
