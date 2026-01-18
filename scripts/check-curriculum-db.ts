#!/usr/bin/env npx tsx
/**
 * Check curriculum database content
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Curriculum Database Status\n');
  
  // Count modules
  const modules = await prisma.module.findMany({
    include: { _count: { select: { lessons: true } } },
    orderBy: { orderIndex: 'asc' }
  });
  
  console.log('Modules and lesson counts:');
  modules.forEach(m => console.log(`  ${m.title}: ${m._count.lessons} lessons`));
  
  // Count lessons with content
  const lessons = await prisma.curriculumLesson.findMany({
    include: {
      _count: {
        select: {
          vocabularyItems: true,
          grammarNotes: true,
          exercises: true,
          dialogues: true
        }
      }
    },
    orderBy: { orderIndex: 'asc' }
  });
  
  console.log(`\nTotal lessons: ${lessons.length}`);
  console.log('\nLesson content counts:');
  lessons.forEach(l => {
    const counts = l._count;
    console.log(`  ${l.title.substring(0, 40).padEnd(40)}: vocab=${counts.vocabularyItems.toString().padStart(3)}, grammar=${counts.grammarNotes.toString().padStart(2)}, exercises=${counts.exercises.toString().padStart(2)}, dialogues=${counts.dialogues}`);
  });
  
  // Summary
  const totalVocab = lessons.reduce((sum, l) => sum + l._count.vocabularyItems, 0);
  const totalGrammar = lessons.reduce((sum, l) => sum + l._count.grammarNotes, 0);
  const totalExercises = lessons.reduce((sum, l) => sum + l._count.exercises, 0);
  const totalDialogues = lessons.reduce((sum, l) => sum + l._count.dialogues, 0);
  
  console.log('\n📈 Summary:');
  console.log(`  Total vocabulary items: ${totalVocab}`);
  console.log(`  Total grammar notes: ${totalGrammar}`);
  console.log(`  Total exercises: ${totalExercises}`);
  console.log(`  Total dialogues: ${totalDialogues}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
