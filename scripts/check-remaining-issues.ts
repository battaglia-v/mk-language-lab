import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get remaining empty translations
  const empty = await prisma.vocabularyItem.findMany({
    where: { englishText: '' },
    select: { macedonianText: true },
    distinct: ['macedonianText']
  });
  
  console.log('Remaining empty translations:');
  empty.forEach(v => console.log(`  '${v.macedonianText}',`));
  
  // Get remaining grammar titles without English
  const grammar = await prisma.grammarNote.findMany({
    distinct: ['title'],
    select: { title: true }
  });
  
  const mkOnlyTitles = grammar.filter(g => {
    // Check if title doesn't have English in parentheses and is mostly Cyrillic
    return !g.title.includes('(') && /[а-яА-Я]/.test(g.title);
  });
  
  console.log('\nGrammar titles without English translation:');
  mkOnlyTitles.forEach(g => console.log(`  '${g.title}'`));
  
  await prisma.$disconnect();
}
main();

