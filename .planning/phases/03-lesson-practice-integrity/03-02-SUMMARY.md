# Plan 03-02 Summary: Completed-Lesson Content API

**Completed:** 2026-01-07
**Duration:** ~4 min

## Objective

Create API endpoint and practice deck support for completed-lesson vocabulary filtering.

## What Was Built

### Task 1: GET /api/practice/lesson-vocab Endpoint

Created new API endpoint (`app/api/practice/lesson-vocab/route.ts`) that:
- Requires authentication
- Gets user's completed lesson IDs from `UserLessonProgress`
- Queries `VocabularyItem` where `lessonId` IN completed lesson IDs
- Returns Flashcard-compatible format with lesson context
- Returns empty array (not error) when no vocab exists

Response format:
```json
{
  "id": "string",
  "macedonian": "string",
  "english": "string",
  "lessonId": "string",
  "lessonTitle": "string",
  "category": "lesson-vocab"
}[]
```

### Task 2: lesson-review Deck Type

Updated practice deck infrastructure:
- Added `'lesson-review'` to `DeckType` union in `types.ts`
- Added `lessonReviewDeck` state to `usePracticeDecks.ts`
- Added `loadLessonReviewDeck()` async action
- Updated `getDeck()` switch statement to handle `'lesson-review'`
- Added `lessonReview` to `deckCounts` object

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `4ffc46c` | feat | Create lesson-vocab API endpoint |
| `21e8f97` | feat | Add lesson-review deck type to practice infrastructure |

## Technical Notes

`★ Insight ─────────────────────────────────────`
- API returns empty array until `VocabularyItem` is seeded (future work)
- Infrastructure follows existing patterns from `/api/practice/prompts`
- Deck type is additive - doesn't modify existing deck behaviors
`─────────────────────────────────────────────────`

## Next Steps

Execute 03-03-PLAN.md: Add grammar-to-curriculum mapping (works immediately, no vocab seeding needed).
