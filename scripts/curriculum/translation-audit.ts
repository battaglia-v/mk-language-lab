#!/usr/bin/env npx tsx
/**
 * Translation Quality Audit Script
 *
 * Audits translation quality and consistency across curriculum and graded reader content:
 * 1. Curriculum vocabulary - empty/placeholder translations, consistency
 * 2. Grammar notes - translated examples completeness
 * 3. Graded reader vocabulary and grammar highlights
 * 4. Cross-content consistency (curriculum vs reader)
 *
 * Run with: npx tsx scripts/curriculum/translation-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const CURRICULUM_FILES: Record<string, string> = {
  A1: 'data/curriculum/structured/a1-teskoto.json',
  A2: 'data/curriculum/structured/a2-lozje.json',
  B1: 'data/curriculum/structured/b1-zlatovrv.json',
};

const READER_DIR = 'data/reader/graded';

// ============================================================================
// Types
// ============================================================================

interface CurriculumVocabItem {
  word: string;
  partOfSpeech: string;
  context?: string;
  translation: string;
  transliteration?: string;
  isCore?: boolean;
  gender?: string;
}

interface GrammarNote {
  title: string;
  content: string;
  examples?: string[];
  translatedExamples?: string[];
}

interface CurriculumChapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  vocabularyItems: CurriculumVocabItem[];
  grammarNotes?: GrammarNote[];
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: CurriculumChapter[];
}

interface ReaderVocabItem {
  mk: string;
  en: string;
  pos?: string;
}

interface ReaderGrammarExample {
  mk: string;
  en: string;
}

interface ReaderGrammarHighlight {
  title_mk: string;
  title_en: string;
  examples: ReaderGrammarExample[];
}

interface ReaderFile {
  id: string;
  title_mk: string;
  title_en: string;
  difficulty: string;
  vocabulary: ReaderVocabItem[];
  grammar_highlights?: ReaderGrammarHighlight[];
}

interface TranslationIssue {
  source: 'curriculum' | 'reader';
  level: string;
  location: string;
  mk: string;
  en: string;
  issueType: 'missing' | 'inconsistent' | 'potential_artifact' | 'grammar_example';
  severity: 'critical' | 'warning' | 'info';
  details: string;
}

interface TranslationAuditReport {
  timestamp: string;
  summary: {
    totalItemsChecked: number;
    curriculumVocabChecked: number;
    grammarNotesChecked: number;
    readerVocabChecked: number;
    readerGrammarChecked: number;
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
    byType: Record<string, number>;
  };
  issues: TranslationIssue[];
  inconsistencies: {
    word: string;
    translations: { source: string; translation: string }[];
  }[];
  recommendations: string[];
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Check if a translation is missing or placeholder
 */
function isMissingTranslation(en: string | undefined | null): boolean {
  if (!en || en.trim() === '') return true;
  if (en === '...' || en === '-' || en === 'TODO') return true;
  return false;
}

/**
 * Check if a translation appears to be a machine translation artifact
 */
function isPotentialArtifact(mk: string, en: string): { isArtifact: boolean; reason: string } {
  // Overly long translation (>100 chars may indicate artifacts)
  if (en.length > 100) {
    return { isArtifact: true, reason: 'Translation exceeds 100 characters' };
  }

  // Translation contains raw Cyrillic (untranslated)
  if (/[\u0400-\u04FF]/.test(en)) {
    return { isArtifact: true, reason: 'Translation contains Cyrillic characters' };
  }

  // Translation is identical to source (not translated)
  if (mk.toLowerCase() === en.toLowerCase()) {
    return { isArtifact: true, reason: 'Translation identical to source' };
  }

  // Translation contains suspicious patterns
  if (/\[.*\]/.test(en) && !en.includes('[pl]') && !en.includes('[m]') && !en.includes('[f]') && !en.includes('[n]')) {
    return { isArtifact: true, reason: 'Contains suspicious bracket notation' };
  }

  return { isArtifact: false, reason: '' };
}

// ============================================================================
// Audit Functions
// ============================================================================

/**
 * Audit curriculum vocabulary translations
 */
