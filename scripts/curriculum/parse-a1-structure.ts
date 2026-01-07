#!/usr/bin/env npx tsx
/**
 * Parse A1 (Тешкото) raw extraction into structured curriculum JSON
 * Maps to Prisma models: Module, CurriculumLesson, VocabularyItem, GrammarNote
 */

import * as fs from 'fs';
import type { ExtractedPage, StructuredVocabulary } from './types';
import { extractAllVocabulary, type VocabularyItem } from './vocabulary-patterns';
import {
  extractGrammarSections,
  extractGrammarExamples,
  extractConjugationTables,
  type GrammarSection,
} from './grammar-patterns';

const INPUT_PATH = 'data/curriculum/extracted/a1-raw.json';
const OUTPUT_PATH = 'data/curriculum/structured/a1-teskoto.json';

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
  learningPages: { label: string; startPage: number }[];
  metadata: {
    totalLessons: number;
    totalPages: number;
    extractedAt: string;
    parsedAt: string;
  };
}

// Lesson info from table of contents
const LESSON_INFO: { num: number; title: string; page: number }[] = [
  { num: 1, title: 'Јас и ти', page: 6 },
  { num: 2, title: 'Семејство', page: 15 },
  { num: 3, title: 'Прашуваме', page: 31 },
  { num: 4, title: 'Околу нас', page: 39 },
  { num: 5, title: 'Има...', page: 57 },
  { num: 6, title: 'Твојот дом', page: 65 },
  { num: 7, title: 'Што прават луѓето?', page: 78 },
  { num: 8, title: 'Јадење и пиење', page: 85 },
  { num: 9, title: 'Дали...?', page: 99 },
  { num: 10, title: 'Што купуваат луѓето?', page: 106 },
  { num: 11, title: 'Што се случува?', page: 120 },
  { num: 12, title: 'Опишување луѓе', page: 126 },
  { num: 13, title: 'Колку чини?', page: 139 },
  { num: 14, title: 'Преку годината', page: 144 },
  { num: 15, title: 'Во минатото 1', page: 156 },
  { num: 16, title: 'Околу светот', page: 160 },
  { num: 17, title: 'Во минатото 2', page: 168 },
  { num: 18, title: 'Како да стигнеш таму?', page: 171 },
  { num: 19, title: 'Не смееш да го правиш тоа!', page: 177 },
  { num: 20, title: 'Тело', page: 183 },
  { num: 21, title: 'Добро, подобро, најдобро', page: 191 },
  { num: 22, title: 'Слободно време', page: 194 },
  { num: 23, title: 'Идни планови', page: 202 },
  { num: 24, title: 'Чувства', page: 207 },
];

