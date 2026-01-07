---
phase: 09-extraction-pipeline-fix
plan: 01
subsystem: curriculum
tags: [vocabulary, regex, extraction, macedonian, parsing]

requires:
  - phase: 08-pdf-extraction-audit
    provides: AUDIT.md with vocabulary extraction failure analysis

provides:
  - Vocabulary extraction utilities module (vocabulary-patterns.ts)
  - Updated A1 parser with working vocabulary extraction
  - Updated A2 parser with working vocabulary extraction
  - StructuredVocabulary interface for Macedonian-only format

affects: [a1-vocabulary-extraction, a2-content-population, grammar-extraction]

tech-stack:
  added: []
  patterns:
    - Macedonian-only vocabulary extraction (no English translations)
    - Word list extraction from "зборови:" markers
    - Singular/plural pair detection from tabular layouts

key-files:
  created:
    - scripts/curriculum/vocabulary-patterns.ts
  modified:
    - scripts/curriculum/parse-a1-structure.ts
    - scripts/curriculum/parse-a2-structure.ts
    - scripts/curriculum/types.ts
    - data/curriculum/structured/a1-teskoto.json
    - data/curriculum/structured/a2-lozje.json

key-decisions:
  - "Changed vocabulary format from {macedonian, english} to {word, partOfSpeech?, context?} to match Macedonian-only source material"
  - "Created shared vocabulary extraction module to avoid code duplication between A1/A2 parsers"

patterns-established:
  - "Extract vocabulary from 'зборови:' word list markers"
  - "Extract singular/plural pairs from еднина/множина tables"
  - "Deduplicate vocabulary across extraction methods"

issues-created: []

duration: 30min
completed: 2026-01-07
---

# Phase 9 Plan 01: Fix Vocabulary Extraction Regex Summary

**Created vocabulary extraction utilities and updated A1/A2 parsers to extract Macedonian-only vocabulary from UKIM textbooks (17,418 items vs 0 before)**

## Performance

- **Duration:** 30 min
- **Started:** 2026-01-07T19:03:55Z
- **Completed:** 2026-01-07T19:34:31Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Created vocabulary-patterns.ts with 3 extraction functions for UKIM textbook formats
- Fixed A1 parser: 7,513 vocabulary items extracted (target was 200+)
- Fixed A2 parser: 9,905 vocabulary items extracted (target was 80+)
- Updated StructuredVocabulary interface to remove English field (doesn't exist in source)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create vocabulary extraction utilities module** - `ff4786b` (feat)
2. **Task 2: Update A1 parser to use new vocabulary patterns** - `498fc72` (feat)
3. **Task 3: Update A2 parser to use new vocabulary patterns** - `6504f5d` (feat)

## Files Created/Modified

- `scripts/curriculum/vocabulary-patterns.ts` - New module with extractWordLists(), extractSingularPluralPairs(), extractThematicVocabulary(), extractAllVocabulary()
- `scripts/curriculum/types.ts` - Added StructuredVocabulary interface
- `scripts/curriculum/parse-a1-structure.ts` - Replaced failing dashPattern regex with new extraction module
- `scripts/curriculum/parse-a2-structure.ts` - Replaced failing dashPattern regex with new extraction module
- `data/curriculum/structured/a1-teskoto.json` - Now contains 7,513 vocabulary items (was 0)
- `data/curriculum/structured/a2-lozje.json` - Now contains 9,905 vocabulary items (was 0)

## Decisions Made

1. **Removed English translation field** - UKIM textbooks are entirely in Macedonian. The original regex pattern `([Cyrillic]+)\s+[-–—]\s+([a-zA-Z]+)` required English translations that don't exist. Changed interface from `{macedonian, english}` to `{word, partOfSpeech?, context?}`.

2. **Created shared extraction module** - Rather than duplicating extraction logic in both A1 and A2 parsers, created `vocabulary-patterns.ts` as a shared utility.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - extraction patterns worked on first implementation.

## Next Phase Readiness

- Vocabulary extraction now working - 17,418 total items extracted
- Some noise in results (short words like "и", "ти", "да") - can be filtered in Phase 10
- Ready for 09-02: Grammar extraction and placeholder population
- Grammar notes still use hardcoded patterns (only 7 in A1, 34 placeholders in A2)

---
*Phase: 09-extraction-pipeline-fix*
*Completed: 2026-01-07*
