---
phase: 21-bug-fixes
plan: 01
subsystem: ui
tags: [react, tailwind, vocabulary, ux]

# Dependency graph
requires:
  - phase: 16-practice-ux-redesign
    provides: EnhancedVocabularyCard component, LessonPageContentV2 layout
provides:
  - Interactive vocabulary cards with tap-to-reveal examples
  - Proper noun filtering for lesson vocabulary displays
affects: [practice-feature-audit, content-expansion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tap-to-reveal UI pattern for compact cards"
    - "Vocabulary filtering with blocklist approach"

key-files:
  created: []
  modified:
    - components/learn/EnhancedVocabularyCard.tsx
    - components/learn/LessonPageContentV2.tsx
    - app/globals.css

key-decisions:
  - "Inlined Tailwind utilities to fix v4 compatibility issue with @apply"
  - "Used blocklist approach for name filtering rather than complex heuristics"

patterns-established:
  - "Tap-to-reveal pattern: hasExample check + onClick toggle + opacity/max-h transitions"

issues-created: []

# Metrics
duration: 6min
completed: 2026-01-09
---

# Phase 21 Plan 01: Vocabulary Bug Fixes Summary

**Interactive vocabulary cards with tap-to-reveal examples in compact mode, plus proper noun filtering to exclude names from lesson vocabulary displays**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-09T23:29:23Z
- **Completed:** 2026-01-09T23:35:44Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- EnhancedVocabularyCard compact mode now responds to taps - clicking reveals example sentences with smooth opacity/max-h transitions
- Added "Tap for example" hint with BookOpen icon when example sentences are available
- Proper nouns (names like Ана, Марко, Влатко) filtered from lesson vocabulary displays
- Country names and "(name)" translations also filtered
- Fixed Tailwind v4 CSS compatibility issue blocking build

## Task Commits

Each task was committed atomically:

1. **Task 1: Add interactivity to EnhancedVocabularyCard** - `b4ff7b1` (feat)
2. **Task 2: Add vocabulary filtering to LessonPageContentV2** - `eed0baf` (fix)
3. **Task 3: Build verification + CSS fix** - `1b00c28` (fix)

**Plan metadata:** `2b64c11`

## Files Created/Modified

- `components/learn/EnhancedVocabularyCard.tsx` - Added hasExample check, handleCompactClick handler, cursor-pointer class, and example reveal with transitions
- `components/learn/LessonPageContentV2.tsx` - Added COUNTRY_NAMES and COMMON_NAMES blocklists, filterVocabularyForDisplay() function filtering proper nouns
- `app/globals.css` - Inlined utility class values to fix Tailwind v4 @apply compatibility

## Decisions Made

- **Blocklist approach for filtering:** Used simple blocklist of common names rather than complex NLP heuristics. This is reliable and easy to extend.
- **Inlined CSS utilities:** Tailwind v4 doesn't support @apply with custom classes defined in the same file. Inlined the values directly instead of restructuring.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Tailwind v4 CSS build failure**
- **Found during:** Task 3 (Build verification)
- **Issue:** Pre-existing issue in app/globals.css - `@apply lesson-card-standard lesson-rounded` failed because Tailwind v4 can't @apply custom classes defined in the same file
- **Fix:** Inlined `p-5 md:p-6` and `rounded-xl` directly into the affected classes
- **Files modified:** app/globals.css
- **Verification:** npm run build passes
- **Committed in:** 1b00c28

---

**Total deviations:** 1 auto-fixed (blocking build issue), 0 deferred
**Impact on plan:** Essential fix for build to pass. No scope creep.

## Issues Encountered

None - all tasks completed successfully after addressing the CSS blocker.

## Next Phase Readiness

- Phase 21 complete (1/1 plans done)
- Vocabulary cards are now interactive with tap-to-reveal
- Proper nouns filtered from displays
- Ready for Phase 22: Content Effectiveness Audit

---
*Phase: 21-bug-fixes*
*Completed: 2026-01-09*
