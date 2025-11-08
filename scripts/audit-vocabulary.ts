import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditVocabulary() {
  console.log('🔍 Vocabulary Database Audit\n');
  console.log('=' .repeat(60));

  try {
    // 1. Total counts
    const totalCount = await prisma.practiceVocabulary.count();
    const activeCount = await prisma.practiceVocabulary.count({
      where: { isActive: true },
    });
    const wotdCount = await prisma.wordOfTheDay.count({
      where: { isActive: true },
    });

    console.log('\n📊 TOTAL COUNTS');
    console.log(`Total vocabulary entries: ${totalCount}`);
    console.log(`Active entries: ${activeCount}`);
    console.log(`Inactive entries: ${totalCount - activeCount}`);
    console.log(`Word of the Day pool: ${wotdCount}`);

    // 2. Data quality - missing critical fields
    const allVocab = await prisma.practiceVocabulary.findMany({
      select: {
        english: true,
        macedonian: true,
        category: true,
      },
    });

    const missingEnglish = allVocab.filter(v => !v.english || v.english.trim() === '').length;
    const missingMacedonian = allVocab.filter(v => !v.macedonian || v.macedonian.trim() === '').length;
    const missingCategory = allVocab.filter(v => !v.category || v.category.trim() === '').length;

    console.log('\n⚠️  DATA QUALITY ISSUES');
    console.log(`Missing English translation: ${missingEnglish}`);
    console.log(`Missing Macedonian translation: ${missingMacedonian}`);
    console.log(`Missing category: ${missingCategory}`);

    // 3. Category distribution
    const categories = await prisma.practiceVocabulary.groupBy({
      by: ['category'],
      _count: true,
    });

    console.log('\n📁 CATEGORY DISTRIBUTION');
    categories
      .filter((cat) => cat.category !== null)
      .sort((a, b) => b._count - a._count)
      .forEach((cat) => {
        console.log(`${cat.category}: ${cat._count} words`);
      });

    // 4. Difficulty distribution
    const difficulties = await prisma.practiceVocabulary.groupBy({
      by: ['difficulty'],
      _count: true,
    });

    console.log('\n🎯 DIFFICULTY DISTRIBUTION');
    difficulties
      .sort((a, b) => {
        const order = { beginner: 1, intermediate: 2, advanced: 3 };
        return (order[a.difficulty as keyof typeof order] || 99) - (order[b.difficulty as keyof typeof order] || 99);
      })
      .forEach((diff) => {
        console.log(`${diff.difficulty}: ${diff._count} words`);
      });

    // 5. Check for potential duplicates
    const allWords = await prisma.practiceVocabulary.findMany({
      select: {
        id: true,
        macedonian: true,
        english: true,
      },
    });

    const macedonianMap = new Map<string, number[]>();
    allWords.forEach((word) => {
      const normalized = word.macedonian.toLowerCase().trim();
      if (!macedonianMap.has(normalized)) {
        macedonianMap.set(normalized, []);
      }
      macedonianMap.get(normalized)!.push(word.id);
    });

    const duplicates = Array.from(macedonianMap.entries())
      .filter(([_, ids]) => ids.length > 1);

    console.log('\n🔄 DUPLICATE CHECK');
    console.log(`Potential duplicate Macedonian words: ${duplicates.length}`);
    if (duplicates.length > 0) {
      console.log('\nTop duplicates:');
      duplicates.slice(0, 5).forEach(([word, ids]) => {
        console.log(`  "${word}" appears ${ids.length} times (IDs: ${ids.join(', ')})`);
      });
    }

    // 6. Sample entries for manual review
    console.log('\n📝 SAMPLE ENTRIES FOR REVIEW');
    const samples = await prisma.practiceVocabulary.findMany({
      take: 5,
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        macedonian: true,
        english: true,
        category: true,
        difficulty: true,
        pronunciation: true,
      },
    });

    samples.forEach((sample, idx) => {
      console.log(`\n${idx + 1}. ${sample.macedonian} [${sample.pronunciation || 'no pronunciation'}]`);
      console.log(`   English: ${sample.english}`);
      console.log(`   Category: ${sample.category || 'N/A'}, Difficulty: ${sample.difficulty || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Audit complete\n');

  } catch (error) {
    console.error('❌ Error during audit:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

auditVocabulary();
