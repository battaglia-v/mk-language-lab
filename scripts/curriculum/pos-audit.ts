#!/usr/bin/env npx tsx
/**
 * Part-of-Speech Audit Script
 *
 * Validates vocabulary partOfSpeech tags against Macedonian morphology patterns.
 * Detects high-confidence misclassifications (e.g., verbs tagged as nouns).
 *
 * Run with: npx tsx scripts/curriculum/pos-audit.ts
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

// ============================================================================
// Macedonian Morphology Patterns
// ============================================================================

/**
 * Verb endings in Macedonian (conjugated forms)
 * High-confidence: If a word ends with these AND is tagged as noun, it's likely wrong
 */
const VERB_ENDINGS = {
  // 2nd person singular present (-ш is very distinctive)
  secondPersonSingular: /[аеио]ш$/,
  // 3rd person plural present
  thirdPersonPlural: /(ат|ет|ат)$/,
  // Imperfective verbs with -ува/-ира suffixes
  imperfective: /(ува|ира)$/,
  // Past participle (л-form)
  pastParticiple: /(ал|ел|ил|ол|ла|ло|ле)$/,
  // Imperative forms
  imperative: /^(прочитај|напиши|одговори|слушај|погледни|пополни|повтори|избери|преведи|поврзи|стави|најди|вметни|објасни|опиши|запознај)$/i,
};

/**
 * Noun endings in Macedonian
 * These are typical for abstract nouns, agents, diminutives
 */
const NOUN_ENDINGS = {
  // Abstract nouns
  abstract: /(ост|ство|ње|ње|ење)$/,
  // Agent nouns
  agent: /(ец|ач|ар|тел|ник|ица)$/,
  // Diminutives
  diminutive: /(че|це|ка|ко)$/,
  // Feminine nouns
  feminine: /(а|ја|ка)$/,
};

/**
 * Adjective endings in Macedonian
 */
const ADJECTIVE_ENDINGS = {
  // Masculine indefinite
  masculine: /(ен|ов|ски|чки|ав|ив)$/,
  // Feminine
  feminine: /(на|ва|ска|чка)$/,
  // Neuter
  neuter: /(но|во|ско|чко)$/,
  // Plural/definite forms
  plural: /(ни|ви|ски|чки|ти|те)$/,
};

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

interface POSIssue {
  level: string;
  lesson: number;
  word: string;
  currentPOS: string;
  suggestedPOS: string;
  reason: string;
  translation: string;
  confidence: 'high' | 'medium' | 'low';
}

