#!/usr/bin/env npx tsx
/**
 * Seed Curated Dialogues to Database
 * 
 * Seeds clean, curated dialogue content with proper speaker names
 * and both Macedonian and English text.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Types for curated dialogues
interface CuratedDialogueLine {
  speaker: string;
  textMk: string;
  textEn: string;
}

interface CuratedDialogue {
  id: string;
  title_mk: string;
  title_en: string;
  difficulty: string;
  topic: string;
  lines: CuratedDialogueLine[];
}

// Topic to lesson title mapping for better matching
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'greetings': ['Кои сме', 'запознавање', 'поздрав', 'Јас и ти'],
  'family': ['семејств', 'родител', 'деца', 'Семејство'],
  'food': ['јадење', 'храна', 'ресторан', 'кафе', 'Јадење', 'јадеме'],
  'directions': ['насок', 'каде', 'град', 'Градот', 'стигнеш'],
  'shopping': ['купува', 'продавница', 'пазар', 'купување', 'чини'],
  'weather': ['време', 'сонце', 'дожд'],
  'daily-life': ['ден', 'рутин', 'работ', 'прават'],
  'communication': ['телефон', 'разговор', 'зборува', 'разбираме'],
  'health': ['здравје', 'доктор', 'болница', 'Моето здравје', 'Тело'],
  'travel': ['патува', 'хотел', 'аеродром', 'такси', 'Патуваме'],
  'transport': ['транспорт', 'такси', 'автобус'],
  'home': ['дом', 'соба', 'Околу нас', 'куќа', 'Твојот дом'],
  'education': ['училиште', 'учиме', 'наставник'],
  'social': ['плани', 'викенд', 'кино', 'слободно'],
  'description': ['Опишување', 'изгледа', 'карактер'],
  'hobbies': ['хоби', 'слободно', 'спорт', 'музика', 'Дајте музика'],
  'city': ['град', 'живот', 'Градска', 'Скопје'],
};

async function findBestLessonMatch(dialogue: CuratedDialogue): Promise<string | null> {
  const keywords = TOPIC_KEYWORDS[dialogue.topic] || [];
  
  // Try to find a lesson that matches the topic
  for (const keyword of keywords) {
    const lesson = await prisma.curriculumLesson.findFirst({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { summary: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });
    
    if (lesson) {
      return lesson.id;
    }
  }
  
  return null;
}

async function seedDialogues(): Promise<void> {
  console.log('Loading curated dialogues...');
  
  const dialoguesPath = path.join(process.cwd(), 'data/dialogues/curated-dialogues.json');
  
  if (!fs.existsSync(dialoguesPath)) {
    console.error('Error: curated-dialogues.json not found.');
    process.exit(1);
  }

  const dialogues: CuratedDialogue[] = JSON.parse(fs.readFileSync(dialoguesPath, 'utf-8'));
  console.log(`Found ${dialogues.length} curated dialogues to seed`);

  // Get all lesson IDs ordered by module and lesson order
  const allLessons = await prisma.curriculumLesson.findMany({
    select: { id: true, title: true },
    orderBy: [
      { module: { orderIndex: 'asc' } },
      { orderIndex: 'asc' },
    ],
  });

  if (allLessons.length === 0) {
    console.error('Error: No lessons found in database. Run seed-curriculum-ukim.ts first.');
    process.exit(1);
  }

  console.log(`Found ${allLessons.length} lessons`);

  // Clear existing dialogues
  console.log('Clearing existing dialogues...');
  await prisma.dialogueLine.deleteMany({});
  await prisma.dialogue.deleteMany({});

  // Seed dialogues - try to match by topic first
  console.log('Seeding dialogues...');
  
  let seededCount = 0;
  const usedLessonIds = new Set<string>();
  
  for (let i = 0; i < dialogues.length; i++) {
    const dialogue = dialogues[i];
    
    // Try to find a matching lesson by topic
    let lessonId = await findBestLessonMatch(dialogue);
    let lessonTitle = '';
    
    // If no match or already used, assign to next available lesson
    if (!lessonId || usedLessonIds.has(lessonId)) {
      // Find first unused lesson
      for (const lesson of allLessons) {
        if (!usedLessonIds.has(lesson.id)) {
          lessonId = lesson.id;
          lessonTitle = lesson.title;
          break;
        }
      }
    } else {
      // Get title for matched lesson
      const matched = allLessons.find(l => l.id === lessonId);
      lessonTitle = matched?.title || '';
    }
    
    if (!lessonId) {
      // All lessons used, cycle from start
      lessonId = allLessons[i % allLessons.length].id;
      lessonTitle = allLessons[i % allLessons.length].title;
    }
    
    usedLessonIds.add(lessonId);
    const orderIndex = 0; // First dialogue for each lesson

    try {
      await prisma.dialogue.create({
        data: {
          lessonId,
          title: dialogue.title_en, // Use English title for display
          orderIndex,
          lines: {
            create: dialogue.lines.map((line, lineIndex) => ({
              speaker: line.speaker,
              textMk: line.textMk,
              textEn: line.textEn,
              transliteration: null,
              hasBlanks: false,
              blanksData: null,
              orderIndex: lineIndex,
            })),
          },
        },
      });
      seededCount++;
      console.log(`  ✓ ${dialogue.title_en} → "${lessonTitle}" (${dialogue.lines.length} lines)`);
    } catch (error) {
      console.error(`  ✗ Failed to seed "${dialogue.title_en}":`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('DIALOGUE SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Dialogues seeded: ${seededCount}`);
  
  // Count total lines
  const totalLines = dialogues.reduce((sum, d) => sum + d.lines.length, 0);
  console.log(`Total dialogue lines: ${totalLines}`);
  
  // Verify
  const dbDialogueCount = await prisma.dialogue.count();
  const dbLineCount = await prisma.dialogueLine.count();
  console.log(`\nDatabase verification:`);
  console.log(`  Dialogues: ${dbDialogueCount}`);
  console.log(`  DialogueLines: ${dbLineCount}`);
}

// Run seeder
seedDialogues()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
