#!/usr/bin/env npx tsx
/**
 * Translation Sync Script
 * 
 * Compares en.json and mk.json translation files to detect:
 * - Keys present in en.json but missing in mk.json
 * - Keys present in mk.json but missing in en.json
 * - Keys with mismatched placeholder patterns (e.g., {count})
 * 
 * Usage:
 *   npx tsx scripts/sync-translations.ts [--fix] [--ci]
 * 
 * Options:
 *   --fix    Create a template for missing keys (outputs to stdout)
 *   --ci     Exit with error code if issues found (for CI checks)
 * 
 * @see docs/ux-audit/09-implementation-plan.md MKLAB-702
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

interface TranslationReport {
  missingInMk: string[];
  missingInEn: string[];
  placeholderMismatches: Array<{
    key: string;
    enPlaceholders: string[];
    mkPlaceholders: string[];
  }>;
  totalEnKeys: number;
  totalMkKeys: number;
}

/**
 * Recursively extract all keys from a nested object
 */
function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested objects
      keys.push(...extractKeys(value as Record<string, unknown>, fullKey));
    } else {
      // Leaf node (string, number, array, etc.)
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Extract placeholders from a translation string
 * Matches patterns like {count}, {name}, {earned}/{goal}, etc.
 * Ignores ICU plural/select format internals (e.g., {count, plural, one {# day}})
 */
function extractPlaceholders(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  
  // For ICU plural/select messages, just extract the variable names
  // Pattern: {varName, plural|select|selectordinal, ...}
  const icuMatches = value.match(/\{(\w+),\s*(?:plural|select|selectordinal)/g);
  if (icuMatches) {
    // Extract just the variable names from ICU patterns
    const icuVars = icuMatches.map(m => {
      const match = m.match(/\{(\w+)/);
      return match ? `{${match[1]}}` : '';
    }).filter(Boolean);
    
    // Also find simple placeholders that aren't part of ICU
    const simpleMatches = value.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g) || [];
    const allPlaceholders = [...new Set([...icuVars, ...simpleMatches])].sort();
    return allPlaceholders;
  }
  
  // For simple strings, just match {variable} patterns
  const matches = value.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g);
  return matches ? [...new Set(matches)].sort() : [];
}

/**
 * Get a nested value from an object by dot-separated key
 */
function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce((current: unknown, part) => {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * Compare two translation files and generate a report
 */
function compareTranslations(
  enJson: Record<string, unknown>,
  mkJson: Record<string, unknown>
): TranslationReport {
  const enKeys = extractKeys(enJson);
  const mkKeys = extractKeys(mkJson);
  
  const enKeySet = new Set(enKeys);
  const mkKeySet = new Set(mkKeys);
  
  // Find missing keys
  const missingInMk = enKeys.filter(key => !mkKeySet.has(key));
  const missingInEn = mkKeys.filter(key => !enKeySet.has(key));
  
  // Find placeholder mismatches (only for keys that exist in both)
  const placeholderMismatches: TranslationReport['placeholderMismatches'] = [];
  
  for (const key of enKeys) {
    if (mkKeySet.has(key)) {
      const enValue = getNestedValue(enJson, key);
      const mkValue = getNestedValue(mkJson, key);
      
      const enPlaceholders = extractPlaceholders(enValue);
      const mkPlaceholders = extractPlaceholders(mkValue);
      
      // Check if placeholders match (order doesn't matter)
      if (JSON.stringify(enPlaceholders) !== JSON.stringify(mkPlaceholders)) {
        // Only report if at least one has placeholders
        if (enPlaceholders.length > 0 || mkPlaceholders.length > 0) {
          placeholderMismatches.push({
            key,
            enPlaceholders,
            mkPlaceholders,
          });
        }
      }
    }
  }
  
  return {
    missingInMk,
    missingInEn,
    placeholderMismatches,
    totalEnKeys: enKeys.length,
    totalMkKeys: mkKeys.length,
  };
}

/**
 * Print the report to console
 */
function printReport(report: TranslationReport): void {
  console.log('\n' + colors.bold + '═══════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.bold + '           Translation Sync Report' + colors.reset);
  console.log(colors.bold + '═══════════════════════════════════════════════════════' + colors.reset + '\n');
  
  // Summary
  console.log(colors.cyan + 'Summary:' + colors.reset);
  console.log(`  Total EN keys: ${report.totalEnKeys}`);
  console.log(`  Total MK keys: ${report.totalMkKeys}`);
  console.log(`  Difference: ${Math.abs(report.totalEnKeys - report.totalMkKeys)} keys\n`);
  
  // Missing in MK
  if (report.missingInMk.length > 0) {
    console.log(colors.red + colors.bold + `✗ Missing in mk.json (${report.missingInMk.length} keys):` + colors.reset);
    report.missingInMk.forEach(key => {
      console.log(colors.red + `  - ${key}` + colors.reset);
    });
    console.log('');
  } else {
    console.log(colors.green + '✓ No keys missing in mk.json' + colors.reset + '\n');
  }
  
  // Missing in EN
  if (report.missingInEn.length > 0) {
    console.log(colors.yellow + colors.bold + `⚠ Missing in en.json (${report.missingInEn.length} keys):` + colors.reset);
    report.missingInEn.forEach(key => {
      console.log(colors.yellow + `  - ${key}` + colors.reset);
    });
    console.log('');
  } else {
    console.log(colors.green + '✓ No keys missing in en.json' + colors.reset + '\n');
  }
  
  // Placeholder mismatches
  if (report.placeholderMismatches.length > 0) {
    console.log(colors.yellow + colors.bold + `⚠ Placeholder mismatches (${report.placeholderMismatches.length} keys):` + colors.reset);
    report.placeholderMismatches.forEach(({ key, enPlaceholders, mkPlaceholders }) => {
      console.log(colors.yellow + `  - ${key}` + colors.reset);
      console.log(colors.dim + `    EN: ${enPlaceholders.join(', ') || '(none)'}` + colors.reset);
      console.log(colors.dim + `    MK: ${mkPlaceholders.join(', ') || '(none)'}` + colors.reset);
    });
    console.log('');
  } else {
    console.log(colors.green + '✓ All placeholders match between files' + colors.reset + '\n');
  }
  
  // Overall status
  const hasIssues = report.missingInMk.length > 0 || 
                    report.missingInEn.length > 0 || 
                    report.placeholderMismatches.length > 0;
  
  if (hasIssues) {
    console.log(colors.red + colors.bold + '✗ Translation files are out of sync!' + colors.reset);
  } else {
    console.log(colors.green + colors.bold + '✓ All translation files are in sync!' + colors.reset);
  }
  
  console.log('');
}

/**
 * Generate a template for missing keys
 */
function generateMissingTemplate(
  report: TranslationReport,
  sourceJson: Record<string, unknown>,
  targetLocale: 'en' | 'mk'
): void {
  const missingKeys = targetLocale === 'mk' ? report.missingInMk : report.missingInEn;
  
  if (missingKeys.length === 0) {
    console.log(`\nNo missing keys in ${targetLocale}.json`);
    return;
  }
  
  console.log(`\n${colors.cyan}Template for missing keys in ${targetLocale}.json:${colors.reset}\n`);
  console.log('Add these keys to the appropriate locations in the file:\n');
  
  const template: Record<string, unknown> = {};
  
  for (const key of missingKeys) {
    const value = getNestedValue(sourceJson, key);
    const parts = key.split('.');
    
    let current = template;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    
    const lastKey = parts[parts.length - 1];
    current[lastKey] = targetLocale === 'mk' 
      ? `[TODO: Translate] ${value}` 
      : value;
  }
  
  console.log(JSON.stringify(template, null, 2));
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const showFix = args.includes('--fix');
  const ciMode = args.includes('--ci');
  
  // Resolve paths
  const messagesDir = path.resolve(__dirname, '..', 'messages');
  const enPath = path.join(messagesDir, 'en.json');
  const mkPath = path.join(messagesDir, 'mk.json');
  
  // Check files exist
  if (!fs.existsSync(enPath)) {
    console.error(colors.red + `Error: ${enPath} not found` + colors.reset);
    process.exit(1);
  }
  
  if (!fs.existsSync(mkPath)) {
    console.error(colors.red + `Error: ${mkPath} not found` + colors.reset);
    process.exit(1);
  }
  
  // Load and parse JSON files
  let enJson: Record<string, unknown>;
  let mkJson: Record<string, unknown>;
  
  try {
    enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  } catch (e) {
    console.error(colors.red + `Error parsing en.json: ${e}` + colors.reset);
    process.exit(1);
  }
  
  try {
    mkJson = JSON.parse(fs.readFileSync(mkPath, 'utf-8'));
  } catch (e) {
    console.error(colors.red + `Error parsing mk.json: ${e}` + colors.reset);
    process.exit(1);
  }
  
  // Generate report
  const report = compareTranslations(enJson, mkJson);
  
  // Print report
  printReport(report);
  
  // Show fix template if requested
  if (showFix) {
    if (report.missingInMk.length > 0) {
      generateMissingTemplate(report, enJson, 'mk');
    }
    if (report.missingInEn.length > 0) {
      generateMissingTemplate(report, mkJson, 'en');
    }
  }
  
  // Exit with error in CI mode if issues found
  if (ciMode) {
    const hasIssues = report.missingInMk.length > 0 || report.missingInEn.length > 0;
    if (hasIssues) {
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error(colors.red + 'Unexpected error:', error, colors.reset);
  process.exit(1);
});
