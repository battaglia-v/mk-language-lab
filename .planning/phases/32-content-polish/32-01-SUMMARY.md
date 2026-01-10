---
phase: 32-content-polish
plan: 01
subsystem: content
tags: [grammar, possessive-pronouns, reader, attribution, i18n]

# Dependency graph
requires:
  - phase: 31-state-persistence
    provides: localStorage patterns for user state
provides:
  - Extended possessive pronouns lesson (10 exercises covering all forms)
  - MLC badge attribution in reader content
affects: [learn-grammar, reader]

# Tech tracking
tech-stack:
  added: []
  patterns: [handle-based attribution detection]

key-files:
  created: []
  modified:
    - data/grammar-lessons.json
    - messages/en.json
    - messages/mk.json
    - app/[locale]/reader/samples/[sampleId]/v2/ReaderV2Client.tsx

key-decisions:
  - "MLC badge detection via handle matching (@mklanguagelab or contains 'mlc') instead of boolean flag"

patterns-established:
  - "Attribution badges can use handle-based detection for conditional display"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-10
---

# Phase 32 Plan 01: Pronouns & MLC Credit Summary

**Added 4 наш/нивни possessive pronoun exercises and restored MLC attribution badge in reader content**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-10T19:07:20Z
- **Completed:** 2026-01-10T19:12:47Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Extended possessive pronouns lesson with 4 new exercises covering наш (our) and нивен (their) forms
- Updated totalXp from 60 to 100 (10 exercises total)
- Added MLC badge display in reader content for attributed stories
- Bilingual translation keys for reader attribution badge

## Task Commits

Each task was committed atomically:

1. **Task 1: Add наш/нивни possessive pronoun exercises** - `1ada8a8` (feat)
2. **Task 2: Restore MLC badge attribution in reader** - `3784ca6` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `data/grammar-lessons.json` - Added 4 exercises (pp-7 through pp-10), updated totalXp to 100
- `messages/en.json` - Added reader.attribution translation keys
- `messages/mk.json` - Added reader.attribution translation keys (Macedonian)
- `app/[locale]/reader/samples/[sampleId]/v2/ReaderV2Client.tsx` - Added MLC badge display with handle detection

## Decisions Made

- Used handle-based detection (`@mklanguagelab` or contains 'mlc') for MLC badge display instead of adding a boolean flag to reader samples schema - more pragmatic approach that doesn't require data migrations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Ready for 32-02-PLAN.md (Alphabet Ordering & Translation UX)
- Possessive pronouns lesson now complete with all forms covered

---
*Phase: 32-content-polish*
*Completed: 2026-01-10*
