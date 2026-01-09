# CI Pipeline Audit Report

**Audit Date:** 2026-01-09
**Milestone:** v1.2 Infrastructure & CI Overhaul
**Status:** All v1.2 CI criteria already met in current pipeline

## Executive Summary

The existing CI pipeline is comprehensive and well-designed. All v1.2 success criteria for CI gates are **already implemented**. Phase 18 should focus on optimization rather than adding missing gates.

---

## 1. Workflow Inventory

### ci.yml - Main CI Pipeline

**Purpose:** Primary quality gate for all code changes
**Triggers:** `push` to main/develop, `pull_request` to main/develop
**Concurrency:** Cancel in-progress runs for same ref

| Job | Dependencies | Runner | Est. Duration | Secrets Required |
|-----|-------------|--------|---------------|------------------|
| lint | - | ubuntu-latest | ~1-2 min | None |
| i18n-check | - | ubuntu-latest | ~1-2 min | None |
| type-check | - | ubuntu-latest | ~1-2 min | DATABASE_URL (Prisma) |
| build | - | ubuntu-latest | ~2-3 min | 10+ secrets (all env vars) |
| content-qa | - | ubuntu-latest | ~1-2 min | None |
| e2e | lint, type-check, build | ubuntu-latest | ~5-10 min | 10+ secrets |
| unit-tests | lint | ubuntu-latest | ~1-2 min | None |
| mobile-maestro | build | macos-latest | ~3-5 min | MAESTRO_* (optional) |
| ci-success | all jobs | ubuntu-latest | <1 min | None |

**Job Parallelism:**
```
Start ─┬─ lint ─────────┬─ unit-tests
       ├─ i18n-check    │
       ├─ type-check ───┼─ e2e (waits for lint, type-check, build)
       ├─ build ────────┼─ mobile-maestro
       └─ content-qa    │
                        └─ ci-success (waits for all)
```

**Features:**
- Concurrency groups prevent duplicate runs
- PR comments with E2E results
- Build size report in GitHub summary
- Artifact uploads for playwright reports (30 days)
- Smart cancellation handling in ci-success job

---

### e2e.yml - Standalone E2E Tests

**Purpose:** Extended E2E testing (full browser matrix)
**Triggers:** `workflow_dispatch` only (schedule disabled)
**Runner:** ubuntu-latest
**Timeout:** 60 minutes

**Key Differences from ci.yml E2E:**
- Has Next.js build cache configured
- Longer timeout (60 min vs 35 min)
- Currently only runs chromium (same as ci.yml)

**Status:** Schedule disabled since CI runs E2E on every push

---

### codex-deploy.yml - Manual Vercel Deployment

**Purpose:** Manual production deployment via workflow dispatch
**Triggers:** `workflow_dispatch` only
**Runner:** ubuntu-latest

**Secrets Required:**
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

**Note:** Gracefully skips if secrets not configured

---

### secret-scan.yml - Secret Detection

**Purpose:** Prevent accidental secret commits
**Triggers:** `push` to main, `pull_request` to main
**Runner:** ubuntu-latest

**Features:**
- Uses gitleaks/gitleaks-action@v2
- Uploads SARIF report to GitHub Security
- Full history scan (fetch-depth: 0)

---

### deploy-notification.yml - Deployment Notifications

**Purpose:** Post-deployment notifications
**Triggers:** `deployment_status` events
**Runner:** ubuntu-latest

**Features:**
- Creates GitHub step summary
- Comments on PRs with deployment URL
- Only triggers for production environment

---

### reminder-cron.yml - Cron Smoke Test

**Purpose:** Fallback smoke test for reminder cron
**Triggers:** `workflow_dispatch` only (schedule disabled)
**Runner:** ubuntu-latest

**Note:** Vercel cron is primary mechanism; this is backup

---

### agent-orchestration.yml - AI Agent Orchestration

**Purpose:** Launch and manage AI sub-agents
**Triggers:** `workflow_dispatch`, `workflow_call`
**Runner:** ubuntu-latest

**Features:**
- Dry-run mode available
- Commits status updates to data/sub-agents-status.json
- Optional Slack notifications

---

## 2. Gap Analysis: v1.2 Success Criteria

