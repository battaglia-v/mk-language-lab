import prisma from '../lib/prisma';

async function main() {
  const total = await prisma.practiceVocabulary.count();
  const active = await prisma.practiceVocabulary.count({ where: { isActive: true } });
  const inactive = await prisma.practiceVocabulary.count({ where: { isActive: false } });
  
  console.log('Total vocabulary items:', total);
  console.log('Active (isActive: true):', active);
  console.log('Inactive (isActive: false):', inactive);
  
  const first5 = await prisma.practiceVocabulary.findMany({
    where: { isActive: true },
    take: 5,
    orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }]
  });
  
  console.log('\nFirst 5 active items:');
  first5.forEach(item => {
    console.log(`  - ${item.macedonian} = ${item.english}`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
