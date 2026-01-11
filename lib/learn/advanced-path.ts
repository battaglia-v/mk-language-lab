import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * Advanced Conversations Track (B1-C1)
 *
 * For heritage learners and advanced students who want to:
 * - Express complex opinions and arguments
 * - Navigate real-world conversations with nuance
 * - Understand colloquial expressions and idioms
 */
export const advancedPathNodes: LessonNode[] = [
  // B1 Grammar Foundations
  {
    id: 'b1-1',
    type: 'lesson',
    title: 'Future Tense (ќе)',
    titleMk: 'Идно време (ќе)',
    description: 'Build confident future statements and negation',
    status: 'available',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'future-tense-basics',
  },
  {
    id: 'b1-2',
    type: 'lesson',
    title: 'Modals (може/мора)',
    titleMk: 'Модални глаголи',
    description: 'Permission, ability, and obligation',
    status: 'locked',
    xpReward: 20,
    href: '/practice/grammar',
    contentId: 'modals-mozhe-mora',
  },
  {
    id: 'b1-3',
    type: 'lesson',
    title: 'Verb Aspect',
    titleMk: 'Глаголски вид',
    description: 'Imperfective vs perfective in context',
    status: 'locked',
    xpReward: 25,
    href: '/practice/grammar',
    contentId: 'aspect-verb-pairs',
  },
  {
    id: 'b1-4',
    type: 'lesson',
    title: 'Complex Sentences',
    titleMk: 'Сложени реченици',
    description: 'Link clauses with ако/бидејќи/дека',
    status: 'locked',
    xpReward: 25,
    href: '/practice/grammar',
    contentId: 'complex-sentences',
  },
  // Unit 1: Opinions & Arguments
  {
    id: 'adv-1',
    type: 'lesson',
    title: 'Expressing Opinions',
    titleMk: 'Изразување мислење',
    description: 'I think, I believe, in my opinion',
    status: 'available',
    xpReward: 20,
    href: '/practice/word-sprint',
    contentId: 'opinions-basic',
  },
  {
    id: 'adv-2',
    type: 'lesson',
    title: 'Agreeing & Disagreeing',
    titleMk: 'Согласување и несогласување',
    description: 'Polite ways to agree or disagree',
    status: 'locked',
    xpReward: 20,
    href: '/practice/word-sprint',
    contentId: 'agree-disagree',
  },
  {
    id: 'adv-3',
    type: 'lesson',
    title: 'Connecting Ideas',
    titleMk: 'Поврзување идеи',
    description: 'However, although, therefore',
    status: 'locked',
    xpReward: 25,
    href: '/practice/word-sprint',
    contentId: 'connectors',
  },
  {
    id: 'adv-4',
    type: 'review',
    title: 'Opinion Review',
    description: 'Practice expressing your views',
    status: 'locked',
    xpReward: 15,
    href: '/practice/word-sprint',
  },

  // Unit 2: Storytelling
  {
    id: 'adv-5',
    type: 'lesson',
    title: 'Past Tense Stories',
    titleMk: 'Раскази во минато време',
    description: 'Once upon a time...',
    status: 'locked',
    xpReward: 25,
    href: '/practice/grammar',
    contentId: 'past-tense',
  },
  {
    id: 'adv-6',
    type: 'lesson',
    title: 'Sequencing Events',
    titleMk: 'Редоследно раскажување',
    description: 'First, then, after that, finally',
    status: 'locked',
    xpReward: 20,
    href: '/practice/word-sprint',
    contentId: 'sequencing',
  },
  {
    id: 'adv-7',
    type: 'story',
    title: 'A Day in Skopje',
    titleMk: 'Ден во Скопје',
    description: 'Read and understand a travel story',
    status: 'locked',
    xpReward: 30,
    href: '/reader/samples/day-in-skopje',
    contentId: 'day-in-skopje',
  },
  {
    id: 'adv-8',
    type: 'checkpoint',
    title: 'Storytelling Check',
    description: 'Test your narrative skills',
    status: 'locked',
    xpReward: 35,
    href: '/practice',
  },

  // Unit 3: Work & Professional
  {
    id: 'adv-9',
    type: 'lesson',
    title: 'At Work',
    titleMk: 'На работа',
    description: 'Office vocabulary and phrases',
    status: 'locked',
    xpReward: 20,
    href: '/practice/word-sprint',
    contentId: 'work-vocab',
  },
  {
    id: 'adv-10',
    type: 'lesson',
    title: 'Making Appointments',
    titleMk: 'Закажување состаноци',
    description: 'Schedule meetings and calls',
    status: 'locked',
    xpReward: 20,
    href: '/practice/word-sprint',
    contentId: 'appointments',
  },
  {
    id: 'adv-11',
    type: 'lesson',
    title: 'Formal vs Informal',
    titleMk: 'Формално и неформално',
    description: 'When to use Вие vs ти',
    status: 'locked',
    xpReward: 25,
    href: '/practice/grammar',
    contentId: 'formal-informal',
  },
  {
    id: 'adv-12',
    type: 'review',
    title: 'Professional Review',
    description: 'Practice workplace language',
    status: 'locked',
    xpReward: 15,
    href: '/practice/word-sprint',
  },

  // Unit 4: Travel Problems
  {
    id: 'adv-13',
    type: 'lesson',
    title: 'Travel Issues',
    titleMk: 'Патнички проблеми',
    description: 'Handle delays and cancellations',
    status: 'locked',
    xpReward: 25,
    href: '/practice/word-sprint',
    contentId: 'travel-problems',
  },
  {
    id: 'adv-14',
    type: 'lesson',
    title: 'Making Complaints',
    titleMk: 'Поплаки',
    description: 'Complain politely and effectively',
    status: 'locked',
    xpReward: 25,
    href: '/practice/word-sprint',
    contentId: 'complaints',
  },
  {
    id: 'adv-15',
    type: 'lesson',
    title: 'Resolving Problems',
    titleMk: 'Решавање проблеми',
    description: 'Ask for help and solutions',
    status: 'locked',
    xpReward: 25,
    href: '/practice/word-sprint',
    contentId: 'problem-solving',
  },

  // Unit 5: Health & Emergencies
  {
    id: 'adv-16',
    type: 'lesson',
    title: 'At the Doctor',
    titleMk: 'Кај доктор',
    description: 'Describe symptoms and conditions',
    status: 'locked',
    xpReward: 25,
    href: '/practice/word-sprint',
    contentId: 'doctor-visit',
  },
  {
    id: 'adv-17',
    type: 'lesson',
    title: 'Pharmacy Visit',
    titleMk: 'Во аптека',
    description: 'Ask for medicine and advice',
    status: 'locked',
    xpReward: 20,
    href: '/practice/word-sprint',
    contentId: 'pharmacy',
  },
  {
    id: 'adv-18',
    type: 'checkpoint',
    title: 'Practical Check',
    description: 'Handle real-world situations',
    status: 'locked',
    xpReward: 40,
    href: '/practice',
  },

  // Unit 6: Idioms & Expressions
  {
    id: 'adv-19',
    type: 'lesson',
    title: 'Common Idioms',
    titleMk: 'Идиоми',
    description: 'Macedonian expressions',
    status: 'locked',
    xpReward: 30,
    href: '/practice/word-sprint',
    contentId: 'idioms',
  },
  {
    id: 'adv-20',
    type: 'lesson',
    title: 'Colloquial Speech',
    titleMk: 'Разговорен јазик',
    description: 'Casual phrases and slang',
    status: 'locked',
    xpReward: 30,
    href: '/practice/word-sprint',
    contentId: 'colloquial',
  },
  {
    id: 'adv-21',
    type: 'story',
    title: 'Street Conversations',
    titleMk: 'Разговори на улица',
    description: 'Real-world casual dialogue',
    status: 'locked',
    xpReward: 35,
    href: '/reader',
    contentId: 'street-conversations',
  },
  {
    id: 'adv-22',
    type: 'checkpoint',
    title: 'Advanced Final',
    description: 'Complete assessment',
    status: 'locked',
    xpReward: 50,
    href: '/practice',
  },
];

