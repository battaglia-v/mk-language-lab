#!/usr/bin/env npx tsx
/**
 * Parse B1 (Златоврв) raw extraction into structured curriculum JSON
 * Maps to Prisma models: Module, CurriculumLesson, VocabularyItem, GrammarNote
 */

import * as fs from 'fs';
import type { ExtractedPage, StructuredVocabulary } from './types';
import { extractAllVocabulary, type VocabularyItem } from './vocabulary-patterns';
import {
  extractGrammarSections,
  extractGrammarExamples,
  extractConjugationTables,
} from './grammar-patterns';

const INPUT_PATH = 'data/curriculum/extracted/b1-raw.json';
const OUTPUT_PATH = 'data/curriculum/structured/b1-zlatovrv.json';

// Structured output types matching Prisma models
interface StructuredLesson {
  lessonNumber: number;
  title: string;
  titleMk: string;
  startPage: number;
  endPage: number;
  themes: StructuredTheme[];
  vocabularyItems: StructuredVocabulary[];
  grammarNotes: StructuredGrammar[];
}

interface StructuredTheme {
  themeNumber: number;
  title: string;
  exercises: string[];
}

// StructuredVocabulary imported from ./types

interface StructuredGrammar {
  title: string;
  content: string;
  examples: string[];
}

interface StructuredTextbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: StructuredLesson[];
  metadata: {
    totalLessons: number;
    totalPages: number;
    extractedAt: string;
    parsedAt: string;
  };
}

// Lesson info from table of contents (page 7 = PDF page 5)
// B1 has 8 comprehensive lessons like A2
const LESSON_INFO: { num: number; title: string; page: number }[] = [
  { num: 1, title: 'Дали се разбираме?', page: 8 },
  { num: 2, title: 'Има ли надеж?', page: 24 },
  { num: 3, title: 'Моето здравје', page: 40 },
  { num: 4, title: 'Што (ќе) јадеме (денес)?', page: 56 },
  { num: 5, title: 'Дајте музика!', page: 72 },
  { num: 6, title: 'Патуваме, сонуваме!', page: 90 },
  { num: 7, title: 'Луѓето се луѓе', page: 112 },
  { num: 8, title: 'Градска џунгла', page: 130 },
];

/**
 * Extract text from pages within a range
 */
function extractPagesText(pages: ExtractedPage[], startPage: number, endPage: number): string {
  return pages
    .filter(p => p.pageNum >= startPage && p.pageNum < endPage)
    .map(p => p.text)
    .join('\n');
}

/**
 * Extract themes from lesson text
 */
function extractThemes(lessonText: string): StructuredTheme[] {
  const themes: StructuredTheme[] = [];

  // Match "Тема X." or "Тема X:" patterns
  const themePattern = /Тема\s+(\d+)\s*[.:]?\s*([^\n]+)/gi;
  let match;

  while ((match = themePattern.exec(lessonText)) !== null) {
    const themeNum = parseInt(match[1]);
    const themeTitle = match[2].trim();

    // Extract exercises for this theme (simplified)
    const exercises: string[] = [];
    const exercisePattern = /(?:Вежба|Задача)\s+(\d+)/g;
    let exMatch;
    while ((exMatch = exercisePattern.exec(lessonText)) !== null) {
      exercises.push(`Вежба ${exMatch[1]}`);
    }

    themes.push({
      themeNumber: themeNum,
      title: themeTitle,
      exercises: [...new Set(exercises)], // Dedupe
    });
  }

  return themes;
}

/**
 * Extract vocabulary items from text using vocabulary extraction patterns
 * UKIM textbooks are Macedonian-only - no English translations exist
 */
function extractVocabulary(lessonText: string): StructuredVocabulary[] {
  // Use the vocabulary extraction module
  const extracted = extractAllVocabulary(lessonText);

  // Convert to StructuredVocabulary format
  return extracted.map((item: VocabularyItem) => ({
    word: item.word,
    partOfSpeech: item.partOfSpeech,
    context: item.context,
  }));
}

/**
 * Extract grammar notes from text using both section-based and pattern extraction
 */