| Criterion | Status | Location | Notes |
|-----------|--------|----------|-------|
| Type checking gate | **MET** | ci.yml: type-check job | Runs `tsc --noEmit` with Prisma generation |
| Linting gate | **MET** | ci.yml: lint job | Runs ESLint with 0 errors allowed |
| Unit test gate | **MET** | ci.yml: unit-tests job | Runs Vitest suite |
| E2E test gate | **MET** | ci.yml: e2e job | Chromium-only in CI, full matrix available |
| Build validation | **MET** | ci.yml: build job | Full Next.js build with all env vars |
| Workflows documented | **MET** | This document | All 7 workflows documented |

**Bonus Quality Gates (already present):**
- Content QA validation (curriculum quality)
- i18n sync checking (translation files)
- Secret scanning (Gitleaks)
- Mobile smoke tests (Maestro, optional)

---

## 3. Build Time Benchmarks

### Local Benchmarks (M1 MacBook Pro)

| Task | Local Time | CI Estimate (+40% overhead) |
|------|------------|----------------------------|
| npm ci | ~12 sec* | ~20-30 sec |
| npm run lint | ~37 sec | ~50-60 sec |
| npm run type-check | ~12 sec | ~20-30 sec |
| npm run build | ~29 sec | ~45-60 sec |
| npm run test | ~13 sec | ~20-30 sec |

*npm ci benchmark affected by local cache; clean CI install likely ~30-60 sec

### Estimated CI Pipeline Times

**Critical Path Analysis:**

```
Time 0 ─────────────────────────────────────────────────────────────────────
       │
       ├─ lint (~1.5 min)
       │     └─ unit-tests (~1 min) ──────────────────────── Total: ~2.5 min
       │
       ├─ type-check (~1 min) ──────┐
       │                            │
       ├─ build (~2 min) ───────────┼─ e2e (~5-8 min) ────── Total: ~10 min
       │                            │
       └─ other parallel jobs...    │
                                    └─ ci-success ────────── Total: ~10-12 min
```

**Critical Path:** `build → e2e → ci-success` = ~10-12 minutes

**Bottleneck:** E2E tests are the longest job on the critical path

### Per-Job Breakdown (estimated)

| Job | npm ci | Task | Total Est. |
|-----|--------|------|------------|
| lint | ~30s | ~60s | ~1.5 min |
| type-check | ~30s | ~30s | ~1 min |
| build | ~30s | ~90s | ~2 min |
| e2e | ~30s | ~5-7 min | ~6-8 min |
| unit-tests | ~30s | ~30s | ~1 min |
| content-qa | ~30s | ~30s | ~1 min |
| i18n-check | ~30s | ~10s | ~45s |
| mobile-maestro | ~60s | ~2-3 min | ~3-4 min |

**Total sequential time:** ~20+ min
**Actual parallel time:** ~10-12 min (jobs run in parallel)

---

## 4. Optimization Opportunities

### 4.1 Duplicate npm ci Calls

**Issue:** Each of 8 jobs runs `npm ci` independently
**Impact:** ~4 minutes of redundant installation time (8 × ~30s)
**Current mitigation:** `actions/setup-node` with `cache: 'npm'` caches npm registry (not node_modules)

**Potential improvements:**
1. **Share node_modules via artifact** - Upload node_modules from first job, download in others
2. **Use nx/turbo caching** - Would require build system changes
3. **Composite actions** - Create reusable setup action

**Recommendation:** Low priority - npm cache already helps, full fix requires significant changes

### 4.2 Missing Next.js Build Cache

**Issue:** ci.yml doesn't cache `.next/cache` (e2e.yml does)
**Impact:** Build job could be ~30-50% faster with cache

**Fix:** Add to ci.yml build job:
```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

**Recommendation:** HIGH priority - easy win

### 4.3 E2E Job Dependencies

**Issue:** E2E waits for build job but doesn't use build artifacts
**Impact:** E2E rebuilds the app locally (Playwright dev server)

**Analysis:** This is intentional - Playwright runs against dev server, not production build. The build job validates production builds separately.

**Recommendation:** Keep as-is - validates both build and runtime behavior

### 4.4 Disabled Scheduled Workflows

| Workflow | Schedule | Status | Notes |
|----------|----------|--------|-------|
| e2e.yml | 5:30 AM daily | Disabled | CI runs E2E on every push |
| reminder-cron.yml | 9:10 AM daily | Disabled | Vercel cron is primary |

**Recommendation:** Keep disabled - current triggers are sufficient

### 4.5 Mobile Maestro Skipping

**Issue:** mobile-maestro always skips (MAESTRO_* secrets not configured)
**Impact:** No actual mobile testing in CI

**Recommendation:** Low priority for v1.2 - mobile app not yet critical path

### 4.6 Playwright Browser Installation

**Issue:** E2E job installs Playwright browsers every run (~1 min)
**Impact:** Adds to E2E job time

**Fix:** Cache Playwright browsers:
```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

