import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Flagging all existing practice vocabulary words for Word of the Day...');

  const result = await prisma.practiceVocabulary.updateMany({
    where: {
      includeInWOTD: false,
    },
    data: {
      includeInWOTD: true,
    },
  });

  console.log(`✓ Flagged ${result.count} words to be included in Word of the Day`);
  console.log('\nNote: You can now add pronunciation, examples, icons, and schedule dates in the admin panel.');
}

main()
  .catch((e) => {
    console.error('Error flagging words:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
