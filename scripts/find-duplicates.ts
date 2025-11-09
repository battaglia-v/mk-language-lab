/**
 * Script to find and report duplicate vocabulary entries
 *
 * Identifies words with identical Macedonian text and provides detailed
 * information to help decide whether to merge, keep, or differentiate them.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicates() {
  console.log('🔍 Scanning for duplicate vocabulary entries...\n');

  // Get all words grouped by Macedonian text
  const allWords = await prisma.practiceVocabulary.findMany({
    where: { isActive: true },
    select: {
      id: true,
      macedonian: true,
      english: true,
      category: true,
      difficulty: true,
      pronunciation: true,
      partOfSpeech: true,
      exampleMk: true,
      exampleEn: true,
      icon: true,
      includeInWOTD: true,
      createdAt: true,
    },
    orderBy: { macedonian: 'asc' },
  });

  // Group by Macedonian text (case-insensitive and trimmed)
  const grouped = new Map<string, typeof allWords>();

  allWords.forEach(word => {
    const key = word.macedonian.toLowerCase().trim();
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(word);
  });

  // Filter to only duplicates (more than one entry)
  const duplicates = Array.from(grouped.entries())
    .filter(([_, words]) => words.length > 1)
    .sort((a, b) => b[1].length - a[1].length); // Sort by count descending

  console.log(`📊 Found ${duplicates.length} Macedonian words with duplicates\n`);
  console.log(`📊 Total duplicate entries: ${duplicates.reduce((sum, [_, words]) => sum + words.length, 0)}\n`);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Database is clean.\n');
    return;
  }

  console.log('=' .repeat(80));
  console.log('DUPLICATE WORDS REPORT');
  console.log('='.repeat(80));
  console.log();

  duplicates.forEach(([macedonianText, words], index) => {
    console.log(`\n${index + 1}. "${macedonianText.toUpperCase()}" (${words.length} entries)`);
    console.log('-'.repeat(80));

    words.forEach((word, wordIndex) => {
      console.log(`\n   Entry ${wordIndex + 1}:`);
      console.log(`   ID: ${word.id}`);
      console.log(`   English: "${word.english}"`);
      console.log(`   Category: ${word.category || 'none'}`);
      console.log(`   Part of Speech: ${word.partOfSpeech || 'none'}`);
      console.log(`   Pronunciation: ${word.pronunciation || 'none'}`);
      console.log(`   Icon: ${word.icon || 'none'}`);
      console.log(`   Example MK: ${word.exampleMk ? `"${word.exampleMk.substring(0, 60)}${word.exampleMk.length > 60 ? '...' : ''}"` : 'none'}`);
      console.log(`   Example EN: ${word.exampleEn ? `"${word.exampleEn.substring(0, 60)}${word.exampleEn.length > 60 ? '...' : ''}"` : 'none'}`);
      console.log(`   In WOTD: ${word.includeInWOTD ? 'Yes' : 'No'}`);
      console.log(`   Created: ${word.createdAt.toISOString().split('T')[0]}`);
    });

    // Analysis
    console.log(`\n   📋 ANALYSIS:`);
    const englishTranslations = [...new Set(words.map(w => w.english))];
    const categories = [...new Set(words.map(w => w.category))];
    const partsOfSpeech = [...new Set(words.map(w => w.partOfSpeech))];

    if (englishTranslations.length === 1) {
      console.log(`   ✅ All have same English translation: "${englishTranslations[0]}"`);
      console.log(`   💡 RECOMMENDATION: TRUE DUPLICATE - Keep one, delete others`);
    } else {
      console.log(`   ⚠️  Different English translations: ${englishTranslations.join(', ')}`);
      console.log(`   💡 RECOMMENDATION: Different meanings - Keep separate with clarification`);
    }

    if (categories.length > 1) {
      console.log(`   ⚠️  Different categories: ${categories.join(', ')}`);
    }

    if (partsOfSpeech.length > 1) {
      console.log(`   ⚠️  Different parts of speech: ${partsOfSpeech.join(', ')}`);
    }

    console.log();
  });

  console.log('=' .repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log();

  // Count true duplicates vs different meanings
  let trueDuplicates = 0;
  let differentMeanings = 0;

  duplicates.forEach(([_, words]) => {
    const englishTranslations = [...new Set(words.map(w => w.english))];
    if (englishTranslations.length === 1) {
      trueDuplicates++;
    } else {
      differentMeanings++;
    }
  });

  console.log(`📊 True duplicates (same English): ${trueDuplicates} words`);
  console.log(`📊 Different meanings (different English): ${differentMeanings} words`);
  console.log();

  console.log('💡 NEXT STEPS:');
  console.log('   1. Review each duplicate above');
  console.log('   2. For true duplicates: Keep the entry with most complete data');
  console.log('   3. For different meanings: Add context/notes to differentiate');
  console.log('   4. Run cleanup script to remove confirmed duplicates');
  console.log();
}

findDuplicates()
  .catch((error) => {
    console.error('❌ Error finding duplicates:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
