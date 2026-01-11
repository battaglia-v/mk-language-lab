#!/usr/bin/env tsx
/**
 * Vocabulary Audit Report Script
 *
 * Analyzes all vocabulary files and produces a detailed audit report:
 * 1. Per-lesson statistics (word counts, instructional words, proper nouns)
 * 2. Duplication analysis across lessons
 * 3. Theme alignment sampling
 * 4. Part-of-speech distribution
 *
 * Run with: npx tsx scripts/curriculum/vocabulary-audit-report.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

// Instructional/meta words to detect (imperatives and meta-terms from textbook)
const INSTRUCTIONAL_WORDS = new Set([
  // Imperative verbs (commands in exercises)
  'прочитај', 'напиши', 'одговори', 'слушај', 'говори', 'погледни',
  'пополни', 'повтори', 'состави', 'заокружи', 'подвлечи', 'избери',
  'преведи', 'поврзи', 'дополни', 'стави', 'означи', 'најди',
  'вметни', 'објасни', 'опиши', 'споредете', 'дискутирајте',
  'запишете', 'слушајте', 'погледнете', 'прочитајте', 'напишете',
  'одговорете', 'пополнете', 'изберете', 'преведете', 'составете',
  // Meta/instructional nouns
  'вежба', 'лекција', 'тема', 'пример', 'примери', 'текст',
  'слика', 'слики', 'задача', 'прашање', 'прашања', 'одговор',
  'одговори', 'реченици', 'реченица', 'збор', 'зборови', 'табела',
  'дијалог', 'дијалози', 'форма', 'форми', 'множина', 'еднина',
]);

// Common proper nouns (names) to detect
const COMMON_NAMES = new Set([
  'влатко', 'ема', 'андреј', 'весна', 'томислав', 'марија', 'ивана',
  'ѓорѓи', 'маја', 'сара', 'лука', 'марко', 'ива', 'петар', 'ана',
  'ангела', 'мирјана', 'миле', 'ванчо', 'наталија', 'марта',
  'соколова', 'новак', 'белучи', 'моника',
]);

// Country names
const COUNTRY_NAMES = new Set([
  'македонија', 'германија', 'франција', 'италија', 'шпанија',
  'англија', 'русија', 'кина', 'јапонија', 'америка', 'австралија',
  'бразил', 'мексико', 'канада', 'ирска', 'грција', 'турција',
  'србија', 'хрватска', 'бугарија', 'албанија', 'словенија',
  'швајцарија', 'холандија', 'белгија', 'австрија', 'полска',
]);

// Regex for Cyrillic capital letters
const CYRILLIC_CAPITAL_REGEX = /^[\u0400-\u042F\u0403\u0405\u0408-\u040B\u040F]/;

// ============================================================================
// Types
// ============================================================================

interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  context: string;
  translation: string;
  transliteration?: string;
  isCore?: boolean;
  gender?: string;
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  vocabularyItems: VocabularyItem[];
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
}

interface LessonStats {
  lessonNumber: number;
  title: string;
  totalWords: number;
  instructionalWords: number;
  properNouns: number;
  countryNames: number;
  weakTranslations: number;
  qualityTranslations: number;
  coreWords: number;
  partOfSpeech: Record<string, number>;
  instructionalWordsList: string[];
  properNounsList: string[];
}

interface DuplicationEntry {
  word: string;
  firstLesson: number;
  allLessons: number[];
  level: string;
}

interface AuditReport {
  timestamp: string;
  summary: {
    totalVocabulary: number;
    byLevel: Record<string, number>;
    instructionalWordsTotal: number;
    properNounsTotal: number;
    duplicatesTotal: number;
    targetReduction: string;
  };
  levels: Record<string, {
    totalWords: number;
    lessonCount: number;
    avgWordsPerLesson: number;
    minWordsPerLesson: number;
    maxWordsPerLesson: number;
    lessons: LessonStats[];
  }>;
  duplication: {
    crossLesson: DuplicationEntry[];
    crossLevel: { word: string; levels: string[] }[];
  };
  recommendations: string[];
}

// ============================================================================
// Analysis Functions
// ============================================================================

function isInstructionalWord(word: string): boolean {
  return INSTRUCTIONAL_WORDS.has(word.toLowerCase());
}

function isProperNoun(item: VocabularyItem): boolean {
  const word = item.word;
  const translation = item.translation || '';
  const wordLower = word.toLowerCase();

  // Check if it's a known name
  if (COMMON_NAMES.has(wordLower)) return true;

  // Check if it's a country name
  if (COUNTRY_NAMES.has(wordLower)) return true;

  // Check if part of speech indicates proper noun
  if (item.partOfSpeech === 'proper noun') return true;

  // Check if starts with capital and translation looks like transliteration
  if (CYRILLIC_CAPITAL_REGEX.test(word)) {
    const translationLower = translation.toLowerCase();
    // If translation is just the name + "(name)" or similar pattern
    if (translationLower.includes('(name)') || translationLower.includes('(surname)')) {
      return true;
    }
    // If translation is very similar length and looks like transliteration
    if (Math.abs(word.length - translation.length) <= 2 && /^[A-Z][a-z]+$/.test(translation)) {
      return true;
    }
  }

  return false;
}

function isWeakTranslation(item: VocabularyItem): boolean {
  const word = item.word?.trim() || '';
  const translation = item.translation?.trim() || '';

  // Empty translation
  if (!translation) return true;

  // Translation same as Macedonian (untranslated)
  if (word.toLowerCase() === translation.toLowerCase()) return true;

  // Very short translation for longer word
  if (word.length > 3 && translation.length <= 2) return true;

  // Translation looks like just transliteration (similar length, all lowercase letters)
  if (Math.abs(word.length - translation.length) <= 2 && /^[a-z]+$/i.test(translation)) {
    // Likely transliteration if no spaces and similar length
    if (!translation.includes(' ') && !translation.includes('(')) {
      return true;
    }
  }

  return false;
}

function analyzeLesson(chapter: Chapter): LessonStats {
  const items = chapter.vocabularyItems;
  const stats: LessonStats = {
    lessonNumber: chapter.lessonNumber,
    title: chapter.title,
    totalWords: items.length,
    instructionalWords: 0,
    properNouns: 0,
    countryNames: 0,
    weakTranslations: 0,
    qualityTranslations: 0,
    coreWords: 0,
    partOfSpeech: {},
    instructionalWordsList: [],
    properNounsList: [],
  };

  for (const item of items) {
    // Count part of speech
    const pos = item.partOfSpeech || 'unknown';
    stats.partOfSpeech[pos] = (stats.partOfSpeech[pos] || 0) + 1;

    // Count core words
    if (item.isCore === true) {
      stats.coreWords++;
    }

    // Check for instructional words
    if (isInstructionalWord(item.word)) {
      stats.instructionalWords++;
      stats.instructionalWordsList.push(item.word);
    }

    // Check for proper nouns
    if (isProperNoun(item)) {
      if (COUNTRY_NAMES.has(item.word.toLowerCase())) {
        stats.countryNames++;
      } else {
        stats.properNouns++;
        stats.properNounsList.push(item.word);
      }
    }

    // Check translation quality
    if (isWeakTranslation(item)) {
      stats.weakTranslations++;
    } else {
      stats.qualityTranslations++;
    }
  }

  return stats;
}

function findDuplicates(textbooks: Map<string, Textbook>): {
  crossLesson: DuplicationEntry[];
  crossLevel: { word: string; levels: string[] }[];
} {
  // Track first occurrence of each word within each level
  const wordsByLevel: Map<string, Map<string, { firstLesson: number; allLessons: number[] }>> = new Map();
  // Track which levels contain each word
  const wordAcrossLevels: Map<string, Set<string>> = new Map();

  for (const [level, textbook] of textbooks) {
    const levelWords = new Map<string, { firstLesson: number; allLessons: number[] }>();

    for (const chapter of textbook.chapters) {
      for (const item of chapter.vocabularyItems) {
        const wordLower = item.word.toLowerCase();

        // Track within level
        if (levelWords.has(wordLower)) {
          levelWords.get(wordLower)!.allLessons.push(chapter.lessonNumber);
        } else {
          levelWords.set(wordLower, {
            firstLesson: chapter.lessonNumber,
            allLessons: [chapter.lessonNumber],
          });
        }

        // Track across levels
        if (!wordAcrossLevels.has(wordLower)) {
          wordAcrossLevels.set(wordLower, new Set());
        }
        wordAcrossLevels.get(wordLower)!.add(level);
      }
    }

    wordsByLevel.set(level, levelWords);
  }

  // Find cross-lesson duplicates (within level)
  const crossLesson: DuplicationEntry[] = [];
  for (const [level, levelWords] of wordsByLevel) {
    for (const [word, data] of levelWords) {
      if (data.allLessons.length > 1) {
        crossLesson.push({
          word,
          firstLesson: data.firstLesson,
          allLessons: data.allLessons,
          level,
        });
      }
    }
  }

  // Find cross-level duplicates
  const crossLevel: { word: string; levels: string[] }[] = [];
  for (const [word, levels] of wordAcrossLevels) {
    if (levels.size > 1) {
      crossLevel.push({
        word,
        levels: Array.from(levels).sort(),
      });
    }
  }

  return { crossLesson, crossLevel };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('📊 Vocabulary Audit Report');
  console.log('='.repeat(50));
  console.log('');

  const textbooks = new Map<string, Textbook>();
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalVocabulary: 0,
      byLevel: {},
      instructionalWordsTotal: 0,
      properNounsTotal: 0,
      duplicatesTotal: 0,
      targetReduction: '',
    },
    levels: {},
    duplication: { crossLesson: [], crossLevel: [] },
    recommendations: [],
  };

  // Process each level
  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Skipping ${level.toUpperCase()}: file not found`);
      continue;
    }

    console.log(`\n📚 Analyzing ${level.toUpperCase()}...`);
    const textbook: Textbook = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
    textbooks.set(level, textbook);

    const lessonStats: LessonStats[] = [];
    let levelTotal = 0;
    let levelInstructional = 0;
    let levelProperNouns = 0;

    for (const chapter of textbook.chapters) {
      const stats = analyzeLesson(chapter);
      lessonStats.push(stats);
      levelTotal += stats.totalWords;
      levelInstructional += stats.instructionalWords;
      levelProperNouns += stats.properNouns + stats.countryNames;

      // Print lesson summary
      const issues: string[] = [];
      if (stats.instructionalWords > 0) issues.push(`${stats.instructionalWords} instructional`);
      if (stats.properNouns > 0) issues.push(`${stats.properNouns} names`);
      if (stats.countryNames > 0) issues.push(`${stats.countryNames} countries`);
      if (stats.weakTranslations > 0) issues.push(`${stats.weakTranslations} weak translations`);

      const issueStr = issues.length > 0 ? ` [${issues.join(', ')}]` : '';
      console.log(`   Lesson ${chapter.lessonNumber}: ${stats.totalWords} words (${stats.coreWords} core)${issueStr}`);
    }

    // Level statistics
    const wordCounts = lessonStats.map(s => s.totalWords);
    const avgWords = Math.round(levelTotal / textbook.chapters.length);
    const minWords = Math.min(...wordCounts);
    const maxWords = Math.max(...wordCounts);

    report.levels[level] = {
      totalWords: levelTotal,
      lessonCount: textbook.chapters.length,
      avgWordsPerLesson: avgWords,
      minWordsPerLesson: minWords,
      maxWordsPerLesson: maxWords,
      lessons: lessonStats,
    };

    report.summary.byLevel[level] = levelTotal;
    report.summary.totalVocabulary += levelTotal;
    report.summary.instructionalWordsTotal += levelInstructional;
    report.summary.properNounsTotal += levelProperNouns;

    console.log(`\n   ${level.toUpperCase()} Summary:`);
    console.log(`   Total: ${levelTotal} words across ${textbook.chapters.length} lessons`);
    console.log(`   Average: ${avgWords} words/lesson (range: ${minWords}-${maxWords})`);
    console.log(`   Instructional words found: ${levelInstructional}`);
    console.log(`   Proper nouns found: ${levelProperNouns}`);
  }

  // Find duplicates
  console.log('\n🔍 Analyzing duplicates...');
  report.duplication = findDuplicates(textbooks);

  const crossLessonDupes = report.duplication.crossLesson.length;
  const crossLevelDupes = report.duplication.crossLevel.length;
  report.summary.duplicatesTotal = crossLessonDupes;

  console.log(`   Cross-lesson duplicates: ${crossLessonDupes} words appear in multiple lessons`);
  console.log(`   Cross-level duplicates: ${crossLevelDupes} words appear in multiple levels`);

  // Calculate target reduction
  const targetPerLesson = 40; // Target 40 words/lesson
  let totalLessons = 0;
  for (const levelData of Object.values(report.levels)) {
    totalLessons += levelData.lessonCount;
  }
  const targetTotal = targetPerLesson * totalLessons;
  const reductionPercent = Math.round((1 - targetTotal / report.summary.totalVocabulary) * 100);
  report.summary.targetReduction = `${report.summary.totalVocabulary} → ${targetTotal} (${reductionPercent}% reduction)`;

  // Generate recommendations
  report.recommendations = [
    `Remove ${report.summary.instructionalWordsTotal} instructional/meta words (прочитај, вежба, etc.)`,
    `Review ${report.summary.properNounsTotal} proper nouns - remove random names, keep relevant geography`,
    `Deduplicate ${crossLessonDupes} words that appear in multiple lessons within same level`,
    `Cap each lesson at 30-50 words, prioritizing isCore=true items`,
    `Focus on theme alignment - ensure words match lesson topics`,
  ];

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total vocabulary: ${report.summary.totalVocabulary}`);
  console.log(`  - A1: ${report.summary.byLevel.a1 || 0}`);
  console.log(`  - A2: ${report.summary.byLevel.a2 || 0}`);
  console.log(`  - B1: ${report.summary.byLevel.b1 || 0}`);
  console.log(`\nIssues identified:`);
  console.log(`  - Instructional words: ${report.summary.instructionalWordsTotal}`);
  console.log(`  - Proper nouns: ${report.summary.properNounsTotal}`);
  console.log(`  - Cross-lesson duplicates: ${crossLessonDupes}`);
  console.log(`\nTarget reduction: ${report.summary.targetReduction}`);
  console.log(`\nRecommendations:`);
  for (const rec of report.recommendations) {
    console.log(`  • ${rec}`);
  }

  // Write report to file
  const outputPath = path.resolve('data/curriculum/vocabulary-audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ Full report saved to: ${outputPath}`);
}

main().catch(console.error);
