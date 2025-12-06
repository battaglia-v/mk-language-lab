import prisma from '../lib/prisma';

async function main() {
  const count = await prisma.practiceVocabulary.count({ where: { isActive: true } });
  console.log('Total active vocabulary items:', count);
  await prisma.$disconnect();
}

main().catch(console.error);
