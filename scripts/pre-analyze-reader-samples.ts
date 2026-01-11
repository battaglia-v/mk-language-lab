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
const GRADED_DIR = path.join(process.cwd(), 'data/reader/graded');
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

interface ProcessResult {
  success: number;
  failed: number;
  total: number;
}

async function processDirectory(
  dirPath: string,
  label: string,
  fileFilter: (f: string) => boolean
): Promise<ProcessResult> {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Processing ${label}`);
  console.log(`Directory: ${dirPath}`);
  console.log('─'.repeat(60));

  let files: string[];
  try {
    files = await fs.readdir(dirPath);
  } catch {
    console.log(`  Directory not found, skipping...`);
    return { success: 0, failed: 0, total: 0 };
  }

  const jsonFiles = files.filter(fileFilter);
  console.log(`Found ${jsonFiles.length} files to process`);

  let success = 0;
  let failed = 0;

  for (const file of jsonFiles) {
    const result = await processFile(path.join(dirPath, file));
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { success, failed, total: jsonFiles.length };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Pre-analyzing Reader Samples');
  console.log('='.repeat(60));
  console.log(`\nAPI URL: ${API_URL}`);

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

  // Process 30-day challenge samples (day*.json)
  const samplesResult = await processDirectory(
    SAMPLES_DIR,
    '30-Day Challenge Samples',
    (f) => f.endsWith('.json') && f.startsWith('day')
  );

  // Process graded readers (all .json files)
  const gradedResult = await processDirectory(
    GRADED_DIR,
    'Graded Readers',
    (f) => f.endsWith('.json')
  );

  // Combined summary
  const totalFiles = samplesResult.total + gradedResult.total;
  const totalSuccess = samplesResult.success + gradedResult.success;
  const totalFailed = samplesResult.failed + gradedResult.failed;

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`\n30-Day Samples: ${samplesResult.success}/${samplesResult.total} processed`);
  console.log(`Graded Readers: ${gradedResult.success}/${gradedResult.total} processed`);
  console.log(`\nTotal files: ${totalFiles}`);
  console.log(`Successfully processed: ${totalSuccess}`);
  console.log(`Failed: ${totalFailed}`);
}

main().catch(console.error);
