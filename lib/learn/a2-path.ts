import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * A2 Momentum Path - Building on basics
 * Focus: past/future tenses, directions, shopping, travel
 */
export const a2PathNodes: LessonNode[] = [
  // Unit 1: Past Tense Basics
  {
    id: 'a2-1',
    type: 'lesson',
    title: 'What I Did Yesterday',
    titleMk: 'Што направив вчера',
    description: 'Introduction to past tense',
    status: 'locked',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'past-tense-intro',
  },
  {
    id: 'a2-2',
    type: 'lesson',
    title: 'Weekend Activities',
    titleMk: 'Викенд активности',
    description: 'Talking about past events',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=activities-hobbies-v1&difficulty=all',
    contentId: 'activities-hobbies-v1',
  },
  // Unit 2: Future Plans
  {
    id: 'a2-3',
    type: 'lesson',
    title: 'Future Plans',
    titleMk: 'Идни планови',
    description: 'Expressing future with ќе',
    status: 'locked',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'future-tense',
  },
  {
    id: 'a2-4',
    type: 'review',
    title: 'Tense Review',
    description: 'Practice past and future',
    status: 'locked',
    xpReward: 10,
    href: '/practice/word-sprint',
  },
  // Unit 3: Directions & Places
  {
    id: 'a2-5',
    type: 'lesson',
    title: 'Getting Around',
    titleMk: 'Движење низ градот',
    description: 'Asking for and giving directions',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=intermediate',
    contentId: 'directions',
  },
  {
    id: 'a2-6',
    type: 'checkpoint',
    title: 'Checkpoint A2.1',
    description: 'Test your progress',
    status: 'locked',
    xpReward: 30,
    href: '/practice/word-sprint',
  },
  // Unit 4: Shopping
  {
    id: 'a2-7',
    type: 'lesson',
    title: 'At the Market',
    titleMk: 'На пазар',
    description: 'Shopping vocabulary and phrases',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=intermediate',
    contentId: 'shopping',
  },
  // Unit 5: Travel
  {
    id: 'a2-8',
    type: 'lesson',
    title: 'Travel Plans',
    titleMk: 'Патување',
    description: 'Booking and travel logistics',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=curated&difficulty=intermediate',
    contentId: 'travel',
  },
  // Unit 6: Technology
  {
    id: 'a2-9',
    type: 'lesson',
    title: 'Technology',
    titleMk: 'Технологија',
    description: 'Digital communication phrases',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=technology-v1&difficulty=all',
    contentId: 'technology-v1',
  },
  // Unit 7: Celebrations
  {
    id: 'a2-10',
    type: 'lesson',
    title: 'Celebrations',
    titleMk: 'Празници',
    description: 'Macedonian holidays and traditions',
    status: 'locked',
    xpReward: 15,
    href: '/practice/session?deck=celebrations-v1&difficulty=all',
    contentId: 'celebrations-v1',
  },
  {
    id: 'a2-11',
    type: 'story',
    title: 'A Trip to Ohrid',
    titleMk: 'Патување во Охрид',
    description: 'Read about visiting Lake Ohrid',
    status: 'locked',
    xpReward: 25,
    href: '/reader',
    contentId: 'trip-to-ohrid',
  },
  {
    id: 'a2-12',
    type: 'checkpoint',
    title: 'A2 Final',
    description: 'Complete the A2 assessment',
    status: 'locked',
    xpReward: 50,
    href: '/practice/word-sprint',
  },
];

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
      status = 'available';
    } else if (index < firstIncompleteIndex) {
      status = 'completed';
    } else {
      status = 'locked';
    }

    return { ...node, status };
  });

  return {
    id: 'a2-path',
    title: 'A2 Momentum',
    description: 'Build on basics with tenses and travel',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: a2PathNodes.length,
  };
}
