---
phase: 12-a2-content-population
plan: 01
subsystem: curriculum
tags: [a2, grammar, vocabulary, templates, extraction, macedonian]

# Dependency graph
requires:
  - phase: 10-a1-vocabulary-extraction
    provides: MACEDONIAN_STOP_WORDS, isValidVocabularyWord()
  - phase: 11-a1-grammar-content
    provides: GrammarTemplate interface, enhanceWithTemplate() pattern
provides:
  - A2 grammar content templates (36 topics)
  - Quality A2 curriculum (a2-lozje.json)
  - findA2GrammarTemplate() for parser integration
affects: [13-b1-content-bootstrap, curriculum-seeding]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-based-grammar-enhancement, stop-word-vocabulary-filtering]

key-files:
  created:
    - scripts/curriculum/a2-grammar-content.ts
  modified:
    - scripts/curriculum/parse-a2-structure.ts
    - data/curriculum/structured/a2-lozje.json

key-decisions:
  - "Added 36 templates (35 + noun supplement) to cover all A2 grammar topics"
  - "Reused A1 patterns: GrammarTemplate interface, enhanceWithTemplate(), isValidVocabularyWord()"

patterns-established:
  - "Level-specific grammar templates with titleVariants for fuzzy matching"
  - "Double-filtering vocabulary: extractAllVocabulary() then isValidVocabularyWord()"

issues-created: []

# Metrics
duration: 12 min
completed: 2026-01-07
---

# Phase 12 Plan 01: A2 Content Quality Fix Summary

**Applied A1 quality patterns (stop word filtering + grammar templates) to A2 (Лозје) curriculum**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-07T23:39:24Z
- **Completed:** 2026-01-07T23:52:21Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created 36 A2 grammar templates covering all 35 TOC topics + supplementary nouns
- Updated A2 parser with template fallback and vocabulary filtering
- Regenerated a2-lozje.json with quality content

## Quality Improvements

| Metric | Before | After |
|--------|--------|-------|
| Vocabulary items | 9,905 | 8,372 |
| Short explanations (<50 chars) | 2 | 0 |
| Low examples (<3) | 28 | 0 |
| Grammar notes with quality content | 18/46 | 46/46 |

## Task Commits

1. **Task 1: Create A2 grammar content templates** - `6c95e88` (feat)
2. **Task 2: Update A2 parser with template fallback** - `34117a7` (feat)
3. **Task 3: Regenerate A2 content** - `5297779` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `scripts/curriculum/a2-grammar-content.ts` - 36 grammar templates for A2 topics (verb tenses, conditionals, verbal forms, etc.)
- `scripts/curriculum/parse-a2-structure.ts` - Added enhanceWithTemplate(), vocabulary filtering
- `data/curriculum/structured/a2-lozje.json` - Regenerated with quality content

## Decisions Made

- Extended templates beyond the 35 TOC topics to include a generic "Nouns" template for sections extracted from lesson text
- Followed exact A1 pattern for consistency (GrammarTemplate interface, findA2GrammarTemplate function)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added noun template for generic sections**
- **Found during:** Task 3 (quality verification)
- **Issue:** "Именки" section in Lesson 4 had only 2 examples, failing the 3+ requirement
- **Fix:** Added supplementary noun template (36th template) to cover generic noun sections
- **Files modified:** scripts/curriculum/a2-grammar-content.ts
- **Verification:** All 46 grammar notes now have 3+ examples
- **Committed in:** 5297779 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (missing critical)
**Impact on plan:** Template count increased from 35 to 36 to ensure all extracted sections have quality content.

## Issues Encountered

None - plan executed with one minor adjustment (additional template).

## Next Phase Readiness

- A2 quality criteria met (0 short explanations, 0 low examples)
- All 8 lessons have vocabulary (819-1197 items) and grammar (4-11 notes)
- Ready for Phase 12.1 (UX Fixes) or Phase 13 (B1 Content Bootstrap)

---
*Phase: 12-a2-content-population*
*Completed: 2026-01-07*
