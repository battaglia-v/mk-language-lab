---
phase: 28-navigation-overhaul
plan: 03
subsystem: navigation
tags: [routes, cleanup, learning-paths, redirect]

requires:
  - phase: 28-02
    provides: Tools merge complete, navigation simplified to 5 tabs
provides:
  - Removed redundant /learn/paths routes
  - All paths references updated to /learn?level= query params
  - Clean 5-tab navigation structure finalized
affects: [user-journey, navigation, learn]

tech-stack:
  added: []
  patterns: [query-param-based level selection]

key-files:
  created: []
  modified:
    - components/learn/LearnPageClient.tsx
    - app/[locale]/learn/lessons/alphabet/page.tsx
    - app/[locale]/reader/page.tsx
  deleted:
    - app/[locale]/learn/paths/page.tsx
    - app/[locale]/learn/paths/[pathId]/page.tsx
    - tests/mobile-audit/03-paths-hub.spec.ts

key-decisions:
  - "Delete paths without redirect - internal pages not worth maintaining redirects"
  - "Use /learn?level= query params for level selection instead of /paths/{id}"

patterns-established:
  - "Level selection via query params (?level=beginner/intermediate/advanced/challenge)"

issues-created: []

duration: 8min
completed: 2026-01-10
---

# Phase 28-03: Learning Paths Removal Summary

**Deleted redundant /learn/paths routes and updated all references to use /learn?level= query params**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-10T16:45:48Z
- **Completed:** 2026-01-10T16:54:37Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 13+ (3 deleted, 10+ updated)

## Accomplishments
- Deleted /learn/paths/ route directory (page.tsx and [pathId]/page.tsx)
- Updated all active code references to use /learn?level= query params
- Updated 8 test files to test level tabs instead of paths routes
- Cleaned up screenshot capture scripts

## Task Commits

1. **Task 1-2: Delete learning paths routes and references** - `fdd482a` (feat)

**Plan metadata:** (this commit)

## Files Deleted
- `app/[locale]/learn/paths/page.tsx`
- `app/[locale]/learn/paths/[pathId]/page.tsx`
- `tests/mobile-audit/03-paths-hub.spec.ts`

## Files Modified
- `components/learn/LearnPageClient.tsx` - Removed paths links, updated fallback ctaHref
- `app/[locale]/learn/lessons/alphabet/page.tsx` - Changed /paths/a1 to /learn?level=beginner
- `app/[locale]/reader/page.tsx` - Changed /paths/30day to /learn?level=challenge
- `tests/release-gate/_routes.ts` - Removed paths routes, added level query routes
- `tests/mobile-audit/_helpers.ts` - Removed paths from ALL_ROUTES
- `tests/mobile-audit/10-navigation.spec.ts` - Removed paths back nav test
- `tests/mobile-audit/13-stage4-critical.spec.ts` - Updated to test level tabs
- `tests/mobile-audit/14-stage4-gate.spec.ts` - Replaced paths hub test
- `e2e/i18n-regression.spec.ts` - Updated to test level selection tabs
- `scripts/capture-screenshots-*.ts` - Updated paths to query params

## Decisions Made
- Delete without redirect: Internal pages not prominently linked, 404 acceptable
- Use query params for level selection: Cleaner URLs, no extra routes needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Phase 28 Complete Summary

Navigation structure simplified from "More" catch-all to direct access:

**Before:** Learn, Translate, Practice, Reader, More
**After:** Learn, Tools, Practice, Reader, Resources

### Phase Accomplishments (3 plans)
1. **28-01:** Replaced "More" with "Resources", consolidated UserMenu
2. **28-02:** Created unified Tools page (Translate + Analyze toggle)
3. **28-03:** Removed redundant Learning Paths section

### Navigation Changes
- Bottom nav: 5 clean tabs with direct access
- UserMenu: Profile, Settings, Help, About consolidated
- /learn page: Level tabs (A1/A2/B1/Challenge) serve as entry point
- /tools page: Unified translate/analyze with toggle

## Next Phase Readiness
- Phase 28 complete, ready for Phase 29: Lesson Enhancements
- Navigation is clean and functional
- All tests passing

---
*Phase: 28-navigation-overhaul*
*Completed: 2026-01-10*
