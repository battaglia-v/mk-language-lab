/**
 * Seed Script: Lesson 2 - Семејство (Family)
 * 
 * This script populates Lesson 2 with structured content about family members,
 * possessive pronouns, and descriptions.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Sample Data for Lesson 2: Семејство (Family)
// ============================================================================

// Dialogue about introducing family
const dialogue1 = {
  title: 'Мојата фамилија (My family)',
  lines: [
    {
      speaker: 'Марко',
      textMk: 'Ова е мојата фамилија.',
      textEn: 'This is my family.',
      transliteration: 'Ova e mojata familija.',
      hasBlanks: false,
    },
    {
      speaker: 'Ана',
      textMk: 'Колку членови има?',
      textEn: 'How many members does it have?',
      transliteration: 'Kolku chlenovi ima?',
      hasBlanks: false,
    },
    {
      speaker: 'Марко',
      textMk: 'Имам мајка, татко, брат и сестра.',
      textEn: 'I have a mother, father, brother and sister.',
      transliteration: 'Imam majka, tatko, brat i sestra.',
      hasBlanks: false,
    },
    {
      speaker: 'Ана',
      textMk: 'А баба и дедо?',
      textEn: 'And grandma and grandpa?',
      transliteration: 'A baba i dedo?',
      hasBlanks: false,
    },
    {
      speaker: 'Марко',
      textMk: 'Да, имам и баба и дедо. Тие живеат во Охрид.',
      textEn: 'Yes, I have grandma and grandpa too. They live in Ohrid.',
      transliteration: 'Da, imam i baba i dedo. Tie zhiveat vo Ohrid.',
      hasBlanks: false,
    },
    {
      speaker: 'Ана',
      textMk: 'Каква убава фамилија!',
      textEn: 'What a beautiful family!',
      transliteration: 'Kakva ubava familija!',
      hasBlanks: false,
    },
  ],
};

// Family vocabulary with example sentences
const vocabulary = [
  // Core family members
  { macedonianText: 'семејство', englishText: 'family', category: 'family', partOfSpeech: 'noun', transliteration: 'semejstvo', gender: 'neuter', exampleSentenceMk: 'Моето семејство е големо.', exampleSentenceEn: 'My family is big.' },
  { macedonianText: 'фамилија', englishText: 'family', category: 'family', partOfSpeech: 'noun', transliteration: 'familija', gender: 'feminine', exampleSentenceMk: 'Ова е мојата фамилија.', exampleSentenceEn: 'This is my family.' },
  { macedonianText: 'мајка', englishText: 'mother', category: 'family', partOfSpeech: 'noun', transliteration: 'majka', gender: 'feminine', exampleSentenceMk: 'Мојата мајка е добра.', exampleSentenceEn: 'My mother is kind.' },
  { macedonianText: 'татко', englishText: 'father', category: 'family', partOfSpeech: 'noun', transliteration: 'tatko', gender: 'masculine', exampleSentenceMk: 'Мојот татко работи.', exampleSentenceEn: 'My father works.' },
  { macedonianText: 'брат', englishText: 'brother', category: 'family', partOfSpeech: 'noun', transliteration: 'brat', gender: 'masculine', exampleSentenceMk: 'Имам еден брат.', exampleSentenceEn: 'I have one brother.' },
  { macedonianText: 'сестра', englishText: 'sister', category: 'family', partOfSpeech: 'noun', transliteration: 'sestra', gender: 'feminine', exampleSentenceMk: 'Мојата сестра е студентка.', exampleSentenceEn: 'My sister is a student.' },
  { macedonianText: 'баба', englishText: 'grandmother', category: 'family', partOfSpeech: 'noun', transliteration: 'baba', gender: 'feminine', exampleSentenceMk: 'Баба ми готви вкусно.', exampleSentenceEn: 'My grandma cooks deliciously.' },
  { macedonianText: 'дедо', englishText: 'grandfather', category: 'family', partOfSpeech: 'noun', transliteration: 'dedo', gender: 'masculine', exampleSentenceMk: 'Дедо ми раскажува приказни.', exampleSentenceEn: 'My grandpa tells stories.' },
  { macedonianText: 'син', englishText: 'son', category: 'family', partOfSpeech: 'noun', transliteration: 'sin', gender: 'masculine', exampleSentenceMk: 'Нивниот син е мал.', exampleSentenceEn: 'Their son is small.' },
  { macedonianText: 'ќерка', englishText: 'daughter', category: 'family', partOfSpeech: 'noun', transliteration: 'kjerka', gender: 'feminine', exampleSentenceMk: 'Нејзината ќерка е убава.', exampleSentenceEn: 'Her daughter is beautiful.' },
  { macedonianText: 'сопруг', englishText: 'husband', category: 'family', partOfSpeech: 'noun', transliteration: 'soprug', gender: 'masculine', exampleSentenceMk: 'Нејзиниот сопруг е добар.', exampleSentenceEn: 'Her husband is good.' },
  { macedonianText: 'сопруга', englishText: 'wife', category: 'family', partOfSpeech: 'noun', transliteration: 'sopruga', gender: 'feminine', exampleSentenceMk: 'Неговата сопруга е наставничка.', exampleSentenceEn: 'His wife is a teacher.' },
  { macedonianText: 'дете', englishText: 'child', category: 'family', partOfSpeech: 'noun', transliteration: 'dete', gender: 'neuter', exampleSentenceMk: 'Детето игра.', exampleSentenceEn: 'The child is playing.' },
  { macedonianText: 'деца', englishText: 'children', category: 'family', partOfSpeech: 'noun', transliteration: 'deca', gender: 'plural', exampleSentenceMk: 'Децата се среќни.', exampleSentenceEn: 'The children are happy.' },
  
  // Extended family
  { macedonianText: 'вујко', englishText: 'uncle (mother\'s brother)', category: 'family', partOfSpeech: 'noun', transliteration: 'vujko', gender: 'masculine', exampleSentenceMk: 'Вујко ми живее во Битола.', exampleSentenceEn: 'My uncle lives in Bitola.' },
  { macedonianText: 'чичко', englishText: 'uncle (father\'s brother)', category: 'family', partOfSpeech: 'noun', transliteration: 'chichko', gender: 'masculine', exampleSentenceMk: 'Чичко ми е доктор.', exampleSentenceEn: 'My uncle is a doctor.' },
  { macedonianText: 'тетка', englishText: 'aunt', category: 'family', partOfSpeech: 'noun', transliteration: 'tetka', gender: 'feminine', exampleSentenceMk: 'Тетка ми има два сина.', exampleSentenceEn: 'My aunt has two sons.' },
  { macedonianText: 'братучед', englishText: 'cousin (male)', category: 'family', partOfSpeech: 'noun', transliteration: 'bratuched', gender: 'masculine', exampleSentenceMk: 'Мојот братучед е висок.', exampleSentenceEn: 'My cousin is tall.' },
  { macedonianText: 'братучетка', englishText: 'cousin (female)', category: 'family', partOfSpeech: 'noun', transliteration: 'bratuchetka', gender: 'feminine', exampleSentenceMk: 'Мојата братучетка учи англиски.', exampleSentenceEn: 'My cousin is learning English.' },
  
  // Possessives (definite forms)
  { macedonianText: 'мојот', englishText: 'my (masc. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'mojot', gender: 'masculine', exampleSentenceMk: 'Мојот татко е добар.', exampleSentenceEn: 'My father is good.' },
  { macedonianText: 'мојата', englishText: 'my (fem. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'mojata', gender: 'feminine', exampleSentenceMk: 'Мојата мајка готви.', exampleSentenceEn: 'My mother is cooking.' },
  { macedonianText: 'моето', englishText: 'my (neut. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'moeto', gender: 'neuter', exampleSentenceMk: 'Моето дете спие.', exampleSentenceEn: 'My child is sleeping.' },
  { macedonianText: 'твојот', englishText: 'your (masc. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'tvojot', gender: 'masculine', exampleSentenceMk: 'Твојот брат е тука.', exampleSentenceEn: 'Your brother is here.' },
  { macedonianText: 'твојата', englishText: 'your (fem. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'tvojata', gender: 'feminine', exampleSentenceMk: 'Твојата сестра е убава.', exampleSentenceEn: 'Your sister is beautiful.' },
  { macedonianText: 'неговиот', englishText: 'his (masc. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'negoviot', gender: 'masculine', exampleSentenceMk: 'Неговиот татко е наставник.', exampleSentenceEn: 'His father is a teacher.' },
  { macedonianText: 'нејзиниот', englishText: 'her (masc. def.)', category: 'possessives', partOfSpeech: 'pronoun', transliteration: 'nejziniot', gender: 'masculine', exampleSentenceMk: 'Нејзиниот брат е студент.', exampleSentenceEn: 'Her brother is a student.' },
  
  // Verbs
  { macedonianText: 'имам', englishText: 'I have', category: 'verbs', partOfSpeech: 'verb', transliteration: 'imam', exampleSentenceMk: 'Имам голема фамилија.', exampleSentenceEn: 'I have a big family.' },
  { macedonianText: 'живеам', englishText: 'I live', category: 'verbs', partOfSpeech: 'verb', transliteration: 'zhiveam', exampleSentenceMk: 'Живеам во Скопје.', exampleSentenceEn: 'I live in Skopje.' },
  { macedonianText: 'сакам', englishText: 'I love/want', category: 'verbs', partOfSpeech: 'verb', transliteration: 'sakam', exampleSentenceMk: 'Ја сакам мојата фамилија.', exampleSentenceEn: 'I love my family.' },
  
  // Descriptive
  { macedonianText: 'убав', englishText: 'beautiful (masc.)', category: 'adjectives', partOfSpeech: 'adjective', transliteration: 'ubav', gender: 'masculine', exampleSentenceMk: 'Тој е убав човек.', exampleSentenceEn: 'He is a beautiful person.' },
  { macedonianText: 'убава', englishText: 'beautiful (fem.)', category: 'adjectives', partOfSpeech: 'adjective', transliteration: 'ubava', gender: 'feminine', exampleSentenceMk: 'Таа е убава жена.', exampleSentenceEn: 'She is a beautiful woman.' },
  { macedonianText: 'голем', englishText: 'big (masc.)', category: 'adjectives', partOfSpeech: 'adjective', transliteration: 'golem', gender: 'masculine', exampleSentenceMk: 'Имаме голем дом.', exampleSentenceEn: 'We have a big home.' },
  { macedonianText: 'мал', englishText: 'small (masc.)', category: 'adjectives', partOfSpeech: 'adjective', transliteration: 'mal', gender: 'masculine', exampleSentenceMk: 'Тоа е мал стан.', exampleSentenceEn: 'That is a small apartment.' },
];

// Grammar: Verb "имам" (to have) conjugation
const grammarConjugation = {
  title: 'Глаголот "имам" (The verb "to have")',
  explanation: `The verb "имам" (to have) is essential for talking about possessions and family members. 
It follows a regular conjugation pattern. Notice how it changes based on the person.`,
  examples: [
    'Јас имам брат. - I have a brother.',
    'Ти имаш сестра. - You have a sister.',
    'Тој има голема фамилија. - He has a big family.',
    'Ние имаме баба и дедо. - We have grandma and grandpa.',
  ],
  conjugationTable: {
    verb: 'имам',
    verbEn: 'to have',
    tense: 'present',
    rows: [
      { person: '1sg', pronoun: 'јас', conjugation: 'имам', transliteration: 'imam' },
      { person: '2sg', pronoun: 'ти', conjugation: 'имаш', transliteration: 'imash' },
      { person: '3sg', pronoun: 'тој/таа/тоа', conjugation: 'има', transliteration: 'ima' },
      { person: '1pl', pronoun: 'ние', conjugation: 'имаме', transliteration: 'imame' },
      { person: '2pl', pronoun: 'вие', conjugation: 'имате', transliteration: 'imate' },
      { person: '3pl', pronoun: 'тие', conjugation: 'имаат', transliteration: 'imaat' },
    ],
  },
};

// Exercises
const exercises = [
  {
    type: 'multiple_choice',
    question: 'How do you say "mother" in Macedonian?',
    options: ['татко', 'мајка', 'баба', 'сестра'],
    correctAnswer: 'B',
    explanation: '"Мајка" means "mother". "Татко" is father, "баба" is grandmother, and "сестра" is sister.',
  },
  {
    type: 'fill_blank',
    question: 'Јас ___ брат и сестра. (I ___ a brother and sister.)',
    options: [],
    correctAnswer: 'имам',
    explanation: '"Имам" is the first person singular form of "to have", used with "јас" (I).',
  },
  {
    type: 'multiple_choice',
    question: 'What is the correct possessive for "my mother" (мојата мајка)?',
    options: ['мојот', 'мојата', 'моето', 'мои'],
    correctAnswer: 'B',
    explanation: '"Мајка" is feminine, so we use "мојата" (my, feminine definite form).',
  },
  {
    type: 'translation',
    question: 'Translate: "This is my family."',
    options: [],
    correctAnswer: 'Ова е мојата фамилија.',
    explanation: '"Ова" = this, "е" = is, "мојата" = my (fem.), "фамилија" = family.',
  },
  {
    type: 'fill_blank',
    question: 'Тие ___ во Скопје. (They ___ in Skopje.)',
    options: [],
    correctAnswer: 'живеат',
    explanation: '"Живеат" is the third person plural form of "живеам" (to live).',
  },
  {
    type: 'multiple_choice',
    question: 'Which word means "children"?',
    options: ['дете', 'деца', 'син', 'ќерка'],
    correctAnswer: 'B',
    explanation: '"Деца" is the plural of "дете" (child). "Син" is son and "ќерка" is daughter.',
  },
];

// ============================================================================
// Seed Function
// ============================================================================

export async function seedLesson2Semejstvo(lessonId: string) {
  console.log('🌱 Seeding Lesson 2: Семејство...');

  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    console.error(`❌ Lesson with ID ${lessonId} not found`);
    return;
  }

  // Clear existing content
  console.log('  Clearing existing content...');
  await prisma.dialogueLine.deleteMany({ where: { dialogue: { lessonId } } });
  await prisma.dialogue.deleteMany({ where: { lessonId } });
  await prisma.conjugationRow.deleteMany({ where: { table: { grammarNoteId: { in: (await prisma.grammarNote.findMany({ where: { lessonId }, select: { id: true } })).map(g => g.id) } } } });
  await prisma.conjugationTable.deleteMany({ where: { grammarNoteId: { in: (await prisma.grammarNote.findMany({ where: { lessonId }, select: { id: true } })).map(g => g.id) } } });
  await prisma.grammarNote.deleteMany({ where: { lessonId } });
  await prisma.vocabularyItem.deleteMany({ where: { lessonId } });
  await prisma.exercise.deleteMany({ where: { lessonId } });

  // Seed Dialogue
  console.log('  Creating dialogue...');
  await prisma.dialogue.create({
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

  // Seed Grammar
  console.log('  Creating grammar notes...');
  await prisma.grammarNote.create({
    data: {
      lessonId,
      title: grammarConjugation.title,
      explanation: grammarConjugation.explanation,
      examples: JSON.stringify(grammarConjugation.examples),
      category: 'verb conjugation',
      relatedVerb: 'имам',
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

  // Update lesson summary
  await prisma.curriculumLesson.update({
    where: { id: lessonId },
    data: { summary: 'Семејство - Family' },
  });

  console.log('✅ Lesson 2: Семејство seeded successfully!');
}

// CLI Runner
async function main() {
  const lessonId = process.argv[2];
  if (!lessonId) {
    console.log('Usage: npx tsx prisma/seeds/seed-lesson2-semejstvo.ts <lessonId>');
    process.exit(1);
  }
  try {
    await seedLesson2Semejstvo(lessonId);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

