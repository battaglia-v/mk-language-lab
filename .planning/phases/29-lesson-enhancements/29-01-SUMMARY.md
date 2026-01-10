---
phase: 29-lesson-enhancements
plan: 01
subsystem: learn
tags: [vocabulary, useVocabulary, toast, i18n, sorting]

# Dependency graph
requires:
  - phase: 28-navigation-overhaul
    provides: Clean navigation structure
provides:
  - Save-to-glossary functionality on lesson vocabulary cards
  - Vocabulary sort toggle (category/alphabetical/part-of-speech)
affects: [practice, vocabulary-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useVocabulary hook integration for save-to-glossary
    - Session-based sort state (no persistence)

key-files:
  created: []
  modified:
    - components/learn/LessonPageContentV2.tsx
    - messages/en.json
    - messages/mk.json

key-decisions:
  - "Used useToast (shadcn/ui) instead of sonner - sonner not installed in project"
  - "Session-only sort preference - no localStorage persistence for simplicity"
  - "Source='manual' for saved words - matches existing API contract"

patterns-established:
  - "Vocabulary save pattern: useVocabulary.saveWord() with source tracking"
  - "Sort toggle pattern: state-driven grouping with immediate re-render"

issues-created: []

# Metrics
duration: 10min
completed: 2026-01-10
---

# Phase 29-01: Vocabulary Save & Sort Summary

**Save-to-glossary wired on lesson vocabulary cards with 3-mode sort toggle (Category/A-Ш/Type)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-10T17:09:17Z
- **Completed:** 2026-01-10T17:19:34Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 3

## Accomplishments

- Vocabulary cards now show "Add to Review" button for authenticated users
- Clicking saves word via existing `/api/user/vocabulary` with source='manual'
- Toast feedback confirms save ("Saved [word] to your glossary")
- Button state reflects whether word is already in review deck
- Sort toggle with 3 modes: Category (default), A-Ш (alphabetical by Cyrillic letter), Type (part of speech)
- i18n strings added for both English and Macedonian locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire save-to-glossary on vocabulary cards** - `7599c13` (feat)
2. **Task 2: Add vocabulary sort toggle** - `33338a1` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `components/learn/LessonPageContentV2.tsx` - Added useVocabulary integration, handleSaveWord callback, sort state and toggle UI
- `messages/en.json` - Added vocabulary.sortCategory, sortPos, wordSaved keys
- `messages/mk.json` - Added corresponding Macedonian translations

## Decisions Made

- Used `useToast` from shadcn/ui instead of `sonner` (not installed in project)
- Sort preference is session-only (no localStorage persistence) for simplicity
- Used `source: 'manual'` for saved words to match existing API contract

## Deviations from Plan

None - plan executed as specified with minor implementation adjustments noted above.

## Issues Encountered

None.

## Next Phase Readiness

- Save-to-glossary complete, ready for Phase 30 (Vocabulary Display)
- Sort toggle functional for all three modes
- All verification checks pass (build, lint, type-check)

---
*Phase: 29-lesson-enhancements*
*Completed: 2026-01-10*
