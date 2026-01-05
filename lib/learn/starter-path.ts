import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * A1 Foundations Path - 6 units covering basics
 * Based on CEFR A1 level curriculum
 */
export const starterPathNodes: LessonNode[] = [
  // Unit 1: Alphabet
  {
    id: 'node-1',
    type: 'lesson',
    title: 'The Alphabet',
    titleMk: 'Азбуката',
    description: 'Learn the Cyrillic alphabet and basic pronunciation',
    status: 'available',
    xpReward: 20,
    href: '/learn/lessons/alphabet',
    contentId: 'alphabet',
  },
  // Unit 2: Pronunciation Basics (TEXT ONLY - audio coming soon)
  {
    id: 'node-2',
    type: 'lesson',
    title: 'Pronunciation Basics',
    titleMk: 'Основи на изговор',
    description: 'Learn sounds, stress patterns, and key letter pairs (text guide)',
    status: 'available',
    xpReward: 15,
    href: '/practice/grammar',
    contentId: 'pronunciation-basics',
  },
  // Unit 3: Greetings
  {
    id: 'node-3',
    type: 'lesson',
    title: 'Greetings',
    titleMk: 'Поздрави',
    description: 'Say hello, introduce yourself, and respond politely',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=beginner',
    contentId: 'greetings',
  },
  // Unit 4: Simple Sentences
  {
    id: 'node-4',
    type: 'lesson',
    title: 'Simple Sentences',
    titleMk: 'Едноставни реченици',
    description: 'Build short sentences with basic structure',
    status: 'locked',
    xpReward: 20,
    href: '/practice/session?deck=curated&difficulty=beginner',
    contentId: 'simple-sentences',
  },
  // Unit 5: Numbers & Time
  {
    id: 'node-5',
    type: 'lesson',
    title: 'Numbers & Time',
    titleMk: 'Броеви и време',
    description: 'Count, tell time, and talk about dates',
    status: 'locked',
    xpReward: 20,
    href: '/practice/session?deck=numbers-time-v1&difficulty=all',
    contentId: 'numbers-time-v1',
  },
  // Unit 6: Everyday Verbs
  {
    id: 'node-6',
    type: 'lesson',
    title: 'Everyday Verbs',
    titleMk: 'Секојдневни глаголи',
    description: 'Talk about daily actions with common verbs',
    status: 'locked',
    xpReward: 20,
    href: '/practice/session?deck=activities-hobbies-v1&difficulty=beginner',
    contentId: 'activities-hobbies-v1',
  },
];

/**
 * Create a starter path with progress applied
 *
 * Note: Lessons are sequential - only the next lesson is available,
 * and future lessons stay locked until prior ones are completed.
 */
export function createStarterPath(completedNodeIds: string[] = []): LessonPath {
  const firstIncompleteIndex = starterPathNodes.findIndex(
    (node) => !completedNodeIds.includes(node.id)
  );
  const nextIndex = firstIncompleteIndex === -1 ? starterPathNodes.length : firstIncompleteIndex;

  const nodes = starterPathNodes.map((node, index) => {
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
    id: 'starter-path',
    title: 'A1 Foundations',
    description: 'Master the basics of Macedonian',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: starterPathNodes.length,
  };
}
