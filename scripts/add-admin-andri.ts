import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAdminUser() {
  const email = 'macedonianlanguagecorner@gmail.com';
  const name = 'Andri';

  try {
    console.log(`🔍 Checking if user ${email} already exists...`);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`✅ User ${email} already exists and is already an admin`);
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Role: ${existingUser.role}`);
        return;
      }

      console.log(`📝 User ${email} exists but is not an admin. Upgrading to admin...`);
      const updated = await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      });
      console.log(`✅ Successfully upgraded ${email} to admin role`);
      console.log(`   Name: ${updated.name}`);
      console.log(`   Role: ${updated.role}`);
      return;
    }

    console.log(`➕ Creating new admin user for ${email}...`);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: 'admin',
      },
    });

    console.log(`✅ Successfully created admin user:`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);

  } catch (error) {
    console.error('❌ Error adding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAdminUser();
