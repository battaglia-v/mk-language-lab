---
phase: 28-navigation-overhaul
plan: 02
subsystem: ui
tags: [navigation, next-intl, middleware, redirect]

requires:
  - phase: 28-01
    provides: Navigation simplification foundation (Resources page, UserMenu consolidation)
provides:
  - Unified /tools page with Translate/Analyze toggle
  - 301 redirects from /translate and /reader/analyze
  - Simplified nav (Wrench icon Tools item)
affects: [user-journey, navigation]

tech-stack:
  added: []
  patterns: [URL-synced mode toggle, middleware redirects]

key-files:
  created:
    - app/[locale]/tools/page.tsx
    - components/tools/ToolsPageClient.tsx
  modified:
    - components/shell/navItems.ts
    - middleware.ts
    - messages/en.json
    - messages/mk.json

key-decisions:
  - "Embedded translate logic inline rather than extracting to separate component"
  - "Used Wrench icon for Tools nav item"
  - "301 permanent redirects in middleware for SEO"

patterns-established:
  - "URL-synced mode toggle with router.replace"

issues-created: []

duration: 10min
completed: 2026-01-10
---

# Phase 28-02: Tools Merge Plan Summary

**Unified Translate and Analyze tools into single /tools page with mode toggle**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-10T16:32:35Z
- **Completed:** 2026-01-10T16:42:51Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created unified Tools page with Translate/Analyze segmented control
- URL-synced mode state for shareable links
- 301 redirects for backward compatibility
- Navigation simplified with Wrench icon Tools item

## Task Commits

1. **Task 1: Create unified Tools page** - `0eb58c9` (feat)
2. **Task 2: Update navigation and redirects** - `cda6d0f` (feat)

**Plan metadata:** `451926f` (docs: complete plan)

## Files Created/Modified
- `app/[locale]/tools/page.tsx` (new) - Server component reading mode param
- `components/tools/ToolsPageClient.tsx` (new) - Client component with toggle
- `components/shell/navItems.ts` - Changed translate to tools
- `middleware.ts` - Added 301 redirects
- `messages/en.json` - Added tools i18n keys
- `messages/mk.json` - Added tools i18n keys

## Decisions Made
- Embedded translate logic inline rather than extracting (no reuse benefit)
- Used Wrench icon for Tools nav (better represents unified concept)
- 301 permanent redirects in middleware (SEO-friendly, centralized)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness
- Ready for 28-03-PLAN.md (Learning Paths removal)
- Navigation now has: Learn, Practice, Reader, Tools, Resources
- 2 of 3 plans complete for Phase 28

---
*Phase: 28-navigation-overhaul*
*Completed: 2026-01-10*
