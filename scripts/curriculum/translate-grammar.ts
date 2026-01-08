#!/usr/bin/env npx tsx
/**
 * Translate grammar note examples from Macedonian to English
 *
 * Usage:
 *   npx tsx scripts/curriculum/translate-grammar.ts --level a1
 *   npx tsx scripts/curriculum/translate-grammar.ts --level a2
 */

import * as fs from 'fs';

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
};

const CACHE_FILE = 'data/curriculum/structured/.translation-cache.json';
const DELAY_MS = 800;

interface GrammarNote {
  title: string;
  content: string;
  examples: string[];
  translatedExamples?: string[];
}

interface Chapter {
  title: string;
  vocabularyItems: unknown[];
  grammarNotes: GrammarNote[];
}

interface CurriculumData {
  level: string;
  chapters: Chapter[];
}

type TranslationCache = Record<string, string>;

function loadCache(): TranslationCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch {
    console.warn('Could not load cache, starting fresh');
  }
  return {};
}

function saveCache(cache: TranslationCache): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function translateSentence(sentence: string): Promise<string | null> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'mk',
    tl: 'en',
    dt: 't',
    q: sentence,
  });

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Translation failed for "${sentence.slice(0, 30)}...": ${response.status}`);
      return null;
    }

    const data = await response.json();
    const segments = Array.isArray(data?.[0]) ? data[0] : [];
    const translatedText = segments
      .map((segment: unknown) =>
        Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''
      )
      .join('')
      .trim();

    return translatedText || null;
  } catch (error) {
    console.warn(`Translation error:`, error);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const levelIndex = args.indexOf('--level');
  const level = levelIndex !== -1 ? args[levelIndex + 1]?.toLowerCase() : 'a1';

  if (!LEVEL_FILES[level]) {
    console.error(`Unknown level: ${level}. Use --level a1 or --level a2`);
    process.exit(1);
  }

  const filePath = LEVEL_FILES[level];
  console.log(`\nTranslating ${level.toUpperCase()} grammar examples from ${filePath}\n`);

  const data: CurriculumData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cache = loadCache();

  // Collect all examples that need translation
  const examplesToTranslate: { sentence: string; noteTitle: string }[] = [];

  for (const chapter of data.chapters) {
    for (const note of chapter.grammarNotes) {
      if (!note.translatedExamples || note.translatedExamples.length === 0) {
        for (const example of note.examples) {
          if (!cache[example.toLowerCase()]) {
            examplesToTranslate.push({ sentence: example, noteTitle: note.title });
          }
        }
      }
    }
  }

  console.log(`Found ${examplesToTranslate.length} examples needing translation`);
  console.log(`Cache has ${Object.keys(cache).length} existing translations\n`);

  if (examplesToTranslate.length > 0) {
    console.log(`Translating ${examplesToTranslate.length} sentences...`);
    console.log(`Estimated time: ${Math.ceil((examplesToTranslate.length * DELAY_MS) / 60000)} minutes\n`);

    let completed = 0;
    for (const { sentence } of examplesToTranslate) {
      const normalized = sentence.toLowerCase();

      if (!cache[normalized]) {
        const translation = await translateSentence(sentence);
        if (translation) {
          cache[normalized] = translation;
        }
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }

      completed++;
      if (completed % 10 === 0) {
        saveCache(cache);
        const percent = Math.round((completed / examplesToTranslate.length) * 100);
        process.stdout.write(`\rProgress: ${completed}/${examplesToTranslate.length} (${percent}%)`);
      }
    }

    console.log('\n\nSaving cache...');
    saveCache(cache);
  }

  // Apply translations to grammar notes
  let translatedCount = 0;
  let totalNotes = 0;

  for (const chapter of data.chapters) {
    for (const note of chapter.grammarNotes) {
      totalNotes++;
      const translatedExamples: string[] = [];

      for (const example of note.examples) {
        const normalized = example.toLowerCase();
        if (cache[normalized]) {
          translatedExamples.push(cache[normalized]);
        }
      }

      if (translatedExamples.length > 0) {
        note.translatedExamples = translatedExamples;
        translatedCount++;
      }
    }
  }

  // Save updated data
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`\nResults:`);
  console.log(`  Grammar notes with translations: ${translatedCount} / ${totalNotes}`);
  console.log(`  Coverage: ${Math.round((translatedCount / totalNotes) * 100)}%`);
  console.log(`\nUpdated: ${filePath}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
