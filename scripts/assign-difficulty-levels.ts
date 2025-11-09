/**
 * Script to assign difficulty levels to vocabulary words
 *
 * Strategy:
 * - BEGINNER: High-frequency daily words, greetings, numbers, basic family
 * - INTERMEDIATE: Work vocabulary, emotions, complex grammar, phrases
 * - ADVANCED: Formal language, cultural nuances, specialized terms
 *
 * Target distribution: 60% beginner, 30% intermediate, 10% advanced
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category-based difficulty mapping
const CATEGORY_DIFFICULTY: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  // Beginner categories (60% of content)
  'greetings': 'beginner',
  'numbers': 'beginner',
  'time': 'beginner',
  'politeness': 'beginner',
  'colors': 'beginner',
  'weather': 'beginner',

  // Mixed beginner/intermediate (context-dependent)
  'family': 'beginner',        // Most family words are beginner
  'food': 'beginner',           // Common foods are beginner
  'health': 'beginner',         // Basic body parts are beginner
  'activities': 'intermediate', // Daily activities vary
  'emotions': 'intermediate',   // Emotions can be complex

  // Intermediate categories
  'shopping': 'intermediate',
  'travel': 'intermediate',
  'transport': 'intermediate',
  'places': 'intermediate',
  'nature': 'intermediate',
  'questions': 'intermediate',

  // Advanced categories
  'work': 'advanced',
  'culture': 'advanced',
  'daily life': 'intermediate',
  'people': 'intermediate',
};

// Specific beginner words (high-frequency essentials)
const BEGINNER_WORDS = new Set([
  'здраво', 'добро утро', 'добра вечер', 'добар ден', 'добра ноќ',
  'благодарам', 'извинете', 'да', 'не', 'те молам',
  'мајка', 'татко', 'син', 'ќерка', 'брат', 'сестра',
  'јас', 'ти', 'тој', 'таа', 'ние', 'вие', 'тие',
  'еден', 'два', 'три', 'денес', 'утре', 'вчера',
  'вода', 'леб', 'млеко', 'сок',
]);

// Advanced indicators (complex grammar or formal usage)
const ADVANCED_INDICATORS = [
  'formal', 'polite form', 'literary', 'official',
  'workplace', 'professional', 'ceremony', 'tradition',
];

async function assignDifficultyLevels() {
  console.log('📊 Starting difficulty level assignment...\n');

  // Get all active vocabulary
  const allVocab = await prisma.practiceVocabulary.findMany({
    where: { isActive: true },
    select: {
      id: true,
      macedonian: true,
      english: true,
      category: true,
      difficulty: true,
      partOfSpeech: true,
      usageContext: true,
    },
  });

  console.log(`📚 Found ${allVocab.length} active vocabulary words\n`);

  const updates: Array<{
    id: string;
    macedonian: string;
    english: string;
    oldDifficulty: string;
    newDifficulty: 'beginner' | 'intermediate' | 'advanced';
    reason: string;
  }> = [];

  // Classify each word
  for (const word of allVocab) {
    let newDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    let reason = '';

    const macedonianLower = word.macedonian.toLowerCase().trim();
    const categoryLower = (word.category || '').toLowerCase();
    const contextLower = (word.usageContext || '').toLowerCase();

    // Rule 1: Explicit beginner words (high-frequency essentials)
    if (BEGINNER_WORDS.has(macedonianLower)) {
      newDifficulty = 'beginner';
      reason = 'High-frequency essential word';
    }
    // Rule 2: Check for advanced indicators in context
    else if (ADVANCED_INDICATORS.some(indicator => contextLower.includes(indicator))) {
      newDifficulty = 'advanced';
      reason = 'Formal or specialized usage';
    }
    // Rule 3: Category-based classification
    else if (CATEGORY_DIFFICULTY[categoryLower]) {
      const categoryDifficulty = CATEGORY_DIFFICULTY[categoryLower];

      // Special handling for mixed categories
      if (categoryLower === 'family') {
        // Core family members are beginner, extended family is intermediate
        const basicFamily = ['мајка', 'татко', 'син', 'ќерка', 'брат', 'сестра',
                             'баба', 'дедо', 'мама', 'тато'];
        newDifficulty = basicFamily.some(w => macedonianLower.includes(w))
          ? 'beginner' : 'intermediate';
        reason = newDifficulty === 'beginner' ? 'Core family member' : 'Extended family';
      }
      else if (categoryLower === 'food') {
        // Basic foods are beginner, specific dishes are intermediate
        const basicFood = ['вода', 'леб', 'млеко', 'сок', 'месо', 'риба',
                           'јајце', 'сирење', 'овошје', 'зеленчук'];
        newDifficulty = basicFood.some(w => macedonianLower.includes(w))
          ? 'beginner' : 'intermediate';
        reason = newDifficulty === 'beginner' ? 'Basic food item' : 'Specific food/dish';
      }
      else if (categoryLower === 'health') {
        // Basic body parts are beginner, medical terms are intermediate/advanced
        const basicBody = ['глава', 'рака', 'нога', 'око', 'уво', 'нос', 'уста'];
        const medicalTerms = ['болен', 'здрав', 'болница', 'доктор', 'лек'];

        if (basicBody.some(w => macedonianLower.includes(w))) {
          newDifficulty = 'beginner';
          reason = 'Basic body part';
        } else if (medicalTerms.some(w => macedonianLower.includes(w))) {
          newDifficulty = 'intermediate';
          reason = 'Medical/health term';
        } else {
          newDifficulty = 'intermediate';
          reason = 'Health-related vocabulary';
        }
      }
      else if (categoryLower === 'activities') {
        // Simple activities (I eat, I sleep) are beginner
        // Complex activities are intermediate
        const simpleActivities = ['јадам', 'пијам', 'спијам', 'одам', 'дојдам', 'седам'];
        newDifficulty = simpleActivities.some(w => macedonianLower.includes(w))
          ? 'beginner' : 'intermediate';
        reason = newDifficulty === 'beginner' ? 'Basic daily activity' : 'Complex activity';
      }
      else {
        newDifficulty = categoryDifficulty;
        reason = `Category: ${categoryLower}`;
      }
    }
    // Rule 4: Phrase complexity (longer phrases are generally harder)
    else if (word.macedonian.split(' ').length >= 4) {
      newDifficulty = 'intermediate';
      reason = 'Complex phrase (4+ words)';
    }
    // Rule 5: Default based on part of speech
    else {
      const partOfSpeech = (word.partOfSpeech || '').toLowerCase();
      if (['greeting', 'interjection'].includes(partOfSpeech)) {
        newDifficulty = 'beginner';
        reason = 'Basic expression';
      } else {
        newDifficulty = 'intermediate';
        reason = 'Default classification';
      }
    }

    // Record if difficulty changed
    if (word.difficulty !== newDifficulty) {
      updates.push({
        id: word.id,
        macedonian: word.macedonian,
        english: word.english,
        oldDifficulty: word.difficulty,
        newDifficulty,
        reason,
      });
    }
  }

  console.log(`📝 Identified ${updates.length} words needing difficulty updates\n`);

  if (updates.length === 0) {
    console.log('✅ All words already have correct difficulty levels!\n');
    return;
  }

  // Show sample of changes
  console.log('📋 Sample changes (first 10):');
  updates.slice(0, 10).forEach(update => {
    console.log(`   ${update.macedonian} (${update.english})`);
    console.log(`     ${update.oldDifficulty} → ${update.newDifficulty} (${update.reason})`);
  });
  console.log();

  // Apply updates in batches
  console.log('🔄 Applying difficulty level updates...\n');

  let updatedCount = 0;
  for (const update of updates) {
    await prisma.practiceVocabulary.update({
      where: { id: update.id },
      data: { difficulty: update.newDifficulty },
    });
    updatedCount++;
  }

  console.log(`✅ Updated ${updatedCount} vocabulary words\n`);

  // Final statistics
  const stats = await Promise.all([
    prisma.practiceVocabulary.count({ where: { isActive: true, difficulty: 'beginner' } }),
    prisma.practiceVocabulary.count({ where: { isActive: true, difficulty: 'intermediate' } }),
    prisma.practiceVocabulary.count({ where: { isActive: true, difficulty: 'advanced' } }),
  ]);

  const [beginnerCount, intermediateCount, advancedCount] = stats;
  const total = beginnerCount + intermediateCount + advancedCount;

  console.log('=' .repeat(80));
  console.log('DIFFICULTY DISTRIBUTION');
  console.log('='.repeat(80));
  console.log();
  console.log(`📊 Beginner:      ${beginnerCount} words (${((beginnerCount / total) * 100).toFixed(1)}%)`);
  console.log(`📊 Intermediate:  ${intermediateCount} words (${((intermediateCount / total) * 100).toFixed(1)}%)`);
  console.log(`📊 Advanced:      ${advancedCount} words (${((advancedCount / total) * 100).toFixed(1)}%)`);
  console.log(`📊 Total Active:  ${total} words`);
  console.log();

  console.log('✨ Difficulty levels assigned successfully!');
  console.log('💡 Learners can now filter by difficulty in practice exercises.\n');
}

assignDifficultyLevels()
  .catch((error) => {
    console.error('❌ Error assigning difficulty levels:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
