/**
 * Script to clean up duplicate vocabulary entries
 *
 * Strategy: Keep the most common/useful English translation active,
 * mark alternative translations as inactive to preserve data while
 * preventing clutter in practice exercises and WOTD rotation.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of Macedonian word -> ID to keep active (most common translation)
const PRIMARY_TRANSLATIONS: Record<string, { keepId: string; reason: string }> = {
  'гледам': {
    keepId: 'cmhqife0z008vssd84jou0aqs', // "I watch"
    reason: 'Most common modern usage (watch TV, watch a movie)',
  },
  'баба': {
    keepId: 'cmhqif61f0020ssd8dapdrck0', // "grandmother"
    reason: 'Formal term better for learning',
  },
  'благодарен': {
    keepId: 'cmhqiffq100adssd88g54txn5', // "grateful"
    reason: 'More common in Macedonian usage',
  },
  'болен': {
    keepId: 'cmhqif9yl005dssd846vhtbp2', // "sick"
    reason: 'More common in everyday speech',
  },
  'вкусно': {
    keepId: 'cmhqif8lj0047ssd8brqzsbt9', // "delicious"
    reason: 'Stronger positive meaning',
  },
  'внук': {
    keepId: 'cmhqif6os002kssd8cjyzvls8', // "grandson"
    reason: 'Correct primary meaning (nephew is неаков)',
  },
  'внука': {
    keepId: 'cmhqif6px002lssd8uay8egci', // "granddaughter"
    reason: 'Correct primary meaning (niece is неака)',
  },
  'возам': {
    keepId: 'cmhqifekd009dssd8mo9a9rn2', // "I drive"
    reason: 'More common usage (drive a car)',
  },
  'дедо': {
    keepId: 'cmhqif62j0021ssd8yn43qy6m', // "grandfather"
    reason: 'Formal term better for learning',
  },
  'колку': {
    keepId: 'cmhqifdvw008rssd8yusslxtb', // "how much"
    reason: 'More versatile (works for both countable and uncountable)',
  },
  'кој': {
    keepId: 'cmhqifdlr008jssd8zhhq70j2', // "who"
    reason: 'Primary question word for people',
  },
  'ладно': {
    keepId: 'cmhqifbxe0073ssd8sj4fy93t', // "cold"
    reason: 'Simpler, more general term',
  },
  'недела': {
    keepId: 'cmhqifavg0066ssd8j6333mlm', // "Sunday"
    reason: 'More common meaning (week is "седмица")',
  },
  'одлично': {
    keepId: 'cmhqif4tf000xssd8m67wq98t', // "excellent"
    reason: 'Stronger positive meaning',
  },
  'рака': {
    keepId: 'cmhqif9pv0056ssd8zprrxjim', // "hand"
    reason: 'More specific and common usage',
  },
  'сакам': {
    keepId: 'cmhqifdb8008assd8mpj96491', // "I want"
    reason: 'More common and safer for beginners',
  },
  'слушам': {
    keepId: 'cmhqifc6r007bssd8rcqbqu7x', // "I listen"
    reason: 'Active listening (vs passive hearing)',
  },
  'топло': {
    keepId: 'cmhqifbw90072ssd89x4medbp', // "warm"
    reason: 'More common moderate temperature',
  },
};

async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate cleanup process...\n');

  let deactivatedCount = 0;
  const changes: Array<{ word: string; from: string; to: string }> = [];

  // Process each duplicate word
  for (const [macedonianWord, config] of Object.entries(PRIMARY_TRANSLATIONS)) {
    console.log(`Processing "${macedonianWord}"...`);

    // Find all entries for this word
    const entries = await prisma.practiceVocabulary.findMany({
      where: {
        macedonian: {
          equals: macedonianWord,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        english: true,
        isActive: true,
      },
    });

    if (entries.length === 0) {
      console.log(`  ⚠️  No entries found for "${macedonianWord}"`);
      continue;
    }

    // Deactivate all entries except the primary one
    for (const entry of entries) {
      if (entry.id === config.keepId) {
        console.log(`  ✅ Keeping active: "${entry.english}" (${entry.id})`);
      } else if (entry.isActive) {
        await prisma.practiceVocabulary.update({
          where: { id: entry.id },
          data: {
            isActive: false,
            includeInWOTD: false, // Remove from WOTD pool
          },
        });
        console.log(`  ➡️  Deactivated: "${entry.english}" (${entry.id})`);
        deactivatedCount++;
        changes.push({
          word: macedonianWord,
          from: entry.english,
          to: 'inactive',
        });
      } else {
        console.log(`  ⏭️  Already inactive: "${entry.english}" (${entry.id})`);
      }
    }

    console.log();
  }

  console.log('=' .repeat(80));
  console.log('CLEANUP SUMMARY');
  console.log('='.repeat(80));
  console.log();
  console.log(`📊 Total duplicate words processed: ${Object.keys(PRIMARY_TRANSLATIONS).length}`);
  console.log(`📊 Alternative translations deactivated: ${deactivatedCount}`);
  console.log();

  if (changes.length > 0) {
    console.log('📝 Changes made:');
    changes.forEach(change => {
      console.log(`   - ${change.word}: "${change.from}" → ${change.to}`);
    });
    console.log();
  }

  // Verify active vocabulary count
  const activeCount = await prisma.practiceVocabulary.count({
    where: { isActive: true },
  });

  const wotdCount = await prisma.practiceVocabulary.count({
    where: { isActive: true, includeInWOTD: true },
  });

  console.log(`✅ Active vocabulary words: ${activeCount} (reduced by ${deactivatedCount})`);
  console.log(`✅ Words in WOTD pool: ${wotdCount}`);
  console.log();
  console.log('💡 NOTE: Deactivated words are preserved in the database for reference.');
  console.log('   They can be reactivated later if needed via the admin panel.');
  console.log();
}

cleanupDuplicates()
  .catch((error) => {
    console.error('❌ Error cleaning up duplicates:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
