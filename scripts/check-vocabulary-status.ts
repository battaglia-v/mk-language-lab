import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking vocabulary database status...\n');

  const total = await prisma.practiceVocabulary.count();
  const flagged = await prisma.practiceVocabulary.count({
    where: { includeInWOTD: true },
  });
  const withPartOfSpeech = await prisma.practiceVocabulary.count({
    where: { partOfSpeech: { not: null } },
  });
  const withExamples = await prisma.practiceVocabulary.count({
    where: {
      AND: [
        { exampleMk: { not: null } },
        { exampleEn: { not: null } },
      ]
    },
  });

  console.log(`Total words: ${total}`);
  console.log(`Words flagged for WOTD: ${flagged}`);
  console.log(`Words with partOfSpeech: ${withPartOfSpeech}`);
  console.log(`Words with examples: ${withExamples}`);

  if (total > 0) {
    console.log('\nSample words:');
    const samples = await prisma.practiceVocabulary.findMany({
      take: 5,
      select: {
        macedonian: true,
        english: true,
        includeInWOTD: true,
        partOfSpeech: true,
        exampleMk: true,
        exampleEn: true,
      },
    });
    console.log(JSON.stringify(samples, null, 2));
  }
}

main()
  .catch((e) => {
    console.error('Error checking vocabulary:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