/**
 * Create an advanced path with progress applied
 */
export function createAdvancedPath(completedNodeIds: string[] = []): LessonPath {
  const nodes = advancedPathNodes.map((node, index) => {
    const isCompleted = completedNodeIds.includes(node.id);
    const firstIncompleteIndex = advancedPathNodes.findIndex(
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
    id: 'advanced-path',
    title: 'Advanced Conversations',
    description: 'B1-C1 level conversations for fluency',
    nodes,
    completedCount: completedNodeIds.filter(id => id.startsWith('adv-')).length,
    totalCount: advancedPathNodes.length,
  };
}

/**
 * Units in the advanced track
 */
export const advancedUnits = [
  {
    id: 'unit-1',
    title: 'Opinions & Arguments',
    titleMk: 'Мислења и аргументи',
    nodeIds: ['adv-1', 'adv-2', 'adv-3', 'adv-4'],
    level: 'B1',
  },
  {
    id: 'unit-2',
    title: 'Storytelling',
    titleMk: 'Раскажување',
    nodeIds: ['adv-5', 'adv-6', 'adv-7', 'adv-8'],
    level: 'B1',
  },
  {
    id: 'unit-3',
    title: 'Work & Professional',
    titleMk: 'Работа и професија',
    nodeIds: ['adv-9', 'adv-10', 'adv-11', 'adv-12'],
    level: 'B1-B2',
  },
  {
    id: 'unit-4',
    title: 'Travel Problems',
    titleMk: 'Патнички проблеми',
    nodeIds: ['adv-13', 'adv-14', 'adv-15'],
    level: 'B2',
  },
  {
    id: 'unit-5',
    title: 'Health & Emergencies',
    titleMk: 'Здравје и итни случаи',
    nodeIds: ['adv-16', 'adv-17', 'adv-18'],
    level: 'B2',
  },
  {
    id: 'unit-6',
    title: 'Idioms & Expressions',
    titleMk: 'Идиоми и изрази',
    nodeIds: ['adv-19', 'adv-20', 'adv-21', 'adv-22'],
    level: 'B2-C1',
  },
];
