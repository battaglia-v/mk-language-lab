#!/usr/bin/env npx tsx
/**
 * Download UKIM Macedonian language textbook PDFs
 * Source: UKIM Macedonian Language Summer School
 */

import * as fs from 'fs';
import * as path from 'path';

const TEXTBOOKS = [
  {
    id: 'a1-teskoto',
    title: 'Тешкото',
    level: 'A1',
    url: 'https://archive.ukim.edu.mk/msmjlk/uchebnici/TESKOTO_Simon_Sazdov.pdf',
    filename: 'a1-teskoto.pdf'
  },
  {
    id: 'a2-lozje',
    title: 'Лозје',
    level: 'A2',
    url: 'https://archive.ukim.edu.mk/msmjlk/uchebnici/LOZJE_Gordana_Aleksova.pdf',
    filename: 'a2-lozje.pdf'
  },
  {
    id: 'b1-zlatovrv',
    title: 'Златоврв',
    level: 'B1',
    url: 'https://archive.ukim.edu.mk/msmjlk/uchebnici/ZLATOVRV_Aneta_Ducevska.pdf',
    filename: 'b1-zlatovrv.pdf'
  }
];

const OUTPUT_DIR = 'data/curriculum/raw';
const MIN_FILE_SIZE = 1024 * 1024; // 1MB minimum

async function downloadPdf(url: string, outputPath: string, title: string): Promise<boolean> {
  console.log(`\nDownloading: ${title}`);
  console.log(`  URL: ${url}`);
  console.log(`  Output: ${outputPath}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MKLanguageLab/1.0; +https://mklanguage.com)'
      }
    });

    if (!response.ok) {
      console.error(`  ✗ HTTP error: ${response.status} ${response.statusText}`);
      return false;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('pdf') && !contentType?.includes('octet-stream')) {
      console.warn(`  ⚠ Unexpected content-type: ${contentType}`);
    }

    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer);

    fs.writeFileSync(outputPath, data);

    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    if (stats.size < MIN_FILE_SIZE) {
      console.error(`  ✗ File too small: ${sizeMB}MB (expected >1MB)`);
      return false;
    }

    console.log(`  ✓ Downloaded: ${sizeMB}MB`);
    return true;
  } catch (error) {
    console.error(`  ✗ Download failed:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('UKIM Macedonian Textbook PDF Downloader');
  console.log('='.repeat(60));

  // Ensure output directory exists
  const outputDir = path.resolve(OUTPUT_DIR);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`\nCreated directory: ${outputDir}`);
  }

  const results: { id: string; title: string; success: boolean; path?: string }[] = [];

  for (const book of TEXTBOOKS) {
    const outputPath = path.join(outputDir, book.filename);
    const success = await downloadPdf(book.url, outputPath, `${book.title} (${book.level})`);
    results.push({
      id: book.id,
      title: book.title,
      success,
      path: success ? outputPath : undefined
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Download Summary');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    console.log(`  ${status} ${result.title}`);
  }

  console.log(`\nTotal: ${successful.length}/${results.length} successful`);

  if (failed.length > 0) {
    console.error('\nFailed downloads:');
    for (const f of failed) {
      console.error(`  - ${f.title}`);
    }
    process.exit(1);
  }

  // Verify files
  console.log('\nVerifying downloaded files:');
  for (const book of TEXTBOOKS) {
    const filePath = path.join(outputDir, book.filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  ${book.filename}: ${sizeMB}MB`);
    }
  }

  console.log('\n✓ All downloads complete!');
}

main().catch(console.error);
