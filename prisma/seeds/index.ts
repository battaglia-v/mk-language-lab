import { PrismaClient } from '@prisma/client';
import { seedQuests } from './quests';
import { seedBadges } from './badges';
import { seedLeagues } from './leagues';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting gamification seed...\n');

  try {
    await seedQuests();
    await seedBadges();
    await seedLeagues();

    console.log('\n✅ Gamification seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
