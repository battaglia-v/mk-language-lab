import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check the word "почнувам" (I start) that user showed in screenshot
  const word = await prisma.practiceVocabulary.findFirst({
    where: {
      macedonian: 'почнувам',
    },
  });

  console.log('Word details:');
  console.log(JSON.stringify(word, null, 2));

  // Also check завршувам (finish)
  const finishWord = await prisma.practiceVocabulary.findFirst({
    where: {
      OR: [
        { macedonian: { contains: 'завршувам' } },
        { english: { contains: 'finish' } },
      ],
    },
  });

  console.log('\n\nFinish word details:');
  console.log(JSON.stringify(finishWord, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
