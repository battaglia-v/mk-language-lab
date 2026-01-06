---
phase: 01-curriculum-backbone
plan: 03
subsystem: curriculum
tags: [pdf-extraction, pdfjs-dist, a2, lozje, macedonian]

# Dependency graph
requires:
  - phase: 01-02
    provides: A1 extraction patterns and parsing approach
provides:
  - A2 raw text extraction (178 pages, 381k chars)
  - A2 structured curriculum JSON (8 lessons, 34 grammar notes)
  - Consistent schema across A1/A2 levels
affects: [01-04, database-import, curriculum-display]

# Tech tracking
tech-stack:
  added: []
  patterns: [reuse-extraction-scripts, toc-based-lesson-boundaries]

key-files:
  created:
    - scripts/curriculum/extract-a2.ts
    - scripts/curriculum/parse-a2-structure.ts
    - data/curriculum/extracted/a2-raw.json
    - data/curriculum/structured/a2-lozje.json
  modified: []

key-decisions:
  - "A2 has 8 comprehensive lessons vs A1's 24 shorter ones - different structure, same schema"
  - "Grammar notes extracted from TOC metadata rather than text pattern matching"
  - "supplementarySections field replaces learningPages for A2-specific terminology"

patterns-established:
  - "Reuse extraction scripts with level-specific constants"
  - "TOC-based lesson boundary detection for consistent structure"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-06
---

# Phase 1 Plan 3: A2 Лозје Extraction Summary

**A2 Лозје PDF extraction with 178 pages parsed into 8-lesson structured curriculum matching A1 schema**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-06T23:42:14Z
- **Completed:** 2026-01-06T23:47:32Z
- **Tasks:** 3 (including 1 checkpoint)
- **Files modified:** 4 created

## Accomplishments

- Extracted A2 Лозје textbook: 178 pages, 28,089 text items, 381,092 characters
- Validated Macedonian-specific characters (ѓ: 220, ќ: 1,049, љ: 42, њ: 1,038, џ: 27)
- Parsed into structured JSON with 8 lessons and 34 grammar notes from TOC
- Maintained consistent schema with A1 (journeyId, chapters, metadata structure)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract raw text from Лозје PDF** - `c58b24d` (feat)
2. **Task 2: Human verify extraction** - checkpoint approved
3. **Task 3: Parse structure into curriculum JSON** - `4d2a913` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `scripts/curriculum/extract-a2.ts` - A2 extraction script (mirrors A1 pattern)
- `scripts/curriculum/parse-a2-structure.ts` - A2 structure parser with 8-lesson TOC
- `data/curriculum/extracted/a2-raw.json` - Raw extraction (4.53 MB)
- `data/curriculum/structured/a2-lozje.json` - Structured output (8.77 KB)

## Decisions Made

- A2 Лозје uses 8 comprehensive lessons (vs A1's 24 shorter lessons) - maintained same schema with different content organization
- Grammar notes (34 total) extracted from TOC metadata since in-text pattern matching yielded no results for A2's format
- Used `supplementarySections` instead of `learningPages` to match A2 textbook terminology

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- A2 curriculum structured and ready for database import
- Both A1 and A2 now have consistent JSON schemas
- Ready for 01-04: B1 skeleton and curriculum integration

---
*Phase: 01-curriculum-backbone*
*Completed: 2026-01-06*