function extractGrammarNotes(lessonText: string): StructuredGrammar[] {
  const notes: StructuredGrammar[] = [];
  const seenTitles = new Set<string>();

  // 1. Extract grammar sections using pattern-based extraction
  const sections = extractGrammarSections(lessonText);
  for (const section of sections) {
    const titleKey = section.title.toLowerCase();
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    // Get examples for this section
    const examples = extractGrammarExamples(section.content);

    notes.push({
      title: section.title,
      content: section.content,
      examples: examples.length > 0 ? examples : [],
    });
  }

  // 2. Extract verb conjugation tables
  const conjugations = extractConjugationTables(lessonText);
  for (const conj of conjugations) {
    const title = `Глаголот "${conj.verb}"`;
    const titleKey = title.toLowerCase();
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    const examples = Object.entries(conj.forms).map(([pronoun, form]) => `${pronoun} ${form}`);
    notes.push({
      title,
      content: `Conjugation of the verb "${conj.verb}"`,
      examples,
    });
  }

  // 3. B1-specific grammar patterns
  // Conditional mood (условен начин)
  if (!seenTitles.has('условен начин')) {
    if (lessonText.includes('би') && (lessonText.includes('би сакал') || lessonText.includes('би можел'))) {
      const examples = extractGrammarExamples(lessonText).filter(ex =>
        ex.includes('би ')
      );
      if (examples.length > 0) {
        notes.push({
          title: 'Условен начин (Conditional)',
          content: 'Macedonian conditional mood with "би" particle',
          examples: examples.slice(0, 5),
        });
        seenTitles.add('условен начин');
      }
    }
  }

  // Passive voice (пасив)
  if (!seenTitles.has('пасив')) {
    if (lessonText.includes('е направен') || lessonText.includes('беше направен') ||
        lessonText.includes('се прави') || lessonText.includes('е напишан')) {
      const examples = extractGrammarExamples(lessonText).filter(ex =>
        /е\s+\w+ен|се\s+\w+а/i.test(ex)
      );
      if (examples.length > 0) {
        notes.push({
          title: 'Пасив (Passive Voice)',
          content: 'Macedonian passive constructions',
          examples: examples.slice(0, 5),
        });
        seenTitles.add('пасив');
      }
    }
  }

  // Reported speech (говор)
  if (!seenTitles.has('индиректен говор')) {
    if (lessonText.includes('рече дека') || lessonText.includes('вели дека') ||
        lessonText.includes('мисли дека')) {
      const examples = extractGrammarExamples(lessonText).filter(ex =>
        ex.includes('дека') && (ex.includes('рече') || ex.includes('вели') || ex.includes('мисли'))
      );
      if (examples.length > 0) {
        notes.push({
          title: 'Индиректен говор (Reported Speech)',
          content: 'Indirect speech constructions in Macedonian',
          examples: examples.slice(0, 5),
        });
        seenTitles.add('индиректен говор');
      }
    }
  }

  return notes;
}

/**
 * Parse a single lesson from the extracted pages
 */
function parseLesson(
  pages: ExtractedPage[],
  lessonInfo: typeof LESSON_INFO[0],
  nextLessonPage: number
): StructuredLesson {
  const lessonText = extractPagesText(pages, lessonInfo.page, nextLessonPage);

  return {
    lessonNumber: lessonInfo.num,
    title: `Lesson ${lessonInfo.num}: ${lessonInfo.title}`,
    titleMk: `Лекција ${lessonInfo.num}: ${lessonInfo.title}`,
    startPage: lessonInfo.page,
    endPage: nextLessonPage - 1,
    themes: extractThemes(lessonText),
    vocabularyItems: extractVocabulary(lessonText),
    grammarNotes: extractGrammarNotes(lessonText),
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('B1 Златоврв Structure Parser');
  console.log('='.repeat(60));
  console.log();

  // Load raw extraction
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Error: Raw extraction not found at ${INPUT_PATH}`);
    console.error('Run extract-b1.ts first');
    process.exit(1);
  }

  console.log(`Loading: ${INPUT_PATH}`);
  const rawData = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  const pages: ExtractedPage[] = rawData.pages;
  console.log(`Loaded ${pages.length} pages`);
  console.log();

  // Parse each lesson
  console.log('Parsing lessons...');
  const chapters: StructuredLesson[] = [];

  for (let i = 0; i < LESSON_INFO.length; i++) {
    const lesson = LESSON_INFO[i];
    const nextPage = i < LESSON_INFO.length - 1
      ? LESSON_INFO[i + 1].page
      : pages.length + 1; // Last lesson goes to end of book

    const parsed = parseLesson(pages, lesson, nextPage);
    chapters.push(parsed);

    console.log(`  Lesson ${lesson.num}: ${lesson.title}`);
    console.log(`    Pages: ${parsed.startPage}-${parsed.endPage}`);
    console.log(`    Themes: ${parsed.themes.length}`);
    console.log(`    Vocabulary: ${parsed.vocabularyItems.length} items`);
    console.log(`    Grammar: ${parsed.grammarNotes.length} notes`);
  }

  console.log();

  // Build structured output
  const output: StructuredTextbook = {
    id: 'b1-zlatovrv',
    journeyId: 'ukim-b1',
    title: 'Златоврв',
    level: 'B1',
    chapters,
    metadata: {
      totalLessons: chapters.length,
      totalPages: pages.length,
      extractedAt: rawData.extractedAt,
      parsedAt: new Date().toISOString(),
    },
  };

  // Summary statistics
  const totalVocab = chapters.reduce((sum, ch) => sum + ch.vocabularyItems.length, 0);
  const totalGrammar = chapters.reduce((sum, ch) => sum + ch.grammarNotes.length, 0);
  const totalThemes = chapters.reduce((sum, ch) => sum + ch.themes.length, 0);

  console.log('Summary');
  console.log('-'.repeat(40));
  console.log(`  Lessons: ${chapters.length}`);
  console.log(`  Total themes: ${totalThemes}`);
  console.log(`  Total vocabulary items: ${totalVocab}`);
  console.log(`  Total grammar notes: ${totalGrammar}`);
  console.log();

  // Ensure output directory exists
  const outputDir = 'data/curriculum/structured';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Saved to: ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)} KB`);
  console.log();
  console.log('='.repeat(60));
  console.log('Parsing complete!');
  console.log('='.repeat(60));
  console.log();
  console.log('Note: This is an initial structure extraction.');
  console.log('Vocabulary and grammar detection is basic - Phase 13 will refine.');
}

main().catch(error => {
  console.error('Parsing failed:', error);
  process.exit(1);
});
