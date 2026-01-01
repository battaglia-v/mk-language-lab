import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * A1 Foundations Path - 10 units covering basics
 * Based on CEFR A1 level curriculum
 */
export const starterPathNodes: LessonNode[] = [
  // Unit 1: Alphabet & Pronunciation
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
  // Unit 2: Greetings & Introductions
  {
    id: 'node-2',
    type: 'lesson',
    title: 'Greetings',
    titleMk: 'Поздрави',
    description: 'Essential greetings and introductions',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=all',
    contentId: 'greetings',
  },
  // Unit 3: Numbers, Days & Months
  {
    id: 'node-3',
    type: 'lesson',
    title: 'Numbers & Time',
    titleMk: 'Броеви и време',
    description: 'Count, tell time, and name days/months',
    status: 'locked',
    xpReward: 20,
    href: '/practice/session?deck=numbers-time-v1&difficulty=all',
    contentId: 'numbers-time-v1',
  },
  {
    id: 'node-4',
    type: 'review',
    title: 'Quick Review',
    description: 'Practice alphabet, greetings, and numbers',
    status: 'locked',
    xpReward: 10,
    href: '/practice/word-sprint',
  },
  // Unit 4: Food & Café Survival
  {
    id: 'node-5',
    type: 'lesson',
    title: 'At the Café',
    titleMk: 'Во кафуле',
    description: 'Order food and drinks like a local',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=all',
    contentId: 'cafe',
  },
  // Unit 5: Home & Household
  {
    id: 'node-6',
    type: 'lesson',
    title: 'At Home',
    titleMk: 'Дома',
    description: 'Household items and rooms',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=household-v1&difficulty=all',
    contentId: 'household-v1',
  },
  // Checkpoint 1
  {
    id: 'node-7',
    type: 'checkpoint',
    title: 'Checkpoint 1',
    description: 'Test your progress on Units 1-5',
    status: 'locked',
    xpReward: 30,
    href: '/practice/word-sprint',
  },
  // Unit 6: Weather & Seasons
  {
    id: 'node-8',
    type: 'lesson',
    title: 'Weather',
    titleMk: 'Време',
    description: 'Weather expressions and seasons',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=weather-seasons-v1&difficulty=all',
    contentId: 'weather-seasons-v1',
  },
  // Unit 7: Health & Body
  {
    id: 'node-9',
    type: 'lesson',
    title: 'Health & Body',
    titleMk: 'Здравје и тело',
    description: 'Body parts and health phrases',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=body-health-v1&difficulty=all',
    contentId: 'body-health-v1',
  },
  // Unit 8: Activities & Hobbies
  {
    id: 'node-10',
    type: 'lesson',
    title: 'Hobbies',
    titleMk: 'Хобија',
    description: 'Free time activities and interests',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=activities-hobbies-v1&difficulty=all',
    contentId: 'activities-hobbies-v1',
  },
  {
    id: 'node-11',
    type: 'review',
    title: 'Review Session',
    description: 'Practice weather, health, and hobbies',
    status: 'locked',
    xpReward: 10,
    href: '/practice/word-sprint',
  },
  // Unit 9: Clothing & Appearance
  {
    id: 'node-12',
    type: 'lesson',
    title: 'Clothing',
    titleMk: 'Облека',
    description: 'Describe clothing and appearances',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=clothing-appearance-v1&difficulty=all',
    contentId: 'clothing-appearance-v1',
  },
  // Unit 10: Final Story & Assessment
  {
    id: 'node-13',
    type: 'story',
    title: 'A Day in Skopje',
    titleMk: 'Ден во Скопје',
    description: 'Read a short story using all vocabulary',
    status: 'locked',
    xpReward: 25,
    href: '/reader',
    contentId: 'day-in-skopje',
  },
  {
    id: 'node-14',
    type: 'checkpoint',
    title: 'A1 Final',
    description: 'Complete the A1 Foundations assessment',
    status: 'locked',
    xpReward: 50,
    href: '/practice/word-sprint',
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
    title: 'A1 Foundations',
    description: 'Master the basics of Macedonian',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: starterPathNodes.length,
  };
}
