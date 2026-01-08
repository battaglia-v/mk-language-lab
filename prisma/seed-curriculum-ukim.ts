#!/usr/bin/env tsx
/**
 * Seed UKIM curriculum (A1, A2, B1) from structured JSON files
 * Maps to Prisma models: Module, CurriculumLesson, VocabularyItem, GrammarNote
 *
 * This script is idempotent - can be run multiple times safely
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Structured textbook types
interface StructuredVocabulary {
  macedonian: string;
  english: string;
  context?: string;
}

interface StructuredGrammar {
  title: string;
  content: string;
  examples: string[];
}

interface StructuredLesson {
  lessonNumber: number;
  title: string;
  titleMk: string;
  startPage?: number;
  endPage?: number;
  vocabularyItems: StructuredVocabulary[];
  grammarNotes: StructuredGrammar[];
}

interface StructuredTextbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: StructuredLesson[];
}

interface B1Chapter {
  chapterNumber: number;
  title: string;
  titleMk: string;
  note: string;
}

interface B1Skeleton {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  note: string;
  chapters: B1Chapter[];
}

/**
 * Load JSON file
 */
function loadJSON<T>(filePath: string): T {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Seed A1 or A2 curriculum from structured JSON
 */
async function seedFullCurriculum(textbook: StructuredTextbook) {
  console.log(`\n📚 Seeding ${textbook.level} - ${textbook.title} (${textbook.journeyId})`);
  console.log(`   Total lessons: ${textbook.chapters.length}`);

  // Create/update module
  const curriculumModule = await prisma.module.upsert({
    where: {
      journeyId_orderIndex: {
        journeyId: textbook.journeyId,
        orderIndex: 1,
      },
    },
    update: {
      title: textbook.title,
      description: `${textbook.level} Macedonian curriculum from UKIM`,
    },
    create: {
      journeyId: textbook.journeyId,
      title: textbook.title,
      description: `${textbook.level} Macedonian curriculum from UKIM`,
      orderIndex: 1,
    },
  });

  console.log(`   ✅ Module created/updated: ${curriculumModule.title} (ID: ${curriculumModule.id})`);

  let totalVocab = 0;
  let totalGrammar = 0;

  // Seed each lesson
  for (const chapter of textbook.chapters) {
    // Create/update lesson
    const lesson = await prisma.curriculumLesson.upsert({
      where: {
        moduleId_orderIndex: {
          moduleId: curriculumModule.id,
          orderIndex: chapter.lessonNumber,
        },
      },
      update: {
        title: chapter.title,
        summary: chapter.titleMk,
        content: `Lesson ${chapter.lessonNumber} from ${textbook.title}`,
      },
      create: {
        moduleId: curriculumModule.id,
        title: chapter.title,
        summary: chapter.titleMk,
        content: `Lesson ${chapter.lessonNumber} from ${textbook.title}`,
        orderIndex: chapter.lessonNumber,
        estimatedMinutes: 30, // Default estimate
        difficultyLevel: textbook.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
      },
    });

    // Delete existing vocabulary and grammar for this lesson (to handle updates)
    await prisma.vocabularyItem.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.grammarNote.deleteMany({ where: { lessonId: lesson.id } });

    // Create vocabulary items
    if (chapter.vocabularyItems.length > 0) {
      await prisma.vocabularyItem.createMany({
        data: chapter.vocabularyItems.map((vocab, idx) => ({
          lessonId: lesson.id,
          macedonianText: (vocab as any).word || (vocab as any).macedonian || '',
          englishText: (vocab as any).translation || (vocab as any).english || '',
          exampleSentenceMk: (vocab as any).context || null,
          orderIndex: idx,
        })),
      });
      totalVocab += chapter.vocabularyItems.length;
    }

    // Create grammar notes
    if (chapter.grammarNotes.length > 0) {
      for (const [idx, grammar] of chapter.grammarNotes.entries()) {
        await prisma.grammarNote.create({
          data: {
            lessonId: lesson.id,
            title: grammar.title,
            explanation: grammar.content,
            examples: JSON.stringify(grammar.examples),
            orderIndex: idx,
          },
        });
      }
      totalGrammar += chapter.grammarNotes.length;
    }

    console.log(`   ✅ Lesson ${chapter.lessonNumber}: ${chapter.title}`);
    console.log(`      Vocab: ${chapter.vocabularyItems.length}, Grammar: ${chapter.grammarNotes.length}`);
  }

  console.log(`   📊 Total: ${totalVocab} vocabulary items, ${totalGrammar} grammar notes`);
}

/**
 * Seed B1 skeleton (placeholder structure only)
 */
async function seedB1Skeleton(skeleton: B1Skeleton) {
  console.log(`\n📚 Seeding ${skeleton.level} - ${skeleton.title} (${skeleton.journeyId})`);
  console.log(`   Total chapters: ${skeleton.chapters.length}`);
  console.log(`   Note: ${skeleton.note}`);

  // Create/update module
  const curriculumModule = await prisma.module.upsert({
    where: {
      journeyId_orderIndex: {
        journeyId: skeleton.journeyId,
        orderIndex: 1,
      },
    },
    update: {
      title: skeleton.title,
      description: `${skeleton.level} Macedonian curriculum from UKIM (skeleton only)`,
    },
    create: {
      journeyId: skeleton.journeyId,
      title: skeleton.title,
      description: `${skeleton.level} Macedonian curriculum from UKIM (skeleton only)`,
      orderIndex: 1,
    },
  });

  console.log(`   ✅ Module created/updated: ${curriculumModule.title} (ID: ${curriculumModule.id})`);

  // Seed chapters with full content (like A1/A2)
  let totalVocab = 0;
  let totalGrammar = 0;

  for (const chapter of skeleton.chapters) {
    const lessonNum = (chapter as any).lessonNumber || (chapter as any).chapterNumber || 1;

    const lesson = await prisma.curriculumLesson.upsert({
      where: {
        moduleId_orderIndex: {
          moduleId: curriculumModule.id,
          orderIndex: lessonNum,
        },
      },
      update: {
        title: chapter.title,
        summary: chapter.titleMk,
        content: (chapter as any).note || `Lesson ${lessonNum} from ${skeleton.title}`,
      },
      create: {
        moduleId: curriculumModule.id,
        title: chapter.title,
        summary: chapter.titleMk,
        content: (chapter as any).note || `Lesson ${lessonNum} from ${skeleton.title}`,
        orderIndex: lessonNum,
        estimatedMinutes: 45,
        difficultyLevel: 'intermediate',
      },
    });

    // Delete existing vocabulary and grammar for this lesson
    await prisma.vocabularyItem.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.grammarNote.deleteMany({ where: { lessonId: lesson.id } });

    // Create vocabulary items if present
    const vocabItems = (chapter as any).vocabularyItems || [];
    if (vocabItems.length > 0) {
      await prisma.vocabularyItem.createMany({
        data: vocabItems.map((vocab: any, idx: number) => ({
          lessonId: lesson.id,
          macedonianText: vocab.word || vocab.macedonian || '',
          englishText: vocab.translation || vocab.english || '',
          exampleSentenceMk: vocab.context || null,
          orderIndex: idx,
        })),
      });
      totalVocab += vocabItems.length;
    }

    // Create grammar notes if present
    const grammarNotes = (chapter as any).grammarNotes || [];
    if (grammarNotes.length > 0) {
      for (const [idx, grammar] of grammarNotes.entries()) {
        await prisma.grammarNote.create({
          data: {
            lessonId: lesson.id,
            title: grammar.title,
            explanation: grammar.content,
            examples: JSON.stringify(grammar.examples),
            orderIndex: idx,
          },
        });
      }
      totalGrammar += grammarNotes.length;
    }

    console.log(`   ✅ Lesson ${lessonNum}: ${chapter.titleMk}`);
    console.log(`      Vocab: ${vocabItems.length}, Grammar: ${grammarNotes.length}`);
  }

  console.log(`   📊 Total: ${totalVocab} vocabulary items, ${totalGrammar} grammar notes`);
}

/**
 * Validate JSON structure without database writes (dry-run mode)
 */
function validateDryRun(textbook: StructuredTextbook | B1Skeleton, levelName: string): { vocabCount: number; grammarCount: number; errors: string[] } {
  const errors: string[] = [];
  let vocabCount = 0;
  let grammarCount = 0;

  console.log(`\n📋 Validating ${levelName} - ${textbook.title} (${textbook.journeyId})`);
  console.log(`   Chapters: ${textbook.chapters.length}`);

  for (const chapter of textbook.chapters) {
    const lessonNum = (chapter as StructuredLesson).lessonNumber || (chapter as B1Chapter).chapterNumber || 0;

    // Validate required fields
    if (!chapter.title) {
      errors.push(`${levelName} Lesson ${lessonNum}: Missing title`);
    }
    if (!chapter.titleMk) {
      errors.push(`${levelName} Lesson ${lessonNum}: Missing titleMk`);
    }

    // Count vocabulary
    const vocabItems = (chapter as StructuredLesson).vocabularyItems || [];
    vocabCount += vocabItems.length;

    // Validate vocabulary items
    for (const vocab of vocabItems) {
      const word = (vocab as any).word || (vocab as any).macedonian || '';
      if (!word) {
        errors.push(`${levelName} Lesson ${lessonNum}: Vocabulary item missing word`);
      }
    }

    // Count grammar
    const grammarNotes = (chapter as StructuredLesson).grammarNotes || [];
    grammarCount += grammarNotes.length;

    // Validate grammar notes
    for (const grammar of grammarNotes) {
      if (!grammar.title) {
        errors.push(`${levelName} Lesson ${lessonNum}: Grammar note missing title`);
      }
    }

    console.log(`   ✓ Lesson ${lessonNum}: ${vocabItems.length} vocab, ${grammarNotes.length} grammar`);
  }

  return { vocabCount, grammarCount, errors };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(60));
  console.log(isDryRun ? '🔍 Validating UKIM Curriculum (Dry Run)' : '🌱 Seeding UKIM Curriculum (A1, A2, B1)');
  console.log('='.repeat(60));

  try {
    // Load JSON files
    const a1 = loadJSON<StructuredTextbook>('data/curriculum/structured/a1-teskoto.json');
    const a2 = loadJSON<StructuredTextbook>('data/curriculum/structured/a2-lozje.json');
    const b1 = loadJSON<B1Skeleton>('data/curriculum/structured/b1-zlatovrv.json');

    if (isDryRun) {
      // Dry run - validate without database writes
      const results = {
        a1: validateDryRun(a1, 'A1'),
        a2: validateDryRun(a2, 'A2'),
        b1: validateDryRun(b1, 'B1'),
      };

      const totalVocab = results.a1.vocabCount + results.a2.vocabCount + results.b1.vocabCount;
      const totalGrammar = results.a1.grammarCount + results.a2.grammarCount + results.b1.grammarCount;
      const allErrors = [...results.a1.errors, ...results.a2.errors, ...results.b1.errors];

      console.log('\n' + '='.repeat(60));
      console.log('📊 Dry Run Summary');
      console.log('='.repeat(60));
      console.log(`\nLevels validated: 3`);
      console.log(`Total lessons: ${a1.chapters.length + a2.chapters.length + b1.chapters.length}`);
      console.log(`Total vocabulary items: ${totalVocab}`);
      console.log(`Total grammar notes: ${totalGrammar}`);
      console.log(`\nBreakdown:`);
      console.log(`  A1: ${results.a1.vocabCount} vocab, ${results.a1.grammarCount} grammar`);
      console.log(`  A2: ${results.a2.vocabCount} vocab, ${results.a2.grammarCount} grammar`);
      console.log(`  B1: ${results.b1.vocabCount} vocab, ${results.b1.grammarCount} grammar`);

      if (allErrors.length > 0) {
        console.log(`\n⚠️  Validation errors (${allErrors.length}):`);
        allErrors.forEach(err => console.log(`  - ${err}`));
        console.log('\n❌ Dry run completed with errors');
        process.exit(1);
      } else {
        console.log('\n✅ Dry run completed - all JSON files valid');
        console.log('   Ready for database seeding with: npm run db:seed:ukim');
      }
    } else {
      // Actual seeding
      await seedFullCurriculum(a1);
      await seedFullCurriculum(a2);
      await seedB1Skeleton(b1);

      console.log('\n' + '='.repeat(60));
      console.log('🎉 UKIM curriculum seeding complete!');
      console.log('='.repeat(60));
      console.log('\nCreated/Updated:');
      console.log('- 3 Modules (ukim-a1, ukim-a2, ukim-b1)');
      console.log(`- ${a1.chapters.length + a2.chapters.length + b1.chapters.length} Lessons total`);
      console.log('- Vocabulary items from A1 and A2');
      console.log('- Grammar notes from A1 and A2');
      console.log('- B1 skeleton structure (content pending)');
      console.log();
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
