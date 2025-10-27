# Troubleshooting Guide

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Use this runbook to resolve common operational issues.

## Translate API Failures

**Symptoms**: `/api/translate` returns `502` or mock responses when credentials exist.

**Checks**:
- Verify `GOOGLE_PROJECT_ID` and credentials variables in Vercel.
- Re-deploy after updating secrets (Vercel requires redeploy to pick up changes).
- Inspect server logs for "Failed to configure Google Translate client" messages.

**Resolution**:
- Regenerate service account key and update `GOOGLE_APPLICATION_CREDENTIALS_JSON`.
- Ensure the service account has Cloud Translation API access.

## Tutor API Returning Mock Responses

**Symptoms**: API returns `mock: true` even in production.

**Checks**:
- Confirm `OPENAI_API_KEY` is set for the environment.
- Validate OpenAI account quotas.
- Review Vercel logs for network errors.

**Resolution**:
- Re-issue or rotate the OpenAI key.
- Temporarily disable tutor UI via `NEXT_PUBLIC_ENABLE_TUTOR_CHAT` if outage persists.

## News Feed Timeouts

**Symptoms**: `/api/news` returns fallback items only.

**Checks**:
- Review logs for RSS fetch failures.
- Test feed URLs manually (`curl https://time.mk/rss/all`).
- Ensure outbound requests are allowed (Vercel generally allows).

**Resolution**:
- Adjust `revalidate` or concurrency limits if providers are rate-limiting.
- Add new fallback sources when primary feeds are down.

## Prisma Connection Errors

**Symptoms**: `/api/tasks` returns 500 with database errors.

**Checks**:
- Confirm `DATABASE_URL` secret is configured.
- Run `pnpm prisma db pull` to ensure schema matches deployed database.
- Inspect connection limits for managed database.

**Resolution**:
- Rotate database credentials if compromised.
- Increase connection pool or switch to Prisma Data Proxy if needed.

## Localization Mismatches

**Symptoms**: Missing translation keys or mismatched languages.

**Checks**:
- Run lint/test locally to surface missing keys.
- Compare `messages/en.json` and `messages/mk.json` key sets.

**Resolution**:
- Add missing translations, update glossary, rerun QA checklist.
