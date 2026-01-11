#!/usr/bin/env tsx
/**
 * Enrich structured curriculum vocabulary with metadata:
 * - transliteration
 * - part of speech normalization (fill missing)
 * - gender inference for nouns
 * - semantic category (best-effort)
 * - isCore flag (filters instructional/proper nouns for UI)
 *
 * Writes updates in-place for A1/A2/B1 structured JSON files.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { cyrillicToLatin } from '../../lib/transliterate';
import {
  categorizeWord,
  inferGender,
  inferPartOfSpeech,
  shouldExcludeWord,
} from './enhanced-parser';

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

const POS_ALLOWLIST = new Set([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'particle',
  'numeral',
  'phrase',
  'proper noun',
]);

function normalizePartOfSpeech(raw: unknown, word: string): string | undefined {
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (POS_ALLOWLIST.has(normalized)) {
      return normalized;
    }
  }
  const inferred = inferPartOfSpeech(word);
  return inferred && POS_ALLOWLIST.has(inferred) ? inferred : undefined;
}

function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

type VocabularyItem = {
  word?: string;
  translation?: string;
  partOfSpeech?: string;
  context?: string;
  category?: string;
  gender?: string;
  transliteration?: string;
  isCore?: boolean;
  [key: string]: unknown;
};

type Chapter = {
  lessonNumber?: number;
  chapterNumber?: number;
  title: string;
  titleMk: string;
  vocabularyItems?: VocabularyItem[];
};

type Curriculum = {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  chapters: Chapter[];
};

function enrichChapter(chapter: Chapter): { updated: number; deduped: number } {
  const items = chapter.vocabularyItems || [];
  const seen = new Set<string>();
  const enriched: VocabularyItem[] = [];
  let updated = 0;
  let deduped = 0;

  for (const item of items) {
    const word = typeof item.word === 'string' ? item.word.trim() : '';
    const translation = typeof item.translation === 'string' ? item.translation.trim() : '';
    if (!word || !translation) {
      continue;
    }

    const key = word.toLowerCase();
    if (seen.has(key)) {
      deduped += 1;
      continue;
    }
    seen.add(key);

    const partOfSpeech = normalizePartOfSpeech(item.partOfSpeech, word);
    const gender = item.gender || (partOfSpeech === 'noun' ? inferGender(word) : undefined);
    const category = item.category || categorizeWord(word, item.context);
    const transliteration =
      item.transliteration || (hasCyrillic(word) ? cyrillicToLatin(word) : undefined);
    const isCore = item.isCore ?? !shouldExcludeWord(word, translation);

    const nextItem: VocabularyItem = {
      ...item,
      word,
      translation,
      partOfSpeech: partOfSpeech || item.partOfSpeech,
      gender: gender || item.gender,
      category: category || item.category,
      transliteration: transliteration || item.transliteration,
      isCore,
    };

    if (
      nextItem.partOfSpeech !== item.partOfSpeech ||
      nextItem.gender !== item.gender ||
      nextItem.category !== item.category ||
      nextItem.transliteration !== item.transliteration ||
      nextItem.isCore !== item.isCore ||
      nextItem.word !== item.word ||
      nextItem.translation !== item.translation
    ) {
      updated += 1;
    }

    enriched.push(nextItem);
  }

  chapter.vocabularyItems = enriched;
  return { updated, deduped };
}

async function main() {
  console.log('🔧 Enriching vocabulary metadata (A1/A2/B1)');

  for (const [level, filePath] of Object.entries(LEVEL_FILES)) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`⚠️  Missing ${level.toUpperCase()} file: ${filePath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8')) as Curriculum;
    let updatedCount = 0;
    let dedupedCount = 0;

    for (const chapter of data.chapters) {
      const result = enrichChapter(chapter);
      updatedCount += result.updated;
      dedupedCount += result.deduped;
    }

    fs.writeFileSync(resolvedPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(
      `✅ ${level.toUpperCase()}: updated ${updatedCount} items, removed ${dedupedCount} duplicates`
    );
  }

  console.log('✅ Vocabulary enrichment complete');
}

main().catch((error) => {
  console.error('❌ Vocabulary enrichment failed:', error);
  process.exit(1);
});