function auditCurriculumVocab(
  textbook: Textbook,
  level: string,
  translationMap: Map<string, { source: string; translation: string }[]>
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];

  for (const chapter of textbook.chapters) {
    for (const item of chapter.vocabularyItems) {
      const mk = item.word;
      const en = item.translation;

      // Track translation for consistency check
      const key = mk.toLowerCase();
      if (!translationMap.has(key)) {
        translationMap.set(key, []);
      }
      translationMap.get(key)!.push({
        source: `curriculum-${level}-L${chapter.lessonNumber}`,
        translation: en || '',
      });

      // Check for missing translation
      if (isMissingTranslation(en)) {
        issues.push({
          source: 'curriculum',
          level,
          location: `L${chapter.lessonNumber}`,
          mk,
          en: en || '',
          issueType: 'missing',
          severity: 'critical',
          details: 'Missing or empty translation',
        });
        continue;
      }

      // Check for potential artifacts
      const artifactCheck = isPotentialArtifact(mk, en);
      if (artifactCheck.isArtifact) {
        issues.push({
          source: 'curriculum',
          level,
          location: `L${chapter.lessonNumber}`,
          mk,
          en,
          issueType: 'potential_artifact',
          severity: 'warning',
          details: artifactCheck.reason,
        });
      }
    }
  }

  return issues;
}

/**
 * Audit grammar note translations
 */
function auditGrammarNotes(textbook: Textbook, level: string): TranslationIssue[] {
  const issues: TranslationIssue[] = [];

  for (const chapter of textbook.chapters) {
    const grammarNotes = chapter.grammarNotes || [];

    for (const note of grammarNotes) {
      const examples = note.examples || [];
      const translatedExamples = note.translatedExamples || [];

      // Check if examples exist but translations don't
      if (examples.length > 0 && translatedExamples.length === 0) {
        issues.push({
          source: 'curriculum',
          level,
          location: `L${chapter.lessonNumber} - ${note.title}`,
          mk: examples.slice(0, 2).join('; '),
          en: '',
          issueType: 'grammar_example',
          severity: 'warning',
          details: `${examples.length} examples without translations`,
        });
      }

      // Check for mismatched count
      if (examples.length > 0 && translatedExamples.length > 0 && examples.length !== translatedExamples.length) {
        issues.push({
          source: 'curriculum',
          level,
          location: `L${chapter.lessonNumber} - ${note.title}`,
          mk: `${examples.length} examples`,
          en: `${translatedExamples.length} translations`,
          issueType: 'grammar_example',
          severity: 'info',
          details: 'Mismatch between example count and translation count',
        });
      }
    }
  }

  return issues;
}

/**
 * Audit graded reader vocabulary and grammar
 */
function auditReaderFile(
  reader: ReaderFile,
  translationMap: Map<string, { source: string; translation: string }[]>
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];
  const level = reader.difficulty;
  const readerId = reader.id;

  // Audit vocabulary
  for (const item of reader.vocabulary) {
    const mk = item.mk;
    const en = item.en;

    // Track translation for consistency check
    const key = mk.toLowerCase();
    if (!translationMap.has(key)) {
      translationMap.set(key, []);
    }
    translationMap.get(key)!.push({
      source: `reader-${readerId}`,
      translation: en || '',
    });

    // Check for missing translation
    if (isMissingTranslation(en)) {
      issues.push({
        source: 'reader',
        level,
        location: readerId,
        mk,
        en: en || '',
        issueType: 'missing',
        severity: 'critical',
        details: 'Missing or empty translation in vocabulary',
      });
      continue;
    }

    // Check for potential artifacts
    const artifactCheck = isPotentialArtifact(mk, en);
    if (artifactCheck.isArtifact) {
      issues.push({
        source: 'reader',
        level,
        location: readerId,
        mk,
        en,
        issueType: 'potential_artifact',
        severity: 'warning',
        details: artifactCheck.reason,
      });
    }
  }

  // Audit grammar highlights
  const grammarHighlights = reader.grammar_highlights || [];
  for (const highlight of grammarHighlights) {
    // Check title translation
    if (isMissingTranslation(highlight.title_en)) {
      issues.push({
        source: 'reader',
        level,
        location: readerId,
        mk: highlight.title_mk,
        en: highlight.title_en || '',
        issueType: 'missing',
        severity: 'warning',
        details: 'Grammar highlight missing English title',
      });
    }

    // Check example translations
    for (const example of highlight.examples) {
      if (isMissingTranslation(example.en)) {
        issues.push({
          source: 'reader',
          level,
          location: `${readerId} - ${highlight.title_mk}`,
          mk: example.mk,
          en: example.en || '',
          issueType: 'grammar_example',
          severity: 'warning',
          details: 'Grammar example missing translation',
        });
      }
    }
  }

  return issues;
}

