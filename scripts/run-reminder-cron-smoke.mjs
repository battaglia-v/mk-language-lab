#!/usr/bin/env node
import process from 'node:process';

async function main() {
  const baseUrl =
    process.env.REMINDER_CRON_BASE_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    '';

  if (!baseUrl) {
    throw new Error(
      'Missing base URL. Set REMINDER_CRON_BASE_URL or EXPO_PUBLIC_API_BASE_URL/NEXT_PUBLIC_APP_URL'
    );
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    throw new Error('Missing CRON_SECRET env variable.');
  }

  const target = new URL('/api/cron/reminders', ensureTrailingSlash(baseUrl));
  const response = await fetch(target.toString(), {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Cron response was not valid JSON: ${text}`);
  }

  if (!response.ok) {
    throw new Error(
      `Cron endpoint returned ${response.status}: ${response.statusText}. Body: ${text}`
    );
  }

  const summary = normalizeSummary(payload);
  console.log('[reminder-cron] Response summary');
  console.table(summary);

  const problems = [];
  if (!summary.ok) {
    problems.push('Cron summary reported ok=false');
  }

  const errorBudget = Number.parseInt(process.env.REMINDER_CRON_ERROR_BUDGET ?? '3', 10);
  const hasSevereErrors = Number.isFinite(errorBudget) && summary.errors > errorBudget;
  if (summary.errors > 0) {
    const message = `Encountered ${summary.errors} Expo ticket error(s)`;
    if (hasSevereErrors) {
      problems.push(message + ` (budget ${errorBudget})`);
    } else {
      console.warn(`[reminder-cron] ${message}; below error budget of ${errorBudget}`);
    }
  }

  if (summary.revoked > 0) {
    console.warn(
      `[reminder-cron] Revoked ${summary.revoked} Expo push token(s). Inspect logs for details.`
    );
  }

  if (problems.length > 0) {
    throw new Error(`Reminder cron smoke failed: ${problems.join('; ')}`);
  }
}

function ensureTrailingSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}

function normalizeSummary(payload) {
  return {
    ok: Boolean(payload?.ok),
    sent: Number(payload?.sent ?? 0),
    evaluated: Number(payload?.evaluated ?? 0),
    errors: Number(payload?.errors ?? 0),
    revoked: Number(payload?.revoked ?? 0),
    durationMs: Number(payload?.durationMs ?? 0),
    runId: String(payload?.runId ?? ''),
    windows: payload?.windows ?? {},
  };
}

main().catch((error) => {
  console.error('[reminder-cron] Smoke check failed');
  console.error(error);
  process.exit(1);
});
