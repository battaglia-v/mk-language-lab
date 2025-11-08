import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding POC curriculum content...\n');

  // Create Module 1: Greetings & Introductions
  const module1 = await prisma.module.upsert({
    where: {
      journeyId_orderIndex: {
        journeyId: 'family',
        orderIndex: 1,
      },
    },
    update: {},
    create: {
      journeyId: 'family',
      title: 'Greetings & Introductions',
      description: 'Learn essential greetings and how to introduce yourself in Macedonian',
      orderIndex: 1,
    },
  });

  console.log('✅ Created Module: Greetings & Introductions');

  // Lesson 1: Basic Greetings
  const lesson1 = await prisma.curriculumLesson.upsert({
    where: {
      moduleId_orderIndex: {
        moduleId: module1.id,
        orderIndex: 1,
      },
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Basic Greetings',
      summary: 'Learn how to greet people in Macedonian in both formal and informal situations',
      content: 'In this lesson, you will learn the most common greetings in Macedonian.',
      orderIndex: 1,
      estimatedMinutes: 15,
      difficultyLevel: 'beginner',
    },
  });

  // Lesson 1 Vocabulary
  await prisma.vocabularyItem.createMany({
    data: [
      {
        lessonId: lesson1.id,
        macedonianText: 'Здраво',
        englishText: 'Hello (informal)',
        pronunciation: 'Zdravo',
        exampleSentenceMk: 'Здраво, Марко!',
        exampleSentenceEn: 'Hello, Marko!',
        orderIndex: 0,
      },
      {
        lessonId: lesson1.id,
        macedonianText: 'Добар ден',
        englishText: 'Good day (formal)',
        pronunciation: 'Dobar den',
        exampleSentenceMk: 'Добар ден, госпоѓо!',
        exampleSentenceEn: 'Good day, madam!',
        orderIndex: 1,
      },
      {
        lessonId: lesson1.id,
        macedonianText: 'Добро утро',
        englishText: 'Good morning',
        pronunciation: 'Dobro utro',
        exampleSentenceMk: 'Добро утро!',
        exampleSentenceEn: 'Good morning!',
        orderIndex: 2,
      },
      {
        lessonId: lesson1.id,
        macedonianText: 'Добра вечер',
        englishText: 'Good evening',
        pronunciation: 'Dobra vecher',
        exampleSentenceMk: 'Добра вечер, пријатели!',
        exampleSentenceEn: 'Good evening, friends!',
        orderIndex: 3,
      },
      {
        lessonId: lesson1.id,
        macedonianText: 'Довидување',
        englishText: 'Goodbye',
        pronunciation: 'Doviduvanje',
        exampleSentenceMk: 'Довидување! До утре!',
        exampleSentenceEn: 'Goodbye! See you tomorrow!',
        orderIndex: 4,
      },
    ],
  });

  // Lesson 1 Grammar
  await prisma.grammarNote.create({
    data: {
      lessonId: lesson1.id,
      title: 'Informal vs Formal Greetings',
      explanation: 'Use "Здраво" with friends and family. Use "Добар ден" in formal situations like at work or with strangers.',
      examples: JSON.stringify([
        'Informal: Здраво, Александра! (Hello, Aleksandra!)',
        'Formal: Добар ден, господине. (Good day, sir.)',
      ]),
      orderIndex: 0,
    },
  });

  // Lesson 1 Exercises
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lesson1.id,
        type: 'multiple_choice',
        question: 'How do you say "Hello" informally in Macedonian?',
        options: 'Здраво|Добар ден|Довидување|Благодарам',
        correctAnswer: 'A',
        orderIndex: 0,
      },
      {
        lessonId: lesson1.id,
        type: 'multiple_choice',
        question: 'Which greeting is more formal?',
        options: 'Здраво|Добар ден|Довидување|Добра вечер',
        correctAnswer: 'B',
        orderIndex: 1,
      },
      {
        lessonId: lesson1.id,
        type: 'multiple_choice',
        question: 'How do you say "Goodbye"?',
        options: 'Здраво|Добар ден|Довидување|Добро утро',
        correctAnswer: 'C',
        orderIndex: 2,
      },
    ],
  });

  console.log('✅ Created Lesson 1: Basic Greetings (5 vocab, 1 grammar, 3 exercises)');

  // Lesson 2: Asking How Are You
  const lesson2 = await prisma.curriculumLesson.upsert({
    where: {
      moduleId_orderIndex: {
        moduleId: module1.id,
        orderIndex: 2,
      },
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Asking How Are You',
      summary: 'Learn to ask about someone\'s well-being and respond appropriately',
      content: 'Master the art of asking and answering "How are you?" in Macedonian.',
      orderIndex: 2,
      estimatedMinutes: 15,
      difficultyLevel: 'beginner',
    },
  });

  // Lesson 2 Vocabulary
  await prisma.vocabularyItem.createMany({
    data: [
      {
        lessonId: lesson2.id,
        macedonianText: 'Како си?',
        englishText: 'How are you? (informal)',
        pronunciation: 'Kako si?',
        exampleSentenceMk: 'Здраво! Како си?',
        exampleSentenceEn: 'Hello! How are you?',
        orderIndex: 0,
      },
      {
        lessonId: lesson2.id,
        macedonianText: 'Како сте?',
        englishText: 'How are you? (formal)',
        pronunciation: 'Kako ste?',
        exampleSentenceMk: 'Добар ден! Како сте?',
        exampleSentenceEn: 'Good day! How are you?',
        orderIndex: 1,
      },
      {
        lessonId: lesson2.id,
        macedonianText: 'Добро сум',
        englishText: "I'm good",
        pronunciation: 'Dobro sum',
        exampleSentenceMk: 'Јас сум добро, благодарам.',
        exampleSentenceEn: "I'm good, thank you.",
        orderIndex: 2,
      },
      {
        lessonId: lesson2.id,
        macedonianText: 'Одлично',
        englishText: 'Excellent',
        pronunciation: 'Odlichno',
        exampleSentenceMk: 'Јас сум одлично!',
        exampleSentenceEn: "I'm excellent!",
        orderIndex: 3,
      },
      {
        lessonId: lesson2.id,
        macedonianText: 'Лошо',
        englishText: 'Bad',
        pronunciation: 'Losho',
        exampleSentenceMk: 'Не сум добро, малку лошо.',
        exampleSentenceEn: "I'm not well, a bit bad.",
        orderIndex: 4,
      },
      {
        lessonId: lesson2.id,
        macedonianText: 'Уморен/уморена',
        englishText: 'Tired',
        pronunciation: 'Umoren/umorena',
        exampleSentenceMk: 'Јас сум многу уморен.',
        exampleSentenceEn: 'I am very tired.',
        orderIndex: 5,
      },
    ],
  });

  // Lesson 2 Grammar
  await prisma.grammarNote.create({
    data: {
      lessonId: lesson2.id,
      title: 'Formal vs Informal "You"',
      explanation: 'Use "си" (si) for informal "you are". Use "сте" (ste) for formal "you are" or when speaking to multiple people.',
      examples: JSON.stringify([
        'Informal: Како си? (How are you? - to a friend)',
        'Formal: Како сте? (How are you? - to a stranger/elder)',
      ]),
      orderIndex: 0,
    },
  });

  // Lesson 2 Exercises
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lesson2.id,
        type: 'fill_blank',
        question: 'Complete: Здраво, ____ си?',
        options: '',
        correctAnswer: 'како',
        orderIndex: 0,
      },
      {
        lessonId: lesson2.id,
        type: 'fill_blank',
        question: 'Complete: Јас сум ____ (I\'m good)',
        options: '',
        correctAnswer: 'добро',
        orderIndex: 1,
      },
      {
        lessonId: lesson2.id,
        type: 'multiple_choice',
        question: 'What does "Како сте?" mean?',
        options: 'How are you? (formal)|How are you? (informal)|I\'m good|Goodbye',
        correctAnswer: 'A',
        orderIndex: 2,
      },
    ],
  });

  console.log('✅ Created Lesson 2: Asking How Are You (6 vocab, 1 grammar, 3 exercises)');

  console.log('\n🎉 POC curriculum seeding complete!');
  console.log('\nCreated:');
  console.log('- 1 Module: Greetings & Introductions');
  console.log('- 2 Lessons (with 3 more to add)');
  console.log('- 11 Vocabulary items');
  console.log('- 2 Grammar notes');
  console.log('- 6 Exercises');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
