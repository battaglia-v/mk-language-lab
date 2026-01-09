import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📊 FINAL ENGLISH TRANSLATION AUDIT\n');
  console.log('='.repeat(60));
  
  // 1. Lesson summaries - check for natural English
  console.log('\n📝 LESSON SUMMARIES\n');
  const lessons = await prisma.curriculumLesson.findMany({
    select: { title: true, summary: true, module: { select: { journeyId: true } } },
    orderBy: [{ module: { journeyId: 'asc' } }, { orderIndex: 'asc' }]
  });
  
  for (const l of lessons) {
    const level = l.module.journeyId.replace('ukim-', '').toUpperCase();
    console.log(`[${level}] ${l.title}`);
    console.log(`   → ${l.summary}`);
  }
  
  // 2. Vocabulary stats
  console.log('\n\n📚 VOCABULARY STATISTICS\n');
  const totalVocab = await prisma.vocabularyItem.count();
  const emptyVocab = await prisma.vocabularyItem.count({ where: { englishText: '' } });
  
  console.log(`  Total vocabulary items: ${totalVocab}`);
  console.log(`  Empty translations: ${emptyVocab}`);
  console.log(`  Translation coverage: ${(((totalVocab - emptyVocab) / totalVocab) * 100).toFixed(1)}%`);
  
  // 3. Grammar note titles
  console.log('\n\n📖 GRAMMAR NOTE TITLES\n');
  const grammar = await prisma.grammarNote.findMany({
    distinct: ['title'],
    select: { title: true }
  });
  
  console.log(`  Total unique grammar titles: ${grammar.length}`);
  
  // Check for any without English
  const mkOnly = grammar.filter(g => !g.title.includes('(') && /[а-яА-Я]/.test(g.title));
  if (mkOnly.length > 0) {
    console.log(`  ⚠️ Titles without English: ${mkOnly.length}`);
    mkOnly.forEach(g => console.log(`    - ${g.title}`));
  } else {
    console.log('  ✅ All grammar titles have English translations');
  }
  
  // 4. Sample vocabulary quality check
  console.log('\n\n🔍 VOCABULARY QUALITY SAMPLES\n');
  const samples = await prisma.vocabularyItem.findMany({
    take: 20,
    orderBy: { id: 'asc' },
    select: { macedonianText: true, englishText: true }
  });
  
  samples.forEach(s => console.log(`  ${s.macedonianText} → ${s.englishText}`));
  
  // 5. Exercise quality check
  console.log('\n\n📝 EXERCISE QUALITY SAMPLES\n');
  const exercises = await prisma.exercise.findMany({
    take: 10,
    select: { question: true, explanation: true }
  });
  
  exercises.forEach(e => {
    console.log(`  Q: ${e.question}`);
    if (e.explanation) console.log(`  → ${e.explanation.substring(0, 80)}...`);
    console.log('');
  });
  
  console.log('\n✅ AUDIT COMPLETE\n');
  
  await prisma.$disconnect();
}
main();

