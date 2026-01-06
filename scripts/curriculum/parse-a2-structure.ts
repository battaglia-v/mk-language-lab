#!/usr/bin/env npx tsx
/**
 * Parse A2 (Лозје) raw extraction into structured curriculum JSON
 * Maps to Prisma models: Module, CurriculumLesson, VocabularyItem, GrammarNote
 */

import * as fs from 'fs';
import type { ExtractedPage } from './types';

const INPUT_PATH = 'data/curriculum/extracted/a2-raw.json';
const OUTPUT_PATH = 'data/curriculum/structured/a2-lozje.json';

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

interface StructuredTextbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: StructuredLesson[];
  supplementarySections: { label: string; startPage: number }[];
  metadata: {
    totalLessons: number;
    totalPages: number;
    extractedAt: string;
    parsedAt: string;
  };
}

// Lesson info from table of contents (page 6)
// A2 has 8 comprehensive lessons (vs 24 in A1)
const LESSON_INFO: { num: number; title: string; page: number }[] = [
  { num: 1, title: 'Кои сме – што сме', page: 10 },
  { num: 2, title: 'Градот на мојата душа и душата на мојот град', page: 28 },
  { num: 3, title: 'Нејзиното височество – храната', page: 44 },
  { num: 4, title: 'Во светот на купувањето', page: 60 },
  { num: 5, title: 'Професијата – сон или реалност', page: 80 },
  { num: 6, title: 'Светот на дланка', page: 94 },
  { num: 7, title: 'Празнуваме, одбележуваме, честитаме, подаруваме...', page: 110 },
  { num: 8, title: 'Најди време!', page: 124 },
];

// Supplementary sections (listening texts, grammar reference)
const SUPPLEMENTARY_SECTIONS: { label: string; page: number }[] = [
  { label: 'Текстови за слушање и цитати', page: 139 },
  { label: 'Граматика', page: 156 },
];

// Grammar topics per lesson from TOC (pages 6-9)
const LESSON_GRAMMAR: Record<number, string[]> = {
  1: [
    'Сегашно време (презент)',
    'Определеностa кај именките – членување',
    'Придавки од имиња на географски поими',
    'Прашални реченици',
  ],
  2: [
    'Да-конструкција',
    'Бројни придавки со редно значење',
    'Долги и кратки заменски форми за директен и за индиректен предмет',
    'Идно време (футур)',
    'Прилози (адверби)',
    'Предлози (препозиции)',
  ],
  3: [
    'Заповеден начин (императив)',
    'Глаголска л-форма',
    'Можен начин (потенцијал)',
    'Модални зборови и изрази',
  ],
  4: [
    'Минато определено несвршено време (имперфект)',
    'Минато определено свршено време (аорист)',
    'Глаголска придавка',
    'Глаголска сум-конструкција',
    'Глаголска именка',
    'Индиректен предмет',
    'Реален услов',
  ],
  5: [
    'Минато неопределено време (перфект)',
    'Прилози (адверби)',
    'Честички (партикули)',
  ],
  6: [
    'Минато-идно време',
    'Нереален услов',
    'Глаголска има-конструкција',
    'Извици (интерјекции)',
  ],
  7: [
    'Можен услов',
    'Глаголски прилог',
    'Пасивни реченици',
  ],
  8: [
    'Предминато време (плусквамперфект)',
    'Сврзници (конјункции)',
    'Пресказ',
  ],
};

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
 * Extract vocabulary items from text
 * Looks for patterns like "word - translation" or tabular vocabulary
 */
function extractVocabulary(lessonText: string): StructuredVocabulary[] {
  const vocab: StructuredVocabulary[] = [];

  // Common vocabulary patterns in textbooks
  // Pattern 1: "Macedonian - English" format
  const dashPattern = /([А-Яа-яЀ-ӿ]+(?:\s+[А-Яа-яЀ-ӿ]+)*)\s+[-–—]\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/g;

  let match;
  while ((match = dashPattern.exec(lessonText)) !== null) {
    const mk = match[1].trim();
    const en = match[2].trim();

    // Filter out very short matches or common words
    if (mk.length > 2 && en.length > 2) {
      vocab.push({ macedonian: mk, english: en });
    }
  }

  return vocab;
}

/**
 * Extract grammar notes from lesson - using known grammar topics from TOC
 */
function extractGrammarNotes(lessonNum: number, lessonText: string): StructuredGrammar[] {
  const notes: StructuredGrammar[] = [];
  const grammarTopics = LESSON_GRAMMAR[lessonNum] || [];

  for (const topic of grammarTopics) {
    notes.push({
      title: topic,
      content: `Grammar topic covered in Lesson ${lessonNum}`,
      examples: [], // Would need deeper parsing to extract examples
    });
  }

  // Also detect common grammar patterns in text
  if (lessonText.includes('Јас сум') && lessonText.includes('Ти си')) {
    const existing = notes.find(n => n.title.includes('сум'));
    if (!existing) {
      notes.push({
        title: 'Глаголот "сум" (To be)',
        content: 'Present tense conjugation of "to be"',
        examples: ['Јас сум', 'Ти си', 'Тој/Таа/Тоа е', 'Ние сме', 'Вие сте', 'Тие се'],
      });
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
    grammarNotes: extractGrammarNotes(lessonInfo.num, lessonText),
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('A2 Лозје Structure Parser');
  console.log('='.repeat(60));
  console.log();

  // Load raw extraction
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Error: Raw extraction not found at ${INPUT_PATH}`);
    console.error('Run extract-a2.ts first');
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
      : SUPPLEMENTARY_SECTIONS[0].page; // First supplementary section

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
    id: 'a2-lozje',
    journeyId: 'ukim-a2',
    title: 'Лозје',
    level: 'A2',
    chapters,
    supplementarySections: SUPPLEMENTARY_SECTIONS.map(ss => ({
      label: ss.label,
      startPage: ss.page,
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
  console.log(`  Supplementary sections: ${SUPPLEMENTARY_SECTIONS.length}`);
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
  console.log('Vocabulary and grammar detection is basic - manual review recommended.');
}

main().catch(error => {
  console.error('Parsing failed:', error);
  process.exit(1);
});