/**
 * Find inconsistent translations across sources
 */
function findInconsistencies(
  translationMap: Map<string, { source: string; translation: string }[]>
): { word: string; translations: { source: string; translation: string }[] }[] {
  const inconsistencies: { word: string; translations: { source: string; translation: string }[] }[] = [];

  for (const [word, entries] of translationMap) {
    // Normalize translations for comparison
    const uniqueTranslations = new Set(
      entries.map(e => e.translation.toLowerCase().trim())
    );

    // If more than one unique translation, flag as inconsistent
    if (uniqueTranslations.size > 1) {
      inconsistencies.push({
        word,
        translations: entries,
      });
    }
  }

  // Sort by number of different translations (most inconsistent first)
  inconsistencies.sort((a, b) => {
    const aUnique = new Set(a.translations.map(t => t.translation.toLowerCase())).size;
    const bUnique = new Set(b.translations.map(t => t.translation.toLowerCase())).size;
    return bUnique - aUnique;
  });

  return inconsistencies;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Translation Quality Audit');
  console.log('='.repeat(60));
  console.log();

  const report: TranslationAuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalItemsChecked: 0,
      curriculumVocabChecked: 0,
      grammarNotesChecked: 0,
      readerVocabChecked: 0,
      readerGrammarChecked: 0,
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
      infoIssues: 0,
      byType: {},
    },
    issues: [],
    inconsistencies: [],
    recommendations: [],
  };

  // Translation map for consistency checking
  const translationMap = new Map<string, { source: string; translation: string }[]>();

  // =========================================================================
  // Audit Curriculum
  // =========================================================================
  console.log('📚 Auditing curriculum translations...\n');

  for (const [level, filePath] of Object.entries(CURRICULUM_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.log(`  ⚠️  Skipping ${level} - file not found`);
      continue;
    }

    console.log(`  ${level}:`);
    const textbook: Textbook = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

    // Count items
    let vocabCount = 0;
    let grammarCount = 0;
    for (const chapter of textbook.chapters) {
      vocabCount += chapter.vocabularyItems.length;
      grammarCount += (chapter.grammarNotes || []).length;
    }
    report.summary.curriculumVocabChecked += vocabCount;
    report.summary.grammarNotesChecked += grammarCount;

    // Audit vocabulary
    const vocabIssues = auditCurriculumVocab(textbook, level, translationMap);
    report.issues.push(...vocabIssues);

    // Audit grammar
    const grammarIssues = auditGrammarNotes(textbook, level);
    report.issues.push(...grammarIssues);

    const levelIssues = vocabIssues.length + grammarIssues.length;
    const criticalCount = [...vocabIssues, ...grammarIssues].filter(i => i.severity === 'critical').length;

    console.log(`     Vocabulary: ${vocabCount} items, ${vocabIssues.length} issues (${criticalCount} critical)`);
    console.log(`     Grammar: ${grammarCount} notes, ${grammarIssues.length} issues`);
  }

  console.log();

  // =========================================================================
  // Audit Graded Readers
  // =========================================================================
  console.log('📖 Auditing graded reader translations...\n');

  const readerDir = path.resolve(READER_DIR);
  const readerFiles = fs.readdirSync(readerDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(readerDir, f));
  console.log(`  Found ${readerFiles.length} reader files\n`);

  for (const filePath of readerFiles) {
    const reader: ReaderFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const vocabCount = reader.vocabulary.length;
    const grammarCount = (reader.grammar_highlights || []).length;

    report.summary.readerVocabChecked += vocabCount;
    report.summary.readerGrammarChecked += grammarCount;

    const readerIssues = auditReaderFile(reader, translationMap);
    report.issues.push(...readerIssues);

    if (readerIssues.length > 0) {
      const criticalCount = readerIssues.filter(i => i.severity === 'critical').length;
      console.log(`  ${reader.id}: ${readerIssues.length} issues (${criticalCount} critical)`);
    }
  }

  console.log();

  // =========================================================================
  // Check Consistency
  // =========================================================================
  console.log('🔍 Checking translation consistency...\n');

  report.inconsistencies = findInconsistencies(translationMap);

  // Add inconsistency issues (info level)
  for (const inc of report.inconsistencies.slice(0, 50)) { // Top 50 most inconsistent
    report.issues.push({
      source: 'curriculum',
      level: 'all',
      location: 'cross-content',
      mk: inc.word,
      en: inc.translations.map(t => t.translation).join(' / '),
      issueType: 'inconsistent',
      severity: 'info',
      details: `${inc.translations.length} different translations found`,
    });
  }

  console.log(`  Found ${report.inconsistencies.length} words with inconsistent translations`);
  if (report.inconsistencies.length > 0) {
    console.log('  Top 5 most inconsistent:');
    for (const inc of report.inconsistencies.slice(0, 5)) {
      const uniqueTrans = [...new Set(inc.translations.map(t => t.translation))];
      console.log(`    "${inc.word}": ${uniqueTrans.slice(0, 3).join(', ')}${uniqueTrans.length > 3 ? '...' : ''}`);
    }
  }

  console.log();

  // =========================================================================
  // Calculate Summary
  // =========================================================================
  report.summary.totalItemsChecked =
    report.summary.curriculumVocabChecked +
    report.summary.grammarNotesChecked +
    report.summary.readerVocabChecked +
    report.summary.readerGrammarChecked;

  report.summary.totalIssues = report.issues.length;
  report.summary.criticalIssues = report.issues.filter(i => i.severity === 'critical').length;
  report.summary.warningIssues = report.issues.filter(i => i.severity === 'warning').length;
  report.summary.infoIssues = report.issues.filter(i => i.severity === 'info').length;

  // Count by type
  for (const issue of report.issues) {
    report.summary.byType[issue.issueType] = (report.summary.byType[issue.issueType] || 0) + 1;
  }

  // =========================================================================
  // Generate Recommendations
  // =========================================================================
  if (report.summary.criticalIssues > 0) {
    report.recommendations.push(
      `Fix ${report.summary.criticalIssues} critical missing translations immediately`
    );
  }

  if (report.summary.byType['grammar_example'] > 0) {
    report.recommendations.push(
      `Add translations for ${report.summary.byType['grammar_example']} grammar examples`
    );
  }

  if (report.inconsistencies.length > 20) {
    report.recommendations.push(
      `Review ${report.inconsistencies.length} words with inconsistent translations - prefer curriculum as source of truth`
    );
  }

  if (report.summary.byType['potential_artifact'] > 0) {
    report.recommendations.push(
      `Review ${report.summary.byType['potential_artifact']} potential translation artifacts`
    );
  }

  // =========================================================================
  // Print Summary
  // =========================================================================
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total items checked: ${report.summary.totalItemsChecked}`);
  console.log(`  - Curriculum vocabulary: ${report.summary.curriculumVocabChecked}`);
  console.log(`  - Grammar notes: ${report.summary.grammarNotesChecked}`);
  console.log(`  - Reader vocabulary: ${report.summary.readerVocabChecked}`);
  console.log(`  - Reader grammar: ${report.summary.readerGrammarChecked}`);
  console.log();
  console.log(`Issues found: ${report.summary.totalIssues}`);
  console.log(`  - Critical: ${report.summary.criticalIssues}`);
  console.log(`  - Warning: ${report.summary.warningIssues}`);
  console.log(`  - Info: ${report.summary.infoIssues}`);
  console.log();
  console.log('By type:');
  for (const [type, count] of Object.entries(report.summary.byType)) {
    console.log(`  - ${type}: ${count}`);
  }
  console.log();

  if (report.recommendations.length > 0) {
    console.log('Recommendations:');
    for (const rec of report.recommendations) {
      console.log(`  • ${rec}`);
    }
    console.log();
  }

  // Write report
  const outputPath = path.resolve('data/curriculum/translation-audit-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Report saved to: ${outputPath}`);

  console.log('='.repeat(60));
  if (report.summary.criticalIssues === 0) {
    console.log('✅ No critical translation issues found');
  } else {
    console.log(`⚠️  ${report.summary.criticalIssues} critical issues need attention`);
  }
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('Translation audit failed:', error);
  process.exit(1);
});
