#!/usr/bin/env npx tsx
/**
 * Audit all content sources in the repository
 * 
 * This script identifies ALL content that should be seeded into the database
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

interface ContentAudit {
  source: string;
  type: string;
  count: number;
  seeded: boolean;
  notes: string;
}

const audit: ContentAudit[] = [];

// Helper to load JSON
function loadJSON(filePath: string): any {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

console.log('📊 Content Source Audit\n');
console.log('='.repeat(80));

// 1. Curriculum - Structured JSON files
console.log('\n📚 CURRICULUM DATA (data/curriculum/structured/)\n');

const curriculumFiles = [
  'a1-teskoto-curated.json',
  'a2-lozje-curated.json', 
  'b1-zlatovrv-curated.json',
];

for (const file of curriculumFiles) {
  const filePath = path.join(DATA_DIR, 'curriculum/structured', file);
  const data = loadJSON(filePath);
  if (data) {
    const chapters = data.chapters || [];
    let vocabCount = 0;
    let grammarCount = 0;
    let themesCount = 0;
    let exerciseRefs = 0;
    
    for (const chapter of chapters) {
      vocabCount += (chapter.vocabularyItems || []).length;
      grammarCount += (chapter.grammarNotes || []).length;
      themesCount += (chapter.themes || []).length;
      for (const theme of (chapter.themes || [])) {
        exerciseRefs += (theme.exercises || []).length;
      }
    }
    
    console.log(`  ${file}:`);
    console.log(`    Lessons: ${chapters.length}`);
    console.log(`    Vocabulary: ${vocabCount}`);
    console.log(`    Grammar Notes: ${grammarCount}`);
    console.log(`    Themes: ${themesCount}`);
    console.log(`    Exercise References: ${exerciseRefs} (names only, not full content)`);
    
    audit.push({ source: file, type: 'curriculum-vocab', count: vocabCount, seeded: true, notes: 'Seeded via seed-curriculum-ukim.ts' });
    audit.push({ source: file, type: 'curriculum-grammar', count: grammarCount, seeded: true, notes: 'Seeded via seed-curriculum-ukim.ts' });
    audit.push({ source: file, type: 'curriculum-themes', count: themesCount, seeded: false, notes: 'NOT SEEDED - themes contain raw text, need parsing' });
  }
}

// 2. Grammar Lessons (standalone)
console.log('\n📖 GRAMMAR LESSONS (data/grammar-lessons.json)\n');

const grammarLessons = loadJSON(path.join(DATA_DIR, 'grammar-lessons.json'));
if (grammarLessons) {
  let totalExercises = 0;
  let totalVocab = 0;
  
  for (const lesson of grammarLessons) {
    totalExercises += (lesson.exercises || []).length;
    totalVocab += (lesson.vocabulary_list || []).length;
  }
  
  console.log(`  Lessons: ${grammarLessons.length}`);
  console.log(`  Exercises: ${totalExercises} (multiple-choice, fill-blank, etc.)`);
  console.log(`  Vocabulary: ${totalVocab}`);
  
  audit.push({ source: 'grammar-lessons.json', type: 'grammar-exercises', count: totalExercises, seeded: false, notes: 'NOT SEEDED - standalone grammar exercises' });
  audit.push({ source: 'grammar-lessons.json', type: 'grammar-vocab', count: totalVocab, seeded: false, notes: 'NOT SEEDED - grammar vocabulary' });
}

// 3. Practice Decks
console.log('\n🃏 VOCABULARY DECKS (data/decks/)\n');

const deckFiles = fs.readdirSync(path.join(DATA_DIR, 'decks')).filter(f => f.endsWith('.json'));
let totalDeckCards = 0;

for (const file of deckFiles) {
  const deck = loadJSON(path.join(DATA_DIR, 'decks', file));
  if (deck && deck.cards) {
    console.log(`  ${file}: ${deck.cards.length} cards`);
    totalDeckCards += deck.cards.length;
  }
}

console.log(`  TOTAL: ${totalDeckCards} cards across ${deckFiles.length} decks`);
audit.push({ source: 'data/decks/*.json', type: 'vocab-decks', count: totalDeckCards, seeded: false, notes: 'NOT SEEDED - used directly from JSON' });

// 4. Standalone decks
console.log('\n🎴 STANDALONE DECKS (data/)\n');

const standaloneDeckFiles = ['starter-deck.json', 'survival-deck.json', 'verbs-deck.json', 'alphabet-deck.json'];
for (const file of standaloneDeckFiles) {
  const deck = loadJSON(path.join(DATA_DIR, file));
  if (deck && deck.cards) {
    console.log(`  ${file}: ${deck.cards.length} cards`);
    audit.push({ source: file, type: 'standalone-deck', count: deck.cards.length, seeded: false, notes: 'NOT SEEDED - used directly from JSON' });
  }
}

// 5. Cloze and Fill-blanks (TypeScript seed files)
console.log('\n✏️ EXERCISE SEED DATA (data/*.ts)\n');

// These are TypeScript exports, we can't easily count them here
console.log('  cloze-seed.ts: ~20 cloze exercises');
console.log('  fill-blanks-seed.ts: 20 fill-blank exercises');
console.log('  word-gaps-seed.ts: word gap exercises');

audit.push({ source: 'cloze-seed.ts', type: 'cloze-exercises', count: 20, seeded: false, notes: 'TypeScript export - used at runtime' });
audit.push({ source: 'fill-blanks-seed.ts', type: 'fill-blank-exercises', count: 20, seeded: false, notes: 'TypeScript export - used at runtime' });

// 6. Reader content
console.log('\n📖 READER CONTENT (data/reader/)\n');

const readerDirs = ['challenges', 'conversations', 'graded', 'stories'];
for (const dir of readerDirs) {
  const dirPath = path.join(DATA_DIR, 'reader', dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    console.log(`  ${dir}/: ${files.length} files`);
    audit.push({ source: `data/reader/${dir}/`, type: 'reader-content', count: files.length, seeded: false, notes: 'NOT SEEDED - used directly from JSON' });
  }
}

// 7. Other content
console.log('\n📋 OTHER CONTENT\n');

const otherFiles = [
  'word-of-the-day.json',
  'resources.json',
  'graded-readers.json',
  'practice-vocabulary.json',
];

for (const file of otherFiles) {
  const data = loadJSON(path.join(DATA_DIR, file));
  if (data) {
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`  ${file}: ${count} items`);
    audit.push({ source: file, type: 'misc', count, seeded: false, notes: 'NOT SEEDED - used directly from JSON' });
  }
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('\n📈 AUDIT SUMMARY\n');

const seeded = audit.filter(a => a.seeded);
const notSeeded = audit.filter(a => !a.seeded);

console.log('✅ SEEDED TO DATABASE:');
for (const item of seeded) {
  console.log(`   ${item.source} (${item.type}): ${item.count} items`);
}

console.log('\n❌ NOT SEEDED (used from JSON or needs implementation):');
for (const item of notSeeded) {
  console.log(`   ${item.source} (${item.type}): ${item.count} items - ${item.notes}`);
}

console.log('\n🎯 RECOMMENDED ACTIONS:');
console.log('   1. Seed grammar-lessons.json exercises to Exercise table');
console.log('   2. Consider seeding vocabulary decks for better querying');
console.log('   3. Parse curriculum themes for structured exercises');
console.log('   4. Reader content is fine as JSON (static content)');
