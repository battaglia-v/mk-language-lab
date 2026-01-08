#!/usr/bin/env npx tsx
/**
 * Generate lesson introductions from vocabulary and grammar data
 *
 * Creates educational lesson intros that explain:
 * - What the lesson covers (theme)
 * - Key vocabulary preview
 * - Grammar concepts to learn
 *
 * Usage:
 *   npx tsx scripts/curriculum/generate-lesson-intros.ts --level a1
 *   npx tsx scripts/curriculum/generate-lesson-intros.ts --level a1 --lesson 1
 *   npx tsx scripts/curriculum/generate-lesson-intros.ts --level a1 --dry-run
 */

import * as fs from 'fs';

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

interface VocabItem {
  word: string;
  translation?: string;
  partOfSpeech?: string;
}

interface GrammarNote {
  title: string;
  content: string;
  examples: string[];
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  themes?: { title: string }[];
  vocabularyItems: VocabItem[];
  grammarNotes: GrammarNote[];
  intro?: string; // We'll add this
}

interface CurriculumData {
  id: string;
  level: string;
  chapters: Chapter[];
}

// Lesson title patterns to generate contextual intros
const LESSON_INTROS: Record<string, string> = {
  // A1 lessons - based on common themes
  'јас и ти': 'Learn how to introduce yourself and ask others about their background. This lesson covers essential greetings, personal pronouns, and basic questions like "Where are you from?"',
  'семејство': 'Discover vocabulary for family members and relationships. You\'ll learn to talk about your family, describe people, and use possessive forms.',
  'храна': 'Explore food vocabulary and dining expressions. Learn to order at restaurants, discuss your favorite foods, and use verbs related to eating and drinking.',
  'секојдневие': 'Master daily routine vocabulary and time expressions. Learn to describe your typical day, talk about schedules, and use common verbs in present tense.',
  'облека': 'Learn vocabulary for clothing and shopping. Discover how to describe what you\'re wearing, ask about sizes, and navigate stores in Macedonian.',
  'време': 'Explore weather vocabulary and seasonal expressions. Learn to describe the weather, talk about your favorite season, and make plans based on conditions.',
  'патување': 'Travel vocabulary and directions await! Learn how to ask for directions, book accommodations, and discuss travel plans.',
  'здравје': 'Health and body vocabulary for essential communication. Learn to describe how you feel, talk to doctors, and discuss wellness.',
  'работа': 'Professional vocabulary for the workplace. Learn job titles, office vocabulary, and how to discuss your career in Macedonian.',
  'слободно време': 'Leisure and hobbies vocabulary. Discover how to talk about your free time, interests, and recreational activities.',
};

/**
 * Generate a lesson introduction from existing data (no AI)
 */
function generateIntro(chapter: Chapter, level: string): string {
  // Try to find a matching intro by lesson title keyword
  const titleLower = chapter.titleMk.toLowerCase();
  for (const [keyword, intro] of Object.entries(LESSON_INTROS)) {
    if (titleLower.includes(keyword)) {
      return intro;
    }
  }

  // Extract theme names (clean them up)
  const themeNames = chapter.themes
    ?.map(t => {
      // Remove exercise instructions, keep just the theme name
      const cleaned = t.title.split('Вежба')[0].trim();
      // If it's too long, it's probably mixed content - skip
      if (cleaned.length > 50) return null;
      return cleaned;
    })
    .filter((t): t is string => t !== null && t.length > 3)
    .slice(0, 3) || [];

  // Extract grammar topic names
  const grammarTopics = chapter.grammarNotes
    .map(g => g.title)
    .slice(0, 2);

  // Count vocabulary
  const vocabCount = chapter.vocabularyItems.length;

  // Build a generic intro
  const parts: string[] = [];

  // Theme-based intro
  if (themeNames.length > 0) {
    parts.push(`This lesson explores ${themeNames.join(', ').toLowerCase()}.`);
  } else {
    // Use the lesson title itself
    const topic = chapter.title.replace(/^Lesson \d+:\s*/, '');
    parts.push(`In this lesson, you'll learn about "${topic}".`);
  }

  // Grammar mention
  if (grammarTopics.length > 0) {
    parts.push(`Grammar focus: ${grammarTopics.join(' and ')}.`);
  }

  // Vocabulary count
  if (vocabCount > 0) {
    parts.push(`You'll practice ${Math.min(vocabCount, 20)}+ new vocabulary words.`);
  }

  return parts.join(' ');
}

function main() {
  const args = process.argv.slice(2);
  const levelIndex = args.indexOf('--level');
  const lessonIndex = args.indexOf('--lesson');
  const isDryRun = args.includes('--dry-run');

  const level = levelIndex !== -1 ? args[levelIndex + 1]?.toLowerCase() : 'a1';
  const lessonNum = lessonIndex !== -1 ? parseInt(args[lessonIndex + 1]) : null;

  if (!LEVEL_FILES[level]) {
    console.error(`Unknown level: ${level}. Use --level a1, --level a2, or --level b1`);
    process.exit(1);
  }

  const filePath = LEVEL_FILES[level];
  console.log(`\nGenerating lesson intros for ${level.toUpperCase()} from ${filePath}\n`);

  // Load data
  const data: CurriculumData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Filter to specific lesson if requested
  const chaptersToProcess = lessonNum
    ? data.chapters.filter(c => c.lessonNumber === lessonNum)
    : data.chapters;

  if (chaptersToProcess.length === 0) {
    console.error(`No chapters found${lessonNum ? ` for lesson ${lessonNum}` : ''}`);
    process.exit(1);
  }

  console.log(`Processing ${chaptersToProcess.length} lesson(s)...\n`);

  let generatedCount = 0;
  let skippedCount = 0;

  for (const chapter of chaptersToProcess) {
    // Skip if already has a real intro (not just the title)
    if (chapter.intro && chapter.intro.length > 50) {
      console.log(`  Lesson ${chapter.lessonNumber}: Skipped (already has intro)`);
      skippedCount++;
      continue;
    }

    console.log(`  Lesson ${chapter.lessonNumber}: ${chapter.titleMk}`);

    if (isDryRun) {
      const intro = generateIntro(chapter, level.toUpperCase());
      console.log(`    [DRY RUN] "${intro.substring(0, 80)}..."`);
      console.log(`    Vocab: ${chapter.vocabularyItems.length} items`);
      console.log(`    Grammar: ${chapter.grammarNotes.length} notes`);
      continue;
    }

    try {
      const intro = generateIntro(chapter, level.toUpperCase());

      // Find and update the chapter in the original data
      const originalChapter = data.chapters.find(c => c.lessonNumber === chapter.lessonNumber);
      if (originalChapter) {
        originalChapter.intro = intro;
      }

      console.log(`    ✅ Generated: "${intro.substring(0, 60)}..."`);
      generatedCount++;
    } catch (error) {
      console.error(`    ❌ Error:`, error);
    }
  }

  if (!isDryRun && generatedCount > 0) {
    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\n✅ Saved ${generatedCount} intros to ${filePath}`);
  }

  console.log(`\nSummary:`);
  console.log(`  Generated: ${generatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Total: ${chaptersToProcess.length}`);
}

main();
