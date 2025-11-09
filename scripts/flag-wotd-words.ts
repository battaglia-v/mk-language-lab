/**
 * Script to flag high-quality vocabulary words for Word of the Day rotation
 *
 * Criteria for WOTD inclusion:
 * - Beginner difficulty level
 * - Has example sentences (preferred)
 * - Has icon (preferred)
 * - Common categories (greetings, food, family, time, etc.)
 *
 * Target: Flag 50-100 words for good daily rotation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function flagWOTDWords() {
  console.log('🔍 Starting WOTD flagging process...\n');

  // Get high-quality beginner words with examples and icons
  const candidatesWithExamples = await prisma.practiceVocabulary.findMany({
    where: {
      difficulty: 'beginner',
      isActive: true,
      exampleMk: { not: null },
      exampleEn: { not: null },
      icon: { not: null },
    },
    orderBy: { createdAt: 'asc' },
    take: 100, // Target 100 high-quality words
  });

  console.log(`✅ Found ${candidatesWithExamples.length} high-quality words with examples and icons`);

  // Use the high-quality candidates
  const allCandidates = candidatesWithExamples;
  const candidateIds = allCandidates.map(w => w.id);

  console.log(`\n📊 Total candidates for WOTD pool: ${allCandidates.length}\n`);

  if (allCandidates.length === 0) {
    console.log('⚠️  No suitable words found. Exiting.');
    return;
  }

  // Show sample of words that will be flagged
  console.log('📝 Sample words that will be included in WOTD pool:');
  allCandidates.slice(0, 10).forEach((word, index) => {
    console.log(`   ${index + 1}. ${word.macedonian} (${word.english}) - ${word.category}`);
  });

  console.log('\n🔄 Flagging words for Word of the Day...');

  // Update all candidates to includeInWOTD: true
  const result = await prisma.practiceVocabulary.updateMany({
    where: {
      id: { in: candidateIds },
    },
    data: {
      includeInWOTD: true,
    },
  });

  console.log(`\n✅ Successfully flagged ${result.count} words for WOTD rotation!`);

  // Verify the update
  const wotdCount = await prisma.practiceVocabulary.count({
    where: {
      includeInWOTD: true,
      isActive: true,
    },
  });

  console.log(`\n📊 Current WOTD pool size: ${wotdCount} words`);
  console.log(`   This provides ${wotdCount} days of unique daily words (${Math.floor(wotdCount / 30)} months+ of rotation)\n`);

  // Show category distribution
  const categories = await prisma.practiceVocabulary.groupBy({
    by: ['category'],
    where: {
      includeInWOTD: true,
      isActive: true,
    },
    _count: true,
  });

  console.log('📈 WOTD Pool by Category:');
  categories
    .sort((a, b) => b._count - a._count)
    .forEach(cat => {
      console.log(`   - ${cat.category}: ${cat._count} words`);
    });

  console.log('\n✨ WOTD pool is now active! Word of the Day feature should work correctly.\n');
}

flagWOTDWords()
  .catch((error) => {
    console.error('❌ Error flagging WOTD words:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