interface POSAuditReport {
  timestamp: string;
  summary: {
    totalItemsChecked: number;
    totalIssuesFound: number;
    highConfidenceIssues: number;
    mediumConfidenceIssues: number;
    lowConfidenceIssues: number;
    byLevel: Record<string, { checked: number; issues: number }>;
  };
  issues: POSIssue[];
  issuesByType: Record<string, POSIssue[]>;
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect if a word looks like a verb based on morphology
 */
function looksLikeVerb(word: string, translation: string): { isVerb: boolean; reason: string } {
  const wordLower = word.toLowerCase();

  // Check 2nd person singular (-ш ending) - VERY high confidence
  if (VERB_ENDINGS.secondPersonSingular.test(wordLower)) {
    // Also check if translation suggests verb (e.g., "you laugh", "you do")
    const translationLower = translation.toLowerCase();
    if (translationLower.startsWith('you ') || translationLower.includes('(you)')) {
      return { isVerb: true, reason: '2nd person singular verb ending (-ш) with "you" translation' };
    }
    return { isVerb: true, reason: '2nd person singular verb ending (-ш)' };
  }

  // Check -ува/-ира endings (imperfective verbs)
  if (VERB_ENDINGS.imperfective.test(wordLower)) {
    return { isVerb: true, reason: 'imperfective verb suffix (-ува/-ира)' };
  }

  // Check imperative forms
  if (VERB_ENDINGS.imperative.test(wordLower)) {
    return { isVerb: true, reason: 'imperative verb form' };
  }

  return { isVerb: false, reason: '' };
}

/**
 * Detect if a word looks like an adjective based on morphology
 */
function looksLikeAdjective(word: string): { isAdjective: boolean; reason: string } {
  const wordLower = word.toLowerCase();

  // Check plural/definite adjective endings
  if (ADJECTIVE_ENDINGS.plural.test(wordLower) && !wordLower.endsWith('ти')) {
    // "млади" could be adjective (young) or noun (young people)
    return { isAdjective: true, reason: 'plural/definite adjective ending' };
  }

  return { isAdjective: false, reason: '' };
}

/**
 * Validate a single vocabulary item's part of speech
 */
function validatePOS(item: VocabularyItem, level: string, lesson: number): POSIssue | null {
  const word = item.word;
  const currentPOS = item.partOfSpeech?.toLowerCase() || 'unknown';
  const translation = item.translation || '';

  // Check if tagged as noun but looks like verb
  if (currentPOS === 'noun') {
    const verbCheck = looksLikeVerb(word, translation);
    if (verbCheck.isVerb) {
      // Determine confidence based on evidence
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      if (verbCheck.reason.includes('"you" translation') || verbCheck.reason.includes('2nd person')) {
        confidence = 'high';
      }

      return {
        level,
        lesson,
        word,
        currentPOS: item.partOfSpeech,
        suggestedPOS: 'verb',
        reason: verbCheck.reason,
        translation,
        confidence,
      };
    }

    // Check if "млади" tagged as noun - it can be both, but in context of "young people"
    // this is actually correct as a nominalized adjective, so skip
  }

  // Check if tagged as noun but looks like adjective
  if (currentPOS === 'noun') {
    const adjCheck = looksLikeAdjective(word);
    if (adjCheck.isAdjective) {
      // Check translation for adjective patterns
      const translationLower = translation.toLowerCase();
      if (translationLower.includes('the ') && !translationLower.includes(' one')) {
        // "the empty ones" = nominalized adjective, can stay as noun
        return null;
      }

      return {
        level,
        lesson,
        word,
        currentPOS: item.partOfSpeech,
        suggestedPOS: 'adjective',
        reason: adjCheck.reason,
        translation,
        confidence: 'low', // Adjective vs nominalized is context-dependent
      };
    }
  }

  return null;
}

// ============================================================================
// Main Analysis
// ============================================================================

function analyzeLevel(filePath: string, levelName: string): { checked: number; issues: POSIssue[] } {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Skipping ${levelName} - file not found: ${filePath}`);
    return { checked: 0, issues: [] };
  }

  const data: Textbook = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const issues: POSIssue[] = [];
  let checked = 0;

  for (const chapter of data.chapters) {
    const lessonNum = chapter.lessonNumber || 0;
    const vocabItems = chapter.vocabularyItems || [];

    for (const item of vocabItems) {
      checked++;
      const issue = validatePOS(item, levelName, lessonNum);
      if (issue) {
        issues.push(issue);
      }
    }
  }

  return { checked, issues };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Part-of-Speech Audit');
  console.log('='.repeat(60));
  console.log();

  const report: POSAuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalItemsChecked: 0,
      totalIssuesFound: 0,
      highConfidenceIssues: 0,
      mediumConfidenceIssues: 0,
      lowConfidenceIssues: 0,
      byLevel: {},
    },
    issues: [],
    issuesByType: {},
  };

  // Analyze each level
  console.log('Analyzing vocabulary part-of-speech tags...\n');

  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    console.log(`📚 ${level}:`);
    const resolvedPath = path.resolve(filePath);
    const result = analyzeLevel(resolvedPath, level);

    report.summary.byLevel[level] = {
      checked: result.checked,
      issues: result.issues.length,
    };
    report.summary.totalItemsChecked += result.checked;
    report.issues.push(...result.issues);

    // Count by confidence
    for (const issue of result.issues) {
      if (issue.confidence === 'high') report.summary.highConfidenceIssues++;
      else if (issue.confidence === 'medium') report.summary.mediumConfidenceIssues++;
      else report.summary.lowConfidenceIssues++;
    }

    console.log(`   Checked: ${result.checked} items`);
    console.log(`   Issues: ${result.issues.length}`);

    // Show high-confidence issues inline
    const highConf = result.issues.filter(i => i.confidence === 'high');
    if (highConf.length > 0) {
      console.log(`   High-confidence issues:`);
      for (const issue of highConf) {
        console.log(`     - L${issue.lesson}: "${issue.word}" (${issue.currentPOS} → ${issue.suggestedPOS})`);
        console.log(`       Reason: ${issue.reason}`);
        console.log(`       Translation: "${issue.translation}"`);
      }
    }
    console.log();
  }

  report.summary.totalIssuesFound = report.issues.length;

  // Group issues by type (current POS → suggested POS)
  for (const issue of report.issues) {
    const key = `${issue.currentPOS} → ${issue.suggestedPOS}`;
    if (!report.issuesByType[key]) {
      report.issuesByType[key] = [];
    }
    report.issuesByType[key].push(issue);
  }

  // Print summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total items checked: ${report.summary.totalItemsChecked}`);
  console.log(`Total issues found: ${report.summary.totalIssuesFound}`);
  console.log(`  - High confidence: ${report.summary.highConfidenceIssues}`);
  console.log(`  - Medium confidence: ${report.summary.mediumConfidenceIssues}`);
  console.log(`  - Low confidence: ${report.summary.lowConfidenceIssues}`);
  console.log();

  if (report.summary.highConfidenceIssues > 0) {
    console.log('⚠️  High-confidence issues should be fixed:');
    for (const issue of report.issues.filter(i => i.confidence === 'high')) {
      console.log(`   ${issue.level} L${issue.lesson}: "${issue.word}" is ${issue.currentPOS}, should be ${issue.suggestedPOS}`);
    }
    console.log();
  }

  // Write report
  const outputPath = path.resolve('data/curriculum/pos-audit-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Report saved to: ${outputPath}`);
  console.log('='.repeat(60));

  // Exit with warning if high-confidence issues found
  if (report.summary.highConfidenceIssues > 0) {
    console.log(`\n⚠️  ${report.summary.highConfidenceIssues} high-confidence POS issues need attention`);
  } else {
    console.log('\n✅ No critical POS issues found');
  }
}

main().catch(error => {
  console.error('POS audit failed:', error);
  process.exit(1);
});
