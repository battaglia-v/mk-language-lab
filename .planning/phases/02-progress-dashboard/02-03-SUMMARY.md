---
phase: 02-progress-dashboard
plan: 03
subsystem: ui
tags: [curriculum, database, prisma, learn-page]

# Dependency graph
requires:
  - phase: 01-curriculum-backbone
    provides: CurriculumLesson and Module tables with UKIM content
  - phase: 02-01
    provides: JourneyProgress API for tracking user position
provides:
  - Database-driven curriculum path generator
  - Learn page showing real UKIM curriculum lessons
  - Lesson links using database IDs instead of hardcoded node IDs
affects: [lesson-pages, practice-integrity]

# Tech tracking
tech-stack:
  added: []
  patterns: [curriculum-path-generator, db-driven-ui]

key-files:
  created:
    - lib/learn/curriculum-path.ts
  modified:
    - app/[locale]/learn/page.tsx
    - components/learn/LearnPageClient.tsx

key-decisions:
  - "Curriculum paths generated server-side from database, not client-side fetch"
  - "Deprecated starter-path.ts and a2-path.ts (kept for reference, not used)"
  - "Lesson hrefs now use database IDs: /learn/lessons/{lessonId}"

patterns-established:
  - "getCurriculumPath(journeyId, userId) pattern for DB-driven lesson lists"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-07
---

# Phase 2 Plan 3: Remove Beginner Loop Summary

**Database-driven curriculum paths replace hardcoded lesson lists; Learn page now shows real UKIM curriculum from Тешкото (A1) and Лозје (A2)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-07T00:52:07Z
- **Completed:** 2026-01-07T00:57:05Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created `getCurriculumPath()` function that queries CurriculumLesson database
- Replaced hardcoded `createStarterPath`/`createA2Path` with `getA1Path`/`getA2Path`
- Learn page now displays real UKIM curriculum (~24 A1 lessons, ~8 A2 lessons)
- Lesson completion status now tied to actual UserLessonProgress records

## Task Commits

Each task was committed atomically:

1. **Task 1: Create curriculum path generator** - `ac5908d` (feat)
2. **Task 2: Replace hardcoded paths** - `d45d803` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `lib/learn/curriculum-path.ts` - New module: generates LessonPath from database
- `app/[locale]/learn/page.tsx` - Switched to getCurriculumPath, removed hardcoded imports
- `components/learn/LearnPageClient.tsx` - Renamed starterPath prop to a1Path

## Decisions Made

- **Server-side generation**: Curriculum paths fetched in server component, not client-side
- **Status logic**: completed → UserLessonProgress, available → first incomplete, locked → rest
- **Deprecation approach**: Old starter-path.ts/a2-path.ts kept but unused (cleanup later)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 2 complete - all 3 plans finished
- Learn page now fully database-driven
- Ready for Phase 3: Lesson Practice Integrity

---
*Phase: 02-progress-dashboard*
*Completed: 2026-01-07*
