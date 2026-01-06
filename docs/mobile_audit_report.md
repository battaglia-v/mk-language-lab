# Stage 4 Mobile Audit Report

## Run Details (Production)
- Base URL: https://mklanguage.com (apex; www redirects here)
- Viewport: iPhone 12 (390x844)
- Project: mobile-audit
- Run Timestamp: 2026-01-05 18:44 CST
- Commit: 9929c57
- Command: `PLAYWRIGHT_BASE_URL=https://mklanguage.com npm run audit:stage4`
- Workers: 1
- Retries: 1
- Timeouts: test 60s, expect 15s, global 15m
- Tests: 7 total (7 passed, 0 failed)
- Result: Completed without global timeout

## Pass/Fail Summary
- Passed: home loads, bottom nav navigation, level toggle A1↔A2, paths hub opens a detail, word sprint start/exit, reader word sheet, translate submit
- Failed: none

## Failures
| Test | Failure | Screenshot | Trace |
| --- | --- | --- | --- |
None.

## Notes
- No deploy lag observed; Stage 4 gate passes on production.

---

# Full Mobile Audit (Production) — Incomplete

## Run Details
- Base URL: https://mklanguage.com (apex; www redirects here)
- Viewport: iPhone 12 (390x844)
- Project: mobile-audit
- Run Timestamp: 2026-01-05 19:11 CST
- Commit: f55ffdc
- Command: `PLAYWRIGHT_BASE_URL=https://mklanguage.com npx playwright test tests/mobile-audit --project=mobile-audit --workers=1 --retries=1 --grep-invert @slow`
- Workers: 1
- Retries: 1
- Timeouts: test 60s, expect 15s, global 15m
- Tests planned: 170
- Result: Aborted (tool timeout after 15m); run incomplete

## Pass/Fail Summary
- Failures captured: 16
- Pass/remaining: unknown (run aborted before completion)

## Failures
| Test | Failure | Screenshot | Trace |
| --- | --- | --- | --- |
| Home Page — loads without JS errors and shows CTAs | `Start Learning` link missing on `/en` | `test-results/playwright/01-home-Home-Page-loads-without-JS-errors-and-shows-CTAs-mobile-audit/test-failed-1.png` | `test-results/playwright/01-home-Home-Page-loads-without-JS-errors-and-shows-CTAs-mobile-audit-retry1/trace.zip` |
| Home Page — Start Learning CTA navigates to a practice session | `Start Learning` link not found; click timed out | `test-results/playwright/01-home-Home-Page-Start-Le-e4d39-gates-to-a-practice-session-mobile-audit/test-failed-1.png` | `test-results/playwright/01-home-Home-Page-Start-Le-e4d39-gates-to-a-practice-session-mobile-audit-retry1/trace.zip` |
| Learn Page — Start today's lesson CTA is tappable | `Start today` link not found (CTA now "Start here") | `test-results/playwright/02-learn-Learn-Page-Start-today-s-lesson-CTA-is-tappable-mobile-audit/test-failed-1.png` | `test-results/playwright/02-learn-Learn-Page-Start-today-s-lesson-CTA-is-tappable-mobile-audit-retry1/trace.zip` |
| Learn Page — Pick a skill section visible | Expected "pick a skill" copy missing; now "What level are you?" | `test-results/playwright/02-learn-Learn-Page-Pick-a-skill-section-visible-mobile-audit/test-failed-1.png` | `test-results/playwright/02-learn-Learn-Page-Pick-a-skill-section-visible-mobile-audit-retry1/trace.zip` |
| Learning Paths Hub — path cards are clickable | No `[data-testid^="paths-start-"]` links found | `test-results/playwright/03-paths-hub-Learning-Paths-Hub-path-cards-are-clickable-mobile-audit/test-failed-1.png` | `test-results/playwright/03-paths-hub-Learning-Paths-Hub-path-cards-are-clickable-mobile-audit-retry1/trace.zip` |
| Learning Paths Hub — 30-Day Challenge path card visible | "30-day"/"reading challenge" text not found | `test-results/playwright/03-paths-hub-Learning-Path-ac69e-Challenge-path-card-visible-mobile-audit/test-failed-1.png` | `test-results/playwright/03-paths-hub-Learning-Path-ac69e-Challenge-path-card-visible-mobile-audit-retry1/trace.zip` |
| Learning Paths Hub — Topic Packs path card visible | "topic packs"/"topics" text not found | `test-results/playwright/03-paths-hub-Learning-Path-8f917-pic-Packs-path-card-visible-mobile-audit/test-failed-1.png` | `test-results/playwright/03-paths-hub-Learning-Path-8f917-pic-Packs-path-card-visible-mobile-audit-retry1/trace.zip` |
| Learning Path — path shows lesson nodes | Path detail rendered empty (no lesson nodes) | `test-results/playwright/03-paths-hub-Learning-Path-90be9-ics-path-shows-lesson-nodes-mobile-audit/test-failed-1.png` | `test-results/playwright/03-paths-hub-Learning-Path-90be9-ics-path-shows-lesson-nodes-mobile-audit-retry1/trace.zip` |
| Learning Path — path has back navigation | Path detail returned 404 / back link missing | `test-results/playwright/03-paths-hub-Learning-Path-1e54c-cs-path-has-back-navigation-mobile-audit/test-failed-1.png` | `test-results/playwright/03-paths-hub-Learning-Path-1e54c-cs-path-has-back-navigation-mobile-audit-retry1/trace.zip` |
| Practice Hub — Pronunciation card visible and clickable | `practice-mode-pronunciation` card not present | `test-results/playwright/05-practice-Practice-Hub-P-f8b11--card-visible-and-clickable-mobile-audit/test-failed-1.png` | `test-results/playwright/05-practice-Practice-Hub-P-f8b11--card-visible-and-clickable-mobile-audit-retry1/trace.zip` |
| Reader Sample Page — Back to Reader link works | `Back to Reader` link not found (link text is "Back") | `test-results/playwright/06-reader-Reader-Sample-Page-Back-to-Reader-link-works-mobile-audit/test-failed-1.png` | `test-results/playwright/06-reader-Reader-Sample-Page-Back-to-Reader-link-works-mobile-audit-retry1/trace.zip` |
| Reader Sample Page — Grammar tab shows content | `reader-sample-tab-grammar` testid missing; content check failed | `test-results/playwright/06-reader-Reader-Sample-Page-Grammar-tab-shows-content-mobile-audit/test-failed-1.png` | `test-results/playwright/06-reader-Reader-Sample-Page-Grammar-tab-shows-content-mobile-audit-retry1/trace.zip` |
| Reader Sample Page — Vocabulary tab shows word list | `reader-sample-tab-vocabulary` testid missing; content check failed | `test-results/playwright/06-reader-Reader-Sample-Page-Vocabulary-tab-shows-word-list-mobile-audit/test-failed-1.png` | `test-results/playwright/06-reader-Reader-Sample-Page-Vocabulary-tab-shows-word-list-mobile-audit-retry1/trace.zip` |
| Settings Page — has notification settings | Notification/reminder section not present | `test-results/playwright/08-more-menu-Settings-Page-has-notification-settings-mobile-audit/test-failed-1.png` | `test-results/playwright/08-more-menu-Settings-Page-has-notification-settings-mobile-audit-retry1/trace.zip` |
| Bottom Navigation — bottom nav shows Home item | Nav locator resolved to hidden navigation | `test-results/playwright/10-navigation-Bottom-Navigation-bottom-nav-shows-Home-item-mobile-audit/test-failed-1.png` | `test-results/playwright/10-navigation-Bottom-Navigation-bottom-nav-shows-Home-item-mobile-audit-retry1/trace.zip` |
| Bottom Navigation — bottom nav shows Learn item | Nav locator resolved to hidden navigation | `test-results/playwright/10-navigation-Bottom-Navigation-bottom-nav-shows-Learn-item-mobile-audit/test-failed-1.png` | n/a |

