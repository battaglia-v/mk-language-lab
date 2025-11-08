import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding vocabulary with (formal) or (informal) annotations...\n');

  // Find all words with annotations
  const allWords = await prisma.practiceVocabulary.findMany();

  const wordsToClean = allWords.filter(
    (word) =>
      (word.english && /\((formal|informal)\)/i.test(word.english)) ||
      (word.macedonian && /\((formal|informal)\)/i.test(word.macedonian))
  );

  console.log(`Found ${wordsToClean.length} words with annotations\n`);

  for (const word of wordsToClean) {
    const cleanedEnglish = word.english
      ?.replace(/\s*\((formal|informal)\)\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanedMacedonian = word.macedonian
      ?.replace(/\s*\((formal|informal)\)\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`Cleaning: "${word.macedonian}" (${word.english})`);
    console.log(`  English: "${word.english}" → "${cleanedEnglish}"`);
    console.log(`  Macedonian: "${word.macedonian}" → "${cleanedMacedonian}"\n`);

    await prisma.practiceVocabulary.update({
      where: { id: word.id },
      data: {
        english: cleanedEnglish,
        macedonian: cleanedMacedonian,
      },
    });
  }

  console.log(`✅ Cleaned ${wordsToClean.length} words`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
