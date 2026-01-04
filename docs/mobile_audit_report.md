# Stage 4 Mobile Audit Report

## Run Details (Production)
- Base URL: https://www.mklanguage.com
- Viewport: iPhone 12 (390x844)
- Project: mobile-audit
- Command: PLAYWRIGHT_BASE_URL=https://www.mklanguage.com npx playwright test --project=mobile-audit tests/mobile-audit/13-stage4-critical.spec.ts
- Tests: 9 total (6 passed, 3 failed)
- Notes: Re-run after fixes were pushed to main; production still shows failures (likely deploy lag).

## Local Verification
- Base URL: http://localhost:3000
- Viewport: iPhone 12 (390x844)
- Project: mobile-audit
- Command: npx playwright test tests/mobile-audit/13-stage4-critical.spec.ts --project=mobile-audit
- Tests: 9 total (9 passed)
- Notes: Local run confirms fixes for level toggle, Word Sprint start, and reader taps.

## Failures

### Learn: Intermediate selection does not switch to A2
- Severity: major
- Steps: `/en/learn` -> tap “Intermediate (A2)”
- Expected: A2 path shows title “A2 Momentum” with A2 lessons.
- Actual: A1 path remains visible; A2 title never appears.
- Notes: Fix pushed (level toggle now uses router state + URL); production still failing.

### Practice: Word Sprint doesn’t start
- Severity: critical
- Steps: `/en/practice/word-sprint` -> tap “Start session”
- Expected: Session starts and shows exit control.
- Actual: Remains on difficulty picker; no session UI.
- Notes: Fix pushed (start button now triggers session directly + updates URL); production still failing.

### Reader: Word tap does not open word sheet
- Severity: major
- Steps: `/en/reader/samples/cafe-conversation` -> tap any word
- Expected: Bottom sheet opens with translation/actions.
- Actual: No word sheet appears.
- Notes: Fix pushed (tap handler supports pointer + click events); production still failing.

## Passed Checks
- Core routes load without 404s (home, learn, paths, A1/A2, word sprint, reader sample).
- Home level CTAs visible; translations resolve.
- Beginner CTA navigates to A1 learn path.
- Paths hub shows A1/A2 cards.
- A1 “Start here” opens Alphabet lesson.
- A2 “Start here” opens a practice session.

## Artifacts
- Playwright output: `test-results/playwright/`
- Failure screenshots in `test-results/playwright/` with matching test names.
