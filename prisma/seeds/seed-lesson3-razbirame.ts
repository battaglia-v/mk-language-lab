/**
 * Seed Script: Lesson 3 - Дали се разбираме? (Do we understand each other?)
 * 
 * This script populates Lesson 3 with content about basic communication,
 * questions, understanding and classroom phrases.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Sample Data for Lesson 3: Communication Basics
// ============================================================================

// Dialogue about understanding
const dialogue1 = {
  title: 'Во училница (In the classroom)',
  lines: [
    {
      speaker: 'Наставник',
      textMk: 'Добро утро! Дали сте спремни за часот?',
      textEn: 'Good morning! Are you ready for class?',
      transliteration: 'Dobro utro! Dali ste spremni za chasot?',
      hasBlanks: false,
    },
    {
      speaker: 'Студенти',
      textMk: 'Да, спремни сме!',
      textEn: 'Yes, we are ready!',
      transliteration: 'Da, spremni sme!',
      hasBlanks: false,
    },
    {
      speaker: 'Наставник',
      textMk: 'Отворете ги книгите на страница десет.',
      textEn: 'Open your books to page ten.',
      transliteration: 'Otvorete gi knigite na stranica deset.',
      hasBlanks: false,
    },
    {
      speaker: 'Марија',
      textMk: 'Извинете, не разбирам. Може ли да повторите?',
      textEn: 'Excuse me, I don\'t understand. Can you repeat?',
      transliteration: 'Izvinete, ne razbiram. Mozhe li da povtorite?',
      hasBlanks: false,
    },
    {
      speaker: 'Наставник',
      textMk: 'Секако! Страница десет. Дали сега разбираш?',
      textEn: 'Of course! Page ten. Do you understand now?',
      transliteration: 'Sekako! Stranica deset. Dali sega razbirash?',
      hasBlanks: false,
    },
    {
      speaker: 'Марија',
      textMk: 'Да, благодарам!',
      textEn: 'Yes, thank you!',
      transliteration: 'Da, blagodaram!',
      hasBlanks: false,
    },
    {
      speaker: 'Наставник',
      textMk: 'Може ли некој да прочита?',
      textEn: 'Can someone read?',
      transliteration: 'Mozhe li nekoj da prochita?',
      hasBlanks: false,
    },
  ],
};

// Dialogue 2: Asking for help
const dialogue2 = {
  title: 'Барање помош (Asking for help)',
  lines: [
    {
      speaker: 'Петар',
      textMk: 'Што значи "книга"?',
      textEn: 'What does "book" mean?',
      transliteration: 'Shto znachi "kniga"?',
      hasBlanks: false,
    },
    {
      speaker: 'Ана',
      textMk: '"Книга" значи "book" на англиски.',
      textEn: '"Книга" means "book" in English.',
      transliteration: '"Kniga" znachi "book" na angliski.',
      hasBlanks: false,
    },
    {
      speaker: 'Петар',
      textMk: 'А како се вели "pen"?',
      textEn: 'And how do you say "pen"?',
      transliteration: 'A kako se veli "pen"?',
      hasBlanks: false,
    },
    {
      speaker: 'Ана',
      textMk: '"Pen" се вели "пенкало".',
      textEn: '"Pen" is called "пенкало".',
      transliteration: '"Pen" se veli "penkalo".',
      hasBlanks: false,
    },
    {
      speaker: 'Петар',
      textMk: 'Благодарам многу! Сега разбирам.',
      textEn: 'Thank you very much! Now I understand.',
      transliteration: 'Blagodaram mnogu! Sega razbiram.',
      hasBlanks: false,
    },
  ],
};

// Communication vocabulary with example sentences
const vocabulary = [
  // Question words
  { macedonianText: 'што', englishText: 'what', category: 'question-words', partOfSpeech: 'pronoun', transliteration: 'shto', exampleSentenceMk: 'Што значи "книга"?', exampleSentenceEn: 'What does "book" mean?' },
  { macedonianText: 'како', englishText: 'how', category: 'question-words', partOfSpeech: 'adverb', transliteration: 'kako', exampleSentenceMk: 'Како се вели на македонски?', exampleSentenceEn: 'How do you say it in Macedonian?' },
  { macedonianText: 'зошто', englishText: 'why', category: 'question-words', partOfSpeech: 'adverb', transliteration: 'zoshto', exampleSentenceMk: 'Зошто учиш македонски?', exampleSentenceEn: 'Why are you learning Macedonian?' },
  { macedonianText: 'каде', englishText: 'where', category: 'question-words', partOfSpeech: 'adverb', transliteration: 'kade', exampleSentenceMk: 'Каде е книгата?', exampleSentenceEn: 'Where is the book?' },
  { macedonianText: 'кога', englishText: 'when', category: 'question-words', partOfSpeech: 'adverb', transliteration: 'koga', exampleSentenceMk: 'Кога е часот?', exampleSentenceEn: 'When is the class?' },
  { macedonianText: 'кој', englishText: 'who (masc.)', category: 'question-words', partOfSpeech: 'pronoun', transliteration: 'koj', gender: 'masculine', exampleSentenceMk: 'Кој е наставникот?', exampleSentenceEn: 'Who is the teacher?' },
  { macedonianText: 'која', englishText: 'who (fem.)', category: 'question-words', partOfSpeech: 'pronoun', transliteration: 'koja', gender: 'feminine', exampleSentenceMk: 'Која е таа?', exampleSentenceEn: 'Who is she?' },
  { macedonianText: 'дали', englishText: 'whether/do (question particle)', category: 'question-words', partOfSpeech: 'particle', transliteration: 'dali', exampleSentenceMk: 'Дали разбираш?', exampleSentenceEn: 'Do you understand?' },
  
  // Classroom words
  { macedonianText: 'книга', englishText: 'book', category: 'classroom', partOfSpeech: 'noun', transliteration: 'kniga', gender: 'feminine', exampleSentenceMk: 'Отворете ја книгата.', exampleSentenceEn: 'Open the book.' },
  { macedonianText: 'пенкало', englishText: 'pen', category: 'classroom', partOfSpeech: 'noun', transliteration: 'penkalo', gender: 'neuter', exampleSentenceMk: 'Имам сино пенкало.', exampleSentenceEn: 'I have a blue pen.' },
  { macedonianText: 'молив', englishText: 'pencil', category: 'classroom', partOfSpeech: 'noun', transliteration: 'moliv', gender: 'masculine', exampleSentenceMk: 'Каде е моливот?', exampleSentenceEn: 'Where is the pencil?' },
  { macedonianText: 'тетратка', englishText: 'notebook', category: 'classroom', partOfSpeech: 'noun', transliteration: 'tetratka', gender: 'feminine', exampleSentenceMk: 'Пишувам во тетратка.', exampleSentenceEn: 'I write in a notebook.' },
  { macedonianText: 'страница', englishText: 'page', category: 'classroom', partOfSpeech: 'noun', transliteration: 'stranica', gender: 'feminine', exampleSentenceMk: 'Страница десет, ве молам.', exampleSentenceEn: 'Page ten, please.' },
  { macedonianText: 'час', englishText: 'class/hour', category: 'classroom', partOfSpeech: 'noun', transliteration: 'chas', gender: 'masculine', exampleSentenceMk: 'Часот почнува сега.', exampleSentenceEn: 'The class starts now.' },
  { macedonianText: 'наставник', englishText: 'teacher (male)', category: 'classroom', partOfSpeech: 'noun', transliteration: 'nastavnik', gender: 'masculine', exampleSentenceMk: 'Наставникот е добар.', exampleSentenceEn: 'The teacher is good.' },
  { macedonianText: 'наставничка', englishText: 'teacher (female)', category: 'classroom', partOfSpeech: 'noun', transliteration: 'nastavnichka', gender: 'feminine', exampleSentenceMk: 'Наставничката објаснува.', exampleSentenceEn: 'The teacher is explaining.' },
  { macedonianText: 'студент', englishText: 'student (male)', category: 'classroom', partOfSpeech: 'noun', transliteration: 'student', gender: 'masculine', exampleSentenceMk: 'Студентот учи.', exampleSentenceEn: 'The student is studying.' },
  { macedonianText: 'студентка', englishText: 'student (female)', category: 'classroom', partOfSpeech: 'noun', transliteration: 'studentka', gender: 'feminine', exampleSentenceMk: 'Студентката чита.', exampleSentenceEn: 'The student is reading.' },
  
  // Useful phrases
  { macedonianText: 'разбирам', englishText: 'I understand', category: 'verbs', partOfSpeech: 'verb', transliteration: 'razbiram', exampleSentenceMk: 'Сега разбирам!', exampleSentenceEn: 'Now I understand!' },
  { macedonianText: 'не разбирам', englishText: 'I don\'t understand', category: 'phrases', partOfSpeech: 'phrase', transliteration: 'ne razbiram', exampleSentenceMk: 'Извинете, не разбирам.', exampleSentenceEn: 'Excuse me, I don\'t understand.' },
  { macedonianText: 'знам', englishText: 'I know', category: 'verbs', partOfSpeech: 'verb', transliteration: 'znam', exampleSentenceMk: 'Знам одговорот!', exampleSentenceEn: 'I know the answer!' },
  { macedonianText: 'не знам', englishText: 'I don\'t know', category: 'phrases', partOfSpeech: 'phrase', transliteration: 'ne znam', exampleSentenceMk: 'Не знам што значи.', exampleSentenceEn: 'I don\'t know what it means.' },
  { macedonianText: 'може ли', englishText: 'can/may I', category: 'phrases', partOfSpeech: 'phrase', transliteration: 'mozhe li', exampleSentenceMk: 'Може ли да повторите?', exampleSentenceEn: 'Can you repeat?' },
  { macedonianText: 'секако', englishText: 'of course', category: 'phrases', partOfSpeech: 'adverb', transliteration: 'sekako', exampleSentenceMk: 'Секако! Ќе помогнам.', exampleSentenceEn: 'Of course! I will help.' },
  { macedonianText: 'извинете', englishText: 'excuse me (formal)', category: 'phrases', partOfSpeech: 'phrase', transliteration: 'izvinete', exampleSentenceMk: 'Извинете, не разбирам.', exampleSentenceEn: 'Excuse me, I don\'t understand.' },
  { macedonianText: 'извини', englishText: 'excuse me (informal)', category: 'phrases', partOfSpeech: 'phrase', transliteration: 'izvini', exampleSentenceMk: 'Извини за доцнењето.', exampleSentenceEn: 'Sorry for being late.' },
  { macedonianText: 'повторете', englishText: 'repeat (formal)', category: 'phrases', partOfSpeech: 'verb', transliteration: 'povtorete', exampleSentenceMk: 'Ве молам, повторете.', exampleSentenceEn: 'Please, repeat.' },
  { macedonianText: 'прочитајте', englishText: 'read (formal)', category: 'phrases', partOfSpeech: 'verb', transliteration: 'prochitajte', exampleSentenceMk: 'Прочитајте го текстот.', exampleSentenceEn: 'Read the text.' },
  { macedonianText: 'отворете', englishText: 'open (formal)', category: 'phrases', partOfSpeech: 'verb', transliteration: 'otvorete', exampleSentenceMk: 'Отворете ги книгите.', exampleSentenceEn: 'Open the books.' },
  
  // Numbers (basic)
  { macedonianText: 'еден', englishText: 'one', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'eden', exampleSentenceMk: 'Имам еден брат.', exampleSentenceEn: 'I have one brother.' },
  { macedonianText: 'два', englishText: 'two', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'dva', exampleSentenceMk: 'Имам два пенкала.', exampleSentenceEn: 'I have two pens.' },
  { macedonianText: 'три', englishText: 'three', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'tri', exampleSentenceMk: 'Три студенти се тука.', exampleSentenceEn: 'Three students are here.' },
  { macedonianText: 'четири', englishText: 'four', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'chetiri', exampleSentenceMk: 'Има четири маси.', exampleSentenceEn: 'There are four tables.' },
  { macedonianText: 'пет', englishText: 'five', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'pet', exampleSentenceMk: 'Часот е во пет.', exampleSentenceEn: 'The class is at five.' },
  { macedonianText: 'шест', englishText: 'six', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'shest', exampleSentenceMk: 'Страница шест, ве молам.', exampleSentenceEn: 'Page six, please.' },
  { macedonianText: 'седум', englishText: 'seven', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'sedum', exampleSentenceMk: 'Има седум дена во неделата.', exampleSentenceEn: 'There are seven days in a week.' },
  { macedonianText: 'осум', englishText: 'eight', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'osum', exampleSentenceMk: 'Осум часот почнува.', exampleSentenceEn: 'Eight o\'clock begins.' },
  { macedonianText: 'девет', englishText: 'nine', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'devet', exampleSentenceMk: 'Задача број девет.', exampleSentenceEn: 'Exercise number nine.' },
  { macedonianText: 'десет', englishText: 'ten', category: 'numbers', partOfSpeech: 'numeral', transliteration: 'deset', exampleSentenceMk: 'Страница десет.', exampleSentenceEn: 'Page ten.' },
];

// Grammar: Verb "разбирам" (to understand) conjugation
const grammarConjugation = {
  title: 'Глаголот "разбирам" (The verb "to understand")',
  explanation: `The verb "разбирам" (to understand) is essential for communication. 
It belongs to the a-conjugation class. To make it negative, add "не" before the verb.`,
  examples: [
    'Јас разбирам македонски. - I understand Macedonian.',
    'Дали разбираш? - Do you understand?',
    'Не разбирам. - I don\'t understand.',
    'Тие разбираат англиски. - They understand English.',
  ],
  conjugationTable: {
    verb: 'разбирам',
    verbEn: 'to understand',
    tense: 'present',
    rows: [
      { person: '1sg', pronoun: 'јас', conjugation: 'разбирам', transliteration: 'razbiram' },
      { person: '2sg', pronoun: 'ти', conjugation: 'разбираш', transliteration: 'razbirash' },
      { person: '3sg', pronoun: 'тој/таа/тоа', conjugation: 'разбира', transliteration: 'razbira' },
      { person: '1pl', pronoun: 'ние', conjugation: 'разбираме', transliteration: 'razbirame' },
      { person: '2pl', pronoun: 'вие', conjugation: 'разбирате', transliteration: 'razbirate' },
      { person: '3pl', pronoun: 'тие', conjugation: 'разбираат', transliteration: 'razbiraat' },
    ],
  },
};

// Grammar: Question formation with "дали"
const grammarQuestions = {
  title: 'Прашања со "дали" (Questions with "дали")',
  explanation: `To form yes/no questions in Macedonian, add the particle "дали" at the beginning of a statement.
This is the most common way to ask questions that can be answered with "да" (yes) or "не" (no).`,
  examples: [
    'Дали разбираш? - Do you understand?',
    'Дали си спремен? - Are you ready? (to male)',
    'Дали е ова книга? - Is this a book?',
    'Дали зборуваш македонски? - Do you speak Macedonian?',
  ],
};

// Exercises
const exercises = [
  {
    type: 'multiple_choice',
    question: 'How do you say "I don\'t understand" in Macedonian?',
    options: ['разбирам', 'не разбирам', 'знам', 'не знам'],
    correctAnswer: 'B',
    explanation: '"Не разбирам" means "I don\'t understand". Add "не" before the verb to make it negative.',
  },
  {
    type: 'fill_blank',
    question: '_____ значи "book"? (_____ does "book" mean?)',
    options: [],
    correctAnswer: 'Што',
    explanation: '"Што" means "what" and is used to ask about meaning or identity of things.',
  },
  {
    type: 'multiple_choice',
    question: 'What is the question word for "where"?',
    options: ['што', 'како', 'каде', 'кога'],
    correctAnswer: 'C',
    explanation: '"Каде" means "where". "Што" = what, "Како" = how, "Кога" = when.',
  },
  {
    type: 'translation',
    question: 'Translate: "Do you understand?"',
    options: [],
    correctAnswer: 'Дали разбираш?',
    explanation: 'Use "дали" + verb to form yes/no questions. "Разбираш" is the 2nd person form.',
  },
  {
    type: 'multiple_choice',
    question: 'Which word means "page"?',
    options: ['книга', 'страница', 'тетратка', 'пенкало'],
    correctAnswer: 'B',
    explanation: '"Страница" means "page". "Книга" = book, "тетратка" = notebook, "пенкало" = pen.',
  },
  {
    type: 'fill_blank',
    question: 'Извинете, ___ ли да повторите? (Excuse me, ___ you repeat?)',
    options: [],
    correctAnswer: 'може',
    explanation: '"Може ли" is used to politely ask "can/may I" or "can you".',
  },
  {
    type: 'multiple_choice',
    question: 'What is the third person plural of "разбирам"?',
    options: ['разбирам', 'разбираш', 'разбира', 'разбираат'],
    correctAnswer: 'D',
    explanation: '"Разбираат" is the form used with "тие" (they). Note the double -аа- ending.',
  },
  {
    type: 'multiple_choice',
    question: 'How do you say "seven" in Macedonian?',
    options: ['пет', 'шест', 'седум', 'осум'],
    correctAnswer: 'C',
    explanation: '"Седум" means "seven". Count: пет(5), шест(6), седум(7), осум(8).',
  },
];

// ============================================================================
// Seed Function
// ============================================================================

export async function seedLesson3Razbirame(lessonId: string) {
  console.log('🌱 Seeding Lesson 3: Дали се разбираме?...');

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

  // Seed Dialogues
  console.log('  Creating dialogues...');
  for (let i = 0; i < [dialogue1, dialogue2].length; i++) {
    const dialogue = [dialogue1, dialogue2][i];
    await prisma.dialogue.create({
      data: {
        lessonId,
        title: dialogue.title,
        orderIndex: i,
        lines: {
          create: dialogue.lines.map((line, index) => ({
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
    console.log(`    ✓ Created dialogue: ${dialogue.title}`);
  }

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

  // Seed Grammar Notes
  console.log('  Creating grammar notes...');
  await prisma.grammarNote.create({
    data: {
      lessonId,
      title: grammarConjugation.title,
      explanation: grammarConjugation.explanation,
      examples: JSON.stringify(grammarConjugation.examples),
      category: 'verb conjugation',
      relatedVerb: 'разбирам',
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

  await prisma.grammarNote.create({
    data: {
      lessonId,
      title: grammarQuestions.title,
      explanation: grammarQuestions.explanation,
      examples: JSON.stringify(grammarQuestions.examples),
      category: 'syntax',
      orderIndex: 1,
    },
  });
  console.log('    ✓ Created 2 grammar notes with conjugation table');

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
    data: { summary: 'Дали се разбираме? - Communication Basics' },
  });

  console.log('✅ Lesson 3: Дали се разбираме? seeded successfully!');
}

// CLI Runner
async function main() {
  const lessonId = process.argv[2];
  if (!lessonId) {
    console.log('Usage: npx tsx prisma/seeds/seed-lesson3-razbirame.ts <lessonId>');
    process.exit(1);
  }
  try {
    await seedLesson3Razbirame(lessonId);
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

