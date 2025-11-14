import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DAILY_QUESTS = [
  {
    id: 'daily-practice-5',
    type: 'daily',
    title: 'Daily Practice Streak',
    description: 'Complete 5 practice exercises today',
    category: 'practice',
    target: 5,
    targetUnit: 'exercises',
    xpReward: 50,
    currencyReward: 10,
    difficultyLevel: 'easy',
  },
  {
    id: 'daily-xp-100',
    type: 'daily',
    title: 'XP Hunter',
    description: 'Earn 100 XP today',
    category: 'practice',
    target: 100,
    targetUnit: 'xp',
    xpReward: 75,
    currencyReward: 15,
    difficultyLevel: 'medium',
  },
  {
    id: 'daily-translation-3',
    type: 'daily',
    title: 'Translation Master',
    description: 'Complete 3 translations today',
    category: 'translation',
    target: 3,
    targetUnit: 'translations',
    xpReward: 60,
    currencyReward: 12,
    difficultyLevel: 'medium',
  },
  {
    id: 'daily-perfect-streak',
    type: 'daily',
    title: 'Perfect Practice',
    description: 'Complete 10 exercises without mistakes',
    category: 'practice',
    target: 10,
    targetUnit: 'exercises',
    xpReward: 100,
    currencyReward: 25,
    difficultyLevel: 'hard',
  },
] as const;

export const WEEKLY_QUESTS = [
  {
    id: 'weekly-practice-30',
    type: 'weekly',
    title: 'Weekly Warrior',
    description: 'Complete 30 practice sessions this week',
    category: 'practice',
    target: 30,
    targetUnit: 'exercises',
    xpReward: 300,
    currencyReward: 75,
    difficultyLevel: 'medium',
  },
  {
    id: 'weekly-streak-7',
    type: 'weekly',
    title: 'Week of Learning',
    description: 'Maintain a 7-day practice streak',
    category: 'practice',
    target: 7,
    targetUnit: 'days',
    xpReward: 250,
    currencyReward: 60,
    difficultyLevel: 'medium',
  },
  {
    id: 'weekly-lesson-complete',
    type: 'weekly',
    title: 'Lesson Master',
    description: 'Complete 3 full lessons this week',
    category: 'lesson',
    target: 3,
    targetUnit: 'lessons',
    xpReward: 400,
    currencyReward: 100,
    difficultyLevel: 'hard',
  },
  {
    id: 'weekly-xp-1000',
    type: 'weekly',
    title: 'XP Champion',
    description: 'Earn 1000 XP this week',
    category: 'practice',
    target: 1000,
    targetUnit: 'xp',
    xpReward: 500,
    currencyReward: 125,
    difficultyLevel: 'hard',
  },
] as const;

export async function seedQuests() {
  console.log('🎯 Seeding quests...');

  const allQuests = [...DAILY_QUESTS, ...WEEKLY_QUESTS];

  for (const quest of allQuests) {
    await prisma.quest.upsert({
      where: { id: quest.id },
      update: {
        ...quest,
        isActive: true,
      },
      create: {
        ...quest,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${allQuests.length} quests (${DAILY_QUESTS.length} daily, ${WEEKLY_QUESTS.length} weekly)`);
}
