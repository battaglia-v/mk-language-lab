/**
 * Content Completeness Audit Script
 *
 * Checks content completeness across all A1, A2, and B1 lessons.
 * Reads from JSON files for vocabulary/grammar and seed files for dialogues/exercises.
 *
 * Minimum requirements per lesson:
 * - Vocabulary: 10+ items
 * - Dialogue: 1+ with 4+ lines
 * - Exercises: 3+ of varied types
 * - Grammar notes: 1+ explanation with examples
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface VocabItem {
  word: string;
  translation?: string;
  partOfSpeech?: string;
}

interface GrammarNote {
  title: string;
  content: string;
  examples?: string[];
}

interface Theme {
  themeNumber: number;
  title: string;
  exercises?: string[];
}

interface Chapter {
  lessonNumber: number;
  title: string;
  vocabularyItems?: VocabItem[];
  grammarNotes?: GrammarNote[];
  themes?: Theme[];
}

interface CurriculumJSON {
  id: string;
  title: string;
  level: string;
  chapters: Chapter[];
}

interface DialogueLine {
  speaker: string;
  textMk: string;
  textEn: string;
  transliteration: string;
}

interface Dialogue {
  title: string;
  lines: DialogueLine[];
}

interface Exercise {
  type: 'multiple_choice' | 'fill_blank' | 'translation' | 'word_order' | 'matching';
  question: string;
}

interface LessonEnhancement {
  lessonId: string;
  dialogues: Dialogue[];
  exercises: Exercise[];
}

interface AuditResult {
  lessonNumber: number;
  title: string;
  vocabCount: number;
  dialogueCount: number;
  minDialogueLines: number;
  maxDialogueLines: number;
  exerciseCount: number;
  exerciseTypes: string[];
  grammarCount: number;
  issues: string[];
  status: 'pass' | 'warn' | 'fail';
}

interface LevelAudit {
  level: string;
  lessons: AuditResult[];
  summary: {
    total: number;
    pass: number;
    warn: number;
    fail: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

const MINIMUMS = {
  vocab: 10,
  dialogues: 1,
  dialogueLines: 4,
  exercises: 3,
  grammar: 1,
};

const DATA_DIR = path.resolve(__dirname, '../../data/curriculum/structured');
const SEEDS_DIR = path.resolve(__dirname, '../../prisma/seeds');
const OUTPUT_DIR = path.resolve(__dirname, '../../.planning/phases/18.1-lesson-quality-audit');

// ============================================================================
// Load Functions
// ============================================================================

function loadJSON(filename: string): CurriculumJSON | null {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    return null;
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Parse seed file to extract lesson enhancements.
 * This is a simple regex-based parser since the seed file is TypeScript.
 */
