# 64-01 Summary: Reader API & Story List

## Completed

**Task 1: Create mobile reader API endpoint** ✓
- Created `app/api/mobile/reader/route.ts`
- GET endpoint with list mode (metadata only) and detail mode (full content)
- Query params: `?level=A1|A2|B1` for filtering, `?id=story-id` for detail
- Word count calculated from text_blocks_mk
- 5-minute cache with stale-while-revalidate
- Commit: `0efb9eb6`

**Task 2: Create reader lib and types** ✓
- Created `apps/mobile/lib/reader.ts`
- Types: `ReaderStory`, `ReaderStoryDetail`, `TextBlock`, `VocabularyItem`
- Functions: `fetchStories()`, `fetchStoryDetail()`, `translateWord()`, `lookupVocabulary()`
- Translation cache using in-memory Map for session
- Commit: `346f43fd`

**Task 3: Build story list screen** ✓
- Updated `apps/mobile/app/(tabs)/reader.tsx`
- FlatList with story cards showing title (MK/EN), difficulty badge, duration, word count
- Horizontal filter chips: All, A1, A2, B1
- Color-coded badges: A1=green, A2=blue, B1=amber
- Pull-to-refresh, loading spinner, error state with retry
- Navigation to `/reader/[id]` route
- Commit: `89923491`

## Files Created/Modified

- `app/api/mobile/reader/route.ts` (NEW)
- `apps/mobile/lib/reader.ts` (NEW)
- `apps/mobile/app/(tabs)/reader.tsx` (MODIFIED)

## Verification

- [x] `npm run type-check` passes in apps/mobile
- [x] API endpoint returns story list and detail
- [x] Story list screen shows stories with filters
- [x] Level filter chips work correctly

## Next

Plan 64-02: Story Viewer & Tap-to-Translate
