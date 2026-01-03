#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const rootArg = args.find((arg) => arg.startsWith('--root='));
const rootDir = rootArg ? rootArg.slice('--root='.length) : path.join(process.cwd(), 'test-results', 'release-gate');

const modes = ['signed-out', 'signed-in', 'premium'];
const requiredArtifacts = ['missing-testid.json', 'interaction-inventory.json', 'journey-results.json'];
const failures = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

for (const mode of modes) {
  const modeDir = path.join(rootDir, mode);
  if (!fs.existsSync(modeDir)) {
    failures.push(`[${mode}] missing directory: ${modeDir}`);
    continue;
  }

  for (const file of requiredArtifacts) {
    const p = path.join(modeDir, file);
    if (!fs.existsSync(p)) {
      failures.push(`[${mode}] missing artifact: ${p}`);
    }
  }

  const missingPath = path.join(modeDir, 'missing-testid.json');
  const invPath = path.join(modeDir, 'interaction-inventory.json');
  const journeyPath = path.join(modeDir, 'journey-results.json');
  if (!fs.existsSync(missingPath) || !fs.existsSync(invPath) || !fs.existsSync(journeyPath)) continue;

  const missing = readJson(missingPath);
  const inv = readJson(invPath);
  const journeys = readJson(journeyPath);

  const missingCount = Number(missing?.missingCount ?? missing?.missing?.length ?? 0);
  const missingRouteErrors = Number(missing?.routeErrorCount ?? missing?.routeErrors?.length ?? 0);
  if (missingRouteErrors !== 0) failures.push(`[${mode}] missing_testid_scan has routeErrors=${missingRouteErrors}`);
  if (missingCount !== 0) failures.push(`[${mode}] missing_testid_scan has missingCount=${missingCount}`);

  const deadClickCount = Number(inv?.deadClickCount ?? inv?.deadClicks?.length ?? 0);
  const invRouteErrors = Number(inv?.routeErrorCount ?? inv?.routeErrors?.length ?? 0);
  if (invRouteErrors !== 0) failures.push(`[${mode}] dead_click_scan has routeErrors=${invRouteErrors}`);
  if (deadClickCount !== 0) failures.push(`[${mode}] dead_click_scan has deadClickCount=${deadClickCount}`);

  const journeyFailures = Number(journeys?.failures?.length ?? 0);
  if (journeyFailures !== 0) failures.push(`[${mode}] journey coverage has failures=${journeyFailures}`);
}

// Evidence docs
const docs = [
  'docs/audit_failures.md',
  'docs/audit_passes.md',
  'docs/coverage_summary.md',
  'docs/interaction_inventory.md',
  'docs/ui_audit.md',
  'docs/ui_audit_backlog.md',
];
for (const doc of docs) {
  const p = path.join(process.cwd(), doc);
  if (!fs.existsSync(p)) failures.push(`missing doc: ${doc} (run node scripts/generate-mobile-audit-md.mjs)`);
}

// UI screenshot evidence
const screenshotRoot = path.join(process.cwd(), 'docs', 'ui-audit', 'screenshots');
const viewports = ['390x844', '360x800'];
const majorRouteIds = [
  'home',
  'learn',
  'pathsHub',
  'alphabetLesson',
  'practice',
  'reader',
  'translate',
  'upgrade',
  'profile',
  'settings',
];
for (const viewport of viewports) {
  const dir = path.join(screenshotRoot, viewport);
  if (!fs.existsSync(dir)) {
    failures.push(`missing screenshots dir: docs/ui-audit/screenshots/${viewport}`);
    continue;
  }

  for (const routeId of majorRouteIds) {
    const p = path.join(dir, `${routeId}.png`);
    if (!fs.existsSync(p)) {
      failures.push(`missing screenshot: docs/ui-audit/screenshots/${viewport}/${routeId}.png`);
    }
  }
}

if (failures.length > 0) {
  console.error('Release gate check failed:\n');
  for (const line of failures) console.error(`- ${line}`);
  process.exit(1);
}

console.log('Release gate check passed.');

