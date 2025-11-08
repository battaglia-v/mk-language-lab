import { PrismaClient } from '@prisma/client';

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

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    console.log(`✓ Created tag: ${tag.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
