# Stage 4 Mobile Audit Report

## Run Details (Production)
- Base URL: https://www.mklanguage.com
- Viewport: iPhone 12 (390x844)
- Project: mobile-audit
- Command: `PLAYWRIGHT_BASE_URL=https://www.mklanguage.com npm run audit:stage4`
- Workers: 1
- Retries: 1
- Timeouts: test 60s, expect 15s, global 15m
- Tests: 7 total (3 passed, 4 failed)
- Result: Completed without global timeout

## Pass/Fail Summary
- Passed: home loads, bottom nav navigation, paths hub opens a detail
- Failed: A2 level toggle, Word Sprint start/exit, Reader word sheet, Translate submit

## Failures
| Test | Failure | Screenshot | Trace |
| --- | --- | --- | --- |
| Learn level toggle switches between A1 and A2 | A2 title never appears after selecting Intermediate | `test-results/playwright/14-stage4-gate-Stage-4-gat-43bb5--switches-between-A1-and-A2-mobile-audit/test-failed-1.png` | `test-results/playwright/14-stage4-gate-Stage-4-gat-43bb5--switches-between-A1-and-A2-mobile-audit-retry1/trace.zip` |
| Word Sprint starts and exits | Start session never shows exit control | `test-results/playwright/14-stage4-gate-Stage-4-gat-a63a3-ord-sprint-starts-and-exits-mobile-audit/test-failed-1.png` | `test-results/playwright/14-stage4-gate-Stage-4-gat-a63a3-ord-sprint-starts-and-exits-mobile-audit-retry1/trace.zip` |
| Reader sample opens and word sheet toggles | Word tap never opens bottom sheet | `test-results/playwright/14-stage4-gate-Stage-4-gat-c0994-pens-and-word-sheet-toggles-mobile-audit/test-failed-1.png` | `test-results/playwright/14-stage4-gate-Stage-4-gat-c0994-pens-and-word-sheet-toggles-mobile-audit-retry1/trace.zip` |
| Translate smoke | Translate button remains disabled after input | `test-results/playwright/14-stage4-gate-Stage-4-gat-808c1-al-journeys-translate-smoke-mobile-audit/test-failed-1.png` | `test-results/playwright/14-stage4-gate-Stage-4-gat-808c1-al-journeys-translate-smoke-mobile-audit-retry1/trace.zip` |

## Notes
- Suspected deploy lag: A2 toggle, Word Sprint start/exit, and reader word sheet were fixed on main but still fail on production.
- Translate submit remains disabled after input on production; needs investigation.
