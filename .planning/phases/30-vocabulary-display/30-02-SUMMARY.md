---
phase: 30-vocabulary-display
plan: 02
subsystem: ui
tags: [navigation, ux, cleanup, i18n]

# Dependency graph
requires:
  - phase: 30-vocabulary-display
    provides: Gender annotations and definite article display for vocabulary cards
provides:
  - Removal of redundant "Back to Dashboard" navigation links
  - Cleaner page headers without duplicate navigation
  - Consistent navigation via shell header (home button and logo)
affects: [navigation, shell-header]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - app/[locale]/discover/page.tsx
    - app/[locale]/news/NewsClient.tsx
    - app/[locale]/profile/page.tsx
    - app/[locale]/notifications/page.tsx
    - components/shell/ShellHeader.tsx
    - messages/en.json
    - messages/mk.json

key-decisions:
  - "Remove all Back to Dashboard links - header home button and logo are sufficient"
  - "Remove ShellHeader back button entirely rather than making icon-only"
  - "Clean up unused i18n keys: backToDashboard, backToSection, lessonsPathHint"

patterns-established: []

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-10
---

# Phase 30 Plan 02: Remove Redundant Back to Dashboard Links Summary

**Removed all redundant "Back to Dashboard" navigation links for cleaner page headers - users navigate via header home button and logo**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-10T18:21:57Z
- **Completed:** 2026-01-10T18:26:41Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Removed "Back to Dashboard" links from discover, news, profile, and notifications pages
- Removed conditional back button from ShellHeader component
- Cleaned up unused i18n keys from both en.json and mk.json
- Removed 120 lines of code total (6 insertions, 120 deletions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove Back to Dashboard links from page components** - `7b86049` (feat)
2. **Task 2: Clean up ShellHeader and i18n keys** - `5f6573a` (refactor)

**Plan metadata:** (this commit)

## Files Created/Modified

- `app/[locale]/discover/page.tsx` - Removed backToDashboard link and lessonsPathHint, cleaned imports
- `app/[locale]/news/NewsClient.tsx` - Removed backToDashboard button, cleaned imports
- `app/[locale]/profile/page.tsx` - Removed backToDashboard link, cleaned imports
- `app/[locale]/notifications/page.tsx` - Simplified hero section, removed backToDashboard link
- `components/shell/ShellHeader.tsx` - Removed back button logic, backKey/backLabel/backTarget variables
- `messages/en.json` - Removed backToDashboard, backToSection, lessonsPathHint keys
- `messages/mk.json` - Removed backToDashboard, backToSection, lessonsPathHint keys

## Decisions Made

- User feedback was clear: "Remove all 'back to dashboard' buttons. The home button and Македонски at the top are sufficient."
- Chose to remove the entire back button from ShellHeader rather than converting to icon-only, since the header already has the brand link as primary navigation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 30 (Vocabulary Display) complete
- Navigation is now consistent across all pages (header-based only)
- Ready for Phase 31: State Persistence

---
*Phase: 30-vocabulary-display*
*Completed: 2026-01-10*
