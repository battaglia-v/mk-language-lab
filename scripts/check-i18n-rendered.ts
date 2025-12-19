#!/usr/bin/env tsx
/**
 * i18n Key Detection Script
 *
 * Validates that i18n keys are not rendered as visible text in the UI.
 * Used as part of CI to prevent i18n key leaks in production.
 *
 * Usage:
 *   npx tsx scripts/check-i18n-rendered.ts [--ci]
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - i18n keys found in rendered output (fail CI)
 */

import * as fs from 'fs';
import * as path from 'path';

const CI_MODE = process.argv.includes('--ci');

// Patterns that indicate an i18n key
const I18N_KEY_PATTERNS = [
  // Standard dot-notation keys
  /^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+$/,
  // Known namespace prefixes
  /^(common|nav|learn|practice|translate|news|resources|profile|notifications)\.[a-zA-Z]+/,
  // Bracket notation fallback
  /\{[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+\}/,
];

// Files to check for hardcoded i18n keys
const COMPONENT_EXTENSIONS = ['.tsx', '.jsx'];

interface Issue {
  file: string;
  line: number;
  text: string;
  pattern: string;
}

function isI18nKey(text: string): boolean {
  return I18N_KEY_PATTERNS.some((pattern) => pattern.test(text));
}

function checkFile(filePath: string): Issue[] {
  const issues: Issue[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip imports and comments
    if (line.trim().startsWith('import') || line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    // Look for string literals that might be i18n keys rendered directly
    const stringMatches = line.matchAll(/>["']([^"'<>]+)["']</g);
    for (const match of stringMatches) {
      const text = match[1];
      if (isI18nKey(text)) {
        issues.push({
          file: filePath,
          line: index + 1,
          text: text,
          pattern: 'string literal in JSX',
        });
      }
    }

    // Check for direct template literals with i18n keys
    const templateMatches = line.matchAll(/>\{[`']([^`']+)[`']\}</g);
    for (const match of templateMatches) {
      const text = match[1];
      if (isI18nKey(text)) {
        issues.push({
          file: filePath,
          line: index + 1,
          text: text,
          pattern: 'template literal in JSX',
        });
      }
    }
  });

  return issues;
}

function scanDirectory(dir: string): Issue[] {
  const issues: Issue[] = [];

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    // Skip node_modules, .next, and other non-source directories
    if (file.isDirectory()) {
      if (!['node_modules', '.next', 'dist', '.git', 'coverage'].includes(file.name)) {
        issues.push(...scanDirectory(fullPath));
      }
    } else if (COMPONENT_EXTENSIONS.some((ext) => file.name.endsWith(ext))) {
      issues.push(...checkFile(fullPath));
    }
  }

  return issues;
}

function checkTranslationFiles(): { missing: string[]; duplicate: string[] } {
  const enPath = path.join(process.cwd(), 'messages', 'en.json');
  const mkPath = path.join(process.cwd(), 'messages', 'mk.json');

  const missing: string[] = [];
  const duplicate: string[] = [];

  if (!fs.existsSync(enPath)) {
    missing.push('messages/en.json not found');
    return { missing, duplicate };
  }

  try {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const mk = fs.existsSync(mkPath) ? JSON.parse(fs.readFileSync(mkPath, 'utf-8')) : {};

    // Check for keys in en.json missing from mk.json
    function findMissing(enObj: Record<string, unknown>, mkObj: Record<string, unknown>, prefix = '') {
      for (const key of Object.keys(enObj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
          if (typeof mkObj[key] !== 'object') {
            missing.push(fullKey);
          } else {
            findMissing(enObj[key] as Record<string, unknown>, mkObj[key] as Record<string, unknown>, fullKey);
          }
        } else if (!(key in mkObj)) {
          missing.push(fullKey);
        }
      }
    }

    findMissing(en, mk);
  } catch (error) {
    console.error('Error parsing translation files:', error);
  }

  return { missing, duplicate };
}

async function main() {
  console.log('🔍 Checking for i18n key leaks...\n');

  // Scan component files
  const componentsDir = path.join(process.cwd(), 'components');
  const appDir = path.join(process.cwd(), 'app');

  const issues: Issue[] = [];

  if (fs.existsSync(componentsDir)) {
    issues.push(...scanDirectory(componentsDir));
  }

  if (fs.existsSync(appDir)) {
    issues.push(...scanDirectory(appDir));
  }

  // Check translation files
  const { missing } = checkTranslationFiles();

  // Report results
  let hasErrors = false;

  if (issues.length > 0) {
    console.log('❌ Potential i18n key leaks found:\n');
    for (const issue of issues) {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    Text: "${issue.text}"`);
      console.log(`    Pattern: ${issue.pattern}\n`);
    }
    hasErrors = true;
  } else {
    console.log('✅ No i18n key leaks detected in components.\n');
  }

  if (missing.length > 0 && missing.length < 50) {
    console.log(`⚠️  ${missing.length} keys missing from mk.json translation:\n`);
    missing.slice(0, 10).forEach((key) => console.log(`  - ${key}`));
    if (missing.length > 10) {
      console.log(`  ... and ${missing.length - 10} more\n`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  - i18n leaks: ${issues.length}`);
  console.log(`  - Missing translations: ${missing.length}`);

  if (CI_MODE && hasErrors) {
    console.log('\n💥 CI check failed due to i18n issues.');
    process.exit(1);
  }

  process.exit(0);
}

main().catch(console.error);
