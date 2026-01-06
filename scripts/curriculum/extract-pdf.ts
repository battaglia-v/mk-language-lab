#!/usr/bin/env npx tsx
/**
 * PDF text extraction script for UKIM Macedonian textbooks
 * Uses pdfjs-dist for reliable PDF parsing with position data
 */

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as fs from 'fs';
import * as path from 'path';
import type { ExtractedPage, ExtractedTextItem, ExtractedTextbook } from './types';
import { containsMacedonianChars } from './types';

// Disable worker for Node.js environment
GlobalWorkerOptions.workerSrc = '';

/**
 * Extract text with position data from a PDF file
 */
export async function extractPdfText(pdfPath: string): Promise<ExtractedPage[]> {
  const absolutePath = path.resolve(pdfPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`PDF file not found: ${absolutePath}`);
  }

  const data = new Uint8Array(fs.readFileSync(absolutePath));
  const pdf = await getDocument({ data }).promise;

  const pages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const items: ExtractedTextItem[] = [];
    const textParts: string[] = [];

    for (const item of textContent.items) {
      // Type guard for TextItem (has 'str' property)
      if ('str' in item && typeof item.str === 'string') {
        const textItem = item as TextItem;
        // Normalize Cyrillic text using NFC
        const normalizedText = textItem.str.normalize('NFC');

        // Extract position from transform matrix [scaleX, skewX, skewY, scaleY, x, y]
        const x = textItem.transform[4];
        const y = textItem.transform[5];

        // Estimate font size from transform matrix (scaleY gives approximate height)
        const fontSize = Math.abs(textItem.transform[3]);

        items.push({
          str: normalizedText,
          x,
          y,
          fontSize
        });

        textParts.push(normalizedText);
      }
    }

    pages.push({
      pageNum,
      text: textParts.join(' ').normalize('NFC'),
      items
    });
  }

  return pages;
}

/**
 * Extract a complete textbook and save as JSON
 */
export async function extractTextbook(
  pdfPath: string,
  id: string,
  title: string,
  level: 'A1' | 'A2' | 'B1'
): Promise<ExtractedTextbook> {
  console.log(`Extracting: ${title} (${level})`);
  console.log(`Source: ${pdfPath}`);

  const pages = await extractPdfText(pdfPath);

  // Validate Macedonian content
  const sampleText = pages.slice(0, 10).map(p => p.text).join(' ');
  if (!containsMacedonianChars(sampleText)) {
    console.warn('Warning: No Macedonian-specific characters found in first 10 pages');
  } else {
    console.log('✓ Macedonian characters detected');
  }

  const textbook: ExtractedTextbook = {
    id,
    title,
    level,
    pages,
    extractedAt: new Date().toISOString(),
    totalPages: pages.length
  };

  console.log(`✓ Extracted ${pages.length} pages`);

  return textbook;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
PDF Extraction Script for UKIM Macedonian Textbooks

Usage:
  npx tsx scripts/curriculum/extract-pdf.ts <pdf-path> [options]

Options:
  --id <id>       Textbook identifier (e.g., 'a1-teskoto')
  --title <title> Full title in Macedonian
  --level <level> CEFR level (A1, A2, or B1)
  --output <path> Output JSON file path
  --help, -h      Show this help message

Example:
  npx tsx scripts/curriculum/extract-pdf.ts data/curriculum/raw/a1-teskoto.pdf \\
    --id a1-teskoto --title "Тешкото" --level A1 \\
    --output data/curriculum/extracted/a1-teskoto.json
`);
    process.exit(0);
  }

  const pdfPath = args[0];

  if (!pdfPath) {
    console.log('PDF extraction script ready.');
    console.log('Run with --help for usage information.');
    process.exit(0);
  }

  // Parse arguments
  const idIndex = args.indexOf('--id');
  const titleIndex = args.indexOf('--title');
  const levelIndex = args.indexOf('--level');
  const outputIndex = args.indexOf('--output');

  const id = idIndex !== -1 ? args[idIndex + 1] : path.basename(pdfPath, '.pdf');
  const title = titleIndex !== -1 ? args[titleIndex + 1] : id;
  const level = (levelIndex !== -1 ? args[levelIndex + 1] : 'A1') as 'A1' | 'A2' | 'B1';
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  try {
    const textbook = await extractTextbook(pdfPath, id, title, level);

    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, JSON.stringify(textbook, null, 2));
      console.log(`✓ Saved to: ${outputPath}`);
    } else {
      // Print summary to stdout
      console.log('\nExtraction Summary:');
      console.log(`  ID: ${textbook.id}`);
      console.log(`  Title: ${textbook.title}`);
      console.log(`  Level: ${textbook.level}`);
      console.log(`  Pages: ${textbook.totalPages}`);
      console.log(`  Extracted at: ${textbook.extractedAt}`);
    }
  } catch (error) {
    console.error('Extraction failed:', error);
    process.exit(1);
  }
}

main();
