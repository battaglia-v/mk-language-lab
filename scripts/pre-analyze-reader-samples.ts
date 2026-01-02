#!/usr/bin/env npx tsx
/**
 * Pre-analyze Reader Samples
 *
 * This script reads all reader sample files, calls the analyze API for each,
 * and stores the analyzed data in the JSON files for instant word lookup.
 *
 * Usage: npx tsx scripts/pre-analyze-reader-samples.ts
 *
 * Requires the dev server to be running: npm run dev
 */

import fs from 'fs/promises';
import path from 'path';

const SAMPLES_DIR = path.join(process.cwd(), 'data/reader/samples');
const API_URL = process.env.ANALYZE_API_URL || 'http://localhost:3000/api/translate/analyze';

interface TextBlock {
  type: string;
  value: string;
}

interface ReaderSample {
  id: string;
  text_blocks_mk: TextBlock[];
  analyzedData?: unknown;
  [key: string]: unknown;
}

interface WordAnalysis {
  id: string;
  original: string;
  translation: string;
  alternativeTranslations?: string[];
  contextualMeaning?: string;
  contextHint?: string;
  hasMultipleMeanings?: boolean;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  index: number;
}

interface AnalyzedTextData {
  words: WordAnalysis[];
  tokens: Array<{ token: string; isWord: boolean; index: number }>;
  fullTranslation: string;
  difficulty: {
    level: 'beginner' | 'intermediate' | 'advanced';
    score: number;
  };
  metadata: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
  };
}

async function analyzeText(text: string): Promise<AnalyzedTextData | null> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLang: 'mk',
        targetLang: 'en',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  API error: ${response.status} - ${error}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`  Fetch error:`, error);
    return null;
  }
}

async function processFile(filePath: string): Promise<boolean> {
  const fileName = path.basename(filePath);
  console.log(`\nProcessing: ${fileName}`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const sample: ReaderSample = JSON.parse(content);

    // Skip if already analyzed
    if (sample.analyzedData) {
      console.log(`  Already analyzed, skipping...`);
      return true;
    }

    // Extract text from text_blocks_mk
    if (!sample.text_blocks_mk || sample.text_blocks_mk.length === 0) {
      console.log(`  No text_blocks_mk found, skipping...`);
      return false;
    }

    const fullText = sample.text_blocks_mk
      .filter(block => block.type === 'p')
      .map(block => block.value)
      .join('\n\n');

    if (!fullText.trim()) {
      console.log(`  Empty text content, skipping...`);
      return false;
    }

    console.log(`  Text length: ${fullText.length} chars`);

    // Call analyze API
    const analyzed = await analyzeText(fullText);

    if (!analyzed) {
      console.log(`  Analysis failed, skipping...`);
      return false;
    }

    console.log(`  Analyzed: ${analyzed.metadata.wordCount} words, ${analyzed.metadata.sentenceCount} sentences`);

    // Add analyzed data to sample
    sample.analyzedData = analyzed;

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(sample, null, 2) + '\n', 'utf-8');
    console.log(`  Saved successfully!`);

    return true;
  } catch (error) {
    console.error(`  Error processing file:`, error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Pre-analyzing Reader Samples');
  console.log('='.repeat(60));
  console.log(`\nSamples directory: ${SAMPLES_DIR}`);
  console.log(`API URL: ${API_URL}`);

  // Check if API is available
  try {
    const health = await fetch(API_URL.replace('/analyze', ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test', sourceLang: 'mk', targetLang: 'en' }),
    });
    if (!health.ok) {
      console.error('\nError: API not available. Make sure dev server is running (npm run dev)');
      process.exit(1);
    }
  } catch {
    console.error('\nError: Cannot connect to API. Make sure dev server is running (npm run dev)');
    process.exit(1);
  }

  // Get all JSON files
  const files = await fs.readdir(SAMPLES_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f.startsWith('day'));

  console.log(`\nFound ${jsonFiles.length} sample files to process`);

  let success = 0;
  let failed = 0;
  const skipped = 0;

  for (const file of jsonFiles) {
    const result = await processFile(path.join(SAMPLES_DIR, file));
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total files: ${jsonFiles.length}`);
  console.log(`Successfully processed: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (already analyzed): ${skipped}`);
}

main().catch(console.error);
