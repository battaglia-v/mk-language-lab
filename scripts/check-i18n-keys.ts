#!/usr/bin/env npx tsx
/**
 * Build-time check for missing i18n translation keys.
 *
 * This script scans the codebase for translation key usage and compares
 * against the translation files to detect missing keys.
 *
 * Usage:
 *   npx tsx scripts/check-i18n-keys.ts
 *   npm run check:i18n
 *
 * Exit codes:
 *   0 - All keys found
 *   1 - Missing keys detected
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(PROJECT_ROOT, 'messages');
const LOCALES = ['en', 'mk'] as const;

// Directories to scan for translation usage
const SCAN_DIRS = [
  path.join(PROJECT_ROOT, 'app'),
  path.join(PROJECT_ROOT, 'components'),
];

// File extensions to scan
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Patterns to extract translation keys (for future implementation)
// const KEY_PATTERNS = [
//   /\bt\s*\(\s*['"]([^'"]+)['"]/g,
//   /\bt\s*\(\s*['"]([^'"]+)['"]\s*,/g,
//   /useTranslations\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
//   /getTranslations\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
// ];

interface TranslationUsage {
  key: string;
  file: string;
  line: number;
  namespace?: string;
}

interface MissingKey {
  fullKey: string;
  usages: TranslationUsage[];
  missingIn: string[];
}

function loadMessages(locale: string): Record<string, unknown> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load messages for locale '${locale}':`, error);
    return {};
  }
}

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  const keys = keyPath.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function keyExists(messages: Record<string, unknown>, fullKey: string): boolean {
  const value = getNestedValue(messages, fullKey);
  return value !== undefined;
}

function scanFile(filePath: string): TranslationUsage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const usages: TranslationUsage[] = [];

  // Find the namespace from useTranslations or getTranslations
  let currentNamespace: string | undefined;
  const namespaceMatch = content.match(/(?:useTranslations|getTranslations)\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  if (namespaceMatch) {
    currentNamespace = namespaceMatch[1];
  }

  // Scan for key usage
  lines.forEach((line, lineIndex) => {
    // Match t('key') patterns
    const keyMatches = line.matchAll(/\bt\s*\(\s*['"]([^'"]+)['"]/g);
    for (const match of keyMatches) {
      const key = match[1];
      // Skip if it looks like a full key with namespace already
      if (!key.includes('.') || currentNamespace) {
        usages.push({
          key,
          file: filePath,
          line: lineIndex + 1,
          namespace: currentNamespace,
        });
      }
    }
  });

  return usages;
}

function scanDirectory(dir: string): TranslationUsage[] {
  const usages: TranslationUsage[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          walk(fullPath);
        }
      } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
        usages.push(...scanFile(fullPath));
      }
    }
  }

  walk(dir);
  return usages;
}

function findMissingKeys(): MissingKey[] {
  console.log('Loading translation files...');
  const messages: Record<string, Record<string, unknown>> = {};
  for (const locale of LOCALES) {
    messages[locale] = loadMessages(locale);
    console.log(`  Loaded ${locale}.json`);
  }

  console.log('\nScanning source files for translation usage...');
  const allUsages: TranslationUsage[] = [];
  for (const dir of SCAN_DIRS) {
    if (fs.existsSync(dir)) {
      const usages = scanDirectory(dir);
      allUsages.push(...usages);
      console.log(`  Scanned ${dir}: ${usages.length} usages found`);
    }
  }

  console.log(`\nTotal translation usages found: ${allUsages.length}`);

  // Group usages by full key
  const usagesByKey = new Map<string, TranslationUsage[]>();
  for (const usage of allUsages) {
    const fullKey = usage.namespace ? `${usage.namespace}.${usage.key}` : usage.key;
    const existing = usagesByKey.get(fullKey) || [];
    existing.push(usage);
    usagesByKey.set(fullKey, existing);
  }

  // Check each key against all locales
  const missingKeys: MissingKey[] = [];
  for (const [fullKey, usages] of usagesByKey) {
    const missingIn: string[] = [];

    for (const locale of LOCALES) {
      if (!keyExists(messages[locale], fullKey)) {
        missingIn.push(locale);
      }
    }

    if (missingIn.length > 0) {
      missingKeys.push({ fullKey, usages, missingIn });
    }
  }

  return missingKeys;
}

function main() {
  console.log('=== i18n Key Checker ===\n');

  const missingKeys = findMissingKeys();

  if (missingKeys.length === 0) {
    console.log('\n All translation keys are defined in all locales!');
    process.exit(0);
  }

  console.log(`\n Found ${missingKeys.length} missing translation keys:\n`);

  for (const missing of missingKeys) {
    console.log(`  ${missing.fullKey}`);
    console.log(`    Missing in: ${missing.missingIn.join(', ')}`);
    console.log(`    Used in:`);
    for (const usage of missing.usages.slice(0, 3)) {
      const relPath = path.relative(PROJECT_ROOT, usage.file);
      console.log(`      - ${relPath}:${usage.line}`);
    }
    if (missing.usages.length > 3) {
      console.log(`      ... and ${missing.usages.length - 3} more`);
    }
    console.log();
  }

  console.log('\nTo fix, add the missing keys to the translation files in messages/');
  process.exit(1);
}

main();
