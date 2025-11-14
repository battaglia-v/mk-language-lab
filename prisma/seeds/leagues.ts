import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const LEAGUE_TIERS = [
  {
    id: 'league-bronze',
    name: 'Bronze League',
    tier: 1,
    minStreak: 0,
    maxStreak: 6,
    xpMultiplier: 1.0,
    icon: '🥉',
  },
  {
    id: 'league-silver',
    name: 'Silver League',
    tier: 2,
    minStreak: 7,
    maxStreak: 20,
    xpMultiplier: 1.1,
    icon: '🥈',
  },
  {
    id: 'league-gold',
    name: 'Gold League',
    tier: 3,
    minStreak: 21,
    maxStreak: 49,
    xpMultiplier: 1.2,
    icon: '🥇',
  },
  {
    id: 'league-platinum',
    name: 'Platinum League',
    tier: 4,
    minStreak: 50,
    maxStreak: 99,
    xpMultiplier: 1.3,
    icon: '💿',
  },
  {
    id: 'league-diamond',
    name: 'Diamond League',
    tier: 5,
    minStreak: 100,
    maxStreak: null, // No upper limit
    xpMultiplier: 1.5,
    icon: '💎',
  },
] as const;

export async function seedLeagues() {
  console.log('🏅 Seeding leagues...');

  for (const league of LEAGUE_TIERS) {
    await prisma.league.upsert({
      where: { id: league.id },
      update: league,
      create: league,
    });
  }

  console.log(`✅ Seeded ${LEAGUE_TIERS.length} league tiers`);
}