// Learning pages sections
const LEARNING_PAGES: { label: string; page: number }[] = [
  { label: 'А', page: 23 },
  { label: 'Б', page: 48 },
  { label: 'В', page: 71 },
  { label: 'Г', page: 92 },
  { label: 'Д', page: 114 },
  { label: 'Ѓ', page: 133 },
  { label: 'Е', page: 151 },
  { label: 'Ж', page: 164 },
  { label: 'З', page: 174 },
  { label: 'Ѕ', page: 188 },
  { label: 'И', page: 198 },
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
  const themePattern = /Тема\s+(\d+)\s*[.:]\s*([^\n]+)/gi;
  let match;

  while ((match = themePattern.exec(lessonText)) !== null) {
    const themeNum = parseInt(match[1]);
    const themeTitle = match[2].trim();

    // Extract exercises for this theme (simplified)
    const exercises: string[] = [];
    const exercisePattern = /Вежба\s+(\d+)/g;
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
 * Extract vocabulary items from text using new vocabulary extraction patterns
 * UKIM textbooks are Macedonian-only - no English translations exist
 */
function extractVocabulary(lessonText: string): StructuredVocabulary[] {
  // Use the new vocabulary extraction module
  const extracted = extractAllVocabulary(lessonText);

  // Convert to StructuredVocabulary format
  return extracted.map((item: VocabularyItem) => ({
    word: item.word,
    partOfSpeech: item.partOfSpeech,
    context: item.context,
  }));
}

/**
 * Extract grammar notes from text using both hardcoded patterns and section-based extraction
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

  // 3. Fallback: Look for pronoun tables (common grammar pattern) - keep as backup
  if (!seenTitles.has('глаголот "сум"') && !seenTitles.has('глаголот сум')) {
    if (lessonText.includes('Јас сум') && lessonText.includes('Ти си')) {
      notes.push({
        title: 'Глаголот "сум" (To be)',
        content: 'Present tense conjugation of "to be"',
        examples: ['Јас сум', 'Ти си', 'Тој/Таа/Тоа е', 'Ние сме', 'Вие сте', 'Тие се'],
      });
      seenTitles.add('глаголот "сум"');
    }
  }

  // 4. Fallback: Look for possessive patterns
  if (!seenTitles.has('присвојни заменки')) {
    if (lessonText.includes('мој') && lessonText.includes('моја') && lessonText.includes('мое')) {
      notes.push({
        title: 'Присвојни заменки (Possessive pronouns)',
        content: 'Macedonian possessive pronouns agree with noun gender',
        examples: ['мој (m)', 'моја (f)', 'мое (n)'],
      });
      seenTitles.add('присвојни заменки');
    }
  }

  // 5. Additional grammar patterns common in A1
  // Demonstratives (ова, тоа, оној)
  if (!seenTitles.has('показни заменки')) {
    if (lessonText.includes('ова') && lessonText.includes('тоа') &&
        (lessonText.includes('оној') || lessonText.includes('онаа'))) {
      const examples = extractGrammarExamples(lessonText).filter(ex =>
        ex.includes('ова') || ex.includes('тоа') || ex.includes('оној')
      );
      notes.push({
        title: 'Показни заменки (Demonstratives)',
        content: 'Macedonian demonstrative pronouns: ова (this), тоа (that), оној/онаа (that over there)',
        examples: examples.length > 0 ? examples.slice(0, 5) : ['Ова е...', 'Тоа е...', 'Оној/онаа е...'],
      });
      seenTitles.add('показни заменки');
    }
  }

  // Numbers (броеви)
  if (!seenTitles.has('броеви')) {
    if (lessonText.includes('еден') && lessonText.includes('два') && lessonText.includes('три')) {
      notes.push({
        title: 'Броеви (Numbers)',
        content: 'Macedonian cardinal numbers',
        examples: ['еден/една/едно (1)', 'два/две (2)', 'три (3)', 'четири (4)', 'пет (5)'],
      });
      seenTitles.add('броеви');
    }
  }

  // Prepositions (предлози)
  if (!seenTitles.has('предлози')) {
    const prepositionKeywords = ['во', 'на', 'со', 'од', 'за', 'до', 'кај'];
    const hasPrepositions = prepositionKeywords.filter(p => lessonText.includes(` ${p} `)).length >= 4;
    if (hasPrepositions) {
      const examples = extractGrammarExamples(lessonText).filter(ex =>
        prepositionKeywords.some(p => ex.includes(` ${p} `))
      );
      if (examples.length >= 2) {
        notes.push({
          title: 'Предлози (Prepositions)',
          content: 'Common Macedonian prepositions: во (in), на (on), со (with), од (from), за (for), до (to)',
          examples: examples.slice(0, 5),
        });
        seenTitles.add('предлози');
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
  console.log('A1 Тешкото Structure Parser');
  console.log('='.repeat(60));
  console.log();

  // Load raw extraction
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Error: Raw extraction not found at ${INPUT_PATH}`);
    console.error('Run extract-a1.ts first');
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
      : 213; // Final test starts at page 213

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
    id: 'a1-teskoto',
    journeyId: 'ukim-a1',
    title: 'Тешкото',
    level: 'A1',
    chapters,
    learningPages: LEARNING_PAGES.map(lp => ({
      label: lp.label,
      startPage: lp.page,
    })),
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
  console.log(`  Learning pages: ${LEARNING_PAGES.length}`);
  console.log(`  Total themes: ${totalThemes}`);
  console.log(`  Total vocabulary items: ${totalVocab}`);
  console.log(`  Total grammar notes: ${totalGrammar}`);
  console.log();

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
  console.log('Vocabulary and grammar detection is basic - manual review recommended.');
}

main().catch(error => {
  console.error('Parsing failed:', error);
  process.exit(1);
});
