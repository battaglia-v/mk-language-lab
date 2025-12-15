#!/usr/bin/env tsx
/**
 * Content QA Validation Script
 * 
 * Runs grammar and content validation against all learning content.
 * Can be run:
 * - In CI pipeline (--ci flag exits with error code on issues)
 * - During build (--strict flag fails build on critical issues)
 * - Manually for audit reports (default)
 * 
 * Usage:
 *   npm run content:validate         # Run audit and generate report
 *   npm run content:validate -- --ci # CI mode - exit with error on issues
 *   npm run content:validate -- --strict # Strict mode - exit on any issue
 * 
 * @see /lib/content-qa/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { 
  auditAllContent, 
  formatAuditReportAsMarkdown,
} from '../lib/content-qa';
import type { ContentAuditReport, ContentAuditEntry } from '../lib/content-qa/types';

// ==================== Configuration ====================

const DATA_DIR = resolve(__dirname, '../data');
const REPORTS_DIR = resolve(__dirname, '../docs/qa-reports');

const CONTENT_FILES = {
  grammar: 'grammar-lessons.json',
  vocabulary: 'practice-vocabulary.json',
  flashcards: ['alphabet-deck.json', 'starter-deck.json', 'survival-deck.json', 'verbs-deck.json'],
  readers: 'graded-readers.json',
} as const;

// Critical issues that should fail CI
const CRITICAL_RULES = [
  'adjective_agrees_with_noun_gender',
  'verb_agrees_with_subject',
  'definite_article_agreement',
] as const;

// ==================== Helpers ====================

function loadJsonFile(filename: string): unknown {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return null;
  }
  try {
    const content = readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error parsing ${filename}:`, error);
    return null;
  }
}

function ensureReportsDir(): void {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function formatTimestamp(): string {
  return new Date().toISOString().split('T')[0];
}

// ==================== Main Validation ====================

interface ValidationResult {
  report: ContentAuditReport;
  hasCriticalIssues: boolean;
  hasAnyIssues: boolean;
}

function runFullValidation(): ValidationResult {
  console.log('\n🔍 MK Language Lab - Content QA Validation\n');
  console.log('═'.repeat(50));
  
  // Load content files
  console.log('\n📁 Loading content files...\n');
  
  const grammarLessons = loadJsonFile(CONTENT_FILES.grammar) as unknown[] ?? [];
  console.log(`   ✓ Grammar lessons: ${grammarLessons.length} lessons`);
  
  const vocabulary = loadJsonFile(CONTENT_FILES.vocabulary) as unknown[] ?? [];
  console.log(`   ✓ Vocabulary: ${vocabulary.length} items`);
  
  const flashcardDecks: unknown[] = [];
  for (const deckFile of CONTENT_FILES.flashcards) {
    const deck = loadJsonFile(deckFile);
    if (deck) {
      flashcardDecks.push(deck);
      const d = deck as Record<string, unknown>;
      const items = (d.items as unknown[]) ?? [];
      console.log(`   ✓ Flashcard deck (${deckFile}): ${items.length} cards`);
    }
  }
  
  const gradedReaders = loadJsonFile(CONTENT_FILES.readers) ?? { texts: [] };
  const r = gradedReaders as Record<string, unknown>;
  const texts = (r.texts as unknown[]) ?? [];
  console.log(`   ✓ Graded readers: ${texts.length} texts`);
  
  // Run audit
  console.log('\n🔬 Running content audit...\n');
  
  const report = auditAllContent(
    grammarLessons,
    vocabulary,
    flashcardDecks,
    gradedReaders
  );
  
  // Analyze results
  const criticalIssues = report.entries.filter((entry: ContentAuditEntry) => 
    CRITICAL_RULES.includes(entry.grammarRule as typeof CRITICAL_RULES[number])
  );
  
  return {
    report,
    hasCriticalIssues: criticalIssues.length > 0,
    hasAnyIssues: report.issuesFound > 0,
  };
}

function printSummary(result: ValidationResult): void {
  const { report, hasCriticalIssues } = result;
  
  console.log('═'.repeat(50));
  console.log('\n📊 VALIDATION SUMMARY\n');
  console.log(`   Total items scanned: ${report.totalItemsScanned}`);
  console.log(`   Issues found: ${report.issuesFound}`);
  console.log(`   Issues fixed: ${report.issuesFixed}`);
  
  if (hasCriticalIssues) {
    console.log('\n   ⚠️  CRITICAL ISSUES DETECTED\n');
    for (const entry of report.entries) {
      if (CRITICAL_RULES.includes(entry.grammarRule as typeof CRITICAL_RULES[number])) {
        console.log(`   ❌ ${entry.contentId}`);
        console.log(`      Issue: ${entry.issue}`);
        console.log(`      Current: "${entry.currentAnswer}"`);
        console.log(`      Should be: "${entry.correctAnswer}"`);
        console.log('');
      }
    }
  } else if (report.issuesFound > 0) {
    console.log('\n   ⚠️  Issues found (non-critical):\n');
    for (const entry of report.entries) {
      console.log(`   ⚡ ${entry.contentId}: ${entry.issue}`);
    }
    console.log('');
  } else {
    console.log('\n   ✅ All content passed validation!\n');
  }
}

function saveReports(report: ContentAuditReport): void {
  ensureReportsDir();
  const timestamp = formatTimestamp();
  
  // Save Markdown report
  const markdownPath = join(REPORTS_DIR, `content-audit-${timestamp}.md`);
  const markdown = formatAuditReportAsMarkdown(report);
  writeFileSync(markdownPath, markdown);
  console.log(`   📝 Markdown report: ${markdownPath}`);
  
  // Save JSON report
  const jsonPath = join(REPORTS_DIR, `content-audit-${timestamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`   📊 JSON report: ${jsonPath}`);
  
  // Update latest symlink (actually just copy for simplicity)
  const latestMarkdown = join(REPORTS_DIR, 'content-audit-latest.md');
  const latestJson = join(REPORTS_DIR, 'content-audit-latest.json');
  writeFileSync(latestMarkdown, markdown);
  writeFileSync(latestJson, JSON.stringify(report, null, 2));
  console.log('   🔗 Updated latest reports');
}

// ==================== CLI Entry Point ====================

function main(): void {
  const args = process.argv.slice(2);
  const ciMode = args.includes('--ci');
  const strictMode = args.includes('--strict');
  const quiet = args.includes('--quiet');
  
  const result = runFullValidation();
  
  if (!quiet) {
    printSummary(result);
  }
  
  // Save reports
  console.log('\n📁 Saving reports...\n');
  saveReports(result.report);
  
  console.log('\n' + '═'.repeat(50) + '\n');
  
  // Exit codes
  if (strictMode && result.hasAnyIssues) {
    console.error('❌ STRICT MODE: Validation failed - issues detected\n');
    process.exit(1);
  }
  
  if (ciMode && result.hasCriticalIssues) {
    console.error('❌ CI MODE: Validation failed - critical issues detected\n');
    process.exit(1);
  }
  
  if (result.hasAnyIssues) {
    console.log('⚠️  Validation complete with warnings\n');
    process.exit(0);
  }
  
  console.log('✅ Validation complete - all checks passed\n');
  process.exit(0);
}

main();
