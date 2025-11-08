import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to detect part of speech from English translation
function guessPartOfSpeech(english: string, macedonian: string): string {
  const lower = english.toLowerCase();

  // Questions
  if (lower.includes('?') || lower.startsWith('how') || lower.startsWith('what') ||
      lower.startsWith('where') || lower.startsWith('when') || lower.startsWith('who') ||
      lower.startsWith('why')) {
    return 'phrase';
  }

  // Greetings
  if (['hello', 'hi', 'goodbye', 'bye', 'good morning', 'good evening', 'good night',
       'see you', 'welcome', 'thanks', 'thank you', 'please', 'sorry', 'excuse me'].includes(lower)) {
    return 'greeting';
  }

  // Common verbs (infinitive or gerund forms)
  if (lower.startsWith('to ') || lower.endsWith('ing')) {
    return 'verb';
  }

  // Adjectives (common patterns)
  if (['good', 'bad', 'big', 'small', 'hot', 'cold', 'new', 'old', 'young'].some(adj => lower.includes(adj))) {
    return 'adjective';
  }

  // Multi-word expressions
  if (english.split(' ').length > 2 || macedonian.split(' ').length > 2) {
    return 'phrase';
  }

  // Single words are likely nouns
  if (english.split(' ').length === 1 && macedonian.split(' ').length === 1) {
    return 'noun';
  }

  // Default for everything else
  return 'phrase';
}

// Helper to create example sentences
function createExampleSentences(macedonian: string, english: string, partOfSpeech: string): { mk: string; en: string } {
  // If it's already a phrase or question, use it directly
  if (macedonian.includes(' ') || macedonian.includes('?')) {
    return {
      mk: macedonian,
      en: english
    };
  }

  // Otherwise, create simple sentences based on part of speech
  switch (partOfSpeech) {
    case 'greeting':
      return {
        mk: `${macedonian}! Како си?`,
        en: `${english}! How are you?`
      };

    case 'verb':
      return {
        mk: `Јас сакам да ${macedonian}.`,
        en: `I want to ${english}.`
      };

    case 'adjective':
      return {
        mk: `Ова е многу ${macedonian}.`,
        en: `This is very ${english}.`
      };

    case 'noun':
    default:
      return {
        mk: `Ова е ${macedonian}.`,
        en: `This is ${english}.`
      };
  }
}

// Helper to pick an icon based on category/content
function pickIcon(macedonian: string, english: string): string {
  const lower = english.toLowerCase();

  // Greetings
  if (lower.includes('hello') || lower.includes('hi')) return '👋';
  if (lower.includes('morning')) return '🌅';
  if (lower.includes('evening')) return '🌆';
  if (lower.includes('night')) return '🌙';
  if (lower.includes('goodbye') || lower.includes('bye')) return '👋';
  if (lower.includes('thank')) return '🙏';
  if (lower.includes('sorry')) return '😔';
  if (lower.includes('please')) return '🙏';

  // Questions
  if (lower.includes('?')) return '❓';
  if (lower.includes('how')) return '🤔';
  if (lower.includes('what')) return '❓';
  if (lower.includes('where')) return '📍';
  if (lower.includes('when')) return '🕐';

  // Food
  if (lower.includes('food') || lower.includes('eat') || lower.includes('drink') ||
      lower.includes('bread') || lower.includes('water') || lower.includes('coffee')) return '🍽️';

  // Family
  if (lower.includes('mother') || lower.includes('father') || lower.includes('family') ||
      lower.includes('brother') || lower.includes('sister')) return '👨‍👩‍👧‍👦';

  // Numbers
  if (/\d/.test(english) || ['one', 'two', 'three', 'four', 'five'].includes(lower)) return '🔢';

  // Default
  return '📝';
}

async function main() {
  console.log('Populating Word of the Day details for all vocabulary...\n');

  // Get all words that need details
  const words = await prisma.practiceVocabulary.findMany({
    where: {
      includeInWOTD: true,
      OR: [
        { partOfSpeech: null },
        { exampleMk: null },
        { exampleEn: null },
        { pronunciation: null },
        { icon: null },
      ]
    },
  });

  console.log(`Found ${words.length} words needing details`);

  let updated = 0;
  for (const word of words) {
    const partOfSpeech = word.partOfSpeech || guessPartOfSpeech(word.english, word.macedonian);
    const examples = createExampleSentences(word.macedonian, word.english, partOfSpeech);
    const icon = word.icon || pickIcon(word.macedonian, word.english);
    const pronunciation = word.pronunciation || word.macedonian; // Use Cyrillic as default

    await prisma.practiceVocabulary.update({
      where: { id: word.id },
      data: {
        partOfSpeech,
        exampleMk: word.exampleMk || examples.mk,
        exampleEn: word.exampleEn || examples.en,
        pronunciation,
        icon,
      },
    });

    updated++;
    if (updated % 50 === 0) {
      console.log(`  Updated ${updated}/${words.length} words...`);
    }
  }

  console.log(`\n✓ Successfully populated details for ${updated} words`);

  // Show some samples
  console.log('\nSample updated words:');
  const samples = await prisma.practiceVocabulary.findMany({
    take: 3,
    where: { includeInWOTD: true },
    select: {
      macedonian: true,
      english: true,
      partOfSpeech: true,
      exampleMk: true,
      exampleEn: true,
      icon: true,
    },
  });
  console.log(JSON.stringify(samples, null, 2));
}

main()
  .catch((e) => {
    console.error('Error populating WOTD details:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
