#!/usr/bin/env tsx
/**
 * Vocabulary Curation Script
 *
 * Processes all curriculum files to create curated vocabulary with:
 * 1. Removal of instructional/meta words
 * 2. Deduplication across lessons (first-appearance rule)
 * 3. Removal of weak proper nouns
 * 4. Capping to 30-50 words per lesson
 * 5. Grammar context additions where missing
 *
 * Run with: npx tsx scripts/curriculum/curate-vocabulary.ts
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

const TARGET_WORDS_PER_LESSON = 40; // Target average
const MAX_WORDS_PER_LESSON = 50;
const MIN_WORDS_PER_LESSON = 30;

// Expanded instructional/meta words list
const INSTRUCTIONAL_WORDS = new Set([
  // Imperative verbs (commands)
  'прочитај', 'напиши', 'одговори', 'слушај', 'говори', 'погледни',
  'пополни', 'повтори', 'состави', 'заокружи', 'подвлечи', 'избери',
  'преведи', 'поврзи', 'дополни', 'стави', 'означи', 'најди',
  'вметни', 'објасни', 'опиши', 'споредете', 'дискутирајте',
  'запишете', 'слушајте', 'погледнете', 'прочитајте', 'напишете',
  'одговорете', 'пополнете', 'изберете', 'преведете', 'составете',
  'зборувајте', 'кажи', 'кажете', 'провери', 'проверете',
  'додај', 'додадете', 'исправи', 'исправете', 'промени', 'променете',
  // Meta/instructional nouns
  'вежба', 'лекција', 'тема', 'пример', 'примери', 'текст', 'текстот',
  'слика', 'слики', 'задача', 'прашање', 'прашања', 'одговор',
  'одговори', 'реченици', 'реченица', 'збор', 'зборови', 'табела',
  'дијалог', 'дијалози', 'форма', 'форми', 'множина', 'еднина',
  'колона', 'колони', 'ред', 'редови', 'број', 'бројот',
  'страна', 'страница', 'точка', 'грешка', 'грешки',
  // Textbook formatting words
  'а', 'б', 'в', 'г', 'д', 'ѓ', 'е', 'ж', 'з', 'ѕ', 'и', 'ј', 'к',
  // Single letters often extracted from exercises
]);

// Proper nouns to remove (names from exercises, not vocabulary)
const NAMES_TO_REMOVE = new Set([
  'влатко', 'ема', 'андреј', 'весна', 'томислав', 'марија', 'ивана',
  'ѓорѓи', 'маја', 'сара', 'лука', 'марко', 'ива', 'петар', 'ана',
  'ангела', 'мирјана', 'миле', 'ванчо', 'наталија', 'марта',
  'соколова', 'новак', 'белучи', 'моника', 'стефан', 'никола',
  'катерина', 'елена', 'јана', 'бојан', 'дарко', 'горан',
  'славица', 'снежана', 'билјана', 'александар', 'филип',
  'тања', 'наташа', 'борис', 'димитар', 'кристијан',
]);

// Countries to keep in geography-relevant lessons, remove elsewhere
const COUNTRY_NAMES = new Set([
  'македонија', 'германија', 'франција', 'италија', 'шпанија',
  'англија', 'русија', 'кина', 'јапонија', 'америка', 'австралија',
  'бразил', 'мексико', 'канада', 'ирска', 'грција', 'турција',
  'србија', 'хрватска', 'бугарија', 'албанија', 'словенија',
  'швајцарија', 'холандија', 'белгија', 'австрија', 'полска',
  'романија', 'унгарија', 'чешка', 'словачка', 'украина',
]);

// City names to potentially keep
const CITY_NAMES = new Set([
  'скопје', 'битола', 'охрид', 'струга', 'прилеп', 'куманово',
  'тетово', 'велес', 'штип', 'кавадарци', 'гевгелија', 'струмица',
  'лондон', 'париз', 'берлин', 'рим', 'мадрид', 'виена', 'прага',
]);

// Lesson titles that relate to geography (countries are relevant)
const GEOGRAPHY_KEYWORDS = [
  'од каде', 'земја', 'држава', 'национал', 'патување', 'градови',
  'географија', 'maps', 'земји', 'националност',
];

// Gender detection patterns for Macedonian nouns
const FEMININE_ENDINGS = ['а', 'ија', 'ост', 'ина'];
const NEUTER_ENDINGS = ['о', 'е', 'ње', 'ште'];
// Masculine is default (consonant endings)

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
  category?: string;
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  startPage?: number;
  endPage?: number;
  themes?: unknown[];
  vocabularyItems: VocabularyItem[];
  grammarNotes?: unknown[];
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
}

interface CurationStats {
  level: string;
  originalTotal: number;
  afterInstructional: number;
  afterDeduplication: number;
  afterProperNouns: number;
  afterCapping: number;
  finalTotal: number;
  lessonsStats: {
    lesson: number;
    original: number;
    final: number;
  }[];
  removedCategories: {
    instructional: number;
    duplicates: number;
    properNouns: number;
    capped: number;
  };
}

// ============================================================================
// Curation Functions
// ============================================================================

function isInstructionalWord(word: string): boolean {
  const lower = word.toLowerCase();
  // Check if matches instructional words
  if (INSTRUCTIONAL_WORDS.has(lower)) return true;
  // Very short words (likely fragments or letters)
  if (word.length <= 2) return true;
  return false;
}

function isRemovableProperNoun(item: VocabularyItem, lessonTitle: string): boolean {
  const wordLower = item.word.toLowerCase();

  // Check if it's a name to remove
  if (NAMES_TO_REMOVE.has(wordLower)) return true;

  // Check if it's a country name
  if (COUNTRY_NAMES.has(wordLower)) {
    // Keep if lesson is geography-related
    const titleLower = lessonTitle.toLowerCase();
    const isGeographyLesson = GEOGRAPHY_KEYWORDS.some(kw => titleLower.includes(kw));
    return !isGeographyLesson; // Remove if NOT geography lesson
  }

  // Check if translation indicates it's just a name
  const translation = (item.translation || '').toLowerCase();
  if (translation.includes('(name)') || translation.includes('(surname)')) {
    return true;
  }

  // Check part of speech
  if (item.partOfSpeech === 'proper noun') {
    // Keep city names
    if (CITY_NAMES.has(wordLower)) return false;
    // Remove other proper nouns unless they have real translations
    if (!translation.includes(' ') && translation.length < 15) {
      return true;
    }
  }

  return false;
}

function hasWeakTranslation(item: VocabularyItem): boolean {
  const word = item.word?.trim() || '';
  const translation = item.translation?.trim() || '';

  // Empty translation
  if (!translation) return true;

  // Translation same as Macedonian (untranslated)
  if (word.toLowerCase() === translation.toLowerCase()) return true;

  // Very short translation for longer word (likely untranslated)
  if (word.length > 4 && translation.length <= 2) return true;

  return false;
}

function detectGender(item: VocabularyItem): string | undefined {
  // Skip if not a noun
  if (item.partOfSpeech !== 'noun') return undefined;

  // Already has gender
  if (item.gender) return item.gender;

  const word = item.word.toLowerCase();
  const translation = (item.translation || '').toLowerCase();

  // Check translation for gender hints
  if (translation.includes('(feminine)') || translation.includes('(f)')) return 'feminine';
  if (translation.includes('(masculine)') || translation.includes('(m)')) return 'masculine';
  if (translation.includes('(neuter)') || translation.includes('(n)')) return 'neuter';

  // Detect from word ending
  const lastChar = word.slice(-1);
  const lastTwo = word.slice(-2);
  const lastThree = word.slice(-3);

  if (FEMININE_ENDINGS.some(e => word.endsWith(e))) return 'feminine';
  if (NEUTER_ENDINGS.some(e => word.endsWith(e))) return 'neuter';

  // Default to masculine for consonant endings
  if (!/[аеиоу]$/.test(word)) return 'masculine';

  return undefined;
}

function prioritizeVocabulary(items: VocabularyItem[]): VocabularyItem[] {
  // Sort by priority:
  // 1. isCore=true items first
  // 2. Items with quality translations
  // 3. Items with example sentences (via context)
  // 4. Original order

  return items.sort((a, b) => {
    // Core items first
    if (a.isCore === true && b.isCore !== true) return -1;
    if (b.isCore === true && a.isCore !== true) return 1;

    // Quality translations next
    const aWeak = hasWeakTranslation(a);
    const bWeak = hasWeakTranslation(b);
    if (!aWeak && bWeak) return -1;
    if (aWeak && !bWeak) return 1;

    // Keep original order otherwise
    return 0;
  });
}

// ============================================================================
// Main Curation Process
// ============================================================================

function curateLevel(textbook: Textbook): { curated: Textbook; stats: CurationStats } {
  const stats: CurationStats = {
    level: textbook.level,
    originalTotal: 0,
    afterInstructional: 0,
    afterDeduplication: 0,
    afterProperNouns: 0,
    afterCapping: 0,
    finalTotal: 0,
    lessonsStats: [],
    removedCategories: {
      instructional: 0,
      duplicates: 0,
      properNouns: 0,
      capped: 0,
    },
  };

  // Track seen words across all lessons for deduplication
  const seenWords = new Set<string>();

  // Process each chapter
  for (const chapter of textbook.chapters) {
    const originalCount = chapter.vocabularyItems.length;
    stats.originalTotal += originalCount;

    // Step 1: Remove instructional words
    let filtered = chapter.vocabularyItems.filter(item => {
      if (isInstructionalWord(item.word)) {
        stats.removedCategories.instructional++;
        return false;
      }
      return true;
    });
    stats.afterInstructional += filtered.length;

    // Step 2: Deduplicate (keep only first occurrence across lessons)
    filtered = filtered.filter(item => {
      const wordLower = item.word.toLowerCase();
      if (seenWords.has(wordLower)) {
        stats.removedCategories.duplicates++;
        return false;
      }
      seenWords.add(wordLower);
      return true;
    });
    stats.afterDeduplication += filtered.length;

    // Step 3: Remove weak proper nouns
    filtered = filtered.filter(item => {
      if (isRemovableProperNoun(item, chapter.title)) {
        stats.removedCategories.properNouns++;
        return false;
      }
      return true;
    });
    stats.afterProperNouns += filtered.length;

    // Step 4: Add gender context to nouns
    for (const item of filtered) {
      const gender = detectGender(item);
      if (gender && !item.gender) {
        item.gender = gender;
      }
    }

    // Step 5: Prioritize and cap
    filtered = prioritizeVocabulary(filtered);
    if (filtered.length > MAX_WORDS_PER_LESSON) {
      const removed = filtered.length - MAX_WORDS_PER_LESSON;
      stats.removedCategories.capped += removed;
      filtered = filtered.slice(0, MAX_WORDS_PER_LESSON);
    }
    stats.afterCapping += filtered.length;
    stats.finalTotal += filtered.length;

    // Update chapter
    chapter.vocabularyItems = filtered;

    stats.lessonsStats.push({
      lesson: chapter.lessonNumber,
      original: originalCount,
      final: filtered.length,
    });
  }

  return { curated: textbook, stats };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🔧 Vocabulary Curation Script');
  console.log('='.repeat(50));
  console.log(`Target: ${MIN_WORDS_PER_LESSON}-${MAX_WORDS_PER_LESSON} words/lesson\n`);

  const allStats: CurationStats[] = [];

  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Skipping ${level.toUpperCase()}: file not found`);
      continue;
    }

    console.log(`\n📚 Processing ${level.toUpperCase()}...`);
    const textbook: Textbook = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

    const { curated, stats } = curateLevel(textbook);
    allStats.push(stats);

    // Print per-lesson summary
    for (const lesson of stats.lessonsStats) {
      const reduction = Math.round((1 - lesson.final / lesson.original) * 100);
      console.log(`   Lesson ${lesson.lesson}: ${lesson.original} → ${lesson.final} words (${reduction}% reduction)`);
    }

    // Print level summary
    const levelReduction = Math.round((1 - stats.finalTotal / stats.originalTotal) * 100);
    console.log(`\n   ${level.toUpperCase()} Summary:`);
    console.log(`   ${stats.originalTotal} → ${stats.finalTotal} total words (${levelReduction}% reduction)`);
    console.log(`   Removed breakdown:`);
    console.log(`     - Instructional: ${stats.removedCategories.instructional}`);
    console.log(`     - Duplicates: ${stats.removedCategories.duplicates}`);
    console.log(`     - Proper nouns: ${stats.removedCategories.properNouns}`);
    console.log(`     - Over cap: ${stats.removedCategories.capped}`);

    // Write curated file
    const outputPath = filePath.replace('.json', '-curated.json');
    fs.writeFileSync(path.resolve(outputPath), JSON.stringify(curated, null, 2), 'utf-8');
    console.log(`   ✅ Saved to: ${outputPath}`);
  }

  // Grand summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 CURATION SUMMARY');
  console.log('='.repeat(50));

  let grandOriginal = 0;
  let grandFinal = 0;

  for (const stats of allStats) {
    grandOriginal += stats.originalTotal;
    grandFinal += stats.finalTotal;
    const avgPerLesson = Math.round(stats.finalTotal / stats.lessonsStats.length);
    console.log(`${stats.level}: ${stats.originalTotal} → ${stats.finalTotal} (avg ${avgPerLesson}/lesson)`);
  }

  const grandReduction = Math.round((1 - grandFinal / grandOriginal) * 100);
  console.log(`\nTotal: ${grandOriginal} → ${grandFinal} (${grandReduction}% reduction)`);
  console.log(`\n✅ Curated files ready for review`);
  console.log('\nNext steps:');
  console.log('  1. Review curated files for quality');
  console.log('  2. Copy curated files to replace originals:');
  console.log('     cp data/curriculum/structured/*-curated.json to original names');
  console.log('  3. Run: npx prisma db seed');
}

main().catch(console.error);
