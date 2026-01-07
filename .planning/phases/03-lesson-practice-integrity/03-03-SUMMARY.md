# Plan 03-03 Summary: Grammar Drill Lesson References

**Completed:** 2026-01-07
**Duration:** ~5 min

## Objective

Add source lesson references to grammar drills so users know which UKIM lesson teaches each grammar concept.

## What Was Built

### Task 1: Grammar-to-Curriculum Mapping

Created `data/grammar-curriculum-map.json` with mappings for all 10 grammar lessons:

| Grammar Lesson | UKIM Lesson | Topic |
|----------------|-------------|-------|
| present-tense-sum | Lesson 1 | Verb "сум" conjugation |
| possessive-pronouns | Lesson 1, 2 | Possessive forms |
| question-words | Lesson 1 | Basic question words |
| plural-nouns | Lesson 2 | Family member plurals |
| definite-article-basics | Lesson 3 | Noun articles |
| adjective-agreement | Lesson 3 | Gender agreement |
| negation-basics | Lesson 4 | Negation with "не" |
| prepositions-basics | Lesson 5 | Location prepositions |
| future-tense-basics | Lesson 6 | Future with "ќе" |
| past-tense-intro | Lesson 8 | Past tense forms |

### Task 2: Grammar Practice UI Update

Updated `app/[locale]/practice/grammar/page.tsx`:
- Import grammar curriculum mapping
- Added `getCurriculumRefs()` helper function
- Added blue "Lesson X" badge to lesson cards with BookOpen icon
- Supports both English ("Lesson") and Macedonian ("Лекција") labels

### Human Verification

Verified badges display correctly on grammar practice page in both locales.

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `1bf48f4` | feat | Create grammar-to-curriculum mapping |
| `34b6b18` | feat | Add curriculum lesson badges to grammar UI |

## Phase 3 Complete

All three plans executed:
- 03-01: Practice content audit and gap analysis (DISCOVERY.md)
- 03-02: Lesson-vocab API endpoint and deck type infrastructure
- 03-03: Grammar-to-curriculum mapping and UI badges

**Key Outcome:** Grammar practice now shows curriculum context, helping users understand where they learned (or will learn) each concept.

## Next Steps

Phase 4: Vocabulary System - Implement vocab states (new/learning/mastered) with SRS.
