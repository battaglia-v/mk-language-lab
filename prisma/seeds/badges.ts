import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ACHIEVEMENT_BADGES = [
  {
    id: 'badge-streak-3',
    name: 'Streak Starter',
    description: 'Complete a 3-day practice streak',
    category: 'achievement',
    rarityTier: 'common',
    unlockCondition: JSON.stringify({ type: 'streak', minDays: 3 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-streak-7',
    name: 'Week Warrior',
    description: 'Complete a 7-day practice streak',
    category: 'achievement',
    rarityTier: 'common',
    unlockCondition: JSON.stringify({ type: 'streak', minDays: 7 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-streak-30',
    name: 'Streak Guardian',
    description: 'Complete a 30-day practice streak',
    category: 'achievement',
    rarityTier: 'rare',
    unlockCondition: JSON.stringify({ type: 'streak', minDays: 30 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-streak-100',
    name: 'Century Streak',
    description: 'Complete a 100-day practice streak',
    category: 'achievement',
    rarityTier: 'legendary',
    unlockCondition: JSON.stringify({ type: 'streak', minDays: 100 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-xp-1000',
    name: 'XP Novice',
    description: 'Earn 1,000 total XP',
    category: 'achievement',
    rarityTier: 'common',
    unlockCondition: JSON.stringify({ type: 'xp', minTotal: 1000 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-xp-10000',
    name: 'XP Ranger',
    description: 'Earn 10,000 total XP',
    category: 'achievement',
    rarityTier: 'rare',
    unlockCondition: JSON.stringify({ type: 'xp', minTotal: 10000 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-xp-50000',
    name: 'XP Master',
    description: 'Earn 50,000 total XP',
    category: 'achievement',
    rarityTier: 'epic',
    unlockCondition: JSON.stringify({ type: 'xp', minTotal: 50000 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-quest-10',
    name: 'Quest Enthusiast',
    description: 'Complete 10 quests',
    category: 'achievement',
    rarityTier: 'common',
    unlockCondition: JSON.stringify({ type: 'quests', minCompleted: 10 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-quest-50',
    name: 'Quest Champion',
    description: 'Complete 50 quests',
    category: 'achievement',
    rarityTier: 'rare',
    unlockCondition: JSON.stringify({ type: 'quests', minCompleted: 50 }),
    costGems: 0,
    isAvailableInShop: false,
  },
  {
    id: 'badge-perfect-10',
    name: 'Perfect Practice',
    description: 'Complete 10 exercises with 100% accuracy',
    category: 'achievement',
    rarityTier: 'rare',
    unlockCondition: JSON.stringify({ type: 'perfect_sessions', minCount: 10 }),
    costGems: 0,
    isAvailableInShop: false,
  },
] as const;

export const COSMETIC_BADGES = [
  {
    id: 'badge-fire',
    name: '🔥 Fire Badge',
    description: 'Show off your hot streak with this fiery badge',
    category: 'cosmetic',
    rarityTier: 'common',
    unlockCondition: JSON.stringify({ type: 'purchase' }),
    costGems: 50,
    isAvailableInShop: true,
  },
  {
    id: 'badge-star',
    name: '⭐ Star Badge',
    description: 'Shine bright like a star',
    category: 'cosmetic',
    rarityTier: 'common',
    unlockCondition: JSON.stringify({ type: 'purchase' }),
    costGems: 50,
    isAvailableInShop: true,
  },
  {
    id: 'badge-trophy',
    name: '🏆 Trophy Badge',
    description: 'Display your championship status',
    category: 'cosmetic',
    rarityTier: 'rare',
    unlockCondition: JSON.stringify({ type: 'purchase' }),
    costGems: 100,
    isAvailableInShop: true,
  },
  {
    id: 'badge-crown',
    name: '👑 Crown Badge',
    description: 'Rule your learning journey',
    category: 'cosmetic',
    rarityTier: 'epic',
    unlockCondition: JSON.stringify({ type: 'purchase' }),
    costGems: 200,
    isAvailableInShop: true,
  },
  {
    id: 'badge-diamond',
    name: '💎 Diamond Badge',
    description: 'Rare and precious, just like your dedication',
    category: 'cosmetic',
    rarityTier: 'legendary',
    unlockCondition: JSON.stringify({ type: 'purchase' }),
    costGems: 500,
    isAvailableInShop: true,
  },
  {
    id: 'badge-rocket',
    name: '🚀 Rocket Badge',
    description: 'Your learning is taking off!',
    category: 'cosmetic',
    rarityTier: 'rare',
    unlockCondition: JSON.stringify({ type: 'purchase' }),
    costGems: 150,
    isAvailableInShop: true,
  },
] as const;

export const SEASONAL_BADGES = [
  {
    id: 'badge-winter-2025',
    name: '❄️ Winter Learner 2025',
    description: 'Practiced during winter season 2025',
    category: 'seasonal',
    rarityTier: 'epic',
    unlockCondition: JSON.stringify({ type: 'seasonal', season: 'winter-2025' }),
    costGems: 0,
    isAvailableInShop: false,
  },
] as const;

export async function seedBadges() {
  console.log('🏆 Seeding badges...');

  const allBadges = [...ACHIEVEMENT_BADGES, ...COSMETIC_BADGES, ...SEASONAL_BADGES];

  for (const badge of allBadges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {
        ...badge,
        isActive: true,
      },
      create: {
        ...badge,
        isActive: true,
      },
    });
  }

  console.log(
    `✅ Seeded ${allBadges.length} badges (${ACHIEVEMENT_BADGES.length} achievements, ${COSMETIC_BADGES.length} cosmetic, ${SEASONAL_BADGES.length} seasonal)`
  );
}
