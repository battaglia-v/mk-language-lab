#!/usr/bin/env npx tsx
/**
 * Audit extraction quality for UKIM Macedonian textbooks
 * Analyzes current extraction output and identifies issues for Phase 9 fixes
 */

import * as fs from 'fs';
import * as path from 'path';

// Input paths
const STRUCTURED_DIR = 'data/curriculum/structured';
const EXTRACTED_DIR = 'data/curriculum/extracted';
const OUTPUT_PATH = 'data/curriculum/audit-results.json';

// Macedonian-specific characters
const MACEDONIAN_SPECIAL_CHARS = ['ѓ', 'ќ', 'љ', 'њ', 'џ', 'Ѓ', 'Ќ', 'Љ', 'Њ', 'Џ'];

// Keywords to search for in raw text
const VOCABULARY_MARKERS = ['Речник', 'речник', 'Зборови', 'зборови', 'Лексика', 'лексика'];
const GRAMMAR_MARKERS = ['Граматика', 'граматика', 'Глагол', 'глагол', 'Именка', 'именка'];

interface LessonStats {
  lessonNumber: number;
  title: string;
  vocabularyCount: number;
  grammarNotesCount: number;
  grammarWithExplanations: number;
  grammarWith3PlusExamples: number;
  themes: number;
}

interface LevelStats {
  level: string;
  totalLessons: number;
  totalVocabulary: number;
  totalGrammarNotes: number;
  grammarWithExplanations: number;
  grammarWith3PlusExamples: number;
  lessonsWithVocabulary: number;
  lessons: LessonStats[];
}

interface RawTextAnalysis {
  level: string;
  totalPages: number;
  macedonianCharCount: number;
  hasMacedonianChars: boolean;
  vocabularyMarkerOccurrences: Record<string, number>;
  grammarMarkerOccurrences: Record<string, number>;
  potentialVocabularyPages: number[];
  potentialGrammarPages: number[];
  sampleVocabularyContext: string[];
  sampleGrammarContext: string[];
}

interface AuditResults {
  auditDate: string;
  summary: {
    totalVocabulary: number;
    totalGrammarNotes: number;
    grammarWithExplanations: number;
    grammarWith3PlusExamples: number;
    levelsAnalyzed: number;
  };
  levels: LevelStats[];
  rawTextAnalysis: RawTextAnalysis[];
  patternFailures: {
    vocabularyPattern: string;
    vocabularyIssue: string;
    grammarPattern: string;
    grammarIssue: string;
  };
  recommendations: string[];
}

/**
 * Analyze structured JSON output for a level
 */
