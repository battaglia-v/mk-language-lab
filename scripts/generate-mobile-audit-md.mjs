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

const args = process.argv.slice(2);
const inputArg = args.find((arg) => arg.startsWith('--input='));
const jsonPath = inputArg ? inputArg.slice('--input='.length) : 'test-results/audit-results.json';

const hasPlaywrightJson = fs.existsSync(jsonPath);
const releaseGateRoot = path.join(process.cwd(), 'test-results', 'release-gate');
const hasReleaseGateArtifacts = fs.existsSync(releaseGateRoot);

if (!hasPlaywrightJson && !hasReleaseGateArtifacts) {
  console.error(`Missing ${jsonPath} and no release-gate artifacts found.`);
  console.error('Run `npm run audit:mobile` or the release-gate suite first.');
  process.exit(1);
}

let data = null;
const failed = [];
const passed = [];
const skipped = [];

if (hasPlaywrightJson) {
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
    process.exit(1);
  }
}

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

// Process all suites (when Playwright JSON is present)
if (data) {
  for (const suite of data.suites || []) {
    processSuite(suite);
  }
}

// Generate Markdown (legacy mobile audit report)
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

const releaseGate = hasReleaseGateArtifacts ? loadReleaseGateArtifacts(releaseGateRoot) : null;
const interactionInventory = releaseGate ? buildMergedInteractionInventory(releaseGate) : null;

fs.writeFileSync('docs/audit_failures.md', renderAuditFailures({ playwright: { failed }, releaseGate }));
fs.writeFileSync('docs/audit_passes.md', renderAuditPasses({ playwright: { passed, skipped, failed }, releaseGate }));
fs.writeFileSync('docs/coverage_summary.md', renderCoverageSummary({ releaseGate, interactionInventory }));

if (interactionInventory) {
  fs.writeFileSync('docs/interaction_inventory.md', renderInteractionInventory(interactionInventory));
}

console.log(`Wrote docs/mobile_audit_report.md`);
console.log(`Wrote docs/audit_failures.md`);
console.log(`Wrote docs/audit_passes.md`);
console.log(`Wrote docs/coverage_summary.md`);
if (interactionInventory) console.log(`Wrote docs/interaction_inventory.md`);
if (data) {
  console.log(`  Passed: ${passed.length}`);
  console.log(`  Failed: ${failed.length}`);
  console.log(`  Skipped: ${skipped.length}`);
}

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

function loadReleaseGateArtifacts(rootDir) {
  const modes = ['signed-out', 'signed-in', 'premium'];
  const runs = [];

  for (const mode of modes) {
    const modeDir = path.join(rootDir, mode);
    if (!fs.existsSync(modeDir)) continue;

    const invPath = path.join(modeDir, 'interaction-inventory.json');
    const missingPath = path.join(modeDir, 'missing-testid.json');
    const journeyPath = path.join(modeDir, 'journey-results.json');

    const run = { mode, interactionInventory: null, missingTestIds: null, journeys: null };
    if (fs.existsSync(invPath)) {
      run.interactionInventory = JSON.parse(fs.readFileSync(invPath, 'utf-8'));
    }
    if (fs.existsSync(missingPath)) {
      run.missingTestIds = JSON.parse(fs.readFileSync(missingPath, 'utf-8'));
    }
    if (fs.existsSync(journeyPath)) {
      run.journeys = JSON.parse(fs.readFileSync(journeyPath, 'utf-8'));
    }
    runs.push(run);
  }

  return { rootDir, runs };
}

