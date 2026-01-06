---
phase: 01-curriculum-backbone
plan: 02
subsystem: curriculum
tags: [pdf-extraction, pdfjs-dist, macedonian, a1, ukim, teskoto]

# Dependency graph
requires:
  - phase: 01-01
    provides: PDF extraction infrastructure, downloaded textbooks
provides:
  - A1 raw text extraction (a1-raw.json)
  - A1 structured curriculum (a1-teskoto.json)
  - 24 lessons with themes, grammar patterns
affects: [01-03, 01-04, database-seeding]

# Tech tracking
tech-stack:
  added: []
  patterns: [structure-parsing-from-toc, font-size-based-detection]

key-files:
  created:
    - scripts/curriculum/extract-a1.ts
    - scripts/curriculum/parse-a1-structure.ts
    - data/curriculum/extracted/a1-raw.json
    - data/curriculum/structured/a1-teskoto.json
  modified:
    - scripts/curriculum/extract-pdf.ts

key-decisions:
  - "Used TOC-based lesson boundaries rather than font-size heuristics alone"
  - "Prioritized structure capture over vocabulary extraction (textbook uses dialogues)"

patterns-established:
  - "Raw extraction → structure parsing two-step process"
  - "journeyId naming: ukim-{level} (e.g., ukim-a1)"

issues-created: []

# Metrics
duration: 10min
completed: 2026-01-06
---

# Phase 1 Plan 02: A1 Curriculum Extraction Summary

**Extracted 286-page Тешкото textbook into structured JSON with 24 lessons, 122 themes, and grammar pattern detection**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-06T23:26:38Z
- **Completed:** 2026-01-06T23:36:58Z
- **Tasks:** 3 (including checkpoint)
- **Files modified:** 5

## Accomplishments

- Extracted 286 pages from A1 Тешкото PDF with position data (30k text items)
- Validated Macedonian-specific characters (Ѓ, Ќ, Љ, Њ, Џ all present)
- Parsed lesson structure from table of contents (24 lessons)
- Identified 122 themes across lessons with exercise lists
- Detected grammar patterns (verb conjugations, possessive pronouns)
- Created Prisma-compatible JSON structure (journeyId, chapters, etc.)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract raw text from PDF** - `08bf598` (feat)
2. **Task 2: Checkpoint verification** - (human-verify, no commit)
3. **Task 3: Parse structure into curriculum JSON** - `e0c2291` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `scripts/curriculum/extract-a1.ts` - A1 extraction wrapper script
- `scripts/curriculum/parse-a1-structure.ts` - Structure parser
- `scripts/curriculum/extract-pdf.ts` - Fixed pdfjs-dist worker setup
- `data/curriculum/extracted/a1-raw.json` - Raw extraction (4.75 MB)
- `data/curriculum/structured/a1-teskoto.json` - Structured output (221 KB)

## Decisions Made

- **TOC-based boundaries**: Used table of contents page numbers rather than font-size detection alone for reliable lesson boundaries
- **Structure over vocabulary**: Prioritized capturing lesson/theme structure; vocabulary extraction was limited because textbook uses dialogues and exercises rather than word lists

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pdfjs-dist worker configuration**
- **Found during:** Task 1 (PDF extraction)
- **Issue:** pdfjs-dist v5 worker setup was failing with "No GlobalWorkerOptions.workerSrc"
- **Fix:** Set workerSrc to actual worker file path instead of empty string
- **Files modified:** scripts/curriculum/extract-pdf.ts
- **Verification:** Extraction completed successfully
- **Committed in:** 08bf598 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking), 0 deferred
**Impact on plan:** Fix was necessary for extraction to work. No scope creep.

## Issues Encountered

None - plan executed as expected after worker configuration fix.

## Next Phase Readiness

- A1 curriculum captured in structured JSON format
- Same extraction pattern ready for A2 (Лозје) and B1 (Златоврв)
- Ready for 01-03: Extract and structure A2 curriculum

---
*Phase: 01-curriculum-backbone*
*Completed: 2026-01-06*
