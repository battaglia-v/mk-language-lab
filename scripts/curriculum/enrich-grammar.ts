#!/usr/bin/env tsx
/**
 * Enrich grammar note explanations using curated templates.
 * - Normalizes whitespace in explanations
 * - Replaces low-quality OCR/exercise text with template explanations
 * - Optionally fills empty examples from templates (keeps translations aligned)
 *
 * Writes updates in-place for A1/A2/B1 structured JSON files.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { GrammarTemplate } from './a1-grammar-content';
import { findGrammarTemplate } from './a1-grammar-content';
import { findA2GrammarTemplate } from './a2-grammar-content';
import { findB1GrammarTemplate } from './b1-grammar-content';

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

type GrammarNote = {
  title: string;
  content: string;
  examples: string[];
  translatedExamples?: string[];
};

type Chapter = {
  lessonNumber?: number;
  chapterNumber?: number;
  title: string;
  titleMk: string;
  grammarNotes?: GrammarNote[];
};

type Curriculum = {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
};

const TEMPLATE_LOOKUP: Record<string, (title: string) => GrammarTemplate | undefined> = {
  a1: findGrammarTemplate,
  a2: findA2GrammarTemplate,
  b1: findB1GrammarTemplate,
};

function selectTemplate(level: string, title: string): GrammarTemplate | undefined {
  const finder = TEMPLATE_LOOKUP[level];
  if (!finder) return undefined;
  const template = finder(title);
  if (!template) return undefined;

  // Avoid mismatches for B1 verb notes that incorrectly map to conditional.
  if (
    level === 'b1' &&
    title.toLowerCase().includes('глагол') &&
    template.title.toLowerCase().includes('условен')
  ) {
    return finder('Глаголи') || template;
  }

  return template;
}

function normalizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

function isLowQualityContent(content: string): boolean {
  const lower = content.toLowerCase();
  const hasBlanks = /_{3,}/.test(content);
  const hasExerciseSignals = /(вежба|пополни|слушај|одговори|подвлеч|поврзи|табела|задача)/.test(lower);
  const hasSource = /(извор|www\.|http)/.test(lower);
  const tooShort = content.length < 50;
  const tooLongWithExercises = content.length > 120 && hasExerciseSignals;
  return hasBlanks || hasSource || tooShort || tooLongWithExercises;
}

function isLowQualityExamples(examples: string[]): boolean {
  if (examples.length === 0) return true;
  return examples.some((example) => {
    const lower = example.toLowerCase();
    return (
      /_{3,}/.test(example) ||
      /(вежба|пополни|одговори|подвлеч|поврзи|табела|задача|извор|www\.|http)/.test(lower) ||
      example.length > 180
    );
  });
}

function enrichChapter(chapter: Chapter, level: string): number {
  const notes = chapter.grammarNotes || [];
  let updated = 0;

  for (const note of notes) {
    const normalized = normalizeContent(note.content || '');
    const template = selectTemplate(level, note.title);
    const forceReplace =
      level === 'b1' &&
      note.title.toLowerCase().includes('глагол') &&
      template?.title.toLowerCase().includes('глаголи');

    // Always normalize whitespace for readability
    if (normalized && normalized !== note.content) {
      note.content = normalized;
      updated += 1;
    }

    if (!template) continue;

    // Replace low-quality extracted content with template explanation
    if (forceReplace || isLowQualityContent(normalized)) {
      note.content = template.explanation;
      updated += 1;
    }

    // If examples are missing or clearly low-quality, backfill from template and clear translations
    if (!note.examples || isLowQualityExamples(note.examples)) {
      note.examples = template.examples.slice(0, 6);
      note.translatedExamples = [];
      updated += 1;
    }
  }

  chapter.grammarNotes = notes;
  return updated;
}

async function main() {
  console.log('🧩 Enriching grammar explanations (A1/A2/B1)');

  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Missing ${level.toUpperCase()} file: ${filePath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8')) as Curriculum;
    let updatedCount = 0;

    for (const chapter of data.chapters) {
      updatedCount += enrichChapter(chapter, level);
    }

    fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ ${level.toUpperCase()}: updated ${updatedCount} grammar notes`);
  }

  console.log('✅ Grammar enrichment complete');
}

main().catch((error) => {
  console.error('❌ Grammar enrichment failed:', error);
  process.exit(1);
});