function buildMergedInteractionInventory(releaseGate) {
  const byKey = new Map();

  for (const run of releaseGate.runs) {
    const interactions = run.interactionInventory?.interactions || [];
    for (const interaction of interactions) {
      const routePath = interaction.resolvedPathname || interaction.routePath;
      const selector = interaction.selector;
      const tagName = interaction.tagName || 'unknown';
      const role = interaction.role || '';
      const label = interaction.label || '';
      const key = `${routePath}::${selector}::${tagName}::${role}::${label}`;

      const existing = byKey.get(key) || {
        routePath,
        label,
        selector,
        action: interaction.action,
        modes: new Set(),
      };

      existing.modes.add(run.mode);
      if (!existing.label && label) existing.label = label;
      if (existing.action === 'unknown' && interaction.action !== 'unknown') existing.action = interaction.action;

      byKey.set(key, existing);
    }
  }

  const rows = Array.from(byKey.values()).map((row) => {
    const modes = Array.from(row.modes.values());
    const gating = modes.includes('signed-out')
      ? 'signed-out'
      : modes.includes('signed-in')
        ? 'signed-in'
        : modes.includes('premium')
          ? 'pro'
          : 'unknown';

    return {
      routePath: row.routePath,
      label: row.label || 'unknown',
      selector: row.selector,
      action: row.action || 'unknown',
      gating,
      modes,
    };
  });

  rows.sort((a, b) => (a.routePath === b.routePath ? a.label.localeCompare(b.label) : a.routePath.localeCompare(b.routePath)));
  return { generatedAt: new Date().toISOString(), rows };
}

function renderInteractionInventory(inventory) {
  let out = `# Interaction Inventory\n\nGenerated: ${inventory.generatedAt}\n\n`;
  out += `Each row represents an interactive element discovered by the release-gate scans.\n\n`;
  out += `| Route | Element label | Selector (data-testid) | Expected action | Gating |\n`;
  out += `|------|---------------|------------------------|----------------|--------|\n`;
  for (const row of inventory.rows) {
    out += `| ${escapePipe(row.routePath)} | ${escapePipe(row.label)} | ${escapePipe(row.selector)} | ${escapePipe(row.action)} | ${escapePipe(row.gating)} |\n`;
  }
  out += `\n`;
  return out;
}

function renderCoverageSummary({ releaseGate, interactionInventory }) {
  const generatedAt = new Date().toISOString();
  let out = `# Coverage Summary\n\nGenerated: ${generatedAt}\n\n`;

  if (!releaseGate || !interactionInventory) {
    out += `No release-gate artifacts found under \`test-results/release-gate\`.\n`;
    return out;
  }

  out += `## Release Gate Runs\n\n`;
  out += `| Mode | Routes scanned | Journeys | Interactions inventoried | Dead clicks | Missing testids |\n`;
  out += `|------|---------------|----------|--------------------------|------------|-----------------|\n`;

  const routeSet = new Set();
  const assertedKeySet = new Set();
  let journeyRunCount = 0;

  for (const run of releaseGate.runs) {
    const inv = run.interactionInventory;
    const missing = run.missingTestIds;
    const journeys = run.journeys;
    const routesScanned = Number(inv?.totalRoutes || 0);
    const interactionsCount = Number(inv?.totalInteractions || (inv?.interactions?.length || 0));
    const deadClicks = Number(inv?.deadClickCount || (inv?.deadClicks?.length || 0));
    const missingCount = Number(missing?.missingCount || (missing?.missing?.length || 0));
    const journeyFailures = Number(journeys?.failures?.length || 0);
    const journeyLabel = journeys ? (journeyFailures === 0 ? 'PASS' : `FAIL (${journeyFailures})`) : 'N/A';
    if (journeys) journeyRunCount += 1;

    out += `| ${run.mode} | ${routesScanned} | ${journeyLabel} | ${interactionsCount} | ${deadClicks} | ${missingCount} |\n`;

    const routes = inv?.routes || missing?.routes || [];
    for (const r of routes) {
      if (r?.path) routeSet.add(r.path);
    }

    for (const i of inv?.interactions || []) {
      const routePath = i.resolvedPathname || i.routePath;
      const selector = i.selector;
      const tagName = i.tagName || 'unknown';
      const role = i.role || '';
      const label = i.label || '';
      const key = `${routePath}::${selector}::${tagName}::${role}::${label}`;
      assertedKeySet.add(key);
    }
  }

  out += `\n## Totals (Union Across Modes)\n\n`;
  const inventoriedCount = interactionInventory.rows.length;
  const assertedCount = assertedKeySet.size;
  out += `- Total routes covered: **${routeSet.size}**\n`;
  out += `- Journey runs present: **${journeyRunCount} / 3**\n`;
  out += `- Total interactions inventoried: **${inventoriedCount}**\n`;
  out += `- Total interactions asserted by tests: **${assertedCount}**\n`;
  out += `- Inventory count == asserted count: **${inventoriedCount === assertedCount ? 'YES' : `NO (${inventoriedCount} vs ${assertedCount})`}**\n`;
  out += `\n`;
  return out;
}

