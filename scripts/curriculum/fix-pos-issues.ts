#!/usr/bin/env npx tsx
/**
 * Fix Part-of-Speech Issues
 *
 * Fixes high-confidence verb misclassifications identified by pos-audit.ts.
 * Only fixes items where translation confirms it's a 2nd person verb (starts with "you ").
 *
 * Run with: npx tsx scripts/curriculum/fix-pos-issues.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const LEVEL_FILES: Record<string, string> = {
  A1: 'data/curriculum/structured/a1-teskoto.json',
  A2: 'data/curriculum/structured/a2-lozje.json',
  B1: 'data/curriculum/structured/b1-zlatovrv.json',
};

// Known false positives - words ending in -ш that are NOT verbs
const FALSE_POSITIVES = new Set([
  'помош', // "help" - noun
  'веднаш', // "immediately" - adverb
  'каш', // could be various
  'душ', // "shower" - noun
  'грош', // "penny" - noun
]);

// ============================================================================
// Types
// ============================================================================

interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  context?: string;
  translation?: string;
  transliteration?: string;
  isCore?: boolean;
  gender?: string;
  [key: string]: unknown;
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  vocabularyItems: VocabularyItem[];
  [key: string]: unknown;
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
  [key: string]: unknown;
}

interface FixResult {
  word: string;
  lesson: number;
  oldPOS: string;
  newPOS: string;
  translation: string;
}

// ============================================================================
// Fix Logic
// ============================================================================

/**
 * Check if a vocabulary item should be fixed
 */
function shouldFix(item: VocabularyItem): boolean {
  const word = item.word?.toLowerCase() || '';
  const translation = item.translation?.toLowerCase() || '';
  const currentPOS = item.partOfSpeech?.toLowerCase() || '';

  // Skip if not tagged as noun
  if (currentPOS !== 'noun') return false;

  // Skip known false positives
  if (FALSE_POSITIVES.has(word)) return false;

  // Check if word ends in -ш (2nd person singular verb ending)
  if (!word.endsWith('ш')) return false;

  // Only fix if translation confirms it's a verb (starts with "you ")
  if (translation.startsWith('you ')) return true;

  return false;
}

/**
 * Fix POS issues in a single level file
 */
function fixLevel(filePath: string, levelName: string): FixResult[] {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.log(`  ⚠️  Skipping ${levelName} - file not found`);
    return [];
  }

  const data: Textbook = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
  const fixes: FixResult[] = [];

  for (const chapter of data.chapters) {
    const lessonNum = chapter.lessonNumber || 0;

    for (const item of chapter.vocabularyItems || []) {
      if (shouldFix(item)) {
        fixes.push({
          word: item.word,
          lesson: lessonNum,
          oldPOS: item.partOfSpeech,
          newPOS: 'verb',
          translation: item.translation || '',
        });

        // Apply the fix
        item.partOfSpeech = 'verb';

        // Remove gender if present (verbs don't have gender in the same way)
        if (item.gender) {
          delete item.gender;
        }
      }
    }
  }

  // Write back if there were fixes
  if (fixes.length > 0) {
    fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(`  ✅ ${levelName}: Fixed ${fixes.length} items`);
  } else {
    console.log(`  ✅ ${levelName}: No fixes needed`);
  }

  return fixes;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Fix Part-of-Speech Issues');
  console.log('='.repeat(60));
  console.log();
  console.log('Fixing high-confidence verb misclassifications...');
  console.log('(Only fixing items where translation starts with "you ")\n');

  const allFixes: FixResult[] = [];

  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const fixes = fixLevel(filePath, level);
    allFixes.push(...fixes.map(f => ({ ...f, level })));
  }

  console.log();
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total items fixed: ${allFixes.length}`);
  console.log();

  if (allFixes.length > 0) {
    console.log('Fixed items:');
    for (const fix of allFixes) {
      console.log(`  - "${fix.word}" (L${fix.lesson}): ${fix.oldPOS} → ${fix.newPOS}`);
    }
    console.log();
    console.log('✅ All fixes applied. Re-run pos-audit.ts to verify.');
  } else {
    console.log('No items needed fixing.');
  }
}

main().catch(error => {
  console.error('Fix failed:', error);
  process.exit(1);
});
