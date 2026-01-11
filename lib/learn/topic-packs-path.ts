import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * Topic Packs - Focused vocabulary modules
 * Self-contained packs for specific topics
 */
export const topicPackNodes: LessonNode[] = [
  // Pack 1: Home & Living
  {
    id: 'topic-home',
    type: 'lesson',
    title: 'Home & Household',
    titleMk: 'Дома',
    description: '30 phrases about rooms and household items',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=household-v1&difficulty=all',
    contentId: 'household-v1',
  },
  // Pack 2: Weather
  {
    id: 'topic-weather',
    type: 'lesson',
    title: 'Weather & Seasons',
    titleMk: 'Време',
    description: '30 weather expressions and seasons',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=weather-seasons-v1&difficulty=all',
    contentId: 'weather-seasons-v1',
  },
  // Pack 3: Health
  {
    id: 'topic-health',
    type: 'lesson',
    title: 'Health & Body',
    titleMk: 'Здравје',
    description: '30 health-related phrases',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=body-health-v1&difficulty=all',
    contentId: 'body-health-v1',
  },
  // Pack 4: Hobbies
  {
    id: 'topic-hobbies',
    type: 'lesson',
    title: 'Activities & Hobbies',
    titleMk: 'Хобија',
    description: '30 phrases about free time',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=activities-hobbies-v1&difficulty=all',
    contentId: 'activities-hobbies-v1',
  },
  // Pack 5: Clothing
  {
    id: 'topic-clothing',
    type: 'lesson',
    title: 'Clothing & Appearance',
    titleMk: 'Облека',
    description: '40 phrases about clothes and looks',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=clothing-appearance-v1&difficulty=all',
    contentId: 'clothing-appearance-v1',
  },
  // Pack 6: Technology
  {
    id: 'topic-tech',
    type: 'lesson',
    title: 'Technology',
    titleMk: 'Технологија',
    description: '30 digital communication phrases',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=technology-v1&difficulty=all',
    contentId: 'technology-v1',
  },
  // Pack 7: Numbers & Time
  {
    id: 'topic-numbers',
    type: 'lesson',
    title: 'Numbers & Time',
    titleMk: 'Броеви и време',
    description: '50 phrases for counting and telling time',
    status: 'available',
    xpReward: 25,
    href: '/practice/session?deck=numbers-time-v1&difficulty=all',
    contentId: 'numbers-time-v1',
  },
  // Pack 8: Celebrations
  {
    id: 'topic-celebrations',
    type: 'lesson',
    title: 'Celebrations',
    titleMk: 'Празници',
    description: '14 holiday and tradition phrases',
    status: 'available',
    xpReward: 15,
    href: '/practice/session?deck=celebrations-v1&difficulty=all',
    contentId: 'celebrations-v1',
  },
  // Pack 9: Shopping
  {
    id: 'topic-shopping',
    type: 'lesson',
    title: 'Shopping',
    titleMk: 'Купување',
    description: '25 phrases for prices, sizes, and payments',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=shopping-v1&difficulty=all',
    contentId: 'shopping-v1',
  },
  // Pack 10: Food & Drink
  {
    id: 'topic-food',
    type: 'lesson',
    title: 'Food & Drink',
    titleMk: 'Храна и пијалаци',
    description: '25 phrases for ordering and dining',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=food-drink-v1&difficulty=all',
    contentId: 'food-drink-v1',
  },
  // Pack 11: Directions
  {
    id: 'topic-directions',
    type: 'lesson',
    title: 'Directions',
    titleMk: 'Насоки',
    description: '20 phrases for asking and giving directions',
    status: 'available',
    xpReward: 20,
    href: '/practice/session?deck=directions-v1&difficulty=all',
    contentId: 'directions-v1',
  },
];

export function createTopicPacksPath(completedNodeIds: string[] = []): LessonPath {
  const nodes = topicPackNodes.map((node) => {
    const isCompleted = completedNodeIds.includes(node.id);
    return {
      ...node,
      status: isCompleted ? 'completed' as const : 'available' as const,
    };
  });

  return {
    id: 'topic-packs',
    title: 'Topic Packs',
    description: 'Focused vocabulary by theme',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: topicPackNodes.length,
  };
}
