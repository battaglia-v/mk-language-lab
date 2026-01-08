---
phase: 16-practice-ux-redesign
plan: 01
subsystem: practice
tags: [practice, usePracticeDecks, PracticeHub, translations, lesson-review]

# Dependency graph
requires:
  - phase: 15-practice-integration
    provides: loadLessonReviewDeck() function and lesson vocab API
provides:
  - Lesson Review practice mode card in PracticeHub
  - deck=lesson-review handling in practice session
  - English and Macedonian translations for lesson review mode
affects: [practice-session, user-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: [practice-mode-cards, conditional-deck-loading]

key-files:
  created: []
  modified:
    - components/practice/PracticeHub.tsx
    - components/practice/PracticeSession.tsx
    - messages/en.json
    - messages/mk.json

key-decisions:
  - "Position Lesson Review card before curated vocabulary card to prioritize lesson-specific content"

patterns-established:
  - "Disabled practice mode cards show disabledReason message from translations"
  - "Practice session handles deck-specific loading and empty states"

issues-created: []

# Metrics
duration: 42min
completed: 2026-01-08
---

# Phase 16 Plan 01: Expose Lesson Vocabulary in Practice Hub Summary

**Lesson Review practice mode card added to PracticeHub with deck loading and empty state handling**

## Performance

- **Duration:** 42 min
- **Started:** 2026-01-08T21:02:08Z
- **Completed:** 2026-01-08T21:44:36Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added Lesson Review practice mode card to PracticeHub with BookOpen icon
- Card shows vocabulary count from completed lessons, disabled with message when none
- Practice session handles deck=lesson-review parameter with empty state fallback
- Added bilingual translations (English + Macedonian) for the new mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Lesson Review mode card to PracticeHub** - `6b22aba` (feat)
2. **Task 2: Handle deck=lesson-review in practice session** - `8b87200` (feat)
3. **Task 3: Human verification** - Checkpoint approved

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified

- `components/practice/PracticeHub.tsx` - Added lessonReview mode card with BookOpen icon, useEffect to load deck on mount
- `components/practice/PracticeSession.tsx` - Added loadLessonReviewDeck call for lesson-review deck type, specific empty state message
- `messages/en.json` - Added practiceHub.modes.lessonReview translations
- `messages/mk.json` - Added practiceHub.modes.lessonReview translations (Macedonian)

## Decisions Made

- Positioned Lesson Review card BEFORE the curated vocabulary card to prioritize lesson-specific content over generic deck
- Used existing loadLessonReviewDeck() from Phase 15 rather than creating new API

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Ready for 16-02-PLAN.md (Lesson content UI redesign + grammar mobile fix)
- Lesson Review practice mode is now accessible to users with completed lessons

---
*Phase: 16-practice-ux-redesign*
*Completed: 2026-01-08*
