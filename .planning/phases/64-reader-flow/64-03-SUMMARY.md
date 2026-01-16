# 64-03 Summary: Progress & Glossary

## Completed

**Task 1: Create reading progress persistence** ✓
- Created `apps/mobile/lib/reading-progress.ts`
- ReadingProgress type with scrollPosition (0-1), completed, lastReadAt
- saveProgress(), loadProgress(), loadAllProgress(), markComplete()
- Debounced save function for scroll updates (1000ms)
- Storage key: `@mklanguage/reading-progress`
- Commit: `16451084`

**Task 2: Integrate progress into story viewer** ✓
- Updated `apps/mobile/app/reader/[id].tsx`
- Load saved progress on mount, restore scroll position
- Debounced save of scroll position on scroll (1000ms)
- Auto-mark complete when scrolled past 95%
- Mark Complete button persists to AsyncStorage
- Flush pending saves on unmount
- Commit: `dc4c7f9f`

**Task 3: Add save-to-glossary functionality** ✓
- Created `apps/mobile/lib/glossary.ts`
- SavedWord type with id, mk, en, pos, savedAt, source
- saveWord(), getSavedWords(), removeWord(), isWordSaved()
- Storage key: `@mklanguage/glossary`
- Updated WordPopup to check if word saved on open
- Save button persists to AsyncStorage
- Shows "Saved!" feedback with check icon
- Commit: `0d504ce7`

## Files Created/Modified

- `apps/mobile/lib/reading-progress.ts` (NEW)
- `apps/mobile/lib/glossary.ts` (NEW)
- `apps/mobile/app/reader/[id].tsx` (MODIFIED)
- `apps/mobile/components/reader/WordPopup.tsx` (MODIFIED)

## Verification

- [x] `npm run type-check` passes in apps/mobile
- [x] Reading progress saves on scroll
- [x] Story resumes from last position
- [x] Save-to-glossary works from word popup
- [x] Completed stories tracked

## Phase 64 Complete

All 3 plans completed:
- 64-01: Reader API & Story List ✓
- 64-02: Story Viewer & Tap-to-Translate ✓
- 64-03: Progress & Glossary ✓

### Success Criteria Met

- [x] Story list displays with level filtering
- [x] Tap-to-translate works with vocabulary + API fallback
- [x] Reading progress persists across sessions
- [x] Words can be saved to glossary
