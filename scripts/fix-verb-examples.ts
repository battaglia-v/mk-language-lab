import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing grammatically incorrect verb examples...\n');

  // Find all words where the example contains "I i" (double I)
  const badExamples = await prisma.practiceVocabulary.findMany({
    where: {
      OR: [
        { exampleEn: { contains: ' i ' } }, // Space i space indicates "I i verb"
        { exampleEn: { startsWith: 'I i' } }, // Starts with "I i"
        { exampleEn: { startsWith: 'I want to to' } }, // Double "to"
      ],
    },
  });

  console.log(`Found ${badExamples.length} words with grammatically incorrect examples`);

  let fixed = 0;
  for (const word of badExamples) {
    let newExampleMk = word.exampleMk;
    let newExampleEn = word.exampleEn;

    // Fix "This is I verb" or "I i verb" → "I verb"
    if (word.exampleEn?.includes('This is I') || word.exampleEn?.match(/^I\s+i\s+/i)) {
      // Extract the verb part (remove "I " prefix if present)
      const verb = word.english.toLowerCase().replace(/^i\s+/i, '');
      newExampleMk = `Јас ${word.macedonian}.`;
      newExampleEn = `I ${verb}.`;
    }

    // Fix "I want to to verb" → "I want to verb"
    if (word.exampleEn?.startsWith('I want to to')) {
      newExampleEn = word.exampleEn.replace('I want to to', 'I want to');
      newExampleMk = word.exampleMk?.replace('сакам да да', 'сакам да') || word.exampleMk;
    }

    await prisma.practiceVocabulary.update({
      where: { id: word.id },
      data: {
        exampleMk: newExampleMk,
        exampleEn: newExampleEn,
      },
    });

    fixed++;
    console.log(`Fixed: "${word.macedonian}" (${word.english})`);
    console.log(`  Old: ${word.exampleEn}`);
    console.log(`  New: ${newExampleEn}\n`);
  }

  console.log(`✓ Fixed ${fixed} grammatically incorrect examples`);
}

main()
  .catch((e) => {
    console.error('Error fixing examples:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
