import { LessonPath, LessonNode } from './lesson-path-types';

/**
 * 30-Day Reading Challenge Path
 * Based on "Малиот принц" (The Little Prince) bilingual readings
 * Each day includes: reading passage, vocabulary, grammar notes, audio
 */

function createDayNode(day: number, title: string, titleMk: string, description: string): LessonNode {
  const isReview = day % 5 === 0;
  return {
    id: `30day-${day}`,
    type: isReview ? 'checkpoint' : 'story',
    title: isReview ? `Day ${day}: Review` : `Day ${day}: ${title}`,
    titleMk: isReview ? `Ден ${day}: Преглед` : `Ден ${day}: ${titleMk}`,
    description,
    status: day === 1 ? 'available' : 'locked',
    xpReward: isReview ? 40 : 25,
    href: `/reader/samples/day${day.toString().padStart(2, '0')}-maliot-princ`,
    contentId: `day${day.toString().padStart(2, '0')}-maliot-princ`,
  };
}

export const challenge30DayNodes: LessonNode[] = [
  // Week 1: Introduction & The Narrator
  createDayNode(1, 'The Drawing', 'Цртежот', 'The narrator\'s childhood drawing'),
  createDayNode(2, 'Grown-ups', 'Возрасните', 'Understanding adults'),
  createDayNode(3, 'The Pilot', 'Пилотот', 'Stranded in the desert'),
  createDayNode(4, 'A Strange Request', 'Чудно барање', 'Draw me a sheep'),
  createDayNode(5, 'Review Week 1', 'Преглед Недела 1', 'Review Days 1-4 vocabulary'),

  // Week 2: The Little Prince's Planet
  createDayNode(6, 'Asteroid B-612', 'Астероид Б-612', 'The prince\'s tiny planet'),
  createDayNode(7, 'The Baobabs', 'Баобабите', 'Dangerous trees'),
  createDayNode(8, 'The Flower', 'Цвеќето', 'A beautiful rose appears'),
  createDayNode(9, 'The Flower\'s Pride', 'Гордоста на цвеќето', 'The rose\'s vanity'),
  createDayNode(10, 'Review Week 2', 'Преглед Недела 2', 'Review Days 6-9 vocabulary'),

  // Week 3: The Journey Begins
  createDayNode(11, 'The Departure', 'Заминувањето', 'Leaving home'),
  createDayNode(12, 'The King', 'Кралот', 'First planet visit'),
  createDayNode(13, 'The Vain Man', 'Суетниот човек', 'Second planet visit'),
  createDayNode(14, 'The Drunkard', 'Пијаницата', 'Third planet visit'),
  createDayNode(15, 'Review Week 3', 'Преглед Недела 3', 'Review Days 11-14 vocabulary'),

  // Week 4: More Planets
  createDayNode(16, 'The Businessman', 'Бизнисменот', 'Fourth planet visit'),
  createDayNode(17, 'The Lamplighter', 'Фенерџијата', 'Fifth planet visit'),
  createDayNode(18, 'The Geographer', 'Географот', 'Sixth planet visit'),
  createDayNode(19, 'Earth', 'Земјата', 'Arriving on Earth'),
  createDayNode(20, 'Review Week 4', 'Преглед Недела 4', 'Review Days 16-19 vocabulary'),

  // Week 5: Earth Adventures
  createDayNode(21, 'The Snake', 'Змијата', 'Meeting the serpent'),
  createDayNode(22, 'The Desert', 'Пустината', 'Crossing the desert'),
  createDayNode(23, 'The Garden', 'Градината', 'A garden of roses'),
  createDayNode(24, 'The Fox', 'Лисицата', 'The wise fox'),
  createDayNode(25, 'Review Week 5', 'Преглед Недела 5', 'Review Days 21-24 vocabulary'),

  // Week 6: Taming & Return
  createDayNode(26, 'Taming', 'Припитомување', 'What it means to tame'),
  createDayNode(27, 'The Secret', 'Тајната', 'The fox\'s secret'),
  createDayNode(28, 'The Well', 'Бунарот', 'Finding water'),
  createDayNode(29, 'Farewell', 'Збогум', 'The prince\'s departure'),
  createDayNode(30, 'Final Review', 'Завршен преглед', 'Complete challenge assessment'),
];

/**
 * Create the 30-Day Challenge path with progress applied
 */
export function create30DayChallengePath(completedNodeIds: string[] = []): LessonPath {
  const nodes = challenge30DayNodes.map((node, index) => {
    const isCompleted = completedNodeIds.includes(node.id);
    const firstIncompleteIndex = challenge30DayNodes.findIndex(
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
    id: '30day-challenge',
    title: '30-Day Reading Challenge',
    description: 'Read "The Little Prince" in Macedonian',
    nodes,
    completedCount: completedNodeIds.length,
    totalCount: challenge30DayNodes.length,
  };
}
