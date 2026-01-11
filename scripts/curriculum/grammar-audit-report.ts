#!/usr/bin/env tsx
/**
 * Grammar Audit Report Script
 *
 * Analyzes grammar notes across all levels and produces a detailed audit report:
 * 1. Per-lesson grammar stats (number of notes, titles)
 * 2. Quality detection (PDF artifacts, weak content, missing structure)
 * 3. Duplication analysis across lessons
 * 4. CEFR alignment check
 *
 * Run with: npx tsx scripts/curriculum/grammar-audit-report.ts
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

// PDF artifact detection patterns
const PDF_ARTIFACT_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'spaced_letters', pattern: /[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ]\s[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ]\s[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ]/i },
  { name: 'raw_macedonian_fragments', pattern: /вуваат|ријатели|се јават|Прочитај|Најдете|Пронајдете/i },
  { name: 'exercise_instructions', pattern: /Вежба \d|во текстот|Пасус \d|пасусот|заменети ги/i },
  { name: 'incomplete_sentence', pattern: /\.\.\.$|\.\.\.[\s]*$|[^.!?]$/ },
  { name: 'mixed_notation', pattern: /\(\s*[ivx]+\s*\)|\(\s*\d+\s*\)/i },
  { name: 'grammar_header_artifact', pattern: /Г\s*Р\s*А\s*М\s*А\s*Т\s*И\s*K\s*A/i },
];

// CEFR-aligned grammar topics by level
const CEFR_GRAMMAR_TOPICS: Record<string, string[]> = {
  a1: [
    'сум', 'to be', 'present tense', 'pronouns', 'possessive',
    'numbers', 'gender', 'adjective agreement', 'singular', 'plural',
    'questions', 'negation', 'има', 'имам', 'basic conjugation',
  ],
  a2: [
    'articles', 'членување', 'definite', 'tripartite',
    'да-constructions', 'да-конструкција', 'modal',
    'past tense', 'aorist', 'imperfect', 'минато',
    'future', 'идно', 'potential', 'можен',
    'passive', 'reflexive', 'aspect',
  ],
  b1: [
    'aspect', 'вид', 'perfective', 'imperfective',
    'conditionals', 'условни', 'reported speech',
    'complex sentences', 'relative clauses',
    'advanced articles', 'има perfect', 'перфект',
    'participles', 'voice', 'mood',
  ],
};

// ============================================================================
// Types
// ============================================================================

interface GrammarNote {
  title: string;
  content: string;
  examples?: string[];
  translatedExamples?: string[];
}

interface Chapter {
  lessonNumber: number;
  title: string;
  titleMk: string;
  grammarNotes?: GrammarNote[];
}

interface Textbook {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
}

interface GrammarNoteIssue {
  lessonNumber: number;
  noteIndex: number;
  noteTitle: string;
  issues: string[];
  severity: 'critical' | 'warning' | 'info';
  contentPreview: string;
}

interface LessonGrammarStats {
  lessonNumber: number;
  title: string;
  noteCount: number;
  noteTitles: string[];
  avgContentLength: number;
  hasExamples: number;
  hasTranslatedExamples: number;
  issues: GrammarNoteIssue[];
}

interface LevelStats {
  totalNotes: number;
  lessonCount: number;
  avgNotesPerLesson: number;
  minNotesPerLesson: number;
  maxNotesPerLesson: number;
  lessons: LessonGrammarStats[];
  qualityScore: number;
  cefrAlignmentScore: number;
}

interface DuplicationEntry {
  title: string;
  normalizedTitle: string;
  lessons: number[];
  level: string;
}

interface AuditReport {
  timestamp: string;
  summary: {
    totalGrammarNotes: number;
    byLevel: Record<string, number>;
    notesWithPdfArtifacts: number;
    notesNeedingRewrite: number;
    qualityScoreOverall: number;
  };
  levels: Record<string, LevelStats>;
  duplication: {
    withinLevel: DuplicationEntry[];
    crossLevel: { title: string; levels: string[] }[];
  };
  notesNeedingRewrite: Array<{
    level: string;
    lessonNumber: number;
    noteIndex: number;
    title: string;
    reasons: string[];
  }>;
  cefrAlignment: Record<string, {
    expected: string[];
    found: string[];
    missing: string[];
  }>;
  recommendations: string[];
}

// ============================================================================
// Analysis Functions
// ============================================================================

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/["""'']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectPdfArtifacts(content: string): string[] {
  const found: string[] = [];
  for (const { name, pattern } of PDF_ARTIFACT_PATTERNS) {
    if (pattern.test(content)) {
      found.push(name);
    }
  }
  return found;
}

function analyzeStructure(note: GrammarNote): string[] {
  const issues: string[] = [];

  // Check for missing title
  if (!note.title || note.title.trim().length === 0) {
    issues.push('missing_title');
  }

  // Check for missing or short content
  if (!note.content || note.content.trim().length === 0) {
    issues.push('missing_content');
  } else if (note.content.length < 50) {
    issues.push('content_too_short');
  }

  // Check for examples
  if (!note.examples || note.examples.length === 0) {
    issues.push('missing_examples');
  }

  // Check for translated examples
  if (!note.translatedExamples || note.translatedExamples.length === 0) {
    issues.push('missing_translated_examples');
  } else if (note.examples && note.translatedExamples.length !== note.examples.length) {
    issues.push('example_translation_mismatch');
  }

  return issues;
}

function checkContentQuality(content: string): string[] {
  const issues: string[] = [];

  // Content appears to be raw Macedonian without English explanation
  const cyrillicCount = (content.match(/[А-Яа-яЃѓЅѕЈјЉљЊњЌќЏџ]/g) || []).length;
  const latinCount = (content.match(/[A-Za-z]/g) || []).length;

  if (cyrillicCount > latinCount * 2 && content.length > 100) {
    issues.push('mostly_macedonian_content');
  }

  // Check for exercise instructions mixed in
  if (/Прочитајте|Одговорете|Најдете|Пронајдете|во текстот/i.test(content)) {
    issues.push('contains_exercise_instructions');
  }

  // Check if content trails off mid-sentence
  if (/[^.!?]\s*$/.test(content) && content.length > 50) {
    issues.push('incomplete_content');
  }

  return issues;
}

function getSeverity(issues: string[]): 'critical' | 'warning' | 'info' {
  const criticalIssues = [
    'grammar_header_artifact', 'spaced_letters', 'raw_macedonian_fragments',
    'missing_content', 'mostly_macedonian_content', 'contains_exercise_instructions',
  ];

  const warningIssues = [
    'incomplete_sentence', 'mixed_notation', 'exercise_instructions',
    'missing_examples', 'incomplete_content', 'content_too_short',
  ];

  if (issues.some(i => criticalIssues.includes(i))) {
    return 'critical';
  }
  if (issues.some(i => warningIssues.includes(i))) {
    return 'warning';
  }
  return 'info';
}

function calculateQualityScore(stats: LessonGrammarStats[]): number {
  if (stats.length === 0) return 100;

  let totalNotes = 0;
  let issueCount = 0;

  for (const lesson of stats) {
    totalNotes += lesson.noteCount;
    for (const issue of lesson.issues) {
      if (issue.severity === 'critical') issueCount += 3;
      else if (issue.severity === 'warning') issueCount += 1;
    }
  }

  if (totalNotes === 0) return 100;

  const score = Math.max(0, 100 - (issueCount / totalNotes) * 25);
  return Math.round(score);
}

function checkCefrAlignment(notes: GrammarNote[], level: string): { found: string[]; missing: string[] } {
  const expectedTopics = CEFR_GRAMMAR_TOPICS[level] || [];
  const found: string[] = [];
  const missing: string[] = [];

  for (const topic of expectedTopics) {
    const topicLower = topic.toLowerCase();
    let isFound = false;

    for (const note of notes) {
      const titleLower = note.title?.toLowerCase() || '';
      const contentLower = note.content?.toLowerCase() || '';

      if (titleLower.includes(topicLower) || contentLower.includes(topicLower)) {
        isFound = true;
        break;
      }
    }

    if (isFound) {
      found.push(topic);
    } else {
      missing.push(topic);
    }
  }

  return { found, missing };
}

function analyzeLesson(chapter: Chapter): LessonGrammarStats {
  const notes = chapter.grammarNotes || [];

  const stats: LessonGrammarStats = {
    lessonNumber: chapter.lessonNumber,
    title: chapter.title,
    noteCount: notes.length,
    noteTitles: notes.map(n => n.title),
    avgContentLength: 0,
    hasExamples: 0,
    hasTranslatedExamples: 0,
    issues: [],
  };

  if (notes.length === 0) {
    return stats;
  }

  let totalContentLength = 0;

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    totalContentLength += (note.content || '').length;

    if (note.examples && note.examples.length > 0) {
      stats.hasExamples++;
    }
    if (note.translatedExamples && note.translatedExamples.length > 0) {
      stats.hasTranslatedExamples++;
    }

    // Collect all issues for this note
    const allIssues: string[] = [];

    // Check for PDF artifacts
    const pdfArtifacts = detectPdfArtifacts(note.content || '');
    allIssues.push(...pdfArtifacts);

    // Check structure
    const structureIssues = analyzeStructure(note);
    allIssues.push(...structureIssues);

    // Check content quality
    const qualityIssues = checkContentQuality(note.content || '');
    allIssues.push(...qualityIssues);

    if (allIssues.length > 0) {
      stats.issues.push({
        lessonNumber: chapter.lessonNumber,
        noteIndex: i,
        noteTitle: note.title,
        issues: allIssues,
        severity: getSeverity(allIssues),
        contentPreview: (note.content || '').substring(0, 100) + '...',
      });
    }
  }

  stats.avgContentLength = Math.round(totalContentLength / notes.length);

  return stats;
}

function findDuplicates(textbooks: Map<string, Textbook>): {
  withinLevel: DuplicationEntry[];
  crossLevel: { title: string; levels: string[] }[];
} {
  // Track titles within each level
  const titlesByLevel: Map<string, Map<string, number[]>> = new Map();
  // Track titles across all levels
  const titleAcrossLevels: Map<string, Set<string>> = new Map();

  for (const [level, textbook] of textbooks) {
    const levelTitles = new Map<string, number[]>();

    for (const chapter of textbook.chapters) {
      const notes = chapter.grammarNotes || [];

      for (const note of notes) {
        const normalized = normalizeTitle(note.title);

        // Track within level
        if (!levelTitles.has(normalized)) {
          levelTitles.set(normalized, []);
        }
        levelTitles.get(normalized)!.push(chapter.lessonNumber);

        // Track across levels
        if (!titleAcrossLevels.has(normalized)) {
          titleAcrossLevels.set(normalized, new Set());
        }
        titleAcrossLevels.get(normalized)!.add(level);
      }
    }

    titlesByLevel.set(level, levelTitles);
  }

  // Find within-level duplicates
  const withinLevel: DuplicationEntry[] = [];
  for (const [level, levelTitles] of titlesByLevel) {
    for (const [normalized, lessons] of levelTitles) {
      if (lessons.length > 1) {
        // Find original title
        let originalTitle = normalized;
        for (const [, textbook] of textbooks) {
          if (textbook.level.toLowerCase() === level) {
            for (const ch of textbook.chapters) {
              for (const note of ch.grammarNotes || []) {
                if (normalizeTitle(note.title) === normalized) {
                  originalTitle = note.title;
                  break;
                }
              }
            }
          }
        }

        withinLevel.push({
          title: originalTitle,
          normalizedTitle: normalized,
          lessons: [...new Set(lessons)],
          level,
        });
      }
    }
  }

  // Find cross-level duplicates
  const crossLevel: { title: string; levels: string[] }[] = [];
  for (const [normalized, levels] of titleAcrossLevels) {
    if (levels.size > 1) {
      crossLevel.push({
        title: normalized,
        levels: Array.from(levels).sort(),
      });
    }
  }

  return { withinLevel, crossLevel };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('📖 Grammar Audit Report');
  console.log('='.repeat(50));
  console.log('');

  const textbooks = new Map<string, Textbook>();
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalGrammarNotes: 0,
      byLevel: {},
      notesWithPdfArtifacts: 0,
      notesNeedingRewrite: 0,
      qualityScoreOverall: 0,
    },
    levels: {},
    duplication: { withinLevel: [], crossLevel: [] },
    notesNeedingRewrite: [],
    cefrAlignment: {},
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

    const lessonStats: LessonGrammarStats[] = [];
    let levelTotal = 0;
    let levelArtifacts = 0;
    const allNotes: GrammarNote[] = [];

    for (const chapter of textbook.chapters) {
      const stats = analyzeLesson(chapter);
      lessonStats.push(stats);
      levelTotal += stats.noteCount;

      // Collect all notes for CEFR alignment check
      allNotes.push(...(chapter.grammarNotes || []));

      // Count artifacts and collect notes needing rewrite
      for (const issue of stats.issues) {
        if (issue.issues.some(i => PDF_ARTIFACT_PATTERNS.some(p => p.name === i))) {
          levelArtifacts++;
        }
        if (issue.severity === 'critical' || issue.severity === 'warning') {
          report.notesNeedingRewrite.push({
            level,
            lessonNumber: issue.lessonNumber,
            noteIndex: issue.noteIndex,
            title: issue.noteTitle,
            reasons: issue.issues,
          });
        }
      }

      // Print lesson summary
      const issueCount = stats.issues.length;
      const criticalCount = stats.issues.filter(i => i.severity === 'critical').length;
      const warningCount = stats.issues.filter(i => i.severity === 'warning').length;

      let issueStr = '';
      if (issueCount > 0) {
        const parts: string[] = [];
        if (criticalCount > 0) parts.push(`${criticalCount} critical`);
        if (warningCount > 0) parts.push(`${warningCount} warning`);
        issueStr = ` [${parts.join(', ')}]`;
      }

      console.log(`   Lesson ${chapter.lessonNumber}: ${stats.noteCount} notes${issueStr}`);
    }

    // Check CEFR alignment
    const { found, missing } = checkCefrAlignment(allNotes, level);
    report.cefrAlignment[level] = {
      expected: CEFR_GRAMMAR_TOPICS[level] || [],
      found,
      missing,
    };

    // Level statistics
    const noteCounts = lessonStats.map(s => s.noteCount);
    const avgNotes = noteCounts.length > 0 ? Math.round(levelTotal / textbook.chapters.length) : 0;
    const minNotes = noteCounts.length > 0 ? Math.min(...noteCounts) : 0;
    const maxNotes = noteCounts.length > 0 ? Math.max(...noteCounts) : 0;
    const qualityScore = calculateQualityScore(lessonStats);
    const cefrScore = found.length > 0 ? Math.round((found.length / (found.length + missing.length)) * 100) : 0;

    report.levels[level] = {
      totalNotes: levelTotal,
      lessonCount: textbook.chapters.length,
      avgNotesPerLesson: avgNotes,
      minNotesPerLesson: minNotes,
      maxNotesPerLesson: maxNotes,
      lessons: lessonStats,
      qualityScore,
      cefrAlignmentScore: cefrScore,
    };

    report.summary.byLevel[level] = levelTotal;
    report.summary.totalGrammarNotes += levelTotal;
    report.summary.notesWithPdfArtifacts += levelArtifacts;

    console.log(`\n   ${level.toUpperCase()} Summary:`);
    console.log(`   Total: ${levelTotal} notes across ${textbook.chapters.length} lessons`);
    console.log(`   Average: ${avgNotes} notes/lesson (range: ${minNotes}-${maxNotes})`);
    console.log(`   PDF artifacts: ${levelArtifacts} notes affected`);
    console.log(`   Quality score: ${qualityScore}/100`);
    console.log(`   CEFR alignment: ${cefrScore}% (${found.length}/${found.length + missing.length} topics)`);
  }

  // Find duplicates
  console.log('\n🔍 Analyzing duplicates...');
  report.duplication = findDuplicates(textbooks);

  const withinLevelDupes = report.duplication.withinLevel.length;
  const crossLevelDupes = report.duplication.crossLevel.length;

  console.log(`   Within-level duplicates: ${withinLevelDupes} titles appear multiple times`);
  console.log(`   Cross-level duplicates: ${crossLevelDupes} titles appear in multiple levels`);

  // Calculate overall stats
  report.summary.notesNeedingRewrite = report.notesNeedingRewrite.length;

  const qualityScores = Object.values(report.levels).map(l => l.qualityScore);
  report.summary.qualityScoreOverall = qualityScores.length > 0
    ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
    : 0;

  // Generate recommendations
  report.recommendations = [];

  if (report.summary.notesWithPdfArtifacts > 0) {
    report.recommendations.push(
      `Clean ${report.summary.notesWithPdfArtifacts} grammar notes with PDF artifacts (spaced letters, raw text fragments)`
    );
  }

  if (report.summary.notesNeedingRewrite > 0) {
    report.recommendations.push(
      `Rewrite ${report.summary.notesNeedingRewrite} grammar notes with critical/warning issues`
    );
  }

  if (withinLevelDupes > 0) {
    report.recommendations.push(
      `Deduplicate ${withinLevelDupes} grammar titles that appear multiple times within same level`
    );
  }

  for (const [level, alignment] of Object.entries(report.cefrAlignment)) {
    if (alignment.missing.length > 0) {
      report.recommendations.push(
        `Add ${level.toUpperCase()} grammar topics: ${alignment.missing.slice(0, 3).join(', ')}${alignment.missing.length > 3 ? '...' : ''}`
      );
    }
  }

  report.recommendations.push(
    'Ensure all grammar notes have: clear English explanation, 4-6 examples, translated examples'
  );

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total grammar notes: ${report.summary.totalGrammarNotes}`);
  console.log(`  - A1: ${report.summary.byLevel.a1 || 0}`);
  console.log(`  - A2: ${report.summary.byLevel.a2 || 0}`);
  console.log(`  - B1: ${report.summary.byLevel.b1 || 0}`);
  console.log(`\nIssues identified:`);
  console.log(`  - Notes with PDF artifacts: ${report.summary.notesWithPdfArtifacts}`);
  console.log(`  - Notes needing rewrite: ${report.summary.notesNeedingRewrite}`);
  console.log(`  - Overall quality score: ${report.summary.qualityScoreOverall}/100`);
  console.log(`\nRecommendations:`);
  for (const rec of report.recommendations) {
    console.log(`  • ${rec}`);
  }

  // Write report to file
  const outputPath = path.resolve('data/curriculum/grammar-audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ Full report saved to: ${outputPath}`);

  // Print notes needing rewrite for quick reference
  if (report.notesNeedingRewrite.length > 0) {
    console.log('\n📝 Notes requiring rewrite:');
    for (const note of report.notesNeedingRewrite.slice(0, 15)) {
      console.log(`   ${note.level.toUpperCase()} L${note.lessonNumber}[${note.noteIndex}]: "${note.title}"`);
      console.log(`      Issues: ${note.reasons.slice(0, 3).join(', ')}`);
    }
    if (report.notesNeedingRewrite.length > 15) {
      console.log(`   ... and ${report.notesNeedingRewrite.length - 15} more`);
    }
  }
}

main().catch(console.error);