**Recommendation:** MEDIUM priority - saves ~1 min per E2E run

---

## 5. Risk Assessment

### Critical Path for Deployment

```
Secret scan (main only) ─┐
                         ├─ Vercel auto-deploy (not CI-controlled)
CI pipeline ─────────────┘
```

**Note:** Vercel deploys automatically on push to main. CI failures don't block deployment.

**Risk:** Code could deploy before CI completes
**Mitigation:** Branch protection rules should require CI success before merge

### Jobs That Can Fail Without Blocking

| Job | Fail Behavior | Risk Level |
|-----|---------------|------------|
| mobile-maestro | Skips gracefully | Low - not configured |
| content-qa | Fails CI | Medium - content issues block |
| ci-success | Reports aggregate | None - summary only |

### Missing Alerts

- No Slack/Discord notifications on CI failure
- No email alerts
- GitHub notifications rely on user settings

**Recommendation:** Consider adding failure notifications in Phase 18

---

## 6. Phase 18 Recommendations

### Quick Wins (< 1 hour each)

1. **Add Next.js build cache to ci.yml** - Copy from e2e.yml, ~30% faster builds
2. **Add Playwright browser cache** - Save ~1 min per E2E run
3. **Update actions/setup-node to v6** - Already done in most jobs

### Medium Effort (1-4 hours)

4. **Create composite setup action** - Standardize checkout + node + cache across jobs
5. **Add CI failure notifications** - Slack webhook on ci-success failure
6. **Verify branch protection rules** - Ensure CI required before merge

### Lower Priority (for future)

7. **Investigate node_modules artifact sharing** - Complex, marginal benefit
8. **Enable Maestro mobile testing** - Requires app build infrastructure
9. **Re-enable scheduled E2E** - When test suite is more stable

### Not Recommended

- Removing job dependencies - Current parallelism is well-optimized
- Switching to monorepo tools (nx/turbo) - Overkill for this project size

---

## 7. v1.2 Success Criteria Status Update

Based on this audit, the v1.2 CI success criteria should be updated:

| Original Criterion | Status | Action Needed |
|--------------------|--------|---------------|
| All existing workflows documented and gaps identified | **DONE** | This document |
| Type checking gate added to CI | **ALREADY EXISTS** | None |
| Linting gate added to CI | **ALREADY EXISTS** | None |
| Unit test gate added to CI | **ALREADY EXISTS** | None |
| E2E test gate added to CI | **ALREADY EXISTS** | None |
| Build validation before deploy | **ALREADY EXISTS** | None (note: Vercel auto-deploys) |

**Revised Phase 18 Focus:** Optimization and polish rather than adding missing gates

---

## Appendix: Secrets Inventory

| Secret | Used By | Required |
|--------|---------|----------|
| DATABASE_URL | type-check, build, e2e | Yes (Prisma) |
| DIRECT_URL | build, e2e | Yes (Prisma) |
| GOOGLE_PROJECT_ID | build, e2e | Yes |
| GOOGLE_APPLICATION_CREDENTIALS_JSON | build, e2e | Yes |
| GOOGLE_DOCS_ID | build, e2e | Yes |
| DICTIONARY_PDF_URL | build, e2e | Yes |
| GOOGLE_SHEETS_CONTENT_ID | build, e2e | Yes |
| CRON_SECRET | build, e2e, reminder-cron | Yes |
| AUTH_SECRET | build, e2e | Yes |
| GOOGLE_CLIENT_ID | build, e2e | Yes |
| GOOGLE_CLIENT_SECRET | build, e2e | Yes |
| NEXT_PUBLIC_SENTRY_DSN | build, e2e | Yes |
| VERCEL_TOKEN | codex-deploy | Optional |
| VERCEL_ORG_ID | codex-deploy | Optional |
| VERCEL_PROJECT_ID | codex-deploy | Optional |
| MAESTRO_* | mobile-maestro | Optional |
| SLACK_WEBHOOK_URL | agent-orchestration | Optional |
