#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.join(process.cwd(), 'test-results', 'release-gate');
const modes = ['signed-out', 'signed-in'];

function run(cmd, args, env) {
  const isWin = process.platform === 'win32';
  const command = isWin && cmd === 'npx' ? 'npx.cmd' : cmd;
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env,
  });
  const code = result.status ?? 1;
  if (code !== 0) {
    process.exit(code);
  }
}

for (const mode of modes) {
  const modeDir = path.join(rootDir, mode);
  fs.rmSync(modeDir, { recursive: true, force: true });
  fs.mkdirSync(modeDir, { recursive: true });

  const env = {
    ...process.env,
    RELEASE_GATE_MODE: mode,
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    // Enable DB-less credential sign-in for local/CI release-gate runs.
    MKLL_E2E_AUTH: process.env.MKLL_E2E_AUTH ?? 'true',
    // Avoid slow DB discovery in route lists when running without a database.
    RELEASE_GATE_RESOLVE_LESSON_FROM_DB: process.env.RELEASE_GATE_RESOLVE_LESSON_FROM_DB ?? 'false',
  };

  console.log(`\n=== Release Gate (${mode}) ===\n`);
  run('npx', ['playwright', 'test', '--project=release-gate'], env);
}

console.log(`\n=== Generating docs ===\n`);
run('node', ['scripts/generate-mobile-audit-md.mjs'], process.env);

console.log(`\n=== Verifying artifacts ===\n`);
run('node', ['scripts/check-release-gate.mjs'], process.env);

