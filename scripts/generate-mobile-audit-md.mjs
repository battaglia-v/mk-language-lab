#!/usr/bin/env node

/**
 * Generate Mobile Audit Report
 *
 * Reads Playwright JSON output and generates docs/mobile_audit_report.md
 *
 * Usage:
 *   npx playwright test --reporter=json > test-results/audit-results.json
 *   node scripts/generate-mobile-audit-md.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const jsonPath = 'test-results/audit-results.json';

if (!fs.existsSync(jsonPath)) {
  console.error('Missing test-results/audit-results.json.');
  console.error('Run `npm run audit:mobile` first.');
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf-8');
let data;

try {
  data = JSON.parse(rawData);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  process.exit(1);
}

const failed = [];
const passed = [];
const skipped = [];

// Parse Playwright JSON structure
function processSpec(spec, filePath) {
  const title = spec.title;

  for (const test of spec.tests || []) {
    const result = test.results?.[0];
    const status = result?.status || 'unknown';
    const error = result?.error?.message || result?.error?.snippet || '';
    const duration = result?.duration || 0;

    const row = {
      title,
      status,
      file: filePath,
      error: error.slice(0, 500),
      duration,
    };

    if (status === 'passed') {
      passed.push(row);
    } else if (status === 'skipped') {
      skipped.push(row);
    } else {
      failed.push(row);
    }
  }
}

function processSuite(suite, parentPath = '') {
  const filePath = suite.file || parentPath;

  for (const spec of suite.specs || []) {
    processSpec(spec, filePath);
  }

  for (const child of suite.suites || []) {
    processSuite(child, filePath);
  }
}

// Process all suites
for (const suite of data.suites || []) {
  processSuite(suite);
}

// Generate Markdown
let md = `# Mobile Audit Report

Generated: ${new Date().toISOString()}

## Summary

| Status | Count |
|--------|-------|
| Passed | ${passed.length} |
| Failed | ${failed.length} |
| Skipped | ${skipped.length} |
| **Total** | **${passed.length + failed.length + skipped.length}** |

`;

// Failures section
md += `## Failures (Action Required)

`;

if (failed.length === 0) {
  md += `No failures - all tests passed!

`;
} else {
  md += `| Test | File | Error |
|------|------|-------|
`;

  for (const f of failed) {
    md += `| ${escapePipe(f.title)} | ${escapePipe(shortenPath(f.file))} | ${escapePipe(shorten(f.error, 150))} |
`;
  }

  md += `
`;
}

// Passed section
md += `## Passed Checks

<details>
<summary>View ${passed.length} passing tests</summary>

| Test | File | Duration |
|------|------|----------|
`;

for (const p of passed) {
  md += `| ${escapePipe(p.title)} | ${escapePipe(shortenPath(p.file))} | ${p.duration}ms |
`;
}

md += `
</details>

`;

// Skipped section
if (skipped.length > 0) {
  md += `## Skipped Tests

<details>
<summary>View ${skipped.length} skipped tests</summary>

| Test | File |
|------|------|
`;

  for (const s of skipped) {
    md += `| ${escapePipe(s.title)} | ${escapePipe(shortenPath(s.file))} |
`;
  }

  md += `
</details>

`;
}

// Routes coverage
md += `## Routes Covered

The following routes were tested:

- \`/en\` - Home
- \`/en/learn\` - Learn
- \`/en/learn/paths\` - Paths Hub
- \`/en/learn/paths/a1\` - A1 Path
- \`/en/learn/paths/a2\` - A2 Path
- \`/en/learn/paths/30day\` - 30-Day Challenge
- \`/en/learn/lessons/alphabet\` - Alphabet Lesson
- \`/en/practice\` - Practice Hub
- \`/en/practice/word-sprint\` - Word Sprint
- \`/en/practice/pronunciation\` - Pronunciation
- \`/en/practice/grammar\` - Grammar
- \`/en/reader\` - Reader Library
- \`/en/reader/samples/*\` - Reader Samples (32 routes)
- \`/en/translate\` - Translate
- \`/en/more\` - More Menu
- \`/en/settings\` - Settings
- \`/en/profile\` - Profile
- \`/en/help\` - Help
- \`/en/about\` - About
- \`/en/news\` - News
- \`/en/upgrade\` - Upgrade
- \`/auth/signin\` - Sign In
- \`/auth/signup\` - Sign Up

## How to Fix Failures

1. Review each failure in the table above
2. Check the error message for hints
3. Common fixes:
   - **Dead click**: Add \`href\` to links, \`onClick\` to buttons
   - **Touch target**: Increase to minimum 44px
   - **Translation key**: Add missing key to messages/*.json
   - **404**: Ensure route exists and file is correct
4. Re-run \`npm run audit:mobile\` to verify fixes

`;

// Write file
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/mobile_audit_report.md', md);
console.log(`Wrote docs/mobile_audit_report.md`);
console.log(`  Passed: ${passed.length}`);
console.log(`  Failed: ${failed.length}`);
console.log(`  Skipped: ${skipped.length}`);

// Helper functions
function escapePipe(s) {
  return String(s || '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

function shorten(s, max = 220) {
  const t = String(s || '').replace(/\n/g, ' ').replace(/\r/g, '');
  return t.length > max ? t.slice(0, max) + '...' : t;
}

function shortenPath(p) {
  return String(p || '')
    .replace(/.*tests\/mobile-audit\//, '')
    .replace(/\.spec\.ts$/, '');
}
