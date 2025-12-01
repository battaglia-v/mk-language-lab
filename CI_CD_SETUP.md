# CI/CD Setup & Test Protection

## Current Status ✅

### E2E Tests
- **100% passing** (63/63 tests)
- Runs on: Push to `main` or `develop`, and all Pull Requests
- Location: `.github/workflows/e2e.yml`

### What's Currently Working

1. **Automated Testing on Every Push**
   - Tests run automatically on pushes to `main` and `develop` branches
   - Tests run on all Pull Requests targeting these branches
   - Test results are uploaded as artifacts for review

2. **Test Coverage**
   - ✅ Admin panel authentication & authorization
   - ✅ Homepage navigation & content loading
   - ✅ News feed functionality
   - ✅ Practice page & vocabulary widget
   - ✅ Translate feature with direction switching
   - ✅ Resources page accessibility
   - ✅ Mobile responsive layouts

## What You Need to Do Next

### 1. Enable Branch Protection (REQUIRED for blocking bad deploys)

#### Quick Setup (2 minutes)

**Go to GitHub Repository Settings:**
1. Navigate to: `Settings` → `Branches` → `Branch protection rules`
2. Click **"Add rule"** for `main` branch
3. Enable these settings:
   - ☑️ **Require status checks to pass before merging**
     - Search for and add: `test` (from E2E Tests workflow)
   - ☑️ **Require branches to be up to date before merging**
   - ☑️ **Do not allow bypassing the above settings** (recommended)

4. Repeat for `develop` branch if you use it

**Result:** PRs cannot be merged if E2E tests fail.

#### Detailed Branch Protection Setup Guide

**Step 1: Navigate to Branch Protection Settings**
1. Go to your repository on GitHub
2. Click **Settings** (top navigation bar)
3. In the left sidebar, click **Branches**
4. Click the **"Add rule"** button

**Step 2: Configure Branch Name Pattern**
- In **Branch name pattern** field, enter: `main`
- This rule will apply only to the `main` branch

**Step 3: Require Pull Request Reviews (Recommended)**
- ☑️ Check **"Require a pull request before merging"**
- Set **"Required number of approvals"**: `1` (for solo projects) or `2` (for teams)
- ☑️ Check **"Dismiss stale pull request approvals when new commits are pushed"**
- ☑️ Check **"Require review from Code Owners"** (optional - if you have CODEOWNERS file)

**Step 4: Select Required Status Checks**
- ☑️ Check **"Require status checks to pass before merging"**
- ☑️ Check **"Require branches to be up to date before merging"**
- Click **"Add checks"** and select:
  - `test` (from e2e.yml - E2E Tests)
  - `ci-success` (if using comprehensive CI workflow)
  - `lint` (if available)
  - `type-check` (if available)

**Step 5: Force Push & Deletion Protection**
- ☑️ Check **"Do not allow force pushes"**
- ☑️ Check **"Do not allow deletions"**

**Step 6: Additional Security (Optional)**
- ☑️ Check **"Require linear history"** (prevents merge commits, cleaner history)
- ☑️ Check **"Require signed commits"** (enforces GPG signing for production security)
- ☑️ Check **"Do not allow bypassing the above settings"** (admin cannot override)

**Step 7: Save the Rule**
- Click **"Create"** button to enable branch protection

**Your Configuration Summary:**
```
Branch: main
├─ Require pull request before merging
├─ Require 1+ approvals
├─ Dismiss stale reviews on new commits
├─ Require status checks to pass:
│  └─ test (E2E Tests)
├─ Require up-to-date branches
├─ Block force pushes
├─ Block deletions
└─ Admin cannot bypass
```

**After setup, what happens:**
- ✅ Direct pushes to `main` are blocked
- ✅ PRs cannot be merged if tests fail
- ✅ PRs cannot be merged without approval (if enabled)
- ✅ `main` branch cannot be force-pushed or deleted

### 2. Configure GitHub Secrets (REQUIRED for CI tests)

Tests need these secrets to run in GitHub Actions:

```bash
# Required Secrets (add in Settings → Secrets → Actions):
DATABASE_URL                          # Neon PostgreSQL connection
DIRECT_URL                           # Neon direct connection
GOOGLE_PROJECT_ID                    # Google Cloud project ID
GOOGLE_APPLICATION_CREDENTIALS_JSON  # Base64-encoded Google credentials
GOOGLE_DOCS_ID                       # Google Doc for resources
DICTIONARY_PDF_URL                   # Dictionary PDF URL
GOOGLE_SHEETS_CONTENT_ID            # Google Sheets ID
CRON_SECRET                         # Secret for cron endpoints
AUTH_SECRET                         # NextAuth.js secret
GOOGLE_CLIENT_ID                    # OAuth client ID
GOOGLE_CLIENT_SECRET                # OAuth client secret
NEXT_PUBLIC_SENTRY_DSN             # Sentry DSN
```

**Quick way to add them:**
```bash
# From your .env.local, add each secret to GitHub
gh secret set DATABASE_URL < <(grep DATABASE_URL .env.local | cut -d= -f2-)
# Repeat for each secret above
```

### 3. Vercel Integration (OPTIONAL but RECOMMENDED)

Current setup: Vercel automatically deploys on push (no test blocking).

**Option A: Let GitHub Actions Block Vercel (RECOMMENDED)**
- Vercel respects branch protection rules
- If GitHub Actions tests fail, PR can't merge → no deploy to production
- Preview deployments still work for testing

**Option B: Add Vercel Checks Integration**
1. Go to Vercel Dashboard → Project Settings → Git
2. Enable: "Run checks before building"
3. This blocks Vercel builds if GitHub Actions fail

## Current Protection Status

