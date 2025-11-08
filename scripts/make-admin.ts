import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  // Get email from command line arguments
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('\nUsage: npx tsx scripts/make-admin.ts <email>');
    console.log('Example: npx tsx scripts/make-admin.ts andri@example.com\n');
    process.exit(1);
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      console.log('\nMake sure the user has signed in at least once.\n');
      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`✅ User "${user.name || email}" is already an admin`);
      process.exit(0);
    }

    // Update to admin
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    console.log(`\n✅ Success! User "${user.name || email}" (${email}) is now an admin`);
    console.log(`\nThey can now access the admin panel at: /admin\n`);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