function parseSeedFileEnhancements(): Map<number, { dialogues: Dialogue[]; exercises: Exercise[] }> {
  const seedFilePath = path.join(SEEDS_DIR, 'seed-all-lessons.ts');

  if (!fs.existsSync(seedFilePath)) {
    console.error(`Seed file not found: ${seedFilePath}`);
    return new Map();
  }

  const content = fs.readFileSync(seedFilePath, 'utf-8');
  const results = new Map<number, { dialogues: Dialogue[]; exercises: Exercise[] }>();

  // Parse A1_ENHANCEMENTS and A2_ENHANCEMENTS arrays
  // This is a simplified parser - we look for patterns in the file

  // Match lesson comments like "// Lesson 3: ..."
  const lessonPattern = /\/\/\s*Lesson\s+(\d+):/gi;
  const dialoguePattern = /dialogues:\s*\[\{[\s\S]*?lines:\s*\[([\s\S]*?)\]/g;
  const exercisePattern = /exercises:\s*\[([\s\S]*?)\]\s*\}/g;

  // Simpler approach: count occurrences per lesson in A1_ENHANCEMENTS
  // Look for the structure and count dialogues/exercises

  // Extract A1 enhancements section
  const a1Match = content.match(/const A1_ENHANCEMENTS[\s\S]*?(?=const A2_ENHANCEMENTS|$)/);
  const a2Match = content.match(/const A2_ENHANCEMENTS[\s\S]*?(?=\/\/\s*=+\s*\n\s*\/\/\s*Seeding|$)/);

  function parseEnhancements(section: string, levelOffset: number): void {
    // Split by lesson blocks
    const lessonBlocks = section.split(/\n\s*\/\/\s*Lesson\s+(\d+):/i);

    for (let i = 1; i < lessonBlocks.length; i += 2) {
      const lessonNum = parseInt(lessonBlocks[i], 10);
      const block = lessonBlocks[i + 1] || '';

      // Count dialogues by looking for "title:" within dialogues array
      const dialoguesMatch = block.match(/dialogues:\s*\[\{[\s\S]*?\}\]/);
      let dialogueCount = 0;
      let lineCount = 0;

      if (dialoguesMatch) {
        // Count dialogue titles
        const titleMatches = dialoguesMatch[0].match(/title:\s*['"`]/g);
        dialogueCount = titleMatches ? titleMatches.length : 0;

        // Count lines (speaker entries)
        const speakerMatches = dialoguesMatch[0].match(/speaker:\s*['"`]/g);
        lineCount = speakerMatches ? speakerMatches.length : 0;
      }

      // Count exercises
      const exercisesMatch = block.match(/exercises:\s*\[([\s\S]*?)\]\s*\}/);
      let exerciseCount = 0;
      const exerciseTypes: string[] = [];

      if (exercisesMatch) {
        // Count exercise types
        const typeMatches = exercisesMatch[0].matchAll(/type:\s*['"`](\w+)['"`]/g);
        for (const match of typeMatches) {
          exerciseCount++;
          if (!exerciseTypes.includes(match[1])) {
            exerciseTypes.push(match[1]);
          }
        }
      }

      results.set(lessonNum + levelOffset, {
        dialogues: dialogueCount > 0 ? [{ title: 'From seed', lines: new Array(lineCount).fill({}) as DialogueLine[] }] : [],
        exercises: new Array(exerciseCount).fill({ type: 'unknown', question: '' }) as Exercise[],
      });
    }
  }

  if (a1Match) {
    parseEnhancements(a1Match[0], 0);
  }
  if (a2Match) {
    parseEnhancements(a2Match[0], 100); // Use 100+ for A2 lessons
  }

  return results;
}

// ============================================================================
// Audit Functions
// ============================================================================

function auditLesson(
  chapter: Chapter,
  seedData: { dialogues: Dialogue[]; exercises: Exercise[] } | undefined
): AuditResult {
  const issues: string[] = [];

  // Count vocabulary
  const vocabCount = chapter.vocabularyItems?.length || 0;
  if (vocabCount < MINIMUMS.vocab) {
    issues.push(`Vocab: ${vocabCount}/${MINIMUMS.vocab}`);
  }

  // Count grammar notes
  const grammarCount = chapter.grammarNotes?.length || 0;
  if (grammarCount < MINIMUMS.grammar) {
    issues.push(`Grammar: ${grammarCount}/${MINIMUMS.grammar}`);
  }

  // Count dialogues and their lines (from seed data)
  const dialogues = seedData?.dialogues || [];
  const dialogueCount = dialogues.length;
  let minLines = 0;
  let maxLines = 0;

  if (dialogues.length > 0) {
    const lineCounts = dialogues.map(d => d.lines?.length || 0);
    minLines = Math.min(...lineCounts);
    maxLines = Math.max(...lineCounts);
  }

  if (dialogueCount < MINIMUMS.dialogues) {
    issues.push(`Dialogues: ${dialogueCount}/${MINIMUMS.dialogues}`);
  } else if (maxLines > 0 && maxLines < MINIMUMS.dialogueLines) {
    issues.push(`Dialogue lines: ${maxLines}/${MINIMUMS.dialogueLines}`);
  }

  // Count exercises (from seed data)
  const exercises = seedData?.exercises || [];
  const exerciseCount = exercises.length;
  const exerciseTypes = [...new Set(exercises.map(e => e.type).filter(Boolean))];

  if (exerciseCount < MINIMUMS.exercises) {
    issues.push(`Exercises: ${exerciseCount}/${MINIMUMS.exercises}`);
  }

  // Determine status
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  if (issues.length > 0) {
    // Fail if missing dialogues or exercises (critical for learning)
    if (dialogueCount === 0 || exerciseCount === 0) {
      status = 'fail';
    } else {
      status = 'warn';
    }
  }

  return {
    lessonNumber: chapter.lessonNumber,
    title: chapter.title,
    vocabCount,
    dialogueCount,
    minDialogueLines: minLines,
    maxDialogueLines: maxLines,
    exerciseCount,
    exerciseTypes,
    grammarCount,
    issues,
    status,
  };
}

function auditLevel(
  jsonFile: string,
  levelName: string,
  seedEnhancements: Map<number, { dialogues: Dialogue[]; exercises: Exercise[] }>,
  lessonOffset: number = 0
): LevelAudit {
  const data = loadJSON(jsonFile);
  if (!data) {
    return {
      level: levelName,
      lessons: [],
      summary: { total: 0, pass: 0, warn: 0, fail: 0 },
    };
  }

  const lessons: AuditResult[] = [];

  for (const chapter of data.chapters) {
    const seedKey = chapter.lessonNumber + lessonOffset;
    const seedData = seedEnhancements.get(seedKey);
    const result = auditLesson(chapter, seedData);
    lessons.push(result);
  }

  const summary = {
    total: lessons.length,
    pass: lessons.filter(l => l.status === 'pass').length,
    warn: lessons.filter(l => l.status === 'warn').length,
    fail: lessons.filter(l => l.status === 'fail').length,
  };

  return { level: levelName, lessons, summary };
}

// ============================================================================
// Report Generation
// ============================================================================

function generateMarkdownReport(audits: LevelAudit[]): string {
  const lines: string[] = [];

  lines.push('# Content Completeness Audit Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Level | Total | Pass | Warn | Fail |');
  lines.push('|-------|-------|------|------|------|');

  for (const audit of audits) {
    const { level, summary } = audit;
    lines.push(`| ${level} | ${summary.total} | ${summary.pass} | ${summary.warn} | ${summary.fail} |`);
  }

  lines.push('');
  lines.push('## Minimum Requirements');
  lines.push('');
  lines.push(`- Vocabulary: ${MINIMUMS.vocab}+ items`);
  lines.push(`- Dialogues: ${MINIMUMS.dialogues}+ with ${MINIMUMS.dialogueLines}+ lines`);
  lines.push(`- Exercises: ${MINIMUMS.exercises}+ of varied types`);
  lines.push(`- Grammar: ${MINIMUMS.grammar}+ notes`);
  lines.push('');

  for (const audit of audits) {
    lines.push(`## ${audit.level} Lessons`);
    lines.push('');
    lines.push('| Lesson | Title | Vocab | Dialogues | Exercises | Grammar | Status | Issues |');
    lines.push('|--------|-------|-------|-----------|-----------|---------|--------|--------|');

    for (const lesson of audit.lessons) {
      const dialogueInfo = lesson.dialogueCount > 0
        ? `${lesson.dialogueCount} (${lesson.maxDialogueLines} lines)`
        : '0';
      const exerciseInfo = lesson.exerciseCount > 0
        ? `${lesson.exerciseCount} (${lesson.exerciseTypes.join(', ')})`
        : '0';
      const statusIcon = lesson.status === 'pass' ? '✅' : lesson.status === 'warn' ? '⚠️' : '❌';
      const issuesStr = lesson.issues.length > 0 ? lesson.issues.join(', ') : '-';

      // Truncate title for readability
      const shortTitle = lesson.title.length > 30
        ? lesson.title.substring(0, 27) + '...'
        : lesson.title;

      lines.push(`| ${lesson.lessonNumber} | ${shortTitle} | ${lesson.vocabCount} | ${dialogueInfo} | ${exerciseInfo} | ${lesson.grammarCount} | ${statusIcon} | ${issuesStr} |`);
    }

    lines.push('');
  }

  // Gap Analysis Section
  lines.push('## Gap Analysis');
  lines.push('');

  for (const audit of audits) {
    const missingDialogues = audit.lessons.filter(l => l.dialogueCount === 0);
    const missingExercises = audit.lessons.filter(l => l.exerciseCount < MINIMUMS.exercises);

    if (missingDialogues.length > 0 || missingExercises.length > 0) {
      lines.push(`### ${audit.level}`);
      lines.push('');

      if (missingDialogues.length > 0) {
        lines.push('**Lessons missing dialogues:**');
        for (const lesson of missingDialogues) {
          lines.push(`- Lesson ${lesson.lessonNumber}: ${lesson.title}`);
        }
        lines.push('');
      }

      if (missingExercises.length > 0) {
        lines.push('**Lessons below exercise minimum (< 3):**');
        for (const lesson of missingExercises) {
          lines.push(`- Lesson ${lesson.lessonNumber}: ${lesson.title} (has ${lesson.exerciseCount})`);
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔍 Content Completeness Audit');
  console.log('=' .repeat(60));

  // Parse seed file for dialogue/exercise data
  console.log('\n📖 Parsing seed file for dialogues and exercises...');
  const seedEnhancements = parseSeedFileEnhancements();
  console.log(`   Found enhancements for ${seedEnhancements.size} lessons`);

  // Audit each level
  console.log('\n📊 Auditing content...');

  const audits: LevelAudit[] = [];

  // A1 (lessons 1-24)
  const a1Audit = auditLevel('a1-teskoto.json', 'A1 (Тешкото)', seedEnhancements, 0);
  audits.push(a1Audit);
  console.log(`   A1: ${a1Audit.summary.total} lessons (${a1Audit.summary.pass} pass, ${a1Audit.summary.warn} warn, ${a1Audit.summary.fail} fail)`);

  // A2 (lessons 1-8) - use offset 100 for seed data mapping
  const a2Audit = auditLevel('a2-lozje.json', 'A2 (Лозје)', seedEnhancements, 100);
  audits.push(a2Audit);
  console.log(`   A2: ${a2Audit.summary.total} lessons (${a2Audit.summary.pass} pass, ${a2Audit.summary.warn} warn, ${a2Audit.summary.fail} fail)`);

  // B1 (lessons 1-8) - no seed enhancements yet
  const b1Audit = auditLevel('b1-zlatovrv.json', 'B1 (Златоврв)', new Map(), 0);
  audits.push(b1Audit);
  console.log(`   B1: ${b1Audit.summary.total} lessons (${b1Audit.summary.pass} pass, ${b1Audit.summary.warn} warn, ${b1Audit.summary.fail} fail)`);

  // Generate report
  console.log('\n📝 Generating report...');
  const report = generateMarkdownReport(audits);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, 'CONTENT-AUDIT.md');
  fs.writeFileSync(outputPath, report);
  console.log(`   Report saved to: ${outputPath}`);

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Audit complete!');
}

main().catch(console.error);
