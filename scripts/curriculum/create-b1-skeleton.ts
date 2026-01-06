#!/usr/bin/env npx tsx
/**
 * Create B1 (Златоврв) skeleton from chapter titles only
 * Per PROJECT.md: B1 is placeholder structure only - no full content extraction
 */

import * as fs from 'fs';
import * as path from 'path';
import { extractPdfText } from './extract-pdf';

const PDF_PATH = 'data/curriculum/raw/b1-zlatovrv.pdf';
const OUTPUT_PATH = 'data/curriculum/structured/b1-zlatovrv.json';

// Skeleton structure (minimal)
interface B1Chapter {
  chapterNumber: number;
  title: string;
  titleMk: string;
  note: string;
}

interface B1Skeleton {
  id: string;
  journeyId: string;
  title: string;
  level: string;
  note: string;
  chapters: B1Chapter[];
  metadata: {
    totalChapters: number;
    extractedAt: string;
  };
}

/**
 * Extract chapter titles from table of contents (first few pages)
 * B1 textbooks typically have TOC on pages 2-5
 */
async function extractChapterTitles(): Promise<B1Chapter[]> {
  const chapters: B1Chapter[] = [];

  console.log(`Loading PDF: ${PDF_PATH}`);
  const pages = await extractPdfText(PDF_PATH);

  console.log(`Total pages: ${pages.length}`);
  console.log('Extracting TOC from first 10 pages...');

  // Extract text from first 10 pages (TOC typically here)
  const tocText = pages
    .slice(0, Math.min(10, pages.length))
    .map(p => p.text)
    .join('\n');

  // Pattern detection for chapters
  // The TOC shows: "Лекција 1 Дали се разбираме? 8"
  // Pattern: "Лекција" + number + title + page number

  const lessonPattern = /Лекција\s+(\d+)\s+([А-Яа-яЀ-ӿ][^0-9]+?)\s+(\d+)/g;
  let match;

  while ((match = lessonPattern.exec(tocText)) !== null) {
    const chapterNum = parseInt(match[1]);
    const title = match[2].trim();

    // Filter out very short titles (likely noise)
    if (title.length > 3) {
      chapters.push({
        chapterNumber: chapterNum,
        title: `Chapter ${chapterNum}: ${title}`,
        titleMk: `Лекција ${chapterNum}: ${title}`,
        note: 'Content pending - B1 skeleton only',
      });
    }
  }

  // Sort by chapter number
  chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

  return chapters;
}

async function main() {
  console.log('='.repeat(60));
  console.log('B1 Златоврв Skeleton Generator');
  console.log('='.repeat(60));
  console.log();
  console.log('NOTE: B1 is placeholder structure only (per PROJECT.md)');
  console.log('      Extracting chapter titles from TOC, not full content');
  console.log();

  // Check PDF exists
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`Error: PDF not found at ${PDF_PATH}`);
    process.exit(1);
  }

  // Extract chapter titles
  console.log('Extracting chapter structure...');
  const chapters = await extractChapterTitles();

  if (chapters.length === 0) {
    console.warn('Warning: No chapters detected. Creating minimal placeholder.');
    // Fallback: create placeholder chapters
    for (let i = 1; i <= 8; i++) {
      chapters.push({
        chapterNumber: i,
        title: `Chapter ${i}: [Title pending]`,
        titleMk: `Глава ${i}: [Наслов pending]`,
        note: 'Content pending - B1 skeleton only',
      });
    }
  }

  console.log(`Detected ${chapters.length} chapters`);
  console.log();

  // Print chapter list
  console.log('Chapters:');
  for (const chapter of chapters) {
    console.log(`  ${chapter.chapterNumber}. ${chapter.titleMk}`);
  }
  console.log();

  // Build skeleton output
  const skeleton: B1Skeleton = {
    id: 'b1-zlatovrv',
    journeyId: 'ukim-b1',
    title: 'Златоврв',
    level: 'B1',
    note: 'B1 skeleton structure only - full content extraction pending (per PROJECT.md Phase 1)',
    chapters,
    metadata: {
      totalChapters: chapters.length,
      extractedAt: new Date().toISOString(),
    },
  };

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save skeleton
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(skeleton, null, 2));
  console.log(`Saved to: ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)} KB`);
  console.log();
  console.log('='.repeat(60));
  console.log('B1 skeleton creation complete!');
  console.log('='.repeat(60));
  console.log();
  console.log('Next step: Create seed script (Task 2)');
}

main().catch(error => {
  console.error('Skeleton creation failed:', error);
  process.exit(1);
});
