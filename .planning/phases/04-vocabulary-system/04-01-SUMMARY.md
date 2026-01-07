# Phase 04-01 Summary: Vocabulary State API

**Status**: Complete
**Duration**: ~5 min
**Date**: 2026-01-07

## Objective

Create API endpoints for vocabulary state management using the existing VocabularyWord Prisma model.

## What Was Built

### 1. GET /api/user/vocabulary (`54b1350`)

Returns user's vocabulary with filtering and counts:

- Query params: `status` (new/learning/mastered/due/all), `limit` (1-200)
- Mastery mapping: new=0, learning=1-3, mastered=4-5, due=nextReviewAt≤now
- Response: `{ words: [...], counts: { new, learning, mastered, due, total } }`
- Returns empty array for users with no vocabulary

### 2. POST /api/user/vocabulary (`54b1350`)

Creates or returns existing vocabulary word:

- Request: `{ wordMk, wordEn, phonetic?, source, sourceId? }`
- Source validation: practice, reader, translator, manual
- Uses Prisma upsert on unique `[userId, wordMk]` constraint
- New words start with mastery=0, nextReviewAt=null

### 3. PATCH /api/user/vocabulary/[id] (`ed471d6`)

Updates word after review with SRS logic:

- Request: `{ correct: boolean }`
- Leitner-style intervals: 1d → 3d → 7d → 14d → 30d → 90d
- Correct: mastery = min(mastery+1, 5)
- Incorrect: mastery = 0
- Tracks timesReviewed and timesCorrect

## Files Created/Modified

| File | Change |
|------|--------|
| `app/api/user/vocabulary/route.ts` | New - GET and POST handlers |
| `app/api/user/vocabulary/[id]/route.ts` | New - PATCH handler |

## Technical Notes

- Used `Prisma.VocabularyWordWhereInput` type for dynamic query building
- SRS intervals match existing `lib/srs.ts` localStorage implementation
- Auth pattern follows existing `/api/user/journey-progress/route.ts`
- Parallel counts query using Promise.all for efficiency

## Verification

- [x] `npm run type-check` passes
- [x] `npm run lint` passes
- [x] GET endpoint returns vocab with counts
- [x] POST endpoint creates new words
- [x] PATCH endpoint updates mastery correctly

## Next Steps

Plan 04-02 will create the `useVocabulary` hook to consume these endpoints from the frontend.