function renderAuditFailures({ playwright, releaseGate }) {
  const generatedAt = new Date().toISOString();
  let out = `# Audit Failures\n\nGenerated: ${generatedAt}\n\n`;

  const hasPlaywrightFailures = (playwright?.failed?.length || 0) > 0;
  const hasReleaseGate = Boolean(releaseGate);

  if (!hasPlaywrightFailures && !hasReleaseGate) {
    out += `No failures.\n`;
    return out;
  }

  if (hasReleaseGate) {
    for (const run of releaseGate.runs) {
      const inv = run.interactionInventory;
      const missing = run.missingTestIds;
      const journeys = run.journeys;
      const deadClicks = inv?.deadClicks || [];
      const missingItems = missing?.missing || [];
      const journeyFailures = journeys?.failures || [];

      if (deadClicks.length === 0 && missingItems.length === 0 && journeyFailures.length === 0) continue;

      out += `## Release Gate: ${run.mode}\n\n`;

      if (journeyFailures.length > 0) {
        out += `### Journey failures (${journeyFailures.length})\n\n`;
        for (const jf of journeyFailures) {
          out += `- Route: \`${jf.routePath}\` • Expected: ${escapePipe((jf.expectedTestIds || []).join(', '))}\n`;
          out += `  - Error: ${escapePipe(jf.error)}\n`;
          out += `  - Repro: Go to \`${jf.routePath}\`.\n`;
        }
        out += `\n`;
      }

      if (missingItems.length > 0) {
        out += `### Missing data-testid (${missingItems.length})\n\n`;
        for (const item of missingItems) {
          out += `- Route: \`${item.routePath}\` • Element: ${escapePipe(item.label)} • ${escapePipe(item.tagName)} ${item.href ? `href=${escapePipe(item.href)}` : ''}\n`;
          out += `  - Repro: Go to \`${item.routePath}\` → find the element labeled "${escapePipe(item.label)}" → it lacks \`data-testid\`.\n`;
        }
        out += `\n`;
      }

      if (deadClicks.length > 0) {
        out += `### Dead clicks (${deadClicks.length})\n\n`;
        for (const dc of deadClicks) {
          out += `- ${escapePipe(dc.label)} on \`${dc.routePath}\` (\`${dc.selector}\`)\n`;
          for (const step of dc.repro || []) {
            out += `  - ${escapePipe(step)}\n`;
          }
        }
        out += `\n`;
      }
    }
  }

  if (hasPlaywrightFailures) {
    out += `## Playwright Test Failures (${playwright.failed.length})\n\n`;
    for (const f of playwright.failed) {
      out += `- ${escapePipe(f.title)} (${escapePipe(shortenPath(f.file))})\n`;
      out += `  - Error: ${escapePipe(shorten(f.error, 220))}\n`;
      out += `  - Repro: \`npx playwright test ${escapePipe(f.file)}\`\n`;
    }
    out += `\n`;
  }

  return out;
}

function renderAuditPasses({ playwright, releaseGate }) {
  const generatedAt = new Date().toISOString();
  let out = `# Audit Passes\n\nGenerated: ${generatedAt}\n\n`;

  if (releaseGate) {
    out += `## Release Gate Summary\n\n`;
    for (const run of releaseGate.runs) {
      const inv = run.interactionInventory;
      const missing = run.missingTestIds;
      const routesScanned = Number(inv?.totalRoutes || 0);
      const interactionsCount = Number(inv?.totalInteractions || (inv?.interactions?.length || 0));
      const deadClicks = Number(inv?.deadClickCount || (inv?.deadClicks?.length || 0));
      const missingCount = Number(missing?.missingCount || (missing?.missing?.length || 0));

      out += `- ${run.mode}: routes=${routesScanned}, interactions=${interactionsCount}, deadClicks=${deadClicks}, missingTestids=${missingCount}\n`;
    }
    out += `\n`;
  }

  if (playwright) {
    out += `## Playwright Summary\n\n`;
    out += `| Status | Count |\n|--------|-------|\n`;
    out += `| Passed | ${playwright.passed.length} |\n`;
    out += `| Failed | ${playwright.failed.length} |\n`;
    out += `| Skipped | ${playwright.skipped.length} |\n`;
    out += `\n`;
  }

  return out;
}
