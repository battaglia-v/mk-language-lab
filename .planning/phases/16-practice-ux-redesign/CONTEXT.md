# Phase 16: Practice UX Redesign - Context

## User Feedback (2026-01-08)

After completing Phase 15 (seeding curriculum content), user tested the practice flow and reported:

1. **Vocabulary practice shows 200+ generic cards, not lesson-specific content**
   - Expected: Vocabulary from completed lessons
   - Actual: Generic curated prompts deck

2. **Lesson UI is "giant scrolling wall" - very barebones and hard to use**
   - Current: Long scrolling cards with all vocab/grammar dumped at once
   - Expected: Interactive, step-by-step learning experience

3. **Grammar not spaced evenly on mobile UI, rendering improperly**
   - Current: Grammar notes lack proper mobile spacing
   - Expected: Readable, well-spaced mobile layout

## Technical Analysis

### Issue 1: Vocabulary Practice Bug
- `PracticeHub.tsx` links vocabulary to `/practice/session?deck=curated`
- `usePracticeDecks.ts` has `loadLessonReviewDeck()` that calls `/api/practice/lesson-vocab`
- But "Lesson Review" deck is NOT exposed in the PracticeHub UI
- Fix: Add "Lesson Review" mode card to PracticeHub

### Issue 2: Lesson UI Needs Redesign
- UKIM lessons have `useLessonRunner: false` (or no config)
- Falls back to `LessonContent.tsx` which renders:
  - `VocabularySection` - simple list of all vocab items
  - `GrammarSection` - simple list of all grammar notes
  - No interactive exercises, just "Mark Complete" buttons
- Solution: Either:
  - A) Generate `lessonRunnerConfig` JSON for each lesson (lots of content)
  - B) Redesign `LessonContent` to be more interactive (better approach)

### Issue 3: Grammar Mobile Spacing
- `GrammarSection.tsx` needs responsive layout fixes
- Grammar notes with examples need proper visual hierarchy

## Key Files

- `components/practice/PracticeHub.tsx` - Practice mode selection
- `components/practice/usePracticeDecks.ts` - Deck loading logic
- `components/learn/LessonContent.tsx` - Old lesson rendering (scrolling wall)
- `components/learn/VocabularySection.tsx` - Vocab list rendering
- `components/learn/GrammarSection.tsx` - Grammar notes rendering
- `components/lesson/LessonRunner.tsx` - New interactive lesson system

## Success Criteria

- [ ] Vocabulary practice shows items from completed lessons only
- [ ] Lesson UI is interactive (not a scrolling wall)
- [ ] Grammar notes render properly on mobile with good spacing
- [ ] User can complete a lesson with a clear, guided experience
