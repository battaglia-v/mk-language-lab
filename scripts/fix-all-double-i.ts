import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding and fixing all "I i" patterns...\n');

  // Find all words with "I i" pattern (capital I, space, lowercase i, space)
  const allWords = await prisma.practiceVocabulary.findMany();

  const wordsToFix = allWords.filter(
    (word) => word.exampleEn && /I\s+i\s+/i.test(word.exampleEn)
  );

  console.log(`Found ${wordsToFix.length} words with "I i" pattern\n`);

  for (const word of wordsToFix) {
    // Simply replace "I i " with "I "
    const fixedExample = word.exampleEn!.replace(/I\s+i\s+/gi, 'I ');

    console.log(`Fixing: "${word.macedonian}" (${word.english})`);
    console.log(`  Old: ${word.exampleEn}`);
    console.log(`  New: ${fixedExample}\n`);

    await prisma.practiceVocabulary.update({
      where: { id: word.id },
      data: {
        exampleEn: fixedExample,
      },
    });
  }

  console.log(`✅ Fixed ${wordsToFix.length} examples`);

  // Verify the fixes
  console.log('\n\nVerifying fixes...');
  const checkWords = await prisma.practiceVocabulary.findMany({
    where: {
      OR: [
        { macedonian: 'почнувам' },
        { macedonian: 'завршувам' },
      ],
    },
    select: {
      macedonian: true,
      english: true,
      exampleEn: true,
    },
  });

  console.log(JSON.stringify(checkWords, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
