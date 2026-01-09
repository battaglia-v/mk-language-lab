/**
 * Seed Script: Lesson 1 Sample Content
 * 
 * This script populates Lesson 1 "Јас и ти" (Me and You) with structured content
 * from the Тешкото textbook, demonstrating the new lesson overhaul features:
 * - Dialogues with speaker labels
 * - Categorized vocabulary
 * - Conjugation tables for grammar
 * - Interactive exercises
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Sample Data for Lesson 1: Јас и ти
// ============================================================================

// Dialogue from the textbook - Влатко meets students at the faculty
const dialogue1 = {
  title: 'Запознавање (Getting to know each other)',
  lines: [
    {
      speaker: 'Влатко',
      textMk: 'Здраво. Јас сум Влатко.',
      textEn: 'Hello. I am Vlatko.',
      transliteration: 'Zdravo. Jas sum Vlatko.',
      hasBlanks: false,
    },
    {
      speaker: 'Ема',
      textMk: 'Еј, здраво. Јас сум Ема.',
      textEn: 'Hey, hello. I am Ema.',
      transliteration: 'Ej, zdravo. Jas sum Ema.',
      hasBlanks: false,
    },
    {
      speaker: 'Влатко',
      textMk: 'Од каде си, Ема?',
      textEn: 'Where are you from, Ema?',
      transliteration: 'Od kade si, Ema?',
      hasBlanks: false,
    },
    {
      speaker: 'Ема',
      textMk: 'Јас сум од Лондон.',
      textEn: 'I am from London.',
      transliteration: 'Jas sum od London.',
      hasBlanks: false,
    },
    {
      speaker: 'Андреј',
      textMk: 'Здраво. Јас сум Андреј. Јас сум студент овде.',
      textEn: 'Hello. I am Andrej. I am a student here.',
      transliteration: 'Zdravo. Jas sum Andrej. Jas sum student ovde.',
      hasBlanks: false,
    },
    {
      speaker: 'Влатко',
      textMk: 'Еј, навистина? Јас сум Влатко.',
      textEn: 'Hey, really? I am Vlatko.',
      transliteration: 'Ej, navistina? Jas sum Vlatko.',
      hasBlanks: false,
    },
  ],
};

// Vocabulary categorized by theme with example sentences
const vocabulary = [
  // Greetings
  { macedonianText: 'здраво', englishText: 'hello', category: 'greetings', partOfSpeech: 'interjection', transliteration: 'zdravo', exampleSentenceMk: 'Здраво, како си?', exampleSentenceEn: 'Hello, how are you?' },
  { macedonianText: 'добар ден', englishText: 'good day', category: 'greetings', partOfSpeech: 'phrase', transliteration: 'dobar den', exampleSentenceMk: 'Добар ден, професоре!', exampleSentenceEn: 'Good day, professor!' },
  { macedonianText: 'како си?', englishText: 'how are you?', category: 'greetings', partOfSpeech: 'phrase', transliteration: 'kako si?', exampleSentenceMk: 'Здраво! Како си денес?', exampleSentenceEn: 'Hello! How are you today?' },
  { macedonianText: 'добро сум', englishText: 'I am good', category: 'greetings', partOfSpeech: 'phrase', transliteration: 'dobro sum', exampleSentenceMk: 'Благодарам, добро сум.', exampleSentenceEn: 'Thank you, I am good.' },
  { macedonianText: 'одлично', englishText: 'excellent', category: 'greetings', partOfSpeech: 'adverb', transliteration: 'odlichno', exampleSentenceMk: 'Денес сум одлично!', exampleSentenceEn: 'Today I am excellent!' },
  
  // Pronouns
  { macedonianText: 'јас', englishText: 'I', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'jas', exampleSentenceMk: 'Јас сум студент.', exampleSentenceEn: 'I am a student.' },
  { macedonianText: 'ти', englishText: 'you (singular)', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'ti', exampleSentenceMk: 'Ти си од Скопје.', exampleSentenceEn: 'You are from Skopje.' },
  { macedonianText: 'тој', englishText: 'he', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'toj', gender: 'masculine', exampleSentenceMk: 'Тој е професор.', exampleSentenceEn: 'He is a professor.' },
  { macedonianText: 'таа', englishText: 'she', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'taa', gender: 'feminine', exampleSentenceMk: 'Таа е студентка.', exampleSentenceEn: 'She is a student.' },
  { macedonianText: 'тоа', englishText: 'it', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'toa', gender: 'neuter', exampleSentenceMk: 'Тоа е убаво.', exampleSentenceEn: 'It is beautiful.' },
  { macedonianText: 'ние', englishText: 'we', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'nie', exampleSentenceMk: 'Ние сме од Македонија.', exampleSentenceEn: 'We are from Macedonia.' },
  { macedonianText: 'вие', englishText: 'you (plural/formal)', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'vie', exampleSentenceMk: 'Вие сте добредојдени.', exampleSentenceEn: 'You are welcome.' },
  { macedonianText: 'тие', englishText: 'they', category: 'pronouns', partOfSpeech: 'pronoun', transliteration: 'tie', exampleSentenceMk: 'Тие се пријатели.', exampleSentenceEn: 'They are friends.' },
  
  // Question words
  { macedonianText: 'што', englishText: 'what', category: 'question words', partOfSpeech: 'pronoun', transliteration: 'shto', exampleSentenceMk: 'Што правиш?', exampleSentenceEn: 'What are you doing?' },
  { macedonianText: 'од каде', englishText: 'from where', category: 'question words', partOfSpeech: 'phrase', transliteration: 'od kade', exampleSentenceMk: 'Од каде си ти?', exampleSentenceEn: 'Where are you from?' },
  { macedonianText: 'како', englishText: 'how', category: 'question words', partOfSpeech: 'adverb', transliteration: 'kako', exampleSentenceMk: 'Како се викаш?', exampleSentenceEn: 'What is your name?' },
  
  // People/Professions
  { macedonianText: 'студент', englishText: 'student (male)', category: 'professions', partOfSpeech: 'noun', transliteration: 'student', gender: 'masculine', exampleSentenceMk: 'Тој е студент на факултет.', exampleSentenceEn: 'He is a student at university.' },
  { macedonianText: 'студентка', englishText: 'student (female)', category: 'professions', partOfSpeech: 'noun', transliteration: 'studentka', gender: 'feminine', exampleSentenceMk: 'Таа е студентка по право.', exampleSentenceEn: 'She is a law student.' },
  { macedonianText: 'професор', englishText: 'professor', category: 'professions', partOfSpeech: 'noun', transliteration: 'profesor', gender: 'masculine', exampleSentenceMk: 'Професорот предава историја.', exampleSentenceEn: 'The professor teaches history.' },
  { macedonianText: 'асистент', englishText: 'assistant', category: 'professions', partOfSpeech: 'noun', transliteration: 'asistent', gender: 'masculine', exampleSentenceMk: 'Асистентот помага.', exampleSentenceEn: 'The assistant is helping.' },
  { macedonianText: 'пријател', englishText: 'friend (male)', category: 'people', partOfSpeech: 'noun', transliteration: 'prijatel', gender: 'masculine', exampleSentenceMk: 'Тој е мој пријател.', exampleSentenceEn: 'He is my friend.' },
  { macedonianText: 'пријателка', englishText: 'friend (female)', category: 'people', partOfSpeech: 'noun', transliteration: 'prijatelka', gender: 'feminine', exampleSentenceMk: 'Таа е моја пријателка.', exampleSentenceEn: 'She is my friend.' },
  
  // Possessives
  { macedonianText: 'мој', englishText: 'my (masculine)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'moj', gender: 'masculine', exampleSentenceMk: 'Мојот пријател е тука.', exampleSentenceEn: 'My friend is here.' },
  { macedonianText: 'моја', englishText: 'my (feminine)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'moja', gender: 'feminine', exampleSentenceMk: 'Мојата сестра е студентка.', exampleSentenceEn: 'My sister is a student.' },
  { macedonianText: 'мое', englishText: 'my (neuter)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'moe', gender: 'neuter', exampleSentenceMk: 'Моето име е Марко.', exampleSentenceEn: 'My name is Marko.' },
  { macedonianText: 'твој', englishText: 'your (masculine)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'tvoj', gender: 'masculine', exampleSentenceMk: 'Твојот татко е добар.', exampleSentenceEn: 'Your father is good.' },
  
  // Other
  { macedonianText: 'овде', englishText: 'here', category: 'adverbs', partOfSpeech: 'adverb', transliteration: 'ovde', exampleSentenceMk: 'Јас сум овде.', exampleSentenceEn: 'I am here.' },
  { macedonianText: 'навистина', englishText: 'really', category: 'adverbs', partOfSpeech: 'adverb', transliteration: 'navistina', exampleSentenceMk: 'Навистина? Тоа е одлично!', exampleSentenceEn: 'Really? That is excellent!' },
  { macedonianText: 'ова', englishText: 'this', category: 'demonstratives', partOfSpeech: 'pronoun', transliteration: 'ova', exampleSentenceMk: 'Ова е мојот универзитет.', exampleSentenceEn: 'This is my university.' },
  { macedonianText: 'е', englishText: 'is', category: 'verbs', partOfSpeech: 'verb', transliteration: 'e', exampleSentenceMk: 'Тој е професор.', exampleSentenceEn: 'He is a professor.' },
];

// Grammar: Verb "сум" (to be) conjugation
const grammarConjugation = {
  title: 'Глаголот "сум" (The verb "to be")',
  explanation: `The verb "сум" (to be) is one of the most important verbs in Macedonian. 
It is used to identify yourself, describe things, and talk about locations. 
Unlike in English, the verb form changes depending on who is doing the action.`,
  examples: [
    'Јас сум студент. - I am a student.',
    'Ти си од Македонија. - You are from Macedonia.',
    'Тој е професор. - He is a professor.',
    'Таа е моја пријателка. - She is my friend.',
    'Ние сме од Скопје. - We are from Skopje.',
  ],
  conjugationTable: {
    verb: 'сум',
    verbEn: 'to be',
    tense: 'present',
    rows: [
      { person: '1sg', pronoun: 'јас', conjugation: 'сум', transliteration: 'sum' },
      { person: '2sg', pronoun: 'ти', conjugation: 'си', transliteration: 'si' },
      { person: '3sg', pronoun: 'тој/таа/тоа', conjugation: 'е', transliteration: 'e' },
      { person: '1pl', pronoun: 'ние', conjugation: 'сме', transliteration: 'sme' },
      { person: '2pl', pronoun: 'вие', conjugation: 'сте', transliteration: 'ste' },
      { person: '3pl', pronoun: 'тие', conjugation: 'се', transliteration: 'se' },
    ],
  },
};

// Exercises
const exercises = [
  {
    type: 'multiple_choice',
    question: 'How do you say "I am" in Macedonian?',
    options: ['јас сум', 'ти си', 'тој е', 'ние сме'],
    correctAnswer: 'A',
    explanation: '"Јас сум" means "I am". "Јас" is "I" and "сум" is the first person singular form of "to be".',
  },
  {
    type: 'fill_blank',
    question: 'Тој ___ студент. (He ___ a student.)',
    options: [],
    correctAnswer: 'е',
    explanation: 'For "he/she/it", we use "е" (is).',
  },
  {
    type: 'multiple_choice',
    question: 'What does "Од каде си?" mean?',
    options: ['How are you?', 'Where are you from?', 'What is your name?', 'Who are you?'],
    correctAnswer: 'B',
    explanation: '"Од каде" means "from where" and "си" means "are you", so together it asks "Where are you from?"',
  },
  {
    type: 'fill_blank',
    question: 'Јас ___ од Скопје. (I ___ from Skopje.)',
    options: [],
    correctAnswer: 'сум',
    explanation: '"Сум" is the first person singular form of "to be", used with "јас" (I).',
  },
  {
    type: 'multiple_choice',
    question: 'How do you say "Hello" in Macedonian?',
    options: ['Како си?', 'Здраво', 'Добро', 'Благодарам'],
    correctAnswer: 'B',
    explanation: '"Здраво" is the common way to say hello in Macedonian.',
  },
  {
    type: 'translation',
    question: 'Translate: "She is a student."',
    options: [],
    correctAnswer: 'Таа е студентка.',
    explanation: '"Таа" means "she", "е" is the third person singular of "to be", and "студентка" is the feminine form of "student".',
  },
];

// ============================================================================
// Seed Function
// ============================================================================

export async function seedLesson1Sample(lessonId: string) {
  console.log('🌱 Seeding Lesson 1 sample content...');

  // Check if lesson exists
  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    console.error(`❌ Lesson with ID ${lessonId} not found`);
    return;
  }

  // Clear existing content for this lesson (optional - for re-running)
  console.log('  Clearing existing content...');
  await prisma.dialogueLine.deleteMany({
    where: { dialogue: { lessonId } },
  });
  await prisma.dialogue.deleteMany({ where: { lessonId } });
  await prisma.conjugationRow.deleteMany({
    where: { table: { grammarNote: { lessonId } } },
  });
  await prisma.conjugationTable.deleteMany({
    where: { grammarNote: { lessonId } },
  });
  await prisma.grammarNote.deleteMany({ where: { lessonId } });
  await prisma.vocabularyItem.deleteMany({ where: { lessonId } });
  await prisma.exercise.deleteMany({ where: { lessonId } });

  // Seed Dialogue
  console.log('  Creating dialogue...');
  const dialogue = await prisma.dialogue.create({
    data: {
      lessonId,
      title: dialogue1.title,
      orderIndex: 0,
      lines: {
        create: dialogue1.lines.map((line, index) => ({
          speaker: line.speaker,
          textMk: line.textMk,
          textEn: line.textEn,
          transliteration: line.transliteration,
          hasBlanks: line.hasBlanks,
          orderIndex: index,
        })),
      },
    },
  });
  console.log(`    ✓ Created dialogue with ${dialogue1.lines.length} lines`);

  // Seed Vocabulary
  console.log('  Creating vocabulary...');
  for (let i = 0; i < vocabulary.length; i++) {
    const item = vocabulary[i];
    await prisma.vocabularyItem.create({
      data: {
        lessonId,
        macedonianText: item.macedonianText,
        englishText: item.englishText,
        category: item.category,
        partOfSpeech: item.partOfSpeech,
        transliteration: item.transliteration,
        gender: item.gender,
        exampleSentenceMk: item.exampleSentenceMk,
        exampleSentenceEn: item.exampleSentenceEn,
        isCore: true,
        orderIndex: i,
      },
    });
  }
  console.log(`    ✓ Created ${vocabulary.length} vocabulary items`);

  // Seed Grammar with Conjugation Table
  console.log('  Creating grammar notes...');
  const grammarNote = await prisma.grammarNote.create({
    data: {
      lessonId,
      title: grammarConjugation.title,
      explanation: grammarConjugation.explanation,
      examples: JSON.stringify(grammarConjugation.examples),
      category: 'verb conjugation',
      relatedVerb: 'сум',
      orderIndex: 0,
      conjugationTables: {
        create: {
          verb: grammarConjugation.conjugationTable.verb,
          verbEn: grammarConjugation.conjugationTable.verbEn,
          tense: grammarConjugation.conjugationTable.tense,
          rows: {
            create: grammarConjugation.conjugationTable.rows.map((row, index) => ({
              person: row.person,
              pronoun: row.pronoun,
              conjugation: row.conjugation,
              transliteration: row.transliteration,
              orderIndex: index,
            })),
          },
        },
      },
    },
  });
  console.log(`    ✓ Created grammar note with conjugation table`);

  // Seed Exercises
  console.log('  Creating exercises...');
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    await prisma.exercise.create({
      data: {
        lessonId,
        type: ex.type,
        question: ex.question,
        options: ex.options.join('|'),
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        orderIndex: i,
      },
    });
  }
  console.log(`    ✓ Created ${exercises.length} exercises`);

  // Update lesson summary if needed
  await prisma.curriculumLesson.update({
    where: { id: lessonId },
    data: {
      summary: 'Јас и ти - Me and You',
    },
  });

  console.log('✅ Lesson 1 sample content seeded successfully!');
  console.log(`
Summary:
- 1 dialogue with ${dialogue1.lines.length} lines
- ${vocabulary.length} vocabulary items (categorized)
- 1 grammar note with conjugation table
- ${exercises.length} exercises
`);
}

// ============================================================================
// CLI Runner
// ============================================================================

async function main() {
  const lessonId = process.argv[2];

  if (!lessonId) {
    console.log('Usage: npx ts-node prisma/seeds/seed-lesson1-sample.ts <lessonId>');
    console.log('\nTo find a lesson ID, run:');
    console.log('  npx prisma studio');
    console.log('\nOr query the database for CurriculumLesson records.');
    process.exit(1);
  }

  try {
    await seedLesson1Sample(lessonId);
  } catch (error) {
    console.error('Error seeding content:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if executed directly
if (require.main === module) {
  main();
}

