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

## Summary

✅ **Ready to deploy:** Yes, all tests pass
⚠️ **Protected from bad deploys:** No, need branch protection
🔒 **Will prevent future breaks:** Yes, after setup
📊 **Test coverage:** Excellent (63 comprehensive tests)

**Next Step:** Enable branch protection rules to block merging failed PRs.
