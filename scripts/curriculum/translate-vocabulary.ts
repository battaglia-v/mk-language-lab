#!/usr/bin/env npx tsx
/**
 * Translate A1/A2/B1 vocabulary using free Google Translate API
 *
 * Usage:
 *   npx tsx scripts/curriculum/translate-vocabulary.ts --level a1
 *   npx tsx scripts/curriculum/translate-vocabulary.ts --level a2
 *   npx tsx scripts/curriculum/translate-vocabulary.ts --level b1
 */

import * as fs from 'fs';
import * as path from 'path';

const LEVEL_FILES: Record<string, string> = {
  a1: 'data/curriculum/structured/a1-teskoto.json',
  a2: 'data/curriculum/structured/a2-lozje.json',
  b1: 'data/curriculum/structured/b1-zlatovrv.json',
};

const CACHE_FILE = 'data/curriculum/structured/.translation-cache.json';
const BATCH_SIZE = 10; // Words per batch
const DELAY_MS = 800; // Delay between requests to avoid rate limiting

interface VocabItem {
  word: string;
  partOfSpeech?: string;
  context?: string;
  translation?: string;
}

interface Chapter {
  title: string;
  vocabularyItems: VocabItem[];
  grammarNotes?: unknown[];
}

interface CurriculumData {
  level: string;
  chapters: Chapter[];
}

type TranslationCache = Record<string, string>;

// Load or create translation cache
function loadCache(): TranslationCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not load cache, starting fresh');
  }
  return {};
}

function saveCache(cache: TranslationCache): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// Translate using free Google Translate API
async function translateWord(word: string): Promise<string | null> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'mk',
    tl: 'en',
    dt: 't',
    q: word,
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
      console.warn(`Translation failed for "${word}": ${response.status}`);
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
    console.warn(`Translation error for "${word}":`, error);
    return null;
  }
}

// Translate a batch of words with delay
async function translateBatch(
  words: string[],
  cache: TranslationCache
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (const word of words) {
    const normalized = word.toLowerCase().trim();

    // Check cache first
    if (cache[normalized]) {
      results.set(normalized, cache[normalized]);
      continue;
    }

    // Translate
    const translation = await translateWord(word);
    if (translation) {
      cache[normalized] = translation;
      results.set(normalized, translation);
    }

    // Delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const levelIndex = args.indexOf('--level');
  const level = levelIndex !== -1 ? args[levelIndex + 1]?.toLowerCase() : 'a1';

  if (!LEVEL_FILES[level]) {
    console.error(`Unknown level: ${level}. Use --level a1, --level a2, or --level b1`);
    process.exit(1);
  }

  const filePath = LEVEL_FILES[level];
  console.log(`\nTranslating ${level.toUpperCase()} vocabulary from ${filePath}\n`);

  // Load data
  const data: CurriculumData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const cache = loadCache();

  // Extract unique words
  const uniqueWords = new Set<string>();
  for (const chapter of data.chapters) {
    for (const item of chapter.vocabularyItems) {
      if (item.word && !item.translation) {
        uniqueWords.add(item.word.toLowerCase().trim());
      }
    }
  }

  console.log(`Found ${uniqueWords.size} unique words needing translation`);
  console.log(`Cache has ${Object.keys(cache).length} existing translations\n`);

  // Filter out cached words
  const wordsToTranslate = Array.from(uniqueWords).filter((w) => !cache[w]);
  console.log(`Need to translate ${wordsToTranslate.length} new words\n`);

  if (wordsToTranslate.length === 0) {
    console.log('All words already cached, applying translations...\n');
  } else {
    // Translate in batches
    const batches = [];
    for (let i = 0; i < wordsToTranslate.length; i += BATCH_SIZE) {
      batches.push(wordsToTranslate.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} words each`);
    console.log(`Estimated time: ${Math.ceil((wordsToTranslate.length * DELAY_MS) / 60000)} minutes\n`);

    let completed = 0;
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      await translateBatch(batch, cache);
      completed += batch.length;

      // Save cache periodically
      if ((i + 1) % 10 === 0) {
        saveCache(cache);
      }

      // Progress update
      const percent = Math.round((completed / wordsToTranslate.length) * 100);
      process.stdout.write(`\rProgress: ${completed}/${wordsToTranslate.length} (${percent}%)`);
    }

    console.log('\n\nSaving cache...');
    saveCache(cache);
  }

  // Apply translations to data
  let translatedCount = 0;
  let missingCount = 0;

  for (const chapter of data.chapters) {
    for (const item of chapter.vocabularyItems) {
      if (item.word) {
        const normalized = item.word.toLowerCase().trim();
        if (cache[normalized]) {
          item.translation = cache[normalized];
          translatedCount++;
        } else {
          missingCount++;
        }
      }
    }
  }

  // Save updated data
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`\nResults:`);
  console.log(`  Translated: ${translatedCount}`);
  console.log(`  Missing: ${missingCount}`);
  console.log(`  Coverage: ${Math.round((translatedCount / (translatedCount + missingCount)) * 100)}%`);
  console.log(`\nUpdated: ${filePath}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
