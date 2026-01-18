#!/usr/bin/env npx tsx
/**
 * Seed grammar exercises from grammar-lessons.json
 * 
 * This seeds the standalone grammar exercises (123 exercises across 20 lessons)
 * into the Exercise table linked to CurriculumLesson
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface GrammarExercise {
  id: string;
  type: string;
  instructionMk?: string;
  instructionEn?: string;
  questionMk?: string;
  questionEn?: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  xp?: number;
}

interface GrammarLesson {
  id: string;
  title: string;
  titleMk?: string;
  titleEn?: string;
  descriptionMk?: string;
  descriptionEn?: string;
  difficulty?: string;
  difficulty_level?: string;
  exercises: GrammarExercise[];
  grammarNote?: string;
  grammar_notes?: string[];
  vocabulary_list?: string[] | Array<{ mk: string; en: string }>;
  tags?: string[];
  totalXp?: number;
}

function mapExerciseType(type: string): string {
  const typeMap: Record<string, string> = {
    'multiple-choice': 'multiple_choice',
    'fill-blank': 'fill_blank',
    'fill-in-blank': 'fill_blank',
    'matching': 'matching',
    'translation': 'translation',
    'typing': 'translation',
  };
  return typeMap[type] || 'multiple_choice';
}

async function main() {
  console.log('🌱 Seeding Grammar Exercises\n');

  // Load grammar lessons
  const grammarLessonsPath = path.join(__dirname, '../../data/grammar-lessons.json');
  const grammarLessons: GrammarLesson[] = JSON.parse(
    fs.readFileSync(grammarLessonsPath, 'utf-8')
  );

  console.log(`📚 Found ${grammarLessons.length} grammar lessons`);

  let totalExercises = 0;
  let totalVocab = 0;

  for (const lesson of grammarLessons) {
    // Find or create a matching CurriculumLesson
    // First, try to find by title match
    let curriculumLesson = await prisma.curriculumLesson.findFirst({
      where: {
        OR: [
          { title: { contains: lesson.title } },
          { title: { contains: lesson.titleMk || '' } },
        ],
      },
    });

    // If no match, create a new lesson in a "Grammar" module
    if (!curriculumLesson) {
      // Ensure Grammar module exists
      let grammarModule = await prisma.module.findFirst({
        where: { journeyId: 'grammar' },
      });

      if (!grammarModule) {
        grammarModule = await prisma.module.create({
          data: {
            journeyId: 'grammar',
            title: 'Grammar Lessons',
            description: 'Standalone grammar lessons and exercises',
            orderIndex: 99,
          },
        });
        console.log('   ✅ Created Grammar module');
      }

      // Get next order index
      const maxOrder = await prisma.curriculumLesson.aggregate({
        where: { moduleId: grammarModule.id },
        _max: { orderIndex: true },
      });

      // Handle content - ensure it's a string
      let contentStr = '';
      if (typeof lesson.grammarNote === 'string') {
        contentStr = lesson.grammarNote;
      } else if (lesson.grammar_notes && Array.isArray(lesson.grammar_notes)) {
        contentStr = lesson.grammar_notes.join('\n\n');
      } else if (lesson.grammarNote && typeof lesson.grammarNote === 'object') {
        // If grammarNote is an object, stringify it
        contentStr = JSON.stringify(lesson.grammarNote);
      }

      curriculumLesson = await prisma.curriculumLesson.create({
        data: {
          moduleId: grammarModule.id,
          title: lesson.titleEn || lesson.title,
          summary: lesson.descriptionEn || lesson.descriptionMk || '',
          content: contentStr,
          orderIndex: (maxOrder._max.orderIndex || 0) + 1,
          estimatedMinutes: 15,
          difficultyLevel: lesson.difficulty_level || lesson.difficulty || 'beginner',
        },
      });
      console.log(`   ✅ Created lesson: ${curriculumLesson.title}`);
    }

    // Delete existing exercises for this lesson (idempotent)
    await prisma.exercise.deleteMany({
      where: { lessonId: curriculumLesson.id },
    });

    // Create exercises
    if (lesson.exercises && lesson.exercises.length > 0) {
      for (const [idx, exercise] of lesson.exercises.entries()) {
        const exerciseType = mapExerciseType(exercise.type);
        
        // Build question text
        const question = exercise.questionEn || exercise.questionMk || exercise.instructionEn || '';
        
        // Build options JSON
        const options = exercise.options || [];
        
        // Determine correct answer
        let correctAnswer = '';
        if (exercise.correctAnswer) {
          correctAnswer = exercise.correctAnswer;
        } else if (typeof exercise.correctIndex === 'number' && options.length > 0) {
          correctAnswer = options[exercise.correctIndex];
        }

        await prisma.exercise.create({
          data: {
            lessonId: curriculumLesson.id,
            type: exerciseType,
            question: question,
            options: JSON.stringify(options),
            correctAnswer: correctAnswer,
            explanation: exercise.instructionEn || exercise.instructionMk || null,
            orderIndex: idx,
          },
        });
        totalExercises++;
      }
    }

    // Create vocabulary items if present
    if (lesson.vocabulary_list && lesson.vocabulary_list.length > 0) {
      // Delete existing vocab for this lesson
      await prisma.vocabularyItem.deleteMany({
        where: { lessonId: curriculumLesson.id },
      });

      // Handle both string arrays and object arrays
      const vocabData = lesson.vocabulary_list.map((vocab, idx) => {
        if (typeof vocab === 'string') {
          // Parse "Mk - En" format or just use as Macedonian
          const parts = vocab.split(' - ');
          return {
            lessonId: curriculumLesson.id,
            macedonianText: parts[0] || vocab,
            englishText: parts[1] || '',
            orderIndex: idx,
            isCore: true,
          };
        } else {
          return {
            lessonId: curriculumLesson.id,
            macedonianText: vocab.mk || '',
            englishText: vocab.en || '',
            orderIndex: idx,
            isCore: true,
          };
        }
      }).filter(v => v.macedonianText); // Filter out empty entries

      if (vocabData.length > 0) {
        await prisma.vocabularyItem.createMany({ data: vocabData });
        totalVocab += vocabData.length;
      }
    }

    console.log(`   📖 ${lesson.title}: ${lesson.exercises?.length || 0} exercises, ${lesson.vocabulary_list?.length || 0} vocab`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Seeded ${totalExercises} exercises and ${totalVocab} vocabulary items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
