---
phase: 06-clean-up-confusion
plan: 01
subsystem: ui
tags: [audio, pronunciation, beta-cleanup, routes]

# Dependency graph
requires:
  - phase: 05-reader-reorganization
    provides: Reader reorganized, ready for UX cleanup
provides:
  - Audio/speaking entry points hidden from user-facing UI
  - Pronunciation page shows coming soon placeholder
  - Routes and recommendations cleaned up
affects: [07-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Comment with "Hidden for beta - audio not ready" for future re-enabling

key-files:
  created: []
  modified:
    - lib/routes.ts
    - components/dashboard/SmartRecommendations.tsx
    - app/[locale]/practice/pronunciation/page.tsx
    - components/practice/ModeTileGrid.tsx

key-decisions:
  - "Comment routes rather than delete for easy re-enabling when audio ready"
  - "Keep pronunciation page accessible with placeholder to avoid 404 for bookmarks"

patterns-established:
  - "Beta feature hiding: comment code, keep routes with placeholders"

issues-created: []

# Metrics
duration: 5 min
completed: 2026-01-07
---

# Phase 6 Plan 01: Audit and Hide Audio/Speaking Features Summary

**All audio/speaking entry points hidden from user-facing UI — pronunciation route commented, page shows "Coming Soon" placeholder, ModeTileGrid defaults cleaned**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-07T03:06:53Z
- **Completed:** 2026-01-07T03:11:25Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- PRACTICE_PRONUNCIATION route and QUEST_CATEGORY_ROUTES pronunciation entry commented out
- SmartRecommendations no longer suggests pronunciation practice
- Pronunciation page replaced with "Coming Soon" placeholder (no 404 for bookmarks)
- Pronunciation tile removed from ModeTileGrid defaultTiles

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove pronunciation route from navigation** - `246ca66` (feat)
2. **Task 2: Add coming soon message to pronunciation page** - `4699d30` (feat)
3. **Task 3: Remove pronunciation from ModeTileGrid defaults** - `c7c3fad` (feat)

**Plan metadata:** `af9b0fd` (docs: complete plan)

## Files Created/Modified

- `lib/routes.ts` - Commented out PRACTICE_PRONUNCIATION and quest route mapping
- `components/dashboard/SmartRecommendations.tsx` - Commented out pronunciation recommendation
- `app/[locale]/practice/pronunciation/page.tsx` - Replaced with Coming Soon placeholder
- `components/practice/ModeTileGrid.tsx` - Removed pronunciation from defaultTiles

## Decisions Made

- Comment routes rather than delete for easy re-enabling when audio is ready
- Keep pronunciation page accessible with placeholder to avoid 404 for external bookmarks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Commented out SmartRecommendations pronunciation suggestion**
- **Found during:** Task 1 (Remove pronunciation route from navigation)
- **Issue:** SmartRecommendations.tsx referenced ROUTES.PRACTICE_PRONUNCIATION which was now commented out, causing TypeScript error
- **Fix:** Commented out the pronunciation recommendation push (lines 78-86) with same "Hidden for beta - audio not ready" note
- **Files modified:** components/dashboard/SmartRecommendations.tsx
- **Verification:** npm run type-check passes
- **Committed in:** 246ca66 (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary fix to maintain type safety. SmartRecommendations was an additional entry point to pronunciation that needed hiding.

## Issues Encountered

None - all tasks executed successfully with pre-commit hooks passing.

## Next Phase Readiness

- Audio/speaking entry points fully hidden
- Ready for 06-02: Remove dead settings and add explainers
- No blockers

---
*Phase: 06-clean-up-confusion*
*Completed: 2026-01-07*
