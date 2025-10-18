#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

let workerSrc;
if (typeof import.meta.resolve === 'function') {
  workerSrc = await import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
} else {
  const moduleDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/pdfjs-dist');
  workerSrc = pathToFileURL(path.join(moduleDir, 'legacy/build/pdf.worker.mjs')).href;
}
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const DEFAULT_PDF_URL =
  process.env.DICTIONARY_PDF_URL ||
  process.env.NEXT_PUBLIC_DICTIONARY_PDF_URL ||
  'https://ofs-cdn.italki.com/u/11847001/message/d30vg2pjlt9bmtu5ki9g.pdf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, '..', 'data', 'resources.json');

async function fetchPdfData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF. Status ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function isHeading(text, fontSize) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (trimmed.length < 3) return false;
  if (trimmed.endsWith(':')) return true;
  const uppercaseRatio = trimmed.replace(/[^A-ZА-ЯЀ-ӿ]/giu, '').length / trimmed.length;
  if (uppercaseRatio > 0.6 && trimmed.length <= 80) return true;
  return fontSize >= 14 && uppercaseRatio > 0.3;
}

function getFontSize(transform) {
  const [a, b, c, d] = transform;
  const xScale = Math.hypot(a, b);
  const yScale = Math.hypot(c, d);
  return Math.max(xScale, yScale);
}

function normalizeTitle(str) {
  return str.replace(/:\s*$/, '').trim();
}

function resolveOutputPath(customPath) {
  if (!customPath) return OUTPUT_PATH;
  return path.isAbsolute(customPath) ? customPath : path.resolve(process.cwd(), customPath);
}

async function extractResources(pdfUrl, outputPath) {
  console.log(`Extracting resources from ${pdfUrl}`);
  const pdfData = await fetchPdfData(pdfUrl);
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  const sections = [];
  let currentSection = {
    title: 'General',
    page: 1,
    resources: [],
  };
  sections.push(currentSection);

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const [textContent, annotations] = await Promise.all([
      page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false }),
      page.getAnnotations({ intent: 'display' }),
    ]);

    const entries = [];

    textContent.items.forEach((item) => {
      const str = item.str.trim();
      if (!str) return;
      const fontSize = getFontSize(item.transform);
      const yPos = item.transform[5];
      entries.push({
        type: 'text',
        content: str,
        fontSize,
        y: yPos,
        original: item.str,
      });
    });

    annotations.forEach((annotation) => {
      if (!annotation.url) return;
      const rect = annotation.rect || [0, 0, 0, 0];
      const y = (rect[1] + rect[3]) / 2;
      entries.push({
        type: 'link',
        url: annotation.url,
        title: annotation.title || annotation.contents || null,
        y,
      });
    });

    entries.sort((a, b) => b.y - a.y);

    entries.forEach((entry) => {
      if (entry.type === 'text') {
        if (isHeading(entry.content, entry.fontSize)) {
          const title = normalizeTitle(entry.content);
          if (!title) return;
          const existing = sections.find(
            (section) => section.title.toLowerCase() === title.toLowerCase()
          );
          if (existing) {
            currentSection = existing;
            currentSection.page = Math.min(currentSection.page, pageNum);
          } else {
            currentSection = {
              title,
              page: pageNum,
              resources: [],
            };
            sections.push(currentSection);
          }
        }
      } else if (entry.type === 'link') {
        const label = entry.title || entry.url;
        if (!currentSection) {
          currentSection = {
            title: 'General',
            page: pageNum,
            resources: [],
          };
          sections.push(currentSection);
        }
        currentSection.resources.push({
          title: label,
          url: entry.url,
          page: pageNum,
        });
      }
    });
  }

  const filtered = sections
    .map((section) => ({
      ...section,
      resources: section.resources.filter(
        (resource, index, arr) =>
          resource &&
          Boolean(resource.url) &&
          arr.findIndex((item) => item.url === resource.url) === index
      ),
    }))
    .filter((section) => section.resources.length > 0)
    .sort((a, b) => a.page - b.page || a.title.localeCompare(b.title));

  const result = {
    source: pdfUrl,
    generatedAt: new Date().toISOString(),
    sectionCount: filtered.length,
    resourceCount: filtered.reduce((acc, section) => acc + section.resources.length, 0),
    sections: filtered,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Extracted ${result.resourceCount} resources across ${result.sectionCount} sections.`);
  console.log(`Saved to ${outputPath}`);
}

async function main() {
  const [, , pdfArg, outputArg] = process.argv;

  const pdfUrl = pdfArg || DEFAULT_PDF_URL;
  const outputPath = resolveOutputPath(outputArg);

  try {
    await extractResources(pdfUrl, outputPath);
  } catch (error) {
    console.error('Failed to extract resources:', error);
    process.exitCode = 1;
  }
}

const invokedAsScript = process.argv[1]
  ? pathToFileURL(process.argv[1]).href === import.meta.url
  : false;

if (invokedAsScript) {
  main();
}