## Failure Triage (Option 1)
| Test | Triage | Action |
| --- | --- | --- |
| Home Page — loads without JS errors and shows CTAs | TEST DRIFT | Update to use level CTAs (`cta-start-here`, `home-level-intermediate`) instead of legacy “Start Learning.” |
| Home Page — Start Learning CTA navigates to a practice session | TEST DRIFT | Expect `/en/learn?level=beginner` (guest flow) and use testid. |
| Learn Page — Start today's lesson CTA is tappable | TEST DRIFT | Update to `cta-start-here` and current copy. |
| Learn Page — Pick a skill section visible | TEST DRIFT | Assert level toggle via testids, not legacy copy. |
| Learning Paths Hub — path cards are clickable | TESTABILITY | Assert `paths-start-a1`/`paths-start-a2` visibility and hrefs. |
| Learning Paths Hub — 30-Day Challenge path card visible | TEST DRIFT | Remove from hub expectations (challenge is surfaced in Reader). |
| Learning Paths Hub — Topic Packs path card visible | TEST DRIFT | Remove from hub expectations (not in beta). |
| Learning Path — path shows lesson nodes | TEST DRIFT | Remove `topics` path from path list. |
| Learning Path — path has back navigation | TEST DRIFT | Remove `topics` path from path list. |
| Practice Hub — Pronunciation card visible and clickable | TEST DRIFT | Remove Pronunciation checks (feature hidden in beta). |
| Reader Sample Page — Back to Reader link works | TEST DRIFT | Use `reader-back` testid (label is “Back”). |
| Reader Sample Page — Grammar tab shows content | TESTABILITY | Add `reader-sample-tab-grammar` testid and assert content. |
| Reader Sample Page — Vocabulary tab shows word list | TESTABILITY | Add `reader-sample-tab-vocabulary` testid and assert content. |
| Settings Page — has notification settings | TEST DRIFT | Remove notification expectation (not in beta). |
| Bottom Navigation — bottom nav shows Home item | TESTABILITY | Use `bottom-nav` testid and avoid hidden desktop nav. |
| Bottom Navigation — bottom nav shows Learn item | TESTABILITY | Use `bottom-nav` testid and nav testids. |

## Notes
- Full audit did not complete due to the 15 minute tool timeout. Needs batched runs to finish.
