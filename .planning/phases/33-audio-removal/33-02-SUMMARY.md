---
phase: 33-audio-removal
plan: 02
subsystem: infra
tags: [prisma, cleanup, i18n, e2e]

# Dependency graph
requires:
  - phase: 33-01
    provides: Core audio infrastructure deleted
provides:
  - Complete audio removal from codebase
  - Clean database schema without audio models
  - Updated tests without audio references
affects: [phase-34-polish, phase-35-practice]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - components/lesson/LessonRunner.tsx
    - lib/lazy-components.tsx
    - lib/recommendation-engine.ts
    - e2e/prod-assertions.spec.ts

key-decisions:
  - "Kept i18n keys that reference pronunciation as a concept vs deleted functionality"
  - "Updated E2E tests to expect 404 for removed routes"

patterns-established: []

issues-created: []

# Metrics
duration: 13min
completed: 2026-01-10
---

# Phase 33 Plan 02: Component Cleanup & Schema Removal Summary

**Removed audio imports from 18 files, deleted 5 database models/enums, and updated E2E tests for removed routes**

## Performance

- **Duration:** 13 min
- **Started:** 2026-01-10T20:07:44Z
- **Completed:** 2026-01-10T20:21:08Z
- **Tasks:** 3
- **Files modified:** 18

## Accomplishments

- Fixed broken imports in 5 components (LessonRunner, reader index, lazy-components)
- Deleted 2 orphaned pronunciation components (PronunciationCard, PronunciationSession)
- Removed 5 database models/enums from Prisma schema (ListeningExercise, ListeningQuestion, PracticeAudio, PracticeAudioStatus, PracticeAudioSource)
- Updated 4 E2E tests to handle removed routes
- Removed pronunciation references from UI (Language Lab, alphabet page, recommendations)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix broken imports in components** - `f698e54` (chore)
2. **Task 2: Remove audio models from database schema** - `b3f8fdf` (chore)
3. **Task 3: Remove audio references from UI and tests** - `e202251` (chore)

**Plan metadata:** (pending)

## Files Created/Modified

**Deleted:**
- `components/practice/PronunciationCard.tsx` - Orphaned pronunciation component
- `components/practice/PronunciationSession.tsx` - Orphaned pronunciation session
- `scripts/practice-audio-sync.ts` - Unused sync script
- `data/practice-audio.json` - Unused data file

**Modified:**
- `prisma/schema.prisma` - Removed 5 audio models/enums
- `components/lesson/LessonRunner.tsx` - Removed Pronounce step
- `components/reader/index.ts` - Removed SentenceAudioPlayer export
- `lib/lazy-components.tsx` - Removed pronunciation lazy-load exports
- `lib/recommendation-engine.ts` - Removed pronunciation recommendation
- `app/[locale]/lab/page.tsx` - Removed pronunciation tool from Language Lab
- `app/[locale]/learn/lessons/alphabet/page.tsx` - Removed pronunciation link
- `app/api/admin/content-status/route.ts` - Removed practice_audio content type
- `app/api/practice/prompts/route.ts` - Simplified without audio
- `package.json` - Removed practice-audio:sync script
- `e2e/prod-assertions.spec.ts` - Expect 404 for removed page
- `e2e/mobile-audit-comprehensive.spec.ts` - Removed pronunciation route
- `e2e/mobile-viewport-audit.spec.ts` - Removed pronunciation route
- `e2e/mobile-journey.spec.ts` - Removed pronunciation test

## Decisions Made

- **Kept general i18n keys:** Keys referencing pronunciation as a concept (not deleted functionality) were preserved since they may be used elsewhere or for future features
- **E2E 404 assertions:** Updated prod-assertions to verify removed routes return 404 rather than skipping the tests entirely

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Phase 33: Audio Removal - COMPLETE**

All audio functionality has been removed:
- Plan 01: Deleted 87 core audio files (hooks, components, routes, pages, tests)
- Plan 02: Cleaned up 18 remaining references and database schema

Ready for Phase 34: Remaining Polish (About page credits, grammar expansion, quiz retake button, etc.)

---
*Phase: 33-audio-removal*
*Completed: 2026-01-10*
