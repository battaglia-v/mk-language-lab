/**
 * Manual Progress Recovery Script
 *
 * This script restores user progress directly to the database.
 * Run with: DATABASE_URL='...' npx tsx scripts/restore-progress.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreProgress() {
  // Your Google OAuth email
  const userEmail = 'YOUR_GOOGLE_EMAIL_HERE'; // Replace with your actual email

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`User not found with email: ${userEmail}`);
      console.error('Please update the email in the script');
      return;
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Restore progress with your 260 XP
    const progress = await prisma.gameProgress.upsert({
      where: { userId: user.id },
      update: {
        xp: 260,
        streak: 1,
        level: 'intermediate', // 260 XP = intermediate level
        hearts: 5,
        lastPracticeDate: new Date(),
        streakUpdatedAt: new Date(),
      },
      create: {
        userId: user.id,
        xp: 260,
        streak: 1,
        level: 'intermediate',
        hearts: 5,
        lastPracticeDate: new Date(),
        streakUpdatedAt: new Date(),
      },
    });

    console.log('✅ Progress restored successfully!');
    console.log('Progress:', {
      xp: progress.xp,
      streak: progress.streak,
      level: progress.level,
      hearts: progress.hearts,
    });

    console.log('\nNow refresh your browser and you should see your 260 XP!');
  } catch (error) {
    console.error('Error restoring progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreProgress();
