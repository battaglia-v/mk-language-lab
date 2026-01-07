# Plan 03-01 Summary: Document Practice Sources

**Completed:** 2026-01-07
**Duration:** ~5 min

## Objective

Document current practice content sources and the gap between practice and curriculum systems.

## What Was Built

### DISCOVERY.md Documentation

Created comprehensive practice content audit documenting:

1. **Practice Vocabulary System** - Uses `PracticeVocabulary` table, completely separate from curriculum. Falls back to static JSON if DB fails.

2. **Practice Decks** - Five deck types (curated, mistakes, SRS, favorites, custom), none filtered by lesson progress.

3. **Grammar Practice** - Static JSON source, localStorage progress, no UKIM curriculum references.

4. **Curriculum-Linked Models** - `VocabularyItem` and `Exercise` exist in schema with `lessonId` but have 0 records.

### Gap Analysis

Documented the core issue: practice content is completely separate from curriculum progression. Users can be quizzed on vocabulary they've never seen in lessons.

| Aspect | Current | Desired |
|--------|---------|---------|
| Practice vocab | Generic `PracticeVocabulary` | `VocabularyItem` from completed lessons |
| Grammar context | Standalone | References source UKIM lesson |
| Exercises | None (0 records) | `Exercise` from completed lessons |

### Recommended Approach

Phase 3 focuses on infrastructure:
- 03-02: Build API for completed-lesson content (returns empty until vocab seeded)
- 03-03: Add grammar-to-curriculum mapping (works immediately)

Full practice filtering requires vocabulary seeding (future work).

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `66409be` | docs | Practice content audit and gap analysis |

## Decisions Made

- **Phase 3 scope is infrastructure**: Building API endpoints and mappings, not seeding vocabulary
- **Grammar mapping works now**: Doesn't depend on VocabularyItem seeding
- **Vocabulary seeding is future work**: Outside Phase 3 scope

## Next Steps

Execute 03-02-PLAN.md: Create completed-lesson content API and lesson-review deck type.
