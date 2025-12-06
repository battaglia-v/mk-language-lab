import prisma from '../lib/prisma';

/**
 * Seed profile data for a specific user
 * This creates GameProgress and Currency records if they don't exist
 */
async function seedUserProfile(userEmail: string) {
  console.log(`Seeding profile data for: ${userEmail}`);

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.id})`);

    // Check if GameProgress already exists
    let gameProgress = await prisma.gameProgress.findUnique({
      where: { userId: user.id },
    });

    if (!gameProgress) {
      console.log('Creating GameProgress record...');
      gameProgress = await prisma.gameProgress.create({
        data: {
          userId: user.id,
          xp: 0,
          level: 'beginner',
          streak: 0,
          hearts: 5,
          lastPracticeDate: new Date(),
        },
      });
      console.log('✅ GameProgress created');
    } else {
      console.log('✅ GameProgress already exists');
    }

    // Check if Currency exists
    let currency = await prisma.currency.findUnique({
      where: { userId: user.id },
    });

    if (!currency) {
      console.log('Creating Currency record...');
      currency = await prisma.currency.create({
        data: {
          userId: user.id,
          gems: 0,
          coins: 0,
        },
      });
      console.log('✅ Currency created');
    } else {
      console.log('✅ Currency already exists');
    }

    console.log('\n✅ Profile seeding complete!');
    console.log('\nProfile data:');
    console.log('  XP:', gameProgress.xp);
    console.log('  Level:', gameProgress.level);
    console.log('  Streak:', gameProgress.streak);
    console.log('  Gems:', currency.gems);
    console.log('  Coins:', currency.coins);
  } catch (error) {
    console.error('❌ Error seeding profile:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args or use default
const userEmail = process.argv[2] || 'vpbattaglia@gmail.com';

seedUserProfile(userEmail).catch(console.error);
