---
phase: 27-bug-fixes
plan: 01
subsystem: ui
tags: [tailwind, i18n, next-intl, dark-mode, accessibility]

requires:
  - phase: 26
    provides: Dark mode compliance patterns and semantic design tokens
provides:
  - Semantic color token usage across UI components
  - Localized back button labels in English and Macedonian
affects: [28-navigation, future-ui-components]

tech-stack:
  added: []
  patterns: [text-primary-foreground for primary backgrounds]

key-files:
  created: []
  modified:
    - components/ui/PrimaryButton.tsx
    - components/ui/badge.tsx
    - components/ui/checkbox.tsx
    - components/ui/CardButton.tsx
    - components/ui/filter-chip.tsx
    - components/learn/LearnHeader.tsx
    - components/learn/GrammarExerciseCard.tsx
    - components/learn/LessonPathNode.tsx
    - components/reader/TextImporter.tsx
    - components/reader/ReaderV2Layout.tsx
    - components/reader/WordBottomSheet.tsx
    - components/reader/ReaderLayout.tsx
    - components/learn/LessonPageContentV2.tsx
    - messages/en.json
    - messages/mk.json

key-decisions:
  - "DailyLessons.tsx exclusion: text-white dark:text-black pattern intentional for custom tag colors"
  - "Used useTranslations('common') hook consistently for back button i18n"
  - "ReaderV2Layout refactor: renamed local t object to labels to avoid hook conflict"

patterns-established:
  - "Replace text-black with text-primary-foreground on bg-primary backgrounds"
  - "Leave intentional high-contrast white on emerald/red/green backgrounds"

issues-created: []

duration: 5min
completed: 2026-01-10
---

# Phase 27 Plan 01: Light Mode & i18n Bug Fixes Summary

**Fixed visual regression bugs where hardcoded `text-black` classes caused poor contrast in light mode, and internationalized hardcoded "Back" button labels**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-10T14:30:00Z
- **Completed:** 2026-01-10T14:35:00Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Replaced `text-black` with `text-primary-foreground` across 11 component files
- Added `common.back` translation key in English ("Back") and Macedonian ("Назад")
- Updated 3 navigation components to use next-intl translation hooks

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix light mode colors in UI components** - `fc2b2df` (fix)
2. **Task 2: Fix light mode colors in learn/reader components** - `c4e3295` (fix)
3. **Task 3: Internationalize back button labels** - `153100c` (fix)

## Files Created/Modified

### Task 1 - UI Components (5 files)
- `components/ui/PrimaryButton.tsx` - Primary button text color
- `components/ui/badge.tsx` - Default variant text
- `components/ui/checkbox.tsx` - Checked state indicator (2 locations)
- `components/ui/CardButton.tsx` - Featured variant text and subtitle
- `components/ui/filter-chip.tsx` - Selected state text

### Task 2 - Learn/Reader Components (6 files)
- `components/learn/LearnHeader.tsx` - Continue button text
- `components/learn/GrammarExerciseCard.tsx` - Multiple choice indicator, sentence builder tokens
- `components/learn/LessonPathNode.tsx` - Available and in-progress node backgrounds
- `components/reader/TextImporter.tsx` - File input text
- `components/reader/ReaderV2Layout.tsx` - Glossary badge count
- `components/reader/WordBottomSheet.tsx` - Save button text

### Task 3 - i18n Back Buttons (5 files)
- `messages/en.json` - Added `"back": "Back"` to common section
- `messages/mk.json` - Added `"back": "Назад"` to common section
- `components/reader/ReaderLayout.tsx` - Use `useTranslations` for back label
- `components/reader/ReaderV2Layout.tsx` - Use `useTranslations` for back label
- `components/learn/LessonPageContentV2.tsx` - Use `useTranslations` for back label

## Decisions Made

1. **DailyLessons.tsx exclusion**: The `text-white dark:text-black` pattern was intentional for contrast on custom tag colors (orange, emerald, sky, purple) and play icons. Left unchanged.

2. **Translation pattern**: Used `useTranslations('common')` hook consistently rather than inline locale checks, following existing codebase patterns.

3. **ReaderV2Layout refactor**: Renamed local `t` object to `labels` to avoid conflict with the translation hook naming convention.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Plan 27-01 complete, ready for next plan in Phase 27
- Pattern for semantic color tokens established for future UI work
- i18n back button pattern available for other navigation components

---
*Phase: 27-bug-fixes*
*Completed: 2026-01-10*
