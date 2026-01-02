/**
 * Seed a test user for development/testing
 *
 * Run with: npx tsx scripts/seed-test-user.ts
 *
 * Creates a test user with:
 * - Email: test@mklanguage.com
 * - Password: TestUser123!
 * - Pre-verified email (can log in immediately)
 * - Initial game progress
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_USER = {
  email: 'test@mklanguage.com',
  password: 'TestUser123!',
  name: 'Test User',
};

async function main() {
  console.log('🌱 Seeding test user...\n');

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  });

  if (existingUser) {
    console.log('✅ Test user already exists!');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log(`   User ID: ${existingUser.id}`);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(TEST_USER.password, 12);

  // Create user with verified email
  const user = await prisma.user.create({
    data: {
      email: TEST_USER.email,
      password: hashedPassword,
      name: TEST_USER.name,
      emailVerified: new Date(), // Pre-verified
      role: 'user',
    },
  });

  console.log('✅ Test user created!');
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Password: ${TEST_USER.password}`);
  console.log(`   User ID: ${user.id}`);

  // Create initial game progress
  await prisma.gameProgress.create({
    data: {
      userId: user.id,
      xp: 150,
      todayXP: 50,
      level: 'beginner',
      streak: 3,
      hearts: 5,
      totalLessons: 5,
      lastPracticeDate: new Date(),
      streakUpdatedAt: new Date(),
    },
  });

  console.log('\n✅ Initial game progress created!');
  console.log('   XP: 150');
  console.log('   Streak: 3 days');
  console.log('   Completed lessons: 5');

  console.log('\n🎉 Done! You can now log in at /auth/signin');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding test user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
