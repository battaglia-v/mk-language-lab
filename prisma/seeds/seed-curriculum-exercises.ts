#!/usr/bin/env npx tsx
/**
 * Generate Exercises for Curriculum Lessons
 * 
 * Creates exercises based on each lesson's vocabulary items.
 * Types: multiple-choice, fill-blank, translation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exercise templates
function createMultipleChoiceExercise(
  vocab: { macedonianText: string; englishText: string },
  distractors: string[],
  index: number
) {
  const options = [vocab.englishText, ...distractors.slice(0, 3)];
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    type: 'multiple-choice',
    question: `What does "${vocab.macedonianText}" mean?`,
    options: JSON.stringify(options),
    correctAnswer: vocab.englishText,
    explanation: `"${vocab.macedonianText}" means "${vocab.englishText}" in English.`,
    orderIndex: index,
  };
}

function createFillBlankExercise(
  vocab: { macedonianText: string; englishText: string },
  index: number
) {
  return {
    type: 'fill-blank',
    question: `Translate to Macedonian: "${vocab.englishText}"`,
    options: JSON.stringify([]),
    correctAnswer: vocab.macedonianText.toLowerCase(),
    explanation: `"${vocab.englishText}" is "${vocab.macedonianText}" in Macedonian.`,
    orderIndex: index,
  };
}

function createTranslationExercise(
  vocab: { macedonianText: string; englishText: string },
  index: number
) {
  return {
    type: 'translation',
    question: `How do you say "${vocab.englishText}" in Macedonian?`,
    options: JSON.stringify([]),
    correctAnswer: vocab.macedonianText,
    explanation: `"${vocab.englishText}" translates to "${vocab.macedonianText}".`,
    orderIndex: index,
  };
}

// Common distractor words for multiple choice
const COMMON_DISTRACTORS = [
  'house', 'water', 'food', 'book', 'person', 'time', 'day', 'night',
  'friend', 'family', 'work', 'school', 'car', 'street', 'city', 'country',
  'money', 'phone', 'computer', 'table', 'chair', 'door', 'window', 'room',
  'to go', 'to come', 'to eat', 'to drink', 'to sleep', 'to work', 'to read',
  'big', 'small', 'good', 'bad', 'new', 'old', 'beautiful', 'important',
  'yes', 'no', 'please', 'thank you', 'hello', 'goodbye', 'sorry', 'okay',
];

async function seedCurriculumExercises(): Promise<void> {
  console.log('Loading curriculum lessons with vocabulary...');

  // Get lessons that DON'T already have exercises
  const lessons = await prisma.curriculumLesson.findMany({
    where: {
      exercises: { none: {} },
      vocabularyItems: { some: {} },
    },
    include: {
      vocabularyItems: {
        take: 20, // Get up to 20 vocab items per lesson
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: [
      { module: { orderIndex: 'asc' } },
      { orderIndex: 'asc' },
    ],
  });

  console.log(`Found ${lessons.length} lessons without exercises`);

  let totalExercises = 0;

  for (const lesson of lessons) {
    if (lesson.vocabularyItems.length < 3) {
      console.log(`  Skipping "${lesson.title}" - not enough vocabulary`);
      continue;
    }

    const exercises: Array<{
      lessonId: string;
      type: string;
      question: string;
      options: string;
      correctAnswer: string;
      explanation: string;
      orderIndex: number;
    }> = [];

    // Select vocabulary for exercises (first 6-10 items)
    const vocabForExercises = lesson.vocabularyItems.slice(0, Math.min(10, lesson.vocabularyItems.length));
    
    let exerciseIndex = 0;

    // Create 3-5 multiple choice exercises
    for (let i = 0; i < Math.min(4, vocabForExercises.length); i++) {
      const vocab = vocabForExercises[i];
      // Get distractors that aren't the correct answer
      const distractors = COMMON_DISTRACTORS.filter(
        d => d.toLowerCase() !== vocab.englishText.toLowerCase()
      );
      
      exercises.push({
        lessonId: lesson.id,
        ...createMultipleChoiceExercise(vocab, distractors, exerciseIndex++),
      });
    }

    // Create 2-3 fill-in-blank exercises
    for (let i = 4; i < Math.min(7, vocabForExercises.length); i++) {
      const vocab = vocabForExercises[i];
      exercises.push({
        lessonId: lesson.id,
        ...createFillBlankExercise(vocab, exerciseIndex++),
      });
    }

    // Create 1-2 translation exercises
    for (let i = 7; i < Math.min(9, vocabForExercises.length); i++) {
      const vocab = vocabForExercises[i];
      exercises.push({
        lessonId: lesson.id,
        ...createTranslationExercise(vocab, exerciseIndex++),
      });
    }

    if (exercises.length > 0) {
      await prisma.exercise.createMany({
        data: exercises,
      });
      totalExercises += exercises.length;
      console.log(`  ✓ "${lesson.title}" - ${exercises.length} exercises`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('EXERCISE GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total exercises created: ${totalExercises}`);
  console.log(`Lessons updated: ${lessons.length}`);

  // Verify
  const totalInDb = await prisma.exercise.count();
  console.log(`\nTotal exercises in database: ${totalInDb}`);
}

// Run
seedCurriculumExercises()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
