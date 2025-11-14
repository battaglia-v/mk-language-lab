import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { seedQuests } from './seeds/quests';
import { seedBadges } from './seeds/badges';
import { seedLeagues } from './seeds/leagues';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Default tags for language learning
  const defaultTags = [
    { name: 'Grammar', slug: 'grammar', color: '#10b981', icon: '📚' },
    { name: 'Vocabulary', slug: 'vocabulary', color: '#3b82f6', icon: '📝' },
    { name: 'Pronunciation', slug: 'pronunciation', color: '#f59e0b', icon: '🗣️' },
    { name: 'Culture', slug: 'culture', color: '#8b5cf6', icon: '🏛️' },
    { name: 'Phrases', slug: 'phrases', color: '#ec4899', icon: '💬' },
    { name: 'Verbs', slug: 'verbs', color: '#06b6d4', icon: '⚡' },
    { name: 'Nouns', slug: 'nouns', color: '#6366f1', icon: '🏷️' },
    { name: 'Numbers', slug: 'numbers', color: '#f97316', icon: '🔢' },
    { name: 'Food & Drink', slug: 'food-drink', color: '#84cc16', icon: '🍽️' },
    { name: 'Travel', slug: 'travel', color: '#14b8a6', icon: '✈️' },
    { name: 'Family', slug: 'family', color: '#f43f5e', icon: '👨‍👩‍👧‍👦' },
    { name: 'Daily Life', slug: 'daily-life', color: '#a855f7', icon: '🏠' },
  ];

  console.log('Seeding tags...');
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    console.log(`✓ Created tag: ${tag.name}`);
  }

  // Load and seed practice vocabulary from JSON file
  console.log('\nSeeding practice vocabulary...');
  const vocabPath = join(process.cwd(), 'data', 'practice-vocabulary.json');
  const vocabData = JSON.parse(readFileSync(vocabPath, 'utf-8'));

  // Clear existing practice vocabulary
  const existingCount = await prisma.practiceVocabulary.count();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing vocabulary entries. Skipping seed to preserve any edits.`);
    console.log('To re-seed, delete all entries from PracticeVocabulary table first.');
  } else {
    let createdCount = 0;
    for (const item of vocabData) {
      await prisma.practiceVocabulary.create({
        data: {
          macedonian: item.macedonian,
          english: item.english,
          category: item.category || null,
          difficulty: 'beginner', // Default difficulty for existing words
          isActive: true,
        },
      });
      createdCount++;
    }
    console.log(`✓ Created ${createdCount} practice vocabulary entries`);
  }

  // Load and seed Word of the Day from JSON file
  console.log('\nSeeding Word of the Day...');
  const wotdPath = join(process.cwd(), 'data', 'word-of-the-day.json');
  const wotdData = JSON.parse(readFileSync(wotdPath, 'utf-8'));

  const existingWotdCount = await prisma.wordOfTheDay.count();
  if (existingWotdCount > 0) {
    console.log(`Found ${existingWotdCount} existing Word of the Day entries. Skipping seed to preserve any edits.`);
    console.log('To re-seed, delete all entries from WordOfTheDay table first.');
  } else {
    let wotdCreatedCount = 0;
    for (const item of wotdData) {
      await prisma.wordOfTheDay.create({
        data: {
          macedonian: item.macedonian,
          pronunciation: item.pronunciation,
          english: item.english,
          partOfSpeech: item.partOfSpeech,
          exampleMk: item.exampleMk,
          exampleEn: item.exampleEn,
          icon: item.icon,
          scheduledDate: new Date(item.scheduledDate),
          isActive: true,
        },
      });
      wotdCreatedCount++;
    }
    console.log(`✓ Created ${wotdCreatedCount} Word of the Day entries`);
  }

  // Seed gamification data
  console.log('\n--- Gamification Data ---');
  await seedQuests();
  await seedBadges();
  await seedLeagues();

  console.log('\nSeeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
