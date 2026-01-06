#!/usr/bin/env npx tsx
/**
 * Extract A1 (Тешкото) textbook to raw JSON
 * Produces data/curriculum/extracted/a1-raw.json with position data
 */

import * as fs from 'fs';
import * as path from 'path';
import { extractPdfText } from './extract-pdf';
import { containsMacedonianChars, MACEDONIAN_SPECIFIC_CHARS } from './types';

const PDF_PATH = 'data/curriculum/raw/a1-teskoto.pdf';
const OUTPUT_PATH = 'data/curriculum/extracted/a1-raw.json';

async function main() {
  console.log('='.repeat(60));
  console.log('A1 Тешкото PDF Extraction');
  console.log('='.repeat(60));
  console.log();

  // Check PDF exists
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`Error: PDF not found at ${PDF_PATH}`);
    console.error('Run: npm run curriculum:download first');
    process.exit(1);
  }

  console.log(`Source: ${PDF_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log();

  // Extract text with positions
  console.log('Extracting text with position data...');
  const startTime = Date.now();

  const pages = await extractPdfText(PDF_PATH);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Extraction completed in ${duration}s`);
  console.log();

  // Gather statistics
  let totalItems = 0;
  let totalChars = 0;
  const fontSizes = new Set<number>();

  for (const page of pages) {
    totalItems += page.items.length;
    totalChars += page.text.length;
    for (const item of page.items) {
      fontSizes.add(Math.round(item.fontSize));
    }
  }

  // Validate Cyrillic characters
  const allText = pages.map(p => p.text).join(' ');
  const hasMacedonianChars = containsMacedonianChars(allText);

  // Count occurrences of each Macedonian-specific char
  const charCounts: Record<string, number> = {};
  for (const char of MACEDONIAN_SPECIFIC_CHARS) {
    const count = (allText.match(new RegExp(char, 'g')) || []).length;
    if (count > 0) {
      charCounts[char] = count;
    }
  }

  // Print stats
  console.log('Extraction Statistics');
  console.log('-'.repeat(40));
  console.log(`  Pages: ${pages.length}`);
  console.log(`  Text items: ${totalItems}`);
  console.log(`  Total characters: ${totalChars.toLocaleString()}`);
  console.log(`  Font sizes found: ${[...fontSizes].sort((a, b) => a - b).join(', ')}`);
  console.log();

  console.log('Cyrillic Validation');
  console.log('-'.repeat(40));
  if (hasMacedonianChars) {
    console.log('  ✓ Macedonian-specific characters detected');
    console.log('  Character counts:');
    for (const [char, count] of Object.entries(charCounts)) {
      console.log(`    ${char}: ${count}`);
    }
  } else {
    console.log('  ⚠ WARNING: No Macedonian-specific characters found!');
    console.log('  This may indicate encoding issues (mojibake)');
  }
  console.log();

  // Sample some text to verify
  console.log('Sample Text (first 3 pages)');
  console.log('-'.repeat(40));
  for (let i = 0; i < Math.min(3, pages.length); i++) {
    const page = pages[i];
    const sample = page.text.substring(0, 200).replace(/\s+/g, ' ').trim();
    console.log(`  Page ${page.pageNum}: ${sample}...`);
  }
  console.log();

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save extraction result
  const output = {
    id: 'a1-teskoto',
    title: 'Тешкото',
    level: 'A1' as const,
    pages,
    extractedAt: new Date().toISOString(),
    totalPages: pages.length,
    stats: {
      totalItems,
      totalChars,
      fontSizes: [...fontSizes].sort((a, b) => a - b),
      hasMacedonianChars,
      macedonianCharCounts: charCounts
    }
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`✓ Saved to: ${OUTPUT_PATH}`);
  console.log(`  File size: ${(fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2)} MB`);
  console.log();
  console.log('='.repeat(60));
  console.log('Extraction complete!');
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('Extraction failed:', error);
  process.exit(1);
});