### ✅ What WILL Prevent Breaking Changes
1. **E2E Tests** - Catch functional regressions automatically
2. **Test Coverage** - 63 tests covering all major features
3. **Automatic Execution** - Runs on every push & PR

### ⚠️ What WON'T Prevent Breaking Changes (Yet)
1. **Branch Protection** - Not enabled yet (manual step needed)
2. **Deploy Blocking** - Vercel will deploy even if tests fail
3. **Required Reviews** - Not enforced (optional to add)

### 🔒 After Setup, Protection Will Include
1. ✅ Tests must pass before merging PRs
2. ✅ Failed tests block production deployments
3. ✅ All code changes go through automated validation
4. ✅ Test reports available for debugging

## Deployment Flow After Setup

### For Pull Requests:
```
PR Created → E2E Tests Run (5-10 min) → Tests Pass/Fail
                                              ↓
                          Pass → Can Merge → Deploy to Production
                          Fail → Cannot Merge → Fix & Re-run
```

### For Direct Pushes to Main:
```
Push → E2E Tests Run → Vercel Build Triggered
           ↓                    ↓
        Pass/Fail          Deploys Anyway (unless protected)
```

**Recommendation:** Use PRs for all changes + enable branch protection.

## Limitations & Considerations

### What Tests CAN Catch
- ✅ Page rendering errors
- ✅ Navigation issues
- ✅ API endpoint failures
- ✅ UI component regressions
- ✅ Authentication/authorization bugs
- ✅ Mobile layout issues

### What Tests CANNOT Catch
- ❌ Performance regressions (page load time)
- ❌ SEO issues
- ❌ Accessibility violations (beyond basic checks)
- ❌ Production-specific issues (env differences)
- ❌ Third-party API failures (external dependencies)
- ❌ Database migration issues

### Future Improvements (Optional)
1. **Lighthouse CI** - Performance & accessibility scores
2. **Visual Regression Testing** - Screenshot comparisons
3. **Unit Tests** - Component-level testing
4. **Integration Tests** - API endpoint testing
5. **Load Testing** - Concurrent user simulation

## Quick Reference

### Run Tests Locally
```bash
npm run test:e2e              # Run all E2E tests
npx playwright test --headed  # Run with browser visible
npx playwright test --debug   # Run in debug mode
```

### View Test Reports
```bash
npx playwright show-report    # View HTML report locally
# Or download from GitHub Actions artifacts
```

### Troubleshooting

**Tests fail in CI but pass locally?**
- Check GitHub Secrets are configured correctly
- Verify DATABASE_URL is accessible from GitHub
- Check GOOGLE_APPLICATION_CREDENTIALS_JSON is base64-encoded

**Tests are flaky (sometimes pass/fail)?**
- Increase timeout in test: `test.setTimeout(60000)`
- Add explicit waits: `await page.waitForTimeout(1000)`
- External APIs (news RSS) may be unreliable

**Want to skip CI for a commit?**
```bash
git commit -m "docs: update readme [skip ci]"
```

## Reminder Cron Workflow Setup

### Overview
The reminder-cron workflow (`reminder-cron.yml`) is a **fallback smoke test** for the reminder delivery system. Vercel's native cron (configured in `vercel.json`) is the primary mechanism. This workflow serves as a safety check and can be triggered manually via `workflow_dispatch`.

### Configuration Requirements

For the reminder-cron workflow to run successfully on production (`main` branch), you need to configure:

**Required Secrets:**
- `CRON_SECRET` - Secret token for authenticating cron requests
- One of the following URL sources (for `REMINDER_CRON_BASE_URL`):
  - `REMINDER_CRON_BASE_URL` - Direct cron endpoint URL
  - OR `NEXT_PUBLIC_APP_URL` - Application base URL (fallback)
  - OR `EXPO_PUBLIC_API_BASE_URL` - API base URL (fallback)

### Setup Steps

1. **Go to Settings → Secrets and variables → Actions**

2. **Add `CRON_SECRET`:**
   - Name: `CRON_SECRET`
   - Value: Your cron authentication secret (same as in `vercel.json`)

3. **Add URL Configuration (choose one or more):**
   - Option A: Add `REMINDER_CRON_BASE_URL` with your cron endpoint URL
   - Option B: Ensure `NEXT_PUBLIC_APP_URL` is configured (will be used as fallback)
   - Option C: Ensure `EXPO_PUBLIC_API_BASE_URL` is configured (will be used as fallback)

4. **To test the workflow:**
   - Go to **Actions** tab
   - Select **Reminder Cron Smoke** workflow
   - Click **Run workflow** button
   - Monitor the job execution

### Understanding the Prerequisite Check

The workflow has a prerequisite check (`Determine cron prerequisites` step) that:
- Ensures the workflow runs on the `main` branch only (production-only)
- Validates that `CRON_SECRET` is configured
- Validates that at least one URL source is available for `REMINDER_CRON_BASE_URL`

**If prerequisites fail:**
- The workflow skips the actual cron invocation
- Check the job logs for the skip reason
- Ensure all required secrets are configured
- Verify you're running on the `main` branch

### Debugging

**To see what values are being used (for debugging):**
- Look at the "Determine cron prerequisites" step in the workflow logs
- The step outputs whether each secret is present (without revealing values)
- If missing, configure the corresponding secret in Settings → Secrets

## Summary

✅ **Ready to deploy:** Yes, all tests pass
⚠️ **Protected from bad deploys:** No, need branch protection
🔒 **Will prevent future breaks:** Yes, after setup
📊 **Test coverage:** Excellent (63 comprehensive tests)
🔔 **Reminder workflow:** Ready (after configuring secrets)

**Next Steps:**
1. Enable branch protection rules to block merging failed PRs
2. Configure reminder-cron secrets if using reminder delivery features