function analyzeStructuredLevel(filePath: string): LevelStats | null {
  if (!fs.existsSync(filePath)) {
    console.log(`  Skipping ${filePath} - file not found`);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const chapters = data.chapters || [];

  const lessons: LessonStats[] = chapters.map((ch: {
    lessonNumber?: number;
    chapterNumber?: number;
    title: string;
    vocabularyItems?: unknown[];
    grammarNotes?: Array<{
      content?: string;
      examples?: unknown[];
    }>;
    themes?: unknown[];
  }) => {
    const vocabItems = ch.vocabularyItems || [];
    const grammarNotes = ch.grammarNotes || [];

    return {
      lessonNumber: ch.lessonNumber || ch.chapterNumber || 0,
      title: ch.title || '',
      vocabularyCount: vocabItems.length,
      grammarNotesCount: grammarNotes.length,
      grammarWithExplanations: grammarNotes.filter((g: { content?: string }) =>
        g.content && !g.content.includes('Grammar topic covered in Lesson')
      ).length,
      grammarWith3PlusExamples: grammarNotes.filter((g: { examples?: unknown[] }) =>
        (g.examples?.length || 0) >= 3
      ).length,
      themes: (ch.themes || []).length,
    };
  });

  const totalVocab = lessons.reduce((sum, l) => sum + l.vocabularyCount, 0);
  const totalGrammar = lessons.reduce((sum, l) => sum + l.grammarNotesCount, 0);
  const grammarWithExp = lessons.reduce((sum, l) => sum + l.grammarWithExplanations, 0);
  const grammarWith3Plus = lessons.reduce((sum, l) => sum + l.grammarWith3PlusExamples, 0);
  const lessonsWithVocab = lessons.filter(l => l.vocabularyCount > 0).length;

  return {
    level: data.level || 'Unknown',
    totalLessons: lessons.length,
    totalVocabulary: totalVocab,
    totalGrammarNotes: totalGrammar,
    grammarWithExplanations: grammarWithExp,
    grammarWith3PlusExamples: grammarWith3Plus,
    lessonsWithVocabulary: lessonsWithVocab,
    lessons,
  };
}

/**
 * Analyze raw extracted text for vocabulary/grammar markers
 */
function analyzeRawText(filePath: string, level: string): RawTextAnalysis | null {
  if (!fs.existsSync(filePath)) {
    console.log(`  Skipping ${filePath} - raw file not found`);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const pages: Array<{ pageNum: number; text: string }> = data.pages || [];

  // Count Macedonian special characters
  let macedonianCharCount = 0;
  const vocabMarkerCounts: Record<string, number> = {};
  const grammarMarkerCounts: Record<string, number> = {};
  const potentialVocabPages: number[] = [];
  const potentialGrammarPages: number[] = [];
  const vocabContextSamples: string[] = [];
  const grammarContextSamples: string[] = [];

  // Initialize counters
  VOCABULARY_MARKERS.forEach(m => vocabMarkerCounts[m] = 0);
  GRAMMAR_MARKERS.forEach(m => grammarMarkerCounts[m] = 0);

  for (const page of pages) {
    const text = page.text || '';

    // Count Macedonian chars
    for (const char of MACEDONIAN_SPECIAL_CHARS) {
      const matches = text.match(new RegExp(char, 'g'));
      macedonianCharCount += matches?.length || 0;
    }

    // Check for vocabulary markers
    for (const marker of VOCABULARY_MARKERS) {
      if (text.includes(marker)) {
        vocabMarkerCounts[marker]++;
        if (!potentialVocabPages.includes(page.pageNum)) {
          potentialVocabPages.push(page.pageNum);
        }
        // Extract context around marker (first 200 chars after marker)
        const idx = text.indexOf(marker);
        if (idx !== -1 && vocabContextSamples.length < 3) {
          const context = text.substring(idx, Math.min(idx + 200, text.length));
          vocabContextSamples.push(`Page ${page.pageNum}: ...${context}...`);
        }
      }
    }

    // Check for grammar markers
    for (const marker of GRAMMAR_MARKERS) {
      if (text.includes(marker)) {
        grammarMarkerCounts[marker]++;
        if (!potentialGrammarPages.includes(page.pageNum)) {
          potentialGrammarPages.push(page.pageNum);
        }
        // Extract context
        const idx = text.indexOf(marker);
        if (idx !== -1 && grammarContextSamples.length < 3) {
          const context = text.substring(idx, Math.min(idx + 200, text.length));
          grammarContextSamples.push(`Page ${page.pageNum}: ...${context}...`);
        }
      }
    }
  }

  return {
    level,
    totalPages: pages.length,
    macedonianCharCount,
    hasMacedonianChars: macedonianCharCount > 0,
    vocabularyMarkerOccurrences: vocabMarkerCounts,
    grammarMarkerOccurrences: grammarMarkerCounts,
    potentialVocabularyPages: potentialVocabPages.sort((a, b) => a - b),
    potentialGrammarPages: potentialGrammarPages.sort((a, b) => a - b),
    sampleVocabularyContext: vocabContextSamples,
    sampleGrammarContext: grammarContextSamples,
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('PDF Extraction Audit');
  console.log('='.repeat(60));
  console.log();

  const levels: LevelStats[] = [];
  const rawAnalysis: RawTextAnalysis[] = [];

  // Analyze structured output files
  console.log('Analyzing structured output files...');

  const a1Stats = analyzeStructuredLevel(path.join(STRUCTURED_DIR, 'a1-teskoto.json'));
  if (a1Stats) {
    levels.push(a1Stats);
    console.log(`  A1: ${a1Stats.totalLessons} lessons, ${a1Stats.totalVocabulary} vocab, ${a1Stats.totalGrammarNotes} grammar`);
  }

  const a2Stats = analyzeStructuredLevel(path.join(STRUCTURED_DIR, 'a2-lozje.json'));
  if (a2Stats) {
    levels.push(a2Stats);
    console.log(`  A2: ${a2Stats.totalLessons} lessons, ${a2Stats.totalVocabulary} vocab, ${a2Stats.totalGrammarNotes} grammar`);
  }

  const b1Stats = analyzeStructuredLevel(path.join(STRUCTURED_DIR, 'b1-zlatovrv.json'));
  if (b1Stats) {
    levels.push(b1Stats);
    console.log(`  B1: ${b1Stats.totalLessons} lessons, ${b1Stats.totalVocabulary} vocab, ${b1Stats.totalGrammarNotes} grammar`);
  }

  console.log();

  // Analyze raw extracted text
  console.log('Analyzing raw extracted text for patterns...');

  const a1Raw = analyzeRawText(path.join(EXTRACTED_DIR, 'a1-raw.json'), 'A1');
  if (a1Raw) {
    rawAnalysis.push(a1Raw);
    console.log(`  A1: ${a1Raw.totalPages} pages, ${a1Raw.macedonianCharCount} Macedonian chars`);
    console.log(`      Vocab markers found: ${a1Raw.potentialVocabularyPages.length} pages`);
    console.log(`      Grammar markers found: ${a1Raw.potentialGrammarPages.length} pages`);
  }

  const a2Raw = analyzeRawText(path.join(EXTRACTED_DIR, 'a2-raw.json'), 'A2');
  if (a2Raw) {
    rawAnalysis.push(a2Raw);
    console.log(`  A2: ${a2Raw.totalPages} pages, ${a2Raw.macedonianCharCount} Macedonian chars`);
    console.log(`      Vocab markers found: ${a2Raw.potentialVocabularyPages.length} pages`);
    console.log(`      Grammar markers found: ${a2Raw.potentialGrammarPages.length} pages`);
  }

  console.log();

  // Calculate summary
  const totalVocab = levels.reduce((sum, l) => sum + l.totalVocabulary, 0);
  const totalGrammar = levels.reduce((sum, l) => sum + l.totalGrammarNotes, 0);
  const grammarWithExp = levels.reduce((sum, l) => sum + l.grammarWithExplanations, 0);
  const grammarWith3Plus = levels.reduce((sum, l) => sum + l.grammarWith3PlusExamples, 0);

  // Build audit results
  const auditResults: AuditResults = {
    auditDate: new Date().toISOString(),
    summary: {
      totalVocabulary: totalVocab,
      totalGrammarNotes: totalGrammar,
      grammarWithExplanations: grammarWithExp,
      grammarWith3PlusExamples: grammarWith3Plus,
      levelsAnalyzed: levels.length,
    },
    levels,
    rawTextAnalysis: rawAnalysis,
    patternFailures: {
      vocabularyPattern: '([А-Яа-яЀ-ӿ]+(?:\\s+[А-Яа-яЀ-ӿ]+)*)\\s+[-–—]\\s+([a-zA-Z]+(?:\\s+[a-zA-Z]+)*)',
      vocabularyIssue: 'Pattern expects "Macedonian - English" format, but UKIM textbooks are Macedonian-only with no English translations. The regex requires Latin characters after the dash, which never exist.',
      grammarPattern: 'Hardcoded detection: looks for "Јас сум" + "Ти си" or "мој" + "моја" + "мое"',
      grammarIssue: 'Only 2 hardcoded patterns exist. Misses actual grammar sections marked with "Граматика" headers. A2 parser creates placeholder grammar notes from TOC but with empty examples and generic content.',
    },
    recommendations: [
      'Extract vocabulary from "Речник" sections - found in raw text',
      'Extract vocabulary from exercise word boxes',
      'Extract vocabulary from numbered word lists',
      'Look for Cyrillic word pairs (noun - definition in Macedonian)',
      'Parse "Граматика" sections with headers and content extraction',
      'Extract grammar examples from numbered example sentences',
      'Use position data (x, y) to identify tabular content',
      'Consider OCR cleanup for broken words and artifacts',
    ],
  };

  // Save results
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(auditResults, null, 2));

  console.log('Summary');
  console.log('-'.repeat(40));
  console.log(`  Total vocabulary items: ${totalVocab}`);
  console.log(`  Total grammar notes: ${totalGrammar}`);
  console.log(`  Grammar with real explanations: ${grammarWithExp}`);
  console.log(`  Grammar with 3+ examples: ${grammarWith3Plus}`);
  console.log();
  console.log(`Results saved to: ${OUTPUT_PATH}`);
  console.log();
  console.log('='.repeat(60));
  console.log('Audit complete!');
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
