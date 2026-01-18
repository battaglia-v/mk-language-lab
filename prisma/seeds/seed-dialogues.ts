#!/usr/bin/env npx tsx
/**
 * Seed UKIM Dialogues to Database
 * 
 * This script seeds parsed dialogue data from the UKIM textbook
 * into the Dialogue and DialogueLine tables.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Types matching the parser output
interface ParsedDialogueLine {
  speaker?: string;
  textMk: string;
  hasBlanks: boolean;
  blanksCount: number;
}

interface ParsedDialogue {
  id: string;
  sectionLabel?: string;
  title?: string;
  lines: ParsedDialogueLine[];
  sourceTheme: number;
  sourceChapter: number;
}

// Get all lesson IDs in order
async function getLessonIds(): Promise<string[]> {
  const lessons = await prisma.curriculumLesson.findMany({
    select: { id: true },
    orderBy: [
      { module: { orderIndex: 'asc' } },
      { orderIndex: 'asc' },
    ],
  });

  return lessons.map(l => l.id);
}

async function seedDialogues(): Promise<void> {
  console.log('Loading parsed dialogues...');
  
  const dialoguesPath = path.join(process.cwd(), 'data/dialogues/ukim-dialogues.json');
  
  if (!fs.existsSync(dialoguesPath)) {
    console.error('Error: ukim-dialogues.json not found. Run parse-ukim-dialogues.ts first.');
    process.exit(1);
  }

  const dialogues: ParsedDialogue[] = JSON.parse(fs.readFileSync(dialoguesPath, 'utf-8'));
  console.log(`Found ${dialogues.length} dialogues to seed`);

  // Get lesson IDs in order
  const lessonIds = await getLessonIds();
  console.log(`Found ${lessonIds.length} lessons to link dialogues to`);

  if (lessonIds.length === 0) {
    console.error('Error: No lessons found in database. Run seed-curriculum-ukim.ts first.');
    process.exit(1);
  }

  // Clear existing dialogues
  console.log('Clearing existing dialogues...');
  await prisma.dialogueLine.deleteMany({});
  await prisma.dialogue.deleteMany({});

  // Seed dialogues
  console.log('Seeding dialogues...');
  
  let seededCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < dialogues.length; i++) {
    const dialogue = dialogues[i];
    
    // Skip dialogues with very few lines
    if (dialogue.lines.length < 2) {
      skippedCount++;
      continue;
    }

    // Get a lesson ID to link to (cycle through available lessons)
    const lessonIndex = i % lessonIds.length;
    const lessonId = lessonIds[lessonIndex];

    // Create dialogue
    const title = dialogue.sectionLabel 
      ? `Dialogue ${dialogue.sectionLabel}` 
      : `Dialogue ${i + 1}`;

    try {
      await prisma.dialogue.create({
        data: {
          lessonId,
          title,
          orderIndex: i,
          lines: {
            create: dialogue.lines.map((line, lineIndex) => ({
              speaker: line.speaker || undefined,
              textMk: line.textMk,
              textEn: '', // English translations not in source
              transliteration: undefined,
              hasBlanks: line.hasBlanks,
              blanksData: line.hasBlanks ? JSON.stringify(
                extractBlanksData(line.textMk)
              ) : null,
              orderIndex: lineIndex,
            })),
          },
        },
      });
      seededCount++;
    } catch (error) {
      console.error(`Failed to seed dialogue ${dialogue.id}:`, error);
      skippedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('DIALOGUE SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Dialogues seeded: ${seededCount}`);
  console.log(`Dialogues skipped: ${skippedCount}`);
  
  // Verify
  const dbCount = await prisma.dialogue.count();
  const lineCount = await prisma.dialogueLine.count();
  console.log(`\nDatabase counts:`);
  console.log(`  Dialogues: ${dbCount}`);
  console.log(`  DialogueLines: ${lineCount}`);
}

/**
 * Extract blanks data from text
 * Returns array of { position, answer, hint }
 */
function extractBlanksData(text: string): Array<{ position: number; answer: string; hint: string }> {
  const blanks: Array<{ position: number; answer: string; hint: string }> = [];
  
  // Find all blank markers
  const regex = /_+/g;
  let match;
  let position = 0;
  
  while ((match = regex.exec(text)) !== null) {
    blanks.push({
      position: position++,
      answer: '', // Answer not known from source
      hint: `${match[0].length} characters`, // Hint based on blank length
    });
  }
  
  return blanks;
}

// Run seeder
seedDialogues()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
