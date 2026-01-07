# Phase 04-02 Summary: User Vocab Hooks

**Status**: Complete
**Duration**: ~4 min
**Date**: 2026-01-07

## Objective

Create useVocabulary hook for vocabulary state management and integrate with practice flow.

## What Was Built

### 1. useVocabulary Hook (`a04ba85`)

React hook that manages vocabulary state with API integration:

```typescript
// State
vocabulary: VocabWord[]
counts: VocabCounts  // { new, learning, mastered, due, total }
isLoading: boolean
error: string | null

// Actions
loadVocabulary(status?, limit?)
saveWord(input: SaveWordInput)
recordReview(wordId, correct)
getDueWords(limit?)
getNewWords(limit?)
```

Features:
- Auto-loads vocabulary on mount when authenticated
- Optimistic UI updates on mutations
- Returns guest-safe empty state for unauthenticated users

### 2. Practice Deck Integration (`fbefc3f`)

Updated `types.ts` and `usePracticeDecks.ts`:

- Added `'user-vocab'` to DeckType union
- Added `userVocabDeck` state and `loadUserVocabDeck()` action
- Integrated `useVocabulary` hook internally
- Export `vocabActions` (saveWord, recordReview) for practice UI
- Export `vocabCounts` for mode selection UI
- Updated `getDeck()` to handle `'user-vocab'` type
- Added `userVocab` to `deckCounts`

## Files Created/Modified

| File | Change |
|------|--------|
| `components/practice/useVocabulary.ts` | New - vocabulary state hook |
| `components/practice/types.ts` | Added 'user-vocab' to DeckType |
| `components/practice/usePracticeDecks.ts` | Integrated vocab hook and deck |

## Technical Notes

- `loadUserVocabDeck()` fetches 15 due words + 5 new words for balanced practice
- VocabWord → Flashcard conversion maintains compatibility with existing practice UI
- Hook composition: `usePracticeDecks` internally uses `useVocabulary`

## Verification

- [x] `npm run type-check` passes
- [x] `npm run lint` passes
- [x] useVocabulary hook exports all required functions
- [x] usePracticeDecks integrates user-vocab deck type

## Next Steps

Plan 04-03 will create the practice mode selector UI to let users choose between "Learn new", "Review due", and "Mixed" modes.
